import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  POINTS,
  applyBenchMultiplier,
  qualifiesForCleanSheet,
  getAppearanceType,
} from '@/lib/scoring/engine'

/**
 * POST /api/process-matches
 *
 * Processes match events and updates scores for all leagues.
 * In production, this would be called by a cron job on match days.
 * For now, it can also accept manually submitted match data for testing.
 *
 * Body: { match_id, match_date, events: [...] }
 * Each event: { api_player_id?, player_name?, event_type, minute }
 */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return createClient(url, serviceKey)
}

type EventInput = {
  player_name?: string
  api_player_id?: number
  player_id?: string
  event_type: string
  minute: number | null
}

type MatchInput = {
  match_id: string
  match_date: string
  events: EventInput[]
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: MatchInput = await request.json()
  const { match_id, match_date, events } = body

  if (!match_id || !match_date || !events?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getAdminClient()

  // Check if this match was already processed
  const { count: existingCount } = await supabase
    .from('match_events')
    .select('id', { count: 'exact', head: true })
    .eq('match_id', match_id)

  if (existingCount && existingCount > 0) {
    return NextResponse.json({ message: 'Match already processed', match_id })
  }

  // Resolve player IDs
  const resolvedEvents: Array<{ player_id: string; event_type: string; minute: number | null }> = []

  for (const event of events) {
    let playerId = event.player_id

    if (!playerId && event.player_name) {
      const { data } = await supabase
        .from('players')
        .select('id')
        .ilike('name', `%${event.player_name}%`)
        .limit(1)
        .single()
      playerId = data?.id
    }

    if (!playerId && event.api_player_id) {
      const { data } = await supabase
        .from('players')
        .select('id')
        .eq('api_football_id', event.api_player_id)
        .single()
      playerId = data?.id
    }

    if (playerId && POINTS[event.event_type] !== undefined) {
      resolvedEvents.push({
        player_id: playerId,
        event_type: event.event_type,
        minute: event.minute,
      })
    }
  }

  if (resolvedEvents.length === 0) {
    return NextResponse.json({ message: 'No matching players found', match_id })
  }

  // Insert match events
  const matchEvents = resolvedEvents.map((e) => ({
    match_id,
    match_date,
    player_id: e.player_id,
    event_type: e.event_type,
    minute: e.minute,
    points_awarded: POINTS[e.event_type] || 0,
  }))

  const { error: insertError } = await supabase
    .from('match_events')
    .insert(matchEvents)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Now update scores for all leagues
  // Get all squad_slots that reference these players
  const playerIds = [...new Set(resolvedEvents.map((e) => e.player_id))]

  const { data: affectedSlots } = await supabase
    .from('squad_slots')
    .select('league_id, user_id, player_id, is_starting')
    .in('player_id', playerIds)

  if (!affectedSlots?.length) {
    return NextResponse.json({
      message: 'Match events recorded but no drafted players affected',
      match_id,
      events_count: matchEvents.length,
    })
  }

  // Group points by league+user
  const scoreUpdates: Record<string, number> = {}

  for (const slot of affectedSlots) {
    const key = `${slot.league_id}:${slot.user_id}`
    const playerEvents = resolvedEvents.filter((e) => e.player_id === slot.player_id)

    let playerPoints = 0
    for (const event of playerEvents) {
      playerPoints += POINTS[event.event_type] || 0
    }

    // Apply bench multiplier
    if (!slot.is_starting) {
      playerPoints = applyBenchMultiplier(playerPoints)
    }

    scoreUpdates[key] = (scoreUpdates[key] || 0) + playerPoints
  }

  // Upsert scores
  let updatedCount = 0
  for (const [key, points] of Object.entries(scoreUpdates)) {
    const [leagueId, userId] = key.split(':')

    // Get current score
    const { data: existing } = await supabase
      .from('scores')
      .select('id, total_points')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase
        .from('scores')
        .update({
          total_points: existing.total_points + points,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('scores').insert({
        league_id: leagueId,
        user_id: userId,
        total_points: points,
      })
    }
    updatedCount++

    // Activity feed for each scoring event
    for (const slot of affectedSlots.filter(
      (s) => s.league_id === leagueId && s.user_id === userId
    )) {
      const playerEvents = resolvedEvents.filter(
        (e) => e.player_id === slot.player_id
      )
      for (const event of playerEvents) {
        const pts = POINTS[event.event_type] || 0
        const adjustedPts = slot.is_starting ? pts : applyBenchMultiplier(pts)
        if (adjustedPts === 0) continue

        // Get player and member names
        const { data: player } = await supabase
          .from('players')
          .select('name')
          .eq('id', slot.player_id)
          .single()

        const { data: member } = await supabase
          .from('league_members')
          .select('display_name')
          .eq('league_id', leagueId)
          .eq('user_id', userId)
          .single()

        const sign = adjustedPts > 0 ? '+' : ''
        const eventLabel =
          event.event_type === 'goal'
            ? 'scored'
            : event.event_type === 'assist'
            ? 'assisted'
            : event.event_type === 'yellow'
            ? 'yellow card'
            : event.event_type === 'red'
            ? 'red card'
            : event.event_type === 'own_goal'
            ? 'own goal'
            : event.event_type === 'clean_sheet'
            ? 'clean sheet'
            : event.event_type

        await supabase.from('activity_feed').insert({
          league_id: leagueId,
          event_type: 'scoring_event',
          description: `${member?.display_name}'s ${player?.name} ${eventLabel} — ${sign}${adjustedPts} pts`,
          user_id: userId,
          player_id: slot.player_id,
        })
      }
    }
  }

  return NextResponse.json({
    message: 'Match processed successfully',
    match_id,
    events_count: matchEvents.length,
    scores_updated: updatedCount,
  })
}
