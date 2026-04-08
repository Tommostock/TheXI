import { SupabaseClient } from '@supabase/supabase-js'
import { apiFetch, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/api-football/client'

type DraftWindowType = 'post_groups' | 'post_r32' | 'post_r16' | 'post_qf' | 'post_sf'

/**
 * Fixed draft window schedule for World Cup 2026.
 *
 * Windows open at 9am BST on these dates. First come, first served.
 * Each window lasts 24 hours. After that, remaining eliminated players
 * are auto-replaced.
 */
const WINDOW_SCHEDULE: Array<{
  windowType: DraftWindowType
  opensAt: string // ISO date — window opens at 09:00 BST on this date
}> = [
  { windowType: 'post_groups', opensAt: '2026-06-28' },
  { windowType: 'post_r32',    opensAt: '2026-07-04' },
  { windowType: 'post_r16',    opensAt: '2026-07-08' },
  { windowType: 'post_qf',     opensAt: '2026-07-12' },
  { windowType: 'post_sf',     opensAt: '2026-07-16' },
]

const GROUP_STAGE_ROUND_PREFIX = 'Group'

/**
 * Check if any scheduled draft window should open today.
 *
 * Called by live-poll (automatic) and check-eliminations (manual).
 * On each scheduled date:
 *   1. Queries API-Football for all eliminated nations so far
 *   2. Marks their players as eliminated
 *   3. Opens a 24-hour draft window (first come, first served)
 *
 * Idempotent — skips windows that already exist.
 */
export async function checkAndProcessEliminations(
  supabase: SupabaseClient
): Promise<{ actions: string[]; error?: string }> {
  const actions: string[] = []

  if (!process.env.API_FOOTBALL_KEY) {
    return { actions, error: 'API_FOOTBALL_KEY not configured' }
  }

  const now = new Date()

  // Find windows that should be open by now
  const dueWindows = WINDOW_SCHEDULE.filter((w) => {
    const openDate = new Date(`${w.opensAt}T08:00:00Z`) // 9am BST = 8am UTC
    return now >= openDate
  })

  if (dueWindows.length === 0) {
    actions.push('No draft windows due yet')
    return { actions }
  }

  // Get all leagues with completed initial drafts
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, name, draft_status')
    .eq('draft_status', 'completed')

  if (!leagues?.length) {
    actions.push('No leagues with completed drafts')
    return { actions }
  }

  // Get existing windows to avoid duplicates
  const { data: existingWindows } = await supabase
    .from('draft_windows')
    .select('league_id, window_type')

  const windowExists = (leagueId: string, windowType: string) =>
    (existingWindows || []).some(
      (w) => w.league_id === leagueId && w.window_type === windowType
    )

  // Check which windows still need to be opened
  const windowsToOpen: typeof dueWindows = []
  for (const w of dueWindows) {
    const anyLeagueNeeds = leagues.some((l) => !windowExists(l.id, w.windowType))
    if (anyLeagueNeeds) windowsToOpen.push(w)
  }

  if (windowsToOpen.length === 0) {
    actions.push('All due windows already opened')
    return { actions }
  }

  // Fetch eliminated nations from API-Football
  const eliminatedNations = await getAllEliminatedNations()

  if (eliminatedNations.length === 0) {
    actions.push('No eliminated nations found from API-Football')
    return { actions }
  }

  // Get already-eliminated nations in our DB
  const { data: alreadyMarked } = await supabase
    .from('players')
    .select('nation')
    .eq('is_eliminated', true)

  const alreadyEliminated = new Set((alreadyMarked || []).map((p) => p.nation))
  const newlyEliminated = eliminatedNations.filter((n) => !alreadyEliminated.has(n))

  // Mark newly eliminated players
  if (newlyEliminated.length > 0) {
    await supabase
      .from('players')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
      })
      .in('nation', newlyEliminated)
      .eq('is_eliminated', false)

    actions.push(`Marked ${newlyEliminated.length} nation(s) as eliminated: ${newlyEliminated.join(', ')}`)
  }

  // All eliminated nations (old + new) for the feed message
  const allEliminated = [...new Set([...alreadyEliminated, ...newlyEliminated])]

  // Open windows for each league
  for (const w of windowsToOpen) {
    for (const league of leagues) {
      if (windowExists(league.id, w.windowType)) continue

      const opensAt = new Date(`${w.opensAt}T08:00:00Z`) // 9am BST
      const closesAt = new Date(opensAt.getTime() + 24 * 60 * 60 * 1000)

      await supabase.from('draft_windows').insert({
        league_id: league.id,
        window_type: w.windowType,
        status: 'active',
        opens_at: opensAt.toISOString(),
        closes_at: closesAt.toISOString(),
      })

      // Unlock lineups
      await supabase
        .from('leagues')
        .update({ lineup_locked: false })
        .eq('id', league.id)

      // Activity feed
      const nationCount = newlyEliminated.length > 0 ? newlyEliminated.length : allEliminated.length
      const nationsList = (newlyEliminated.length > 0 ? newlyEliminated : [...allEliminated]).slice(0, 5).join(', ')
      const more = nationCount > 5 ? ` +${nationCount - 5} more` : ''

      await supabase.from('activity_feed').insert({
        league_id: league.id,
        event_type: 'transfer',
        description: `Draft window open — replace eliminated players (${nationsList}${more}). First come, first served. Window closes in 24 hours.`,
      })

      actions.push(`Opened ${w.windowType} window for ${league.name}`)
    }
  }

  return { actions }
}

