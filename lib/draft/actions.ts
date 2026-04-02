'use server'

import { getActionUser } from '@/lib/supabase/auth'
import {
  getCurrentDraftState,
  canDraftPosition,
  canDraftFromNation,
  TOTAL_ROUNDS,
  type DraftPick,
} from './logic'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function startDraft(leagueId: string) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Verify creator
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single()

  if (!league || league.created_by !== user.id) {
    return { error: 'Only the league creator can start the draft' }
  }

  if (league.draft_status !== 'pre_draft') {
    return { error: 'Draft has already started' }
  }

  // Check minimum participants (at least 2)
  const { count } = await supabase
    .from('league_members')
    .select('id', { count: 'exact', head: true })
    .eq('league_id', leagueId)

  if (!count || count < 2) {
    return { error: 'Need at least 2 participants to start the draft' }
  }

  // Randomise draft order
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id')
    .eq('league_id', leagueId)

  const userIds = members?.map((m) => m.user_id) || []
  const randomOrder = shuffleArray(userIds)

  // Update league
  const { error } = await supabase
    .from('leagues')
    .update({
      draft_status: 'in_progress',
      draft_order: randomOrder,
    })
    .eq('id', leagueId)

  if (error) return { error: error.message }

  // Create initial draft window
  await supabase.from('draft_windows').insert({
    league_id: leagueId,
    window_type: 'initial',
    status: 'active',
    opens_at: new Date().toISOString(),
  })

  // Activity feed
  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'draft_pick',
    description: 'The draft has begun! Good luck.',
    user_id: user.id,
  })

  return { success: true }
}

export async function makePick(leagueId: string, playerId: string) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  // Get league
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single()

  if (!league || league.draft_status !== 'in_progress') {
    return { error: 'Draft is not active' }
  }

  const draftOrder = (league.draft_order as string[]) || []

  // Get existing picks with player data
  const { data: existingPicks } = await supabase
    .from('draft_picks')
    .select('*, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', leagueId)
    .eq('draft_window', 'initial')
    .order('pick_number', { ascending: true })

  const picks = (existingPicks || []) as unknown as DraftPick[]

  // Check it's this user's turn
  const state = getCurrentDraftState(draftOrder, picks)
  if (state.isComplete) {
    return { error: 'Draft is complete' }
  }
  if (state.currentPickerUserId !== user.id) {
    return { error: 'It is not your turn to pick' }
  }

  // Check player not already drafted
  const alreadyDrafted = picks.some((p) => p.player_id === playerId)
  if (alreadyDrafted) {
    return { error: 'This player has already been drafted' }
  }

  // Get player to check position
  const { data: player } = await supabase
    .from('players')
    .select('id, name, nation, position')
    .eq('id', playerId)
    .single()

  if (!player) {
    return { error: 'Player not found' }
  }

  // Check position limit
  if (!canDraftPosition(user.id, player.position, picks)) {
    return { error: `You have already filled all ${player.position} slots` }
  }

  // Check nation limit
  const isSharedPool = league.shared_pool || false
  if (!canDraftFromNation(user.id, player.nation, picks, isSharedPool)) {
    const limit = isSharedPool ? 7 : 3
    return { error: `You already have ${limit} players from ${player.nation}` }
  }

  // Insert the pick
  const { error: pickError } = await supabase.from('draft_picks').insert({
    league_id: leagueId,
    user_id: user.id,
    player_id: playerId,
    round: state.currentRound,
    pick_number: state.pickNumber!,
    draft_window: 'initial',
    is_auto_pick: false,
    is_starting_xi: true,
  })

  if (pickError) {
    return { error: pickError.message }
  }

  // Also add to squad_slots
  await supabase.from('squad_slots').insert({
    league_id: leagueId,
    user_id: user.id,
    player_id: playerId,
    position: player.position,
    is_starting: true,
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
    event_type: 'draft_pick',
    description: `${member?.display_name || 'Unknown'} drafted ${player.name} (${player.position})`,
    user_id: user.id,
    player_id: playerId,
  })

  // Check if draft is now complete
  const totalPicksNeeded = TOTAL_ROUNDS * draftOrder.length
  const newPickCount = picks.length + 1
  if (newPickCount >= totalPicksNeeded) {
    await supabase
      .from('leagues')
      .update({ draft_status: 'completed' })
      .eq('id', leagueId)

    await supabase
      .from('draft_windows')
      .update({ status: 'complete', closes_at: new Date().toISOString() })
      .eq('league_id', leagueId)
      .eq('window_type', 'initial')

    await supabase.from('activity_feed').insert({
      league_id: leagueId,
      event_type: 'draft_pick',
      description: 'The draft is complete! Set your formations.',
    })
  }

  return { success: true }
}
