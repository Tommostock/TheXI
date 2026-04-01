/**
 * Draft Logic for The XI
 *
 * Snake draft: pick order reverses each round.
 * Round 1: 1,2,3,4  Round 2: 4,3,2,1  Round 3: 1,2,3,4 ...
 *
 * 15 rounds total. Positional limits: 2 GK, 5 DEF, 5 MID, 3 ATT.
 */

export const TOTAL_ROUNDS = 15

export const POSITION_LIMITS: Record<string, number> = {
  GK: 2,
  DEF: 5,
  MID: 5,
  ATT: 3,
}

export type DraftPick = {
  id: string
  league_id: string
  user_id: string
  player_id: string
  round: number
  pick_number: number
  draft_window: string
  is_auto_pick: boolean
  is_starting_xi: boolean
  picked_at: string
  player?: {
    id: string
    name: string
    nation: string
    nation_flag_url: string | null
    position: string
  }
}

/**
 * Calculate the snake draft order for a given round.
 * Even rounds (2, 4, 6...) reverse the order.
 */
export function getPickOrderForRound(
  draftOrder: string[],
  round: number
): string[] {
  if (round % 2 === 0) {
    return [...draftOrder].reverse()
  }
  return [...draftOrder]
}

/**
 * Calculate the overall pick number (1-indexed) for a given round and position.
 */
export function getOverallPickNumber(
  round: number,
  positionInRound: number,
  participantCount: number
): number {
  return (round - 1) * participantCount + positionInRound + 1
}

/**
 * Determine the current round and picker based on existing picks.
 */
export function getCurrentDraftState(
  draftOrder: string[],
  picks: DraftPick[]
) {
  const totalPicks = picks.length
  const participantCount = draftOrder.length
  const totalPicksNeeded = TOTAL_ROUNDS * participantCount

  if (totalPicks >= totalPicksNeeded) {
    return { isComplete: true, currentRound: TOTAL_ROUNDS, currentPickerUserId: null, pickNumber: totalPicksNeeded }
  }

  const currentRound = Math.floor(totalPicks / participantCount) + 1
  const positionInRound = totalPicks % participantCount
  const roundOrder = getPickOrderForRound(draftOrder, currentRound)
  const currentPickerUserId = roundOrder[positionInRound]
  const pickNumber = totalPicks + 1

  return {
    isComplete: false,
    currentRound,
    currentPickerUserId,
    pickNumber,
    positionInRound,
  }
}

/**
 * Count how many of each position a user has already drafted.
 */
export function getUserPositionCounts(
  userId: string,
  picks: DraftPick[]
): Record<string, number> {
  const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, ATT: 0 }
  for (const pick of picks) {
    if (pick.user_id === userId && pick.player?.position) {
      counts[pick.player.position] = (counts[pick.player.position] || 0) + 1
    }
  }
  return counts
}

/**
 * Get which positions a user still needs to fill.
 */
export function getRemainingPositions(
  userId: string,
  picks: DraftPick[]
): Record<string, number> {
  const counts = getUserPositionCounts(userId, picks)
  const remaining: Record<string, number> = {}
  for (const [pos, limit] of Object.entries(POSITION_LIMITS)) {
    remaining[pos] = limit - (counts[pos] || 0)
  }
  return remaining
}

/**
 * Check if a user can draft a player at a given position.
 */
export function canDraftPosition(
  userId: string,
  position: string,
  picks: DraftPick[]
): boolean {
  const remaining = getRemainingPositions(userId, picks)
  return (remaining[position] || 0) > 0
}

/**
 * Get positions that MUST be filled given remaining rounds.
 * Used to determine which positions to filter for auto-pick.
 */
export function getMandatoryPositions(
  userId: string,
  picks: DraftPick[],
  participantCount: number
): string[] {
  const remaining = getRemainingPositions(userId, picks)
  const userPicks = picks.filter((p) => p.user_id === userId)
  const roundsLeft = TOTAL_ROUNDS - userPicks.length

  // If remaining slots exactly equal rounds left, all remaining positions are mandatory
  const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0)
  if (totalRemaining <= roundsLeft) {
    return Object.entries(remaining)
      .filter(([, count]) => count > 0)
      .map(([pos]) => pos)
  }

  return []
}

/**
 * Determine which positions a user is allowed to pick from.
 */
export function getAllowedPositions(
  userId: string,
  picks: DraftPick[]
): string[] {
  const remaining = getRemainingPositions(userId, picks)
  return Object.entries(remaining)
    .filter(([, count]) => count > 0)
    .map(([pos]) => pos)
}

/**
 * Build the full draft grid: rounds x participants.
 */
export function buildDraftGrid(
  draftOrder: string[],
  picks: DraftPick[]
): Array<Array<DraftPick | null>> {
  const grid: Array<Array<DraftPick | null>> = []

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    const roundOrder = getPickOrderForRound(draftOrder, round)
    const row: Array<DraftPick | null> = roundOrder.map((userId) => {
      return (
        picks.find(
          (p) => p.user_id === userId && p.round === round
        ) || null
      )
    })
    grid.push(row)
  }

  return grid
}