/**
 * Query API-Football to find ALL nations eliminated so far.
 * Combines group stage eliminations + knockout losers.
 */
async function getAllEliminatedNations(): Promise<string[]> {
  const eliminated: string[] = []

  try {
    // Get all fixtures
    const fixturesData = await apiFetch(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
    )
    const allFixtures = fixturesData.response || []

    // --- Group stage eliminations ---
    const groupFixtures = allFixtures.filter(
      (f: { league: { round: string } }) => f.league.round.startsWith(GROUP_STAGE_ROUND_PREFIX)
    )

    const allGroupsFinished = groupFixtures.length > 0 && groupFixtures.every(
      (f: { fixture: { status: { short: string } } }) =>
        ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
    )

    if (allGroupsFinished) {
      const standingsData = await apiFetch(
        `/standings?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
      )
      const standings = standingsData.response || []

      for (const leagueStanding of standings) {
        for (const group of leagueStanding.league?.standings || []) {
          // Bottom 2 per group eliminated (top 2 advance + best 3rd places)
          for (let i = 2; i < group.length; i++) {
            const teamName = group[i].team?.name
            if (teamName) eliminated.push(teamName)
          }
        }
      }
    }

    // --- Knockout round losers ---
    const knockoutRounds = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals']

    for (const round of knockoutRounds) {
      const roundFixtures = allFixtures.filter(
        (f: { league: { round: string }; fixture: { status: { short: string } } }) =>
          f.league.round === round && ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
      )

      for (const fixture of roundFixtures) {
        const home = fixture.teams?.home
        const away = fixture.teams?.away
        if (!home || !away) continue

        let loserName: string | null = null

        if (home.winner === true) loserName = away.name
        else if (away.winner === true) loserName = home.name
        else {
          const hg = fixture.goals?.home ?? 0
          const ag = fixture.goals?.away ?? 0
          if (hg > ag) loserName = away.name
          else if (ag > hg) loserName = home.name
          else {
            const ph = fixture.score?.penalty?.home ?? 0
            const pa = fixture.score?.penalty?.away ?? 0
            if (ph > pa) loserName = away.name
            else if (pa > ph) loserName = home.name
          }
        }

        if (loserName) eliminated.push(loserName)
      }
    }
  } catch {
    // API unavailable — return empty, will retry next poll
  }

  return [...new Set(eliminated)]
}
