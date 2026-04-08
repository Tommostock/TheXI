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

      // Build substitution map: player_id -> minute they were subbed in or out
      // subIn: minute the player entered the pitch
      // subOut: minute the player left the pitch
      const subIn = new Map<number, number>()
      const subOut = new Map<number, number>()

      for (const event of events) {
        if (event.type === 'subst' && event.time?.elapsed != null) {
          // event.player is the player going OFF, event.assist is the player coming ON
          if (event.player?.id) subOut.set(event.player.id, event.time.elapsed)
          if (event.assist?.id) subIn.set(event.assist.id, event.time.elapsed)
        }
      }

      // Match duration in regular time (90 mins, capped — ignore extra time for scoring)
      const fullTime = 90

      // Process goals, assists, cards, penalty saves
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
          } else if (event.detail === 'Penalty') {
            // Normal penalty goal (not shootout) — counts as a goal
            matchEvents.push({
              api_player_id: event.player.id,
              event_type: 'goal',
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

        // Penalty save — GK saves a penalty during regular play
        if (
          event.type === 'Goal' &&
          event.detail === 'Missed Penalty' &&
          event.comments !== 'Penalty Shootout'
        ) {
          // The goalkeeper who saved it isn't in the event data directly.
          // We'll mark the opposing team's GK in the lineup processing below.
          // Store the team that missed so we can credit the other team's GK.
          // (handled after lineups are processed)
        }
      }

      // Collect penalty misses (regular time only) to credit GK saves
      const penaltyMissTeams = new Set<number>()
      for (const event of events) {
        if (
          event.type === 'Goal' &&
          event.detail === 'Missed Penalty' &&
          event.comments !== 'Penalty Shootout' &&
          event.team?.id
        ) {
          penaltyMissTeams.add(event.team.id)
        }
      }

      // Process appearances from lineups using real sub times
      for (let teamIdx = 0; teamIdx < lineups.length; teamIdx++) {
        const team = lineups[teamIdx]
        const teamId = team.team?.id

        // Starters
        for (const p of team.startXI || []) {
          const playerId = p.player?.id
          if (!playerId) continue

          // Starter: played from minute 0 until subbed out or full time
          const endMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          const minutesPlayed = Math.min(endMin, fullTime)

          const appType = minutesPlayed >= 60 ? 'appearance_full' : 'appearance_sub'
          matchEvents.push({
            api_player_id: playerId,
            event_type: appType,
            minute: minutesPlayed,
          })
        }

        // Substitutes who came on
        for (const p of team.substitutes || []) {
          const playerId = p.player?.id
          if (!playerId) continue

          // Only count subs who actually entered the match
          if (!subIn.has(playerId)) continue

          const enterMin = subIn.get(playerId)!
          const exitMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          const minutesPlayed = Math.min(exitMin, fullTime) - Math.min(enterMin, fullTime)

          if (minutesPlayed <= 0) continue

          const appType = minutesPlayed >= 60 ? 'appearance_full' : 'appearance_sub'
          matchEvents.push({
            api_player_id: playerId,
            event_type: appType,
            minute: minutesPlayed,
          })
        }

        // Credit GK with penalty save if the OTHER team missed a penalty
        if (penaltyMissTeams.size > 0 && teamId) {
          // Check if the opposing team missed a penalty — credit this team's GK
          const opposingTeamIdx = teamIdx === 0 ? 1 : 0
          const opposingTeamId = lineups[opposingTeamIdx]?.team?.id
          if (opposingTeamId && penaltyMissTeams.has(opposingTeamId)) {
            // Find GK from startXI (first player is typically GK, or check grid position)
            const gk = (team.startXI || [])[0]
            if (gk?.player?.id) {
              matchEvents.push({
                api_player_id: gk.player.id,
                event_type: 'penalty_save',
                minute: null,
              })
            }
          }
        }
      }

      // Check clean sheets — only starters/subs who played 60+ mins
      const homeGoals = fixture.goals?.home ?? 0
      const awayGoals = fixture.goals?.away ?? 0

      // Home team clean sheet check (conceded 0 from away team)
      if (awayGoals === 0 && lineups[0]) {
        for (const p of lineups[0].startXI || []) {
          const playerId = p.player?.id
          if (!playerId) continue
          const endMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          if (Math.min(endMin, fullTime) >= 60) {
            matchEvents.push({
              api_player_id: playerId,
              event_type: 'clean_sheet',
              minute: null,
            })
          }
        }
        // Subs who played 60+ also get clean sheet
        for (const p of lineups[0].substitutes || []) {
          const playerId = p.player?.id
          if (!playerId || !subIn.has(playerId)) continue
          const enterMin = subIn.get(playerId)!
          const exitMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          if (Math.min(exitMin, fullTime) - Math.min(enterMin, fullTime) >= 60) {
            matchEvents.push({
              api_player_id: playerId,
              event_type: 'clean_sheet',
              minute: null,
            })
          }
        }
      }

      // Away team clean sheet check (conceded 0 from home team)
      if (homeGoals === 0 && lineups[1]) {
        for (const p of lineups[1].startXI || []) {
          const playerId = p.player?.id
          if (!playerId) continue
          const endMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          if (Math.min(endMin, fullTime) >= 60) {
            matchEvents.push({
              api_player_id: playerId,
              event_type: 'clean_sheet',
              minute: null,
            })
          }
        }
        for (const p of lineups[1].substitutes || []) {
          const playerId = p.player?.id
          if (!playerId || !subIn.has(playerId)) continue
          const enterMin = subIn.get(playerId)!
          const exitMin = subOut.has(playerId) ? subOut.get(playerId)! : fullTime
          if (Math.min(exitMin, fullTime) - Math.min(enterMin, fullTime) >= 60) {
            matchEvents.push({
              api_player_id: playerId,
              event_type: 'clean_sheet',
              minute: null,
            })
          }
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
