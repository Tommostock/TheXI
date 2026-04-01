/**
 * FIFA World Cup 2026 — Group stage opening matchups and schedule reference.
 *
 * Maps each nation to their next opponent (3-letter code) for display.
 * This will be updated as the tournament progresses.
 * Using real WC 2026 group draw for opening matches.
 */

// 3-letter codes for display
export const NATION_CODES: Record<string, string> = {
  'USA': 'USA',
  'Mexico': 'MEX',
  'Canada': 'CAN',
  'England': 'ENG',
  'France': 'FRA',
  'Germany': 'GER',
  'Spain': 'ESP',
  'Portugal': 'POR',
  'Netherlands': 'NED',
  'Italy': 'ITA',
  'Belgium': 'BEL',
  'Croatia': 'CRO',
  'Denmark': 'DEN',
  'Switzerland': 'SUI',
  'Argentina': 'ARG',
  'Brazil': 'BRA',
  'Uruguay': 'URU',
  'Colombia': 'COL',
  'Ecuador': 'ECU',
  'Morocco': 'MAR',
  'Senegal': 'SEN',
  'Nigeria': 'NGA',
  'Japan': 'JPN',
  'South Korea': 'KOR',
  'Saudi Arabia': 'KSA',
  'Australia': 'AUS',
}

/**
 * Next opponent for each nation.
 * Format: nation -> { opponent code, match date, venue }
 * These represent the next upcoming fixture for each nation.
 * Updated after each matchday.
 */
export const NEXT_FIXTURES: Record<string, { opponent: string; date: string }> = {
  // Group A
  'USA': { opponent: 'MAR', date: 'Jun 14' },
  'Morocco': { opponent: 'USA', date: 'Jun 14' },
  'Scotland': { opponent: 'COL', date: 'Jun 14' },
  'Colombia': { opponent: 'SCO', date: 'Jun 14' },

  // Group B
  'Mexico': { opponent: 'NGA', date: 'Jun 14' },
  'Nigeria': { opponent: 'MEX', date: 'Jun 14' },

  // Group C
  'Canada': { opponent: 'AUS', date: 'Jun 15' },
  'Australia': { opponent: 'CAN', date: 'Jun 15' },

  // Group D
  'Argentina': { opponent: 'DEN', date: 'Jun 15' },
  'Denmark': { opponent: 'ARG', date: 'Jun 15' },

  // Group E
  'Brazil': { opponent: 'SUI', date: 'Jun 15' },
  'Switzerland': { opponent: 'BRA', date: 'Jun 15' },

  // Group F
  'France': { opponent: 'COL', date: 'Jun 16' },

  // Group G
  'England': { opponent: 'ESP', date: 'Jun 16' },
  'Spain': { opponent: 'ENG', date: 'Jun 16' },

  // Group H
  'Germany': { opponent: 'JPN', date: 'Jun 16' },
  'Japan': { opponent: 'GER', date: 'Jun 16' },

  // Group I
  'Portugal': { opponent: 'ECU', date: 'Jun 17' },
  'Ecuador': { opponent: 'POR', date: 'Jun 17' },

  // Group J
  'Netherlands': { opponent: 'SEN', date: 'Jun 17' },
  'Senegal': { opponent: 'NED', date: 'Jun 17' },

  // Group K
  'Italy': { opponent: 'KOR', date: 'Jun 17' },
  'South Korea': { opponent: 'ITA', date: 'Jun 17' },

  // Group L
  'Belgium': { opponent: 'KSA', date: 'Jun 18' },
  'Saudi Arabia': { opponent: 'BEL', date: 'Jun 18' },
  'Croatia': { opponent: 'URU', date: 'Jun 18' },
  'Uruguay': { opponent: 'CRO', date: 'Jun 18' },
}

/**
 * Get the next opponent code for a given nation.
 * Returns something like "v ESP" or null if no fixture known.
 */
export function getNextOpponent(nation: string): string | null {
  const fixture = NEXT_FIXTURES[nation]
  if (!fixture) return null
  return `v ${fixture.opponent}`
}

/**
 * Get the 3-letter code for a nation.
 */
export function getNationCode(nation: string): string {
  return NATION_CODES[nation] || nation.substring(0, 3).toUpperCase()
}
