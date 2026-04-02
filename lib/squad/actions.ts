'use server'

import { getActionUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'

const FORMATION_SLOTS: Record<string, Record<string, number>> = {
  '4-4-2': { GK: 1, DEF: 4, MID: 4, ATT: 2 },
  '4-3-3': { GK: 1, DEF: 4, MID: 3, ATT: 3 },
  '4-5-1': { GK: 1, DEF: 4, MID: 5, ATT: 1 },
}

export async function changeFormation(leagueId: string, formation: string) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Check lineup lock
  const { data: league } = await supabase
    .from('leagues')
    .select('lineup_locked')
    .eq('id', leagueId)
    .single()

  if (league?.lineup_locked) {
    return { error: 'Lineup is locked until the next draft window' }
  }

  if (!FORMATION_SLOTS[formation]) {
    return { error: 'Invalid formation' }
  }

  const { error } = await supabase
    .from('league_members')
    .update({ formation: formation as '4-4-2' | '4-3-3' | '4-5-1' })
    .eq('league_id', leagueId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await autoAssignStartingXI(supabase, leagueId, user.id, formation)

  const { data: member } = await supabase
    .from('league_members')
    .select('display_name')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single()

  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'formation_change',
    description: `${member?.display_name || 'Unknown'} switched to ${formation}`,
    user_id: user.id,
  })

  return { success: true }
}

async function autoAssignStartingXI(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leagueId: string,
  userId: string,
  formation: string
) {
  const slots = FORMATION_SLOTS[formation]
  if (!slots) return

  const { data: squadSlots } = await supabase
    .from('squad_slots')
    .select('*, player:players(id, position)')
    .eq('league_id', leagueId)
    .eq('user_id', userId)

  if (!squadSlots?.length) return

  type SlotWithPlayer = typeof squadSlots[number] & {
    player: { id: string; position: string } | null
  }

  const byPosition: Record<string, SlotWithPlayer[]> = { GK: [], DEF: [], MID: [], ATT: [] }
  for (const slot of squadSlots as SlotWithPlayer[]) {
    const pos = slot.player?.position || slot.position
    if (byPosition[pos]) byPosition[pos].push(slot)
  }

  const updates: Array<{ id: string; is_starting: boolean }> = []
  for (const [pos, needed] of Object.entries(slots)) {
    const available = byPosition[pos] || []
    available.forEach((slot, i) => {
      updates.push({ id: slot.id, is_starting: i < needed })
    })
  }

  for (const update of updates) {
    await supabase
      .from('squad_slots')
      .update({ is_starting: update.is_starting, updated_at: new Date().toISOString() })
      .eq('id', update.id)
  }
}

export async function toggleStarting(
  leagueId: string,
  slotId: string,
  swapWithSlotId: string
) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Check lineup lock
  const { data: league } = await supabase
    .from('leagues')
    .select('lineup_locked')
    .eq('id', leagueId)
    .single()

  if (league?.lineup_locked) {
    return { error: 'Lineup is locked until the next draft window' }
  }

  const { data: slots } = await supabase
    .from('squad_slots')
    .select('*')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .in('id', [slotId, swapWithSlotId])

  if (!slots || slots.length !== 2) {
    return { error: 'Invalid swap' }
  }

  const now = new Date().toISOString()
  for (const slot of slots) {
    await supabase
      .from('squad_slots')
      .update({ is_starting: !slot.is_starting, updated_at: now })
      .eq('id', slot.id)
  }

  return { success: true }
}

export async function setCaptain(
  leagueId: string,
  captainPlayerId: string,
  viceCaptainPlayerId: string
) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Check lock
  const { data: league } = await supabase
    .from('leagues')
    .select('lineup_locked')
    .eq('id', leagueId)
    .single()

  if (league?.lineup_locked) {
    return { error: 'Lineup is locked until the next draft window' }
  }

  if (captainPlayerId === viceCaptainPlayerId) {
    return { error: 'Captain and Vice Captain must be different players' }
  }

  // Verify both players are in user's starting XI
  const { data: slots } = await supabase
    .from('squad_slots')
    .select('player_id, is_starting')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .in('player_id', [captainPlayerId, viceCaptainPlayerId])

  const startingIds = (slots || []).filter((s) => s.is_starting).map((s) => s.player_id)
  if (!startingIds.includes(captainPlayerId)) {
    return { error: 'Captain must be in your Starting XI' }
  }
  if (!startingIds.includes(viceCaptainPlayerId)) {
    return { error: 'Vice Captain must be in your Starting XI' }
  }

  const { error } = await supabase
    .from('league_members')
    .update({
      captain_player_id: captainPlayerId,
      vice_captain_player_id: viceCaptainPlayerId,
    })
    .eq('league_id', leagueId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
