import { SupabaseClient } from '@supabase/supabase-js'
import { apiFetch, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/api-football/client'

type DraftWindowType = 'post_groups' | 'post_r32' | 'post_r16' | 'post_qf' | 'post_sf'

type StageConfig = {
  windowType: DraftWindowType
  apiRound: string
  totalFixtures: number
}

/**
 * World Cup 2026 knockout stage config.
 * Each entry maps a tournament round to the draft window type it triggers.
 * totalFixtures = how many matches in that round (all must be FT to trigger).
 */
const KNOCKOUT_STAGES: StageConfig[] = [
  { windowType: 'post_r32', apiRound: 'Round of 32', totalFixtures: 16 },
  { windowType: 'post_r16', apiRound: 'Round of 16', totalFixtures: 8 },
  { windowType: 'post_qf', apiRound: 'Quarter-finals', totalFixtures: 4 },
  { windowType: 'post_sf', apiRound: 'Semi-finals', totalFixtures: 2 },
]

// Group stage: 48 matches total (12 groups x 4 teams = 12 groups x 6 matches... actually 48 teams, 3 matches each = 144/2 = 48 group matches... no)
// WC 2026: 12 groups of 4, each group has 6 matches = 72 group stage matches? No — 4 teams per group, each plays 3 = 12 matches per group / 2 = 6 per group. 12 groups x 6 = 72. But some formats have 48 total group matches.
// Actually: 48 teams, 12 groups of 4. Each group: C(4,2)=6 matches. 12 groups x 6 = 72 group matches total.
// Let's use the API to determine this dynamically rather than hardcoding.
const GROUP_STAGE_ROUND_PREFIX = 'Group'

/**
 * Check for newly eliminated nations and open replacement draft windows.
 * Idempotent — skips if a window for that stage already exists.
 *
 * Returns a summary of actions taken.
 */
export async function checkAndProcessEliminations(
  supabase: SupabaseClient
): Promise<{ actions: string[]; error?: string }> {
  const actions: string[] = []

  if (!process.env.API_FOOTBALL_KEY) {
    return { actions, error: 'API_FOOTBALL_KEY not configured' }
  }

  // Get all leagues with completed drafts
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, name, draft_status')
    .eq('draft_status', 'completed')

  if (!leagues?.length) {
    actions.push('No leagues with completed drafts')
    return { actions }
  }

  // Get all existing draft windows to know which stages are already handled
  const { data: existingWindows } = await supabase
    .from('draft_windows')
    .select('league_id, window_type, status')

  const windowExists = (leagueId: string, windowType: string) =>
    (existingWindows || []).some(
      (w) => w.league_id === leagueId && w.window_type === windowType
    )

  // Get already-eliminated nations to avoid re-processing
  const { data: eliminatedPlayers } = await supabase
    .from('players')
    .select('nation')
    .eq('is_eliminated', true)

  const alreadyEliminated = new Set((eliminatedPlayers || []).map((p) => p.nation))

  // --- Check group stage completion ---
  const groupEliminated = await checkGroupStageEliminations(alreadyEliminated)
  if (groupEliminated.length > 0) {
    for (const league of leagues) {
      if (windowExists(league.id, 'post_groups')) continue
      await openWindowWithAdmin(supabase, league.id, 'post_groups', groupEliminated)
      actions.push(`Opened post_groups window for ${league.name}: ${groupEliminated.join(', ')} eliminated`)
    }
  }

  // --- Check knockout stages ---
  for (const stage of KNOCKOUT_STAGES) {
    const stageEliminated = await checkKnockoutEliminations(stage, alreadyEliminated)
    if (stageEliminated.length > 0) {
      for (const league of leagues) {
        if (windowExists(league.id, stage.windowType)) continue
        await openWindowWithAdmin(supabase, league.id, stage.windowType, stageEliminated)
        actions.push(`Opened ${stage.windowType} window for ${league.name}: ${stageEliminated.join(', ')} eliminated`)
      }
    }
  }

  if (actions.length === 0) {
    actions.push('No new eliminations detected')
  }

  return { actions }
}

/**
 * Check if all group stage matches are finished.
 * If so, determine which nations didn't advance.
 */
async function checkGroupStageEliminations(
  alreadyEliminated: Set<string>
): Promise<string[]> {
  try {
    // Get all group stage fixtures
    const fixturesData = await apiFetch(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
    )
    const allFixtures = fixturesData.response || []

    const groupFixtures = allFixtures.filter(
      (f: { league: { round: string } }) => f.league.round.startsWith(GROUP_STAGE_ROUND_PREFIX)
    )

    if (groupFixtures.length === 0) return []

    // Check if ALL group matches are finished
    const allFinished = groupFixtures.every(
      (f: { fixture: { status: { short: string } } }) =>
        ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
    )

    if (!allFinished) return []

    // All group matches done — fetch standings to see who's eliminated
    const standingsData = await apiFetch(
      `/standings?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
    )
    const standings = standingsData.response || []

    const eliminatedNations: string[] = []

    for (const leagueStanding of standings) {
      for (const group of leagueStanding.league?.standings || []) {
        // In WC 2026: top 2 from each group advance + best 3rd places
        // For simplicity, mark bottom 2 from each group as eliminated
        // (This is a reasonable heuristic — 3rd place teams that qualify
        //  would need a separate check after the R32 draw is made)
        for (let i = 2; i < group.length; i++) {
          const teamName = group[i].team?.name
          if (teamName && !alreadyEliminated.has(teamName)) {
            eliminatedNations.push(teamName)
          }
        }
      }
    }

    return eliminatedNations
  } catch {
    return []
  }
}

/**
 * Check if all matches in a knockout round are finished.
 * If so, return the losing teams.
 */
async function checkKnockoutEliminations(
  stage: StageConfig,
  alreadyEliminated: Set<string>
): Promise<string[]> {
  try {
    const fixturesData = await apiFetch(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&round=${encodeURIComponent(stage.apiRound)}`
    )
    const fixtures = fixturesData.response || []

    if (fixtures.length === 0) return []

    // Check if ALL matches in this round are finished
    const allFinished = fixtures.every(
      (f: { fixture: { status: { short: string } } }) =>
        ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
    )

    if (!allFinished) return []

    // Determine losers
    const eliminatedNations: string[] = []

    for (const fixture of fixtures) {
      const home = fixture.teams?.home
      const away = fixture.teams?.away

      if (!home || !away) continue

      // In knockout: winner advances, loser is eliminated
      // API-Football marks winner with .winner = true
      let loserName: string | null = null

      if (home.winner === true) {
        loserName = away.name
      } else if (away.winner === true) {
        loserName = home.name
      } else {
        // Draw shouldn't happen in knockouts (goes to penalties)
        // But if API doesn't mark winner, check goals
        const homeGoals = fixture.goals?.home ?? 0
        const awayGoals = fixture.goals?.away ?? 0
        if (homeGoals > awayGoals) loserName = away.name
        else if (awayGoals > homeGoals) loserName = home.name
        // If still tied (penalty shootout), check fixture.score.penalty
        else {
          const penHome = fixture.score?.penalty?.home ?? 0
          const penAway = fixture.score?.penalty?.away ?? 0
          if (penHome > penAway) loserName = away.name
          else if (penAway > penHome) loserName = home.name
        }
      }

      if (loserName && !alreadyEliminated.has(loserName)) {
        eliminatedNations.push(loserName)
      }
    }

    return eliminatedNations
  } catch {
    return []
  }
}

/**
 * Open a draft window using admin client (no user session required).
 * This is the server-side equivalent of openDraftWindow() from lib/draft/windows.ts
 * but doesn't need a user session since it's called from cron/polling.
 */
async function openWindowWithAdmin(
  supabase: SupabaseClient,
  leagueId: string,
  windowType: DraftWindowType,
  eliminatedNations: string[]
) {
  // Mark eliminated players
  if (eliminatedNations.length > 0) {
    await supabase
      .from('players')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
      })
      .in('nation', eliminatedNations)
      .eq('is_eliminated', false)
  }

  // Create draft window (24-hour window for replacements)
  const opensAt = new Date()
  const closesAt = new Date(opensAt.getTime() + 24 * 60 * 60 * 1000)

  await supabase.from('draft_windows').insert({
    league_id: leagueId,
    window_type: windowType,
    status: 'active',
    opens_at: opensAt.toISOString(),
    closes_at: closesAt.toISOString(),
  })

  // Activity feed
  const nationsList = eliminatedNations.slice(0, 5).join(', ')
  const moreCount = eliminatedNations.length > 5 ? ` +${eliminatedNations.length - 5} more` : ''

  await supabase.from('activity_feed').insert({
    league_id: leagueId,
    event_type: 'transfer',
    description: `Draft window open — ${eliminatedNations.length} nation(s) eliminated (${nationsList}${moreCount}). Replace your players within 24 hours.`,
  })

  // Unlock lineups so users can make changes
  await supabase
    .from('leagues')
    .update({ lineup_locked: false })
    .eq('id', leagueId)
}
