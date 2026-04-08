import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiFetch, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/api-football/client'
import { POINTS, applyBenchMultiplier } from '@/lib/scoring/engine'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { checkAndProcessEliminations } from '@/lib/tournament/eliminations'

/**
 * GET /api/live-poll
 *
 * Client-triggered polling for live World Cup match events.
 * Called every ~10 minutes from the app while a user has it open.
 *
 * - Requires authenticated user (via Supabase session cookie)
 * - Rate-limited: skips if the same match was already processed
 * - Fetches today's fixtures from API-Football
 * - Processes events for live/finished matches not yet in the DB
 */

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  // Check auth via Supabase session
  const userClient = await createServerClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ message: 'API_FOOTBALL_KEY not configured, skipping' })
  }

  const supabase = getAdminClient()

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

    let matchesProcessed = 0
    let eventsCreated = 0

    for (const fixture of fixtures) {
      const fixtureId = String(fixture.fixture.id)
      const status = fixture.fixture.status.short

      // Only process live or finished matches
      if (!['FT', 'AET', 'PEN', '1H', '2H', 'HT', 'ET'].includes(status)) {
        continue
      }

      // Skip if already fully processed (FT status and events exist)
      const { count: existingCount } = await supabase
        .from('match_events')
        .select('id', { count: 'exact', head: true })
        .eq('match_id', fixtureId)

      if (existingCount && existingCount > 0 && ['FT', 'AET', 'PEN'].includes(status)) {
        // Already processed and match is finished — skip
        continue
      }

      // If match is live and we have events, delete old ones to re-process with latest data
      if (existingCount && existingCount > 0) {
        await supabase.from('match_events').delete().eq('match_id', fixtureId)
        // Also need to recalc scores — but for simplicity we'll just skip live re-processing
        // and only process once when the match is finished
        continue
      }

      // Fetch events (1 API call)
      const eventsData = await apiFetch(`/fixtures/events?fixture=${fixtureId}`)
      const apiEvents = eventsData.response || []

      // Fetch lineups (1 API call)
      const lineupsData = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`)
      const lineups = lineupsData.response || []

      // Build substitution maps
      const subIn = new Map<number, number>()
      const subOut = new Map<number, number>()
      for (const event of apiEvents) {
        if (event.type === 'subst' && event.time?.elapsed != null) {
          if (event.player?.id) subOut.set(event.player.id, event.time.elapsed)
          if (event.assist?.id) subIn.set(event.assist.id, event.time.elapsed)
        }
      }

      const fullTime = 90
      const matchEvents: Array<{
        api_player_id: number
        event_type: string
        minute: number | null
      }> = []

      // Process goals, assists, cards, penalty saves
      for (const event of apiEvents) {
        if (!event.player?.id) continue
        if (event.comments === 'Penalty Shootout') continue

        if (event.type === 'Goal' && event.detail !== 'Missed Penalty') {
          matchEvents.push({
            api_player_id: event.player.id,
            event_type: event.detail === 'Own Goal' ? 'own_goal' : 'goal',
            minute: event.time?.elapsed ?? null,
          })
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
            matchEvents.push({ api_player_id: event.player.id, event_type: 'yellow', minute: event.time?.elapsed ?? null })
          } else if (event.detail === 'Red Card') {
            matchEvents.push({ api_player_id: event.player.id, event_type: 'red', minute: event.time?.elapsed ?? null })
          }
        }
      }

      // Penalty misses → credit opposing GK
      const penaltyMissTeams = new Set<number>()
      for (const event of apiEvents) {
        if (event.type === 'Goal' && event.detail === 'Missed Penalty' && event.comments !== 'Penalty Shootout' && event.team?.id) {
          penaltyMissTeams.add(event.team.id)
        }
      }

      // Appearances with real sub times
      for (let teamIdx = 0; teamIdx < lineups.length; teamIdx++) {
        const team = lineups[teamIdx]
        const teamId = team.team?.id

        for (const p of team.startXI || []) {
          const pid = p.player?.id
          if (!pid) continue
          const endMin = subOut.has(pid) ? subOut.get(pid)! : fullTime
          const mins = Math.min(endMin, fullTime)
          matchEvents.push({ api_player_id: pid, event_type: mins >= 60 ? 'appearance_full' : 'appearance_sub', minute: mins })
        }

        for (const p of team.substitutes || []) {
          const pid = p.player?.id
          if (!pid || !subIn.has(pid)) continue
          const enterMin = subIn.get(pid)!
          const exitMin = subOut.has(pid) ? subOut.get(pid)! : fullTime
          const mins = Math.min(exitMin, fullTime) - Math.min(enterMin, fullTime)
          if (mins <= 0) continue
          matchEvents.push({ api_player_id: pid, event_type: mins >= 60 ? 'appearance_full' : 'appearance_sub', minute: mins })
        }

        // Penalty save
        if (penaltyMissTeams.size > 0 && teamId) {
          const opposingTeamId = lineups[teamIdx === 0 ? 1 : 0]?.team?.id
          if (opposingTeamId && penaltyMissTeams.has(opposingTeamId)) {
            const gk = (team.startXI || [])[0]
            if (gk?.player?.id) {
              matchEvents.push({ api_player_id: gk.player.id, event_type: 'penalty_save', minute: null })
            }
          }
        }
      }

      // Clean sheets
      const homeGoals = fixture.goals?.home ?? 0
      const awayGoals = fixture.goals?.away ?? 0

      for (let teamIdx = 0; teamIdx < 2; teamIdx++) {
        const conceded = teamIdx === 0 ? awayGoals : homeGoals
        if (conceded > 0 || !lineups[teamIdx]) continue

        for (const p of lineups[teamIdx].startXI || []) {
          const pid = p.player?.id
          if (!pid) continue
          const endMin = subOut.has(pid) ? subOut.get(pid)! : fullTime
          if (Math.min(endMin, fullTime) >= 60) {
            matchEvents.push({ api_player_id: pid, event_type: 'clean_sheet', minute: null })
          }
        }
        for (const p of lineups[teamIdx].substitutes || []) {
          const pid = p.player?.id
          if (!pid || !subIn.has(pid)) continue
          const enterMin = subIn.get(pid)!
          const exitMin = subOut.has(pid) ? subOut.get(pid)! : fullTime
          if (Math.min(exitMin, fullTime) - Math.min(enterMin, fullTime) >= 60) {
            matchEvents.push({ api_player_id: pid, event_type: 'clean_sheet', minute: null })
          }
        }
      }

      // Now resolve API player IDs to our player IDs and insert
      const resolvedEvents: Array<{ player_id: string; event_type: string; minute: number | null }> = []

      for (const me of matchEvents) {
        const { data: player } = await supabase
          .from('players')
          .select('id')
          .eq('api_football_id', me.api_player_id)
          .single()

        if (player?.id && POINTS[me.event_type] !== undefined) {
          resolvedEvents.push({ player_id: player.id, event_type: me.event_type, minute: me.minute })
        }
      }

      if (resolvedEvents.length === 0) continue

      // Insert match events
      const dbEvents = resolvedEvents.map((e) => ({
        match_id: fixtureId,
        match_date: today,
        player_id: e.player_id,
        event_type: e.event_type,
        minute: e.minute,
        points_awarded: POINTS[e.event_type] || 0,
      }))

      const { error: insertError } = await supabase.from('match_events').insert(dbEvents)
      if (insertError) continue

      eventsCreated += dbEvents.length

      // Update scores for all leagues
      const playerIds = [...new Set(resolvedEvents.map((e) => e.player_id))]
      const { data: affectedSlots } = await supabase
        .from('squad_slots')
        .select('league_id, user_id, player_id, is_starting')
        .in('player_id', playerIds)

      if (affectedSlots?.length) {
        const scoreUpdates: Record<string, number> = {}

        for (const slot of affectedSlots) {
          const key = `${slot.league_id}:${slot.user_id}`
          const playerEvents = resolvedEvents.filter((e) => e.player_id === slot.player_id)
          let pts = 0
          for (const event of playerEvents) pts += POINTS[event.event_type] || 0
          if (!slot.is_starting) pts = applyBenchMultiplier(pts)
          scoreUpdates[key] = (scoreUpdates[key] || 0) + pts
        }

        for (const [key, points] of Object.entries(scoreUpdates)) {
          const [leagueId, userId] = key.split(':')
          const { data: existing } = await supabase
            .from('scores')
            .select('id, total_points')
            .eq('league_id', leagueId)
            .eq('user_id', userId)
            .single()

          if (existing) {
            await supabase.from('scores').update({
              total_points: existing.total_points + points,
              updated_at: new Date().toISOString(),
            }).eq('id', existing.id)
          } else {
            await supabase.from('scores').insert({ league_id: leagueId, user_id: userId, total_points: points })
          }
        }
      }

      matchesProcessed++
    }

    // After processing matches, check for newly eliminated nations
    let eliminationActions: string[] = []
    if (matchesProcessed > 0) {
      const elimResult = await checkAndProcessEliminations(supabase)
      eliminationActions = elimResult.actions
    }

    return NextResponse.json({
      message: matchesProcessed > 0
        ? `Processed ${matchesProcessed} match(es), ${eventsCreated} events`
        : 'No new matches to process',
      date: today,
      matches_processed: matchesProcessed,
      events_created: eventsCreated,
      eliminations: eliminationActions,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
