import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { POINTS, applyBenchMultiplier } from '@/lib/scoring/engine'

const TEST_LEAGUE_ID = '22222222-2222-2222-2222-222222222222'

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

  // Get all squad slots with player data for the test league
  const { data: allSlots } = await supabase
    .from('squad_slots')
    .select('user_id, player_id, is_starting, position, player:players(id, name, nation, position)')
    .eq('league_id', TEST_LEAGUE_ID)

  if (!allSlots?.length) {
    return NextResponse.json({ error: 'No squad data. Complete the draft first.' }, { status: 400 })
  }

  // Get captain data for each user
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id, display_name, captain_player_id')
    .eq('league_id', TEST_LEAGUE_ID)

  const captainMap = new Map((members || []).map((m) => [m.user_id, m.captain_player_id]))
  const nameMap = new Map((members || []).map((m) => [m.user_id, m.display_name]))

  // Check if matchday already processed
  const { count: existingEvents } = await supabase
    .from('match_events')
    .select('id', { count: 'exact', head: true })

  if (existingEvents && existingEvents > 0) {
    // Clear existing events for re-test
    await supabase.from('match_events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('scores').delete().eq('league_id', TEST_LEAGUE_ID)
    await supabase.from('activity_feed').delete().eq('league_id', TEST_LEAGUE_ID).eq('event_type', 'scoring_event')
  }

  // Collect all unique players in squads
  type SlotInfo = { user_id: string; player_id: string; is_starting: boolean; player: { id: string; name: string; nation: string; position: string } | null }
  const slots = allSlots as unknown as SlotInfo[]
  const uniquePlayers = new Map<string, { name: string; nation: string; position: string }>()
  for (const s of slots) {
    if (s.player) uniquePlayers.set(s.player.id, { name: s.player.name, nation: s.player.nation, position: s.player.position })
  }

  // Generate match events — pick players from squads so points register
  const playerList = Array.from(uniquePlayers.entries())
  const matchEvents: Array<{
    match_id: string
    match_date: string
    player_id: string
    event_type: string
    minute: number | null
    points_awarded: number
  }> = []

  // Simulate 6 matches with events for squad players
  const matchDate = '2026-06-12'
  let matchCounter = 0

  // Group players by nation for realistic match assignments
  const byNation = new Map<string, Array<[string, { name: string; nation: string; position: string }]>>()
  for (const [pid, info] of playerList) {
    if (!byNation.has(info.nation)) byNation.set(info.nation, [])
    byNation.get(info.nation)!.push([pid, info])
  }

  const nations = Array.from(byNation.keys())

  // Create matches between nations that have squad players
  for (let i = 0; i < nations.length - 1 && matchCounter < 6; i += 2) {
    matchCounter++
    const matchId = `TEST-MD1-${matchCounter}`
    const nation1 = nations[i]
    const nation2 = nations[i + 1] || nations[0]
    const nation1Players = byNation.get(nation1) || []
    const nation2Players = byNation.get(nation2) || []

    // Give appearances to all players from both nations
    for (const [pid] of [...nation1Players, ...nation2Players]) {
      matchEvents.push({
        match_id: matchId, match_date: matchDate, player_id: pid,
        event_type: 'appearance_full', minute: 90, points_awarded: POINTS.appearance_full,
      })
    }

    // Goals and assists for nation1
    if (nation1Players.length > 0) {
      const scorer = nation1Players.find(([, p]) => p.position === 'ATT') || nation1Players[0]
      matchEvents.push({
        match_id: matchId, match_date: matchDate, player_id: scorer[0],
        event_type: 'goal', minute: 23, points_awarded: POINTS.goal,
      })
      if (nation1Players.length > 1) {
        const assister = nation1Players.find(([, p]) => p.position === 'MID') || nation1Players[1]
        matchEvents.push({
          match_id: matchId, match_date: matchDate, player_id: assister[0],
          event_type: 'assist', minute: 23, points_awarded: POINTS.assist,
        })
      }
    }

    // A goal for nation2
    if (nation2Players.length > 0) {
      const scorer = nation2Players.find(([, p]) => p.position === 'ATT') || nation2Players[0]
      matchEvents.push({
        match_id: matchId, match_date: matchDate, player_id: scorer[0],
        event_type: 'goal', minute: 55, points_awarded: POINTS.goal,
      })
    }

    // Yellow card
    if (nation1Players.length > 2) {
      const carded = nation1Players.find(([, p]) => p.position === 'DEF') || nation1Players[2]
      matchEvents.push({
        match_id: matchId, match_date: matchDate, player_id: carded[0],
        event_type: 'yellow', minute: 67, points_awarded: POINTS.yellow,
      })
    }

    // Clean sheet for GK/DEF if nation2 scored 0 (skip for first match to have variety)
    if (matchCounter > 1 && nation2Players.length === 0) {
      for (const [pid, info] of nation1Players) {
        if (info.position === 'GK' || info.position === 'DEF') {
          matchEvents.push({
            match_id: matchId, match_date: matchDate, player_id: pid,
            event_type: 'clean_sheet', minute: null, points_awarded: POINTS.clean_sheet,
          })
        }
      }
    }

    // Penalty save for a GK (test the +5)
    if (matchCounter === 1) {
      const gk = [...nation1Players, ...nation2Players].find(([, p]) => p.position === 'GK')
      if (gk) {
        matchEvents.push({
          match_id: matchId, match_date: matchDate, player_id: gk[0],
          event_type: 'penalty_save', minute: 34, points_awarded: POINTS.penalty_save,
        })
      }
    }
  }

  // Insert all match events
  if (matchEvents.length > 0) {
    const { error: insertErr } = await supabase.from('match_events').insert(matchEvents)
    if (insertErr) {
      return NextResponse.json({ error: `Events: ${insertErr.message}` }, { status: 500 })
    }
  }

  // Calculate scores per user
  const scoreUpdates: Record<string, number> = {}

  for (const slot of slots) {
    if (!slot.player) continue
    const playerEvents = matchEvents.filter((e) => e.player_id === slot.player_id)
    if (playerEvents.length === 0) continue

    let playerPoints = 0
    for (const event of playerEvents) {
      playerPoints += event.points_awarded
    }

    // Captain doubles
    if (slot.player_id === captainMap.get(slot.user_id)) {
      playerPoints *= 2
    }

    // Bench multiplier
    if (!slot.is_starting) {
      playerPoints = applyBenchMultiplier(playerPoints)
    }

    scoreUpdates[slot.user_id] = (scoreUpdates[slot.user_id] || 0) + playerPoints
  }

  // Upsert scores
  for (const [userId, points] of Object.entries(scoreUpdates)) {
    const { data: existing } = await supabase
      .from('scores')
      .select('id, total_points')
      .eq('league_id', TEST_LEAGUE_ID)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      await supabase.from('scores').update({
        total_points: existing.total_points + points,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('scores').insert({
        league_id: TEST_LEAGUE_ID,
        user_id: userId,
        total_points: points,
      })
    }

    // Activity feed
    const userName = nameMap.get(userId) || 'Unknown'
    await supabase.from('activity_feed').insert({
      league_id: TEST_LEAGUE_ID,
      event_type: 'scoring_event',
      description: `${userName} earned ${points} pts from Matchday 1`,
      user_id: userId,
    })
  }

  // Also add individual scoring events to feed
  for (const event of matchEvents) {
    if (event.event_type === 'appearance_full' || event.event_type === 'appearance_sub') continue
    const player = uniquePlayers.get(event.player_id)
    if (!player) continue

    // Find which user has this player
    const ownerSlot = slots.find((s) => s.player_id === event.player_id)
    if (!ownerSlot) continue

    const ownerName = nameMap.get(ownerSlot.user_id) || 'Unknown'
    const eventLabel = event.event_type === 'goal' ? 'scored' : event.event_type === 'assist' ? 'assisted' : event.event_type === 'penalty_save' ? 'penalty save' : event.event_type === 'yellow' ? 'yellow card' : event.event_type

    await supabase.from('activity_feed').insert({
      league_id: TEST_LEAGUE_ID,
      event_type: 'scoring_event',
      description: `${ownerName}'s ${player.name} ${eventLabel} — ${event.points_awarded > 0 ? '+' : ''}${event.points_awarded} pts`,
      user_id: ownerSlot.user_id,
      player_id: event.player_id,
    })
  }

  // Calculate player of the round
  const playerTotals = new Map<string, number>()
  for (const event of matchEvents) {
    playerTotals.set(event.player_id, (playerTotals.get(event.player_id) || 0) + event.points_awarded)
  }
  let bestPlayerId: string | null = null
  let bestPoints = 0
  for (const [pid, pts] of playerTotals) {
    if (pts > bestPoints) { bestPoints = pts; bestPlayerId = pid }
  }

  // Lock lineups after matchday + set player of round
  await supabase
    .from('leagues')
    .update({
      lineup_locked: true,
      current_stage: 'group_stage',
      ...(bestPlayerId ? { player_of_round_id: bestPlayerId } : {}),
    } as Record<string, unknown>)
    .eq('id', TEST_LEAGUE_ID)

  return NextResponse.json({
    message: 'Matchday 1 simulated',
    events_created: matchEvents.length,
    score_updates: scoreUpdates,
    captain_testing: 'Captain points are doubled in score calculation',
    lineup_locked: true,
  })
}
