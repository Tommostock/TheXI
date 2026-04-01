import { NextResponse } from 'next/server'
import { apiFetch, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/api-football/client'

/**
 * GET /api/poll-matches
 *
 * Polls API-Football for today's World Cup match events.
 * Returns structured data that can be fed to /api/process-matches.
 *
 * This is designed to be called by a cron job every 10-15 minutes on match days.
 * Budget: ~40-60 requests on busy days, well within 100/day limit.
 */

export async function GET(request: Request) {
  const authHeader = request.headers.get('x-seed-secret')
  if (authHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json(
      { error: 'API_FOOTBALL_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    // Get today's World Cup fixtures
    const today = new Date().toISOString().split('T')[0]
    const fixturesData = await apiFetch(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&date=${today}`
    )

    const fixtures = fixturesData.response || []

    if (fixtures.length === 0) {
      return NextResponse.json({ message: 'No matches today', date: today })
    }

    const results = []

    for (const fixture of fixtures) {
      const fixtureId = fixture.fixture.id
      const status = fixture.fixture.status.short

      // Only process finished or live matches
      if (!['FT', 'AET', 'PEN', '1H', '2H', 'HT', 'ET'].includes(status)) {
        continue
      }

      // Fetch events for this fixture (1 API call)
      const eventsData = await apiFetch(`/fixtures/events?fixture=${fixtureId}`)
      const events = eventsData.response || []

      // Fetch lineups for minutes played (1 API call)
      const lineupsData = await apiFetch(
        `/fixtures/lineups?fixture=${fixtureId}`
      )
      const lineups = lineupsData.response || []

      // Build match events
      const matchEvents: Array<{
        api_player_id: number
        event_type: string
        minute: number | null
      }> = []

      // Process goals, assists, cards
      for (const event of events) {
        if (!event.player?.id) continue

        // Skip penalty shootout events
        if (event.comments === 'Penalty Shootout') continue

        if (event.type === 'Goal' && event.detail !== 'Missed Penalty') {
          if (event.detail === 'Own Goal') {
            matchEvents.push({
              api_player_id: event.player.id,
              event_type: 'own_goal',
              minute: event.time?.elapsed ?? null,
            })
          } else {
            matchEvents.push({
              api_player_id: event.player.id,
              event_type: 'goal',
              minute: event.time?.elapsed ?? null,
            })
          }
          // Assist
          if (event.assist?.id) {
            matchEvents.push({
              api_player_id: event.assist.id,
              event_type: 'assist',
              minute: event.time?.elapsed ?? null,
            })
          }
        }

        if (event.type === 'Card') {
          if (event.detail === 'Yellow Card') {
            matchEvents.push({
              api_player_id: event.player.id,
              event_type: 'yellow',
              minute: event.time?.elapsed ?? null,
            })
          } else if (event.detail === 'Red Card') {
            matchEvents.push({
              api_player_id: event.player.id,
              event_type: 'red',
              minute: event.time?.elapsed ?? null,
            })
          }
        }
      }

      // Process appearances from lineups
      for (const team of lineups) {
        const allPlayers = [
          ...(team.startXI || []).map((p: { player: { id: number } }) => ({
            ...p.player,
            started: true,
          })),
          ...(team.substitutes || []).map(
            (p: { player: { id: number } }) => ({
              ...p.player,
              started: false,
            })
          ),
        ]

        for (const player of allPlayers) {
          // Calculate minutes played (simplified — would need sub events for accuracy)
          // For now, starters get 90, subs get estimated based on sub time
          const minutesPlayed = player.started ? 90 : 30 // Simplified

          const appType =
            minutesPlayed >= 60 ? 'appearance_full' : 'appearance_sub'

          matchEvents.push({
            api_player_id: player.id,
            event_type: appType,
            minute: minutesPlayed,
          })
        }
      }

      // Check clean sheets
      const homeGoals = fixture.goals?.home ?? 0
      const awayGoals = fixture.goals?.away ?? 0

      // Home team clean sheet check
      if (awayGoals === 0 && lineups[0]) {
        for (const p of lineups[0].startXI || []) {
          // Would need position data — handled in process-matches via player table
          matchEvents.push({
            api_player_id: p.player.id,
            event_type: 'clean_sheet',
            minute: null,
          })
        }
      }

      // Away team clean sheet check
      if (homeGoals === 0 && lineups[1]) {
        for (const p of lineups[1].startXI || []) {
          matchEvents.push({
            api_player_id: p.player.id,
            event_type: 'clean_sheet',
            minute: null,
          })
        }
      }

      results.push({
        match_id: String(fixtureId),
        match_date: today,
        status,
        home: fixture.teams?.home?.name,
        away: fixture.teams?.away?.name,
        score: `${homeGoals}-${awayGoals}`,
        events: matchEvents,
      })
    }

    return NextResponse.json({
      date: today,
      matches_found: fixtures.length,
      matches_processed: results.length,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
