import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getCurrentDraftState,
  getAllowedPositions,
  getPickOrderForRound,
  TOTAL_ROUNDS,
  type DraftPick,
} from '@/lib/draft/logic'
import {
  calculatePickDeadline,
  DEFAULT_ACTIVE_START,
  DEFAULT_ACTIVE_END,
  DEFAULT_PICK_WINDOW_MINUTES,
} from '@/lib/draft/activeHours'
import { sendPushToUser } from '@/lib/notifications/push'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { leagueId } = body as { leagueId?: string }
  if (!leagueId) return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 })

  const supabase = getAdmin()
  const now = new Date()

  // Get draft window deadline
  const { data: draftWindow } = await supabase
    .from('draft_windows')
    .select('id, current_pick_deadline')
    .eq('league_id', leagueId)
    .eq('window_type', 'initial')
    .eq('status', 'active')
    .single()

  if (!draftWindow?.current_pick_deadline) {
    return NextResponse.json({ error: 'No active draft window' }, { status: 400 })
  }

  if (new Date(draftWindow.current_pick_deadline) > now) {
    return NextResponse.json({ message: 'Deadline not yet passed' })
  }

  // Get league and picks
  const { data: league } = await supabase
    .from('leagues')
    .select('draft_order, draft_pick_window_minutes, draft_active_start, draft_active_end')
    .eq('id', leagueId)
    .single()

  if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 })

  const draftOrder = (league.draft_order as string[]) || []

  const { data: existingPicks } = await supabase
    .from('draft_picks')
    .select('*, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', leagueId)
    .eq('draft_window', 'initial')
    .order('pick_number', { ascending: true })

  const picks = (existingPicks || []) as unknown as DraftPick[]
  const state = getCurrentDraftState(draftOrder, picks)

  if (state.isComplete || !state.currentPickerUserId) {
    return NextResponse.json({ message: 'Draft complete or no picker' })
  }

  const allowedPositions = getAllowedPositions(state.currentPickerUserId, picks)
  if (!allowedPositions.length) {
    return NextResponse.json({ error: 'No allowed positions' }, { status: 400 })
  }

  // Pick a random available player
  const draftedIds = picks.map((p) => p.player_id)
  const { data: candidates } = await supabase
    .from('players')
    .select('id, name, nation, position')
    .in('position', allowedPositions)
    .not('id', 'in', `(${draftedIds.length ? draftedIds.join(',') : 'null'})`)
    .eq('is_eliminated', false)

  if (!candidates?.length) {
    return NextResponse.json({ error: 'No candidates' }, { status: 400 })
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]

  await supabase.from('draft_picks').insert({
    league_id: leagueId,
    user_id: state.currentPickerUserId,
    player_id: chosen.id,
    round: state.currentRound,
    pick_number: state.pickNumber!,
    draft_window: 'initial',
    is_auto_pick: true,
    is_starting_xi: true,
  })

  await supabase.from('squad_slots').insert({
    league_id: leagueId,
    user_id: state.currentPickerUserId,
    player_id: chosen.id,
    position: chosen.position,
    is_starting: true,
  })

  const { data: member } = await supabase
    .from('league_members')
    .select('display_name')
    .eq('league_id', leagueId)
    .eq('user_id', state.currentPickerUserId)
    .single()

  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'draft_pick',
    description: `${member?.display_name || 'Unknown'} missed their pick — system drafted ${chosen.name} (${chosen.position}) automatically`,
    user_id: state.currentPickerUserId,
    player_id: chosen.id,
  })

  const newPickCount = picks.length + 1
  const totalPicksNeeded = TOTAL_ROUNDS * draftOrder.length

  if (newPickCount >= totalPicksNeeded) {
    await supabase.from('leagues').update({ draft_status: 'completed' }).eq('id', leagueId)
    await supabase.from('draft_windows').update({ status: 'complete', closes_at: now.toISOString() }).eq('id', draftWindow.id)
    await supabase.from('activity_feed').insert({ league_id: leagueId, event_type: 'draft_pick', description: 'The draft is complete! Set your formations.' })
  } else {
    const windowMinutes = (league.draft_pick_window_minutes as number) ?? DEFAULT_PICK_WINDOW_MINUTES
    const activeStart = (league.draft_active_start as number) ?? DEFAULT_ACTIVE_START
    const activeEnd = (league.draft_active_end as number) ?? DEFAULT_ACTIVE_END
    const nextDeadline = calculatePickDeadline(now, windowMinutes, activeStart, activeEnd)

    await supabase.from('draft_windows').update({ current_pick_deadline: nextDeadline.toISOString() }).eq('id', draftWindow.id)

    const nextRound = Math.floor(newPickCount / draftOrder.length) + 1
    const nextPosInRound = newPickCount % draftOrder.length
    const nextRoundOrder = getPickOrderForRound(draftOrder, nextRound)
    const nextPickerUserId = nextRoundOrder[nextPosInRound]

    if (nextPickerUserId) {
      sendPushToUser(nextPickerUserId, {
        title: 'The XI — Your Pick!',
        body: `It's your turn to pick! (Round ${nextRound})`,
        url: `/draft/${leagueId}`,
      }).catch(() => {})
    }
  }

  return NextResponse.json({ message: `Auto-picked ${chosen.name} for missed deadline`, player: chosen.name })
}
