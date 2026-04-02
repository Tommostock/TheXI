/**
 * Scoring Engine for The XI
 *
 * Points Table:
 *   Goal:              +5
 *   Assist:            +3
 *   Clean sheet:       +3 (GK/DEF only, 60+ mins)
 *   Appearance 60+:    +2
 *   Appearance <60:    +1
 *   Own goal:          -2
 *   Yellow card:       -1
 *   Red card:          -3
 *
 * Bench players earn 50% of all points (rounded down).
 * Penalty shootout goals do NOT count.
 * Clean sheets only for GK and DEF who play 60+ regular time minutes.
 * Appearance threshold based on regular 90-min time only.
 */

export const POINTS: Record<string, number> = {
  goal: 5,
  assist: 3,
  clean_sheet: 3,
  penalty_save: 5,
  appearance_full: 2,
  appearance_sub: 1,
  own_goal: -2,
  yellow: -1,
  red: -3,
}

export type MatchEvent = {
  player_id: string
  event_type: keyof typeof POINTS
  minute: number | null
  match_id: string
  match_date: string
}

export type PlayerMatchResult = {
  player_id: string
  events: Array<{ event_type: string; points: number; minute: number | null }>
  total_points: number
}

/**
 * Calculate points for a single player in a single match.
 */
export function calculatePlayerMatchPoints(
  events: MatchEvent[]
): PlayerMatchResult | null {
  if (events.length === 0) return null

  const playerId = events[0].player_id
  const matchId = events[0].match_id
  const matchDate = events[0].match_date

  const result: PlayerMatchResult = {
    player_id: playerId,
    events: [],
    total_points: 0,
  }

  for (const event of events) {
    const points = POINTS[event.event_type] ?? 0
    result.events.push({
      event_type: event.event_type,
      points,
      minute: event.minute,
    })
    result.total_points += points
  }

  return result
}

/**
 * Apply bench multiplier: 50% of all points, rounded down.
 */
export function applyBenchMultiplier(points: number): number {
  return Math.floor(points / 2)
}

/**
 * Determine if a player qualifies for a clean sheet.
 * Must be GK or DEF, and play 60+ regular time minutes.
 */
export function qualifiesForCleanSheet(
  position: string,
  minutesPlayed: number,
  teamConceded: boolean
): boolean {
  if (teamConceded) return false
  if (position !== 'GK' && position !== 'DEF') return false
  if (minutesPlayed < 60) return false
  return true
}

/**
 * Determine appearance event type based on minutes played.
 * Only regular 90-min time counts (not extra time).
 */
export function getAppearanceType(
  minutesPlayed: number
): 'appearance_full' | 'appearance_sub' | null {
  if (minutesPlayed <= 0) return null
  if (minutesPlayed >= 60) return 'appearance_full'
  return 'appearance_sub'
}
