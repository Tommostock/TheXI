/**
 * FIFA World Cup 2026 — Next fixture lookup per nation.
 * Updated after each matchday.
 */

export const NATION_CODES: Record<string, string> = {
  'Mexico': 'MEX', 'South Korea': 'KOR', 'South Africa': 'RSA', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Qatar': 'QAT', 'Switzerland': 'SUI', 'Bosnia & Herzegovina': 'BIH',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Scotland': 'SCO', 'Haiti': 'HAI',
  'USA': 'USA', 'Turkey': 'TUR', 'Australia': 'AUS', 'Paraguay': 'PAR',
  'Germany': 'GER', 'Ecuador': 'ECU', 'Ivory Coast': 'CIV', 'Curacao': 'CUW',
  'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Iran': 'IRN', 'Egypt': 'EGY', 'New Zealand': 'NZL',
  'Spain': 'ESP', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU', 'Cape Verde': 'CPV',
  'France': 'FRA', 'Norway': 'NOR', 'Senegal': 'SEN', 'Iraq': 'IRQ',
  'Argentina': 'ARG', 'Austria': 'AUT', 'Algeria': 'ALG', 'Jordan': 'JOR',
  'Portugal': 'POR', 'Colombia': 'COL', 'Uzbekistan': 'UZB', 'DR Congo': 'COD',
  'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
}

// Matchday 1 opponents
export const NEXT_FIXTURES: Record<string, { opponent: string; date: string }> = {
  'Mexico': { opponent: 'RSA', date: 'Jun 11' },
  'South Africa': { opponent: 'MEX', date: 'Jun 11' },
  'South Korea': { opponent: 'CZE', date: 'Jun 12' },
  'Czech Republic': { opponent: 'KOR', date: 'Jun 12' },
  'Canada': { opponent: 'BIH', date: 'Jun 12' },
  'Bosnia & Herzegovina': { opponent: 'CAN', date: 'Jun 12' },
  'USA': { opponent: 'PAR', date: 'Jun 13' },
  'Paraguay': { opponent: 'USA', date: 'Jun 13' },
  'Qatar': { opponent: 'SUI', date: 'Jun 13' },
  'Switzerland': { opponent: 'QAT', date: 'Jun 13' },
  'Brazil': { opponent: 'MAR', date: 'Jun 13' },
  'Morocco': { opponent: 'BRA', date: 'Jun 13' },
  'Haiti': { opponent: 'SCO', date: 'Jun 14' },
  'Scotland': { opponent: 'HAI', date: 'Jun 14' },
  'Australia': { opponent: 'TUR', date: 'Jun 14' },
  'Turkey': { opponent: 'AUS', date: 'Jun 14' },
  'Germany': { opponent: 'CUW', date: 'Jun 14' },
  'Curacao': { opponent: 'GER', date: 'Jun 14' },
  'Netherlands': { opponent: 'JPN', date: 'Jun 14' },
  'Japan': { opponent: 'NED', date: 'Jun 14' },
  'Ivory Coast': { opponent: 'ECU', date: 'Jun 15' },
  'Ecuador': { opponent: 'CIV', date: 'Jun 15' },
  'Sweden': { opponent: 'TUN', date: 'Jun 15' },
  'Tunisia': { opponent: 'SWE', date: 'Jun 15' },
  'Spain': { opponent: 'CPV', date: 'Jun 15' },
  'Cape Verde': { opponent: 'ESP', date: 'Jun 15' },
  'Belgium': { opponent: 'EGY', date: 'Jun 15' },
  'Egypt': { opponent: 'BEL', date: 'Jun 15' },
  'Saudi Arabia': { opponent: 'URU', date: 'Jun 15' },
  'Uruguay': { opponent: 'KSA', date: 'Jun 15' },
  'Iran': { opponent: 'NZL', date: 'Jun 16' },
  'New Zealand': { opponent: 'IRN', date: 'Jun 16' },
  'France': { opponent: 'SEN', date: 'Jun 16' },
  'Senegal': { opponent: 'FRA', date: 'Jun 16' },
  'Iraq': { opponent: 'NOR', date: 'Jun 16' },
  'Norway': { opponent: 'IRQ', date: 'Jun 16' },
  'Argentina': { opponent: 'ALG', date: 'Jun 17' },
  'Algeria': { opponent: 'ARG', date: 'Jun 17' },
  'Austria': { opponent: 'JOR', date: 'Jun 17' },
  'Jordan': { opponent: 'AUT', date: 'Jun 17' },
  'Portugal': { opponent: 'COD', date: 'Jun 17' },
  'DR Congo': { opponent: 'POR', date: 'Jun 17' },
  'England': { opponent: 'CRO', date: 'Jun 17' },
  'Croatia': { opponent: 'ENG', date: 'Jun 17' },
  'Ghana': { opponent: 'PAN', date: 'Jun 18' },
  'Panama': { opponent: 'GHA', date: 'Jun 18' },
  'Uzbekistan': { opponent: 'COL', date: 'Jun 18' },
  'Colombia': { opponent: 'UZB', date: 'Jun 18' },
}

export function getNextOpponent(nation: string): string | null {
  const fixture = NEXT_FIXTURES[nation]
  if (!fixture) return null
  return `v ${fixture.opponent}`
}

export function getNationCode(nation: string): string {
  return NATION_CODES[nation] || nation.substring(0, 3).toUpperCase()
}
