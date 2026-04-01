'use server'

import { createClient } from '@/lib/supabase/server'
import { getActionUser } from '@/lib/supabase/auth'

type DraftWindowType = 'post_groups' | 'post_r32' | 'post_r16' | 'post_qf' | 'post_sf'

/**
 * Open a draft window after a tournament stage completes.
 * Called by an admin/cron when a stage finishes.
 *
 * 1. Marks eliminated nations' players
 * 2. Creates a draft_window record
 * 3. Determines pick order (reverse leaderboard)
 */
export async function openDraftWindow(
  leagueId: string,
  windowType: DraftWindowType,
  eliminatedNations: string[]
) {
  const supabase = await createClient()

  // Mark eliminated players
  if (eliminatedNations.length > 0) {
    const { error } = await supabase
      .from('players')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
      })
      .in('nation', eliminatedNations)
      .eq('is_eliminated', false)

    if (error) return { error: error.message }
  }

  // Create draft window
  const { error: windowError } = await supabase.from('draft_windows').insert({
    league_id: leagueId,
    window_type: windowType,
    status: 'active',
    opens_at: new Date().toISOString(),
  })

  if (windowError) return { error: windowError.message }

  // Activity feed
  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'transfer',
    description: `Draft window open — replace eliminated players. ${eliminatedNations.length} nation(s) eliminated.`,
  })

  return { success: true }
}

/**
 * Get the replacement pick order: reverse of current leaderboard (last place first).
 */
export async function getReplacementPickOrder(leagueId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, total_points')
    .eq('league_id', leagueId)
    .order('total_points', { ascending: true })

  if (!scores?.length) {
    // If no scores yet, use original draft order reversed
    const { data: league } = await supabase
      .from('leagues')
      .select('draft_order')
      .eq('id', leagueId)
      .single()

    return [...((league?.draft_order as string[]) || [])].reverse()
  }

  return scores.map((s) => s.user_id)
}

/**
 * Make a replacement pick during a draft window.
 */
export async function makeReplacementPick(
  leagueId: string,
  droppedPlayerId: string,
  pickedPlayerId: string,
  windowType: DraftWindowType
) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Verify the dropped player is eliminated
  const { data: droppedPlayer } = await supabase
    .from('players')
    .select('id, name, position, is_eliminated')
    .eq('id', droppedPlayerId)
    .single()

  if (!droppedPlayer?.is_eliminated) {
    return { error: 'This player has not been eliminated' }
  }

  // Verify the picked player is available (not eliminated, not drafted in this league)
  const { data: pickedPlayer } = await supabase
    .from('players')
    .select('id, name, position, is_eliminated')
    .eq('id', pickedPlayerId)
    .single()

  if (!pickedPlayer) return { error: 'Player not found' }
  if (pickedPlayer.is_eliminated) return { error: 'This player is also eliminated' }

  // Same position requirement
  if (pickedPlayer.position !== droppedPlayer.position) {
    return { error: `Replacement must be the same position (${droppedPlayer.position})` }
  }

  // Check not already drafted in this league
  const { data: existingSlot } = await supabase
    .from('squad_slots')
    .select('id')
    .eq('league_id', leagueId)
    .eq('player_id', pickedPlayerId)
    .single()

  if (existingSlot) {
    return { error: 'This player is already drafted in your league' }
  }

  // Get the squad slot being replaced
  const { data: slot } = await supabase
    .from('squad_slots')
    .select('id, is_starting')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .eq('player_id', droppedPlayerId)
    .single()

  if (!slot) {
    return { error: 'You do not have this player in your squad' }
  }

  // Update squad slot
  const { error: updateError } = await supabase
    .from('squad_slots')
    .update({
      player_id: pickedPlayerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', slot.id)

  if (updateError) return { error: updateError.message }

  // Record transfer
  await supabase.from('transfers').insert({
    league_id: leagueId,
    user_id: user.id,
    dropped_player_id: droppedPlayerId,
    picked_player_id: pickedPlayerId,
    draft_window: windowType,
    is_auto_pick: false,
  })

  // Activity feed
  const { data: member } = await supabase
    .from('league_members')
    .select('display_name')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single()

  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'transfer',
    description: `${member?.display_name} replaced ${droppedPlayer.name} with ${pickedPlayer.name}`,
    user_id: user.id,
    player_id: pickedPlayerId,
  })

  return { success: true }
}

/**
 * Auto-pick random replacements for users who missed the window
 * or didn't replace eliminated players.
 */
export async function autoReplaceEliminatedPlayers(leagueId: string, windowType: DraftWindowType) {
  const supabase = await createClient()

  // Find all squad slots with eliminated players in this league
  const { data: eliminatedSlots } = await supabase
    .from('squad_slots')
    .select('id, user_id, player_id, position, is_starting, player:players(id, name, is_eliminated)')
    .eq('league_id', leagueId)

  type SlotWithPlayer = NonNullable<typeof eliminatedSlots>[number] & {
    player: { id: string; name: string; is_eliminated: boolean } | null
  }

  const slotsNeedingReplacement = (eliminatedSlots as SlotWithPlayer[] || [])
    .filter((s) => s.player?.is_eliminated)

  if (slotsNeedingReplacement.length === 0) return { replaced: 0 }

  // Get all drafted player IDs in this league
  const { data: allSlots } = await supabase
    .from('squad_slots')
    .select('player_id')
    .eq('league_id', leagueId)

  const draftedIds = new Set((allSlots || []).map((s) => s.player_id))

  let replaced = 0

  for (const slot of slotsNeedingReplacement) {
    // Find random available player in same position
    const { data: available } = await supabase
      .from('players')
      .select('id, name')
      .eq('position', slot.position)
      .eq('is_eliminated', false)
      .limit(50)

    const candidates = (available || []).filter((p) => !draftedIds.has(p.id))
    if (candidates.length === 0) continue

    // Random pick
    const picked = candidates[Math.floor(Math.random() * candidates.length)]

    // Update slot
    await supabase
      .from('squad_slots')
      .update({
        player_id: picked.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slot.id)

    // Record transfer
    await supabase.from('transfers').insert({
      league_id: leagueId,
      user_id: slot.user_id,
      dropped_player_id: slot.player_id,
      picked_player_id: picked.id,
      draft_window: windowType,
      is_auto_pick: true,
    })

    // Activity feed
    const { data: member } = await supabase
      .from('league_members')
      .select('display_name')
      .eq('league_id', leagueId)
      .eq('user_id', slot.user_id)
      .single()

    await supabase.from('activity_feed').insert({
      league_id: leagueId,
      event_type: 'auto_pick',
      description: `${member?.display_name} missed the window — system replaced ${slot.player?.name} with ${picked.name} (random)`,
      user_id: slot.user_id,
      player_id: picked.id,
    })

    draftedIds.add(picked.id)
    replaced++
  }

  return { replaced }
}

/**
 * Close a draft window and auto-replace any remaining eliminated players.
 */
export async function closeDraftWindow(leagueId: string, windowType: DraftWindowType) {
  const supabase = await createClient()

  // Auto-replace remaining eliminated players
  await autoReplaceEliminatedPlayers(leagueId, windowType)

  // Close the window
  await supabase
    .from('draft_windows')
    .update({
      status: 'complete',
      closes_at: new Date().toISOString(),
    })
    .eq('league_id', leagueId)
    .eq('window_type', windowType)
    .eq('status', 'active')

  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'transfer',
    description: 'Draft window closed. All eliminated players have been replaced.',
  })

  return { success: true }
}
