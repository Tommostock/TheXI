import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getCurrentDraftState,
  canDraftPosition,
  canDraftFromNation,
  getAllowedPositions,
  TOTAL_ROUNDS,
  POSITION_LIMITS,
  type DraftPick,
} from '@/lib/draft/logic'

const TEST_LEAGUE_ID = '22222222-2222-2222-2222-222222222222'
const TOM_ID = '42c16e22-4291-4eaf-9bca-c4ff7fd2a727'
const BOT_IDS = new Set([
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // Dave
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', // Jake
])

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: Request) {
  if (request.headers.get('x-seed-secret') !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdmin()

  // Get league
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', TEST_LEAGUE_ID)
    .single()

  if (!league || league.draft_status !== 'in_progress') {
    return NextResponse.json({ error: 'Draft not active. Start the draft first.' }, { status: 400 })
  }

  const draftOrder = (league.draft_order as string[]) || []

  // Get all existing picks
  const { data: existingPicks } = await supabase
    .from('draft_picks')
    .select('*, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', TEST_LEAGUE_ID)
    .eq('draft_window', 'initial')
    .order('pick_number', { ascending: true })

  const picks = (existingPicks || []) as unknown as DraftPick[]

  // Get all available players
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, name, nation, position')
    .eq('is_eliminated', false)

  const draftedPlayerIds = new Set(picks.map((p) => p.player_id))

  let botPicksMade = 0
  let currentPicks = [...picks]

  // Keep picking while it's a bot's turn
  while (true) {
    const state = getCurrentDraftState(draftOrder, currentPicks)
    if (state.isComplete) {
      // Mark draft as completed
      await supabase
        .from('leagues')
        .update({ draft_status: 'completed' })
        .eq('id', TEST_LEAGUE_ID)
      break
    }

    const currentPicker = state.currentPickerUserId!
    if (!BOT_IDS.has(currentPicker)) {
      // It's Tom's turn — stop
      break
    }

    // Find allowed positions for this bot
    const allowedPositions = getAllowedPositions(currentPicker, currentPicks)

    // Find available players matching position and nation limits
    const candidates = (allPlayers || []).filter((p) => {
      if (draftedPlayerIds.has(p.id)) return false
      if (!allowedPositions.includes(p.position)) return false
      if (!canDraftFromNation(currentPicker, p.nation, currentPicks, false)) return false
      return true
    })

    if (candidates.length === 0) {
      return NextResponse.json({ error: 'No valid candidates for bot pick' }, { status: 500 })
    }

    // Pick strategy: prioritize ATT > MID > DEF > GK for variety
    const positionPriority = ['ATT', 'MID', 'DEF', 'GK']
    let picked = candidates[0]
    for (const pos of positionPriority) {
      const posPlayer = candidates.find((c) => c.position === pos)
      if (posPlayer) {
        picked = posPlayer
        break
      }
    }

    // Insert pick
    const { error: pickError } = await supabase.from('draft_picks').insert({
      league_id: TEST_LEAGUE_ID,
      user_id: currentPicker,
      player_id: picked.id,
      round: state.currentRound,
      pick_number: state.pickNumber!,
      draft_window: 'initial',
      is_auto_pick: true,
      is_starting_xi: true,
    })

    if (pickError) {
      return NextResponse.json({ error: pickError.message }, { status: 500 })
    }

    // Insert squad slot
    await supabase.from('squad_slots').insert({
      league_id: TEST_LEAGUE_ID,
      user_id: currentPicker,
      player_id: picked.id,
      position: picked.position,
      is_starting: true,
    })

    // Activity feed
    const botName = currentPicker === 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' ? 'Dave' : 'Jake'
    await supabase.from('activity_feed').insert({
      league_id: TEST_LEAGUE_ID,
      event_type: 'draft_pick',
      description: `${botName} drafted ${picked.name} (${picked.position})`,
      user_id: currentPicker,
      player_id: picked.id,
    })

    draftedPlayerIds.add(picked.id)
    currentPicks.push({
      id: '',
      league_id: TEST_LEAGUE_ID,
      user_id: currentPicker,
      player_id: picked.id,
      round: state.currentRound,
      pick_number: state.pickNumber!,
      draft_window: 'initial',
      is_auto_pick: true,
      is_starting_xi: true,
      picked_at: new Date().toISOString(),
      player: {
        id: picked.id,
        name: picked.name,
        nation: picked.nation,
        nation_flag_url: null,
        position: picked.position,
      },
    } as DraftPick)

    botPicksMade++
  }

  const finalState = getCurrentDraftState(draftOrder, currentPicks)

  return NextResponse.json({
    message: botPicksMade > 0 ? `Bots made ${botPicksMade} pick(s)` : "It's your turn to pick",
    total_picks: currentPicks.length,
    draft_complete: finalState.isComplete,
    current_round: finalState.currentRound,
    your_turn: finalState.currentPickerUserId === TOM_ID,
    next_picker: finalState.currentPickerUserId,
  })
}
