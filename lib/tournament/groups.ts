/**
 * FIFA World Cup 2026 — Group stage structure and fixtures.
 * 48 teams in 12 groups of 4. Top 2 + 8 best 3rd-place teams advance.
 *
 * Using projected/placeholder groups based on qualifying.
 * These will be updated once the official draw happens.
 */

export type GroupTeam = {
  nation: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  points: number
}

export type Fixture = {
  id: string
  group: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  date: string
  time: string
  venue: string
  homeScore: number | null
  awayScore: number | null
  status: 'upcoming' | 'live' | 'finished'
}

const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`

export const GROUPS: Record<string, GroupTeam[]> = {
  A: [
    { nation: 'USA', flag: flag('us'), played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 1, points: 3 },
    { nation: 'Morocco', flag: flag('ma'), played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 2, points: 0 },
    { nation: 'Colombia', flag: flag('co'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ecuador', flag: flag('ec'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  B: [
    { nation: 'Mexico', flag: flag('mx'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Nigeria', flag: flag('ng'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Uruguay', flag: flag('uy'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Croatia', flag: flag('hr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  C: [
    { nation: 'Canada', flag: flag('ca'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Australia', flag: flag('au'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'South Korea', flag: flag('kr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Senegal', flag: flag('sn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  D: [
    { nation: 'Argentina', flag: flag('ar'), played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, points: 3 },
    { nation: 'Denmark', flag: flag('dk'), played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, points: 0 },
    { nation: 'Belgium', flag: flag('be'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Saudi Arabia', flag: flag('sa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  E: [
    { nation: 'England', flag: flag('gb-eng'), played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 1, points: 3 },
    { nation: 'Spain', flag: flag('es'), played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 2, points: 0 },
    { nation: 'Netherlands', flag: flag('nl'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Switzerland', flag: flag('ch'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  F: [
    { nation: 'France', flag: flag('fr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Germany', flag: flag('de'), played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, points: 0 },
    { nation: 'Japan', flag: flag('jp'), played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, points: 3 },
    { nation: 'Italy', flag: flag('it'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  G: [
    { nation: 'Brazil', flag: flag('br'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Portugal', flag: flag('pt'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
}

export const FIXTURES: Fixture[] = [
  // Matchday 1 — completed
  {
    id: 'ENG-ESP-GS1', group: 'E',
    home: 'England', homeFlag: flag('gb-eng'), away: 'Spain', awayFlag: flag('es'),
    date: 'Jun 12', time: '20:00', venue: 'MetLife Stadium, New York',
    homeScore: 2, awayScore: 1, status: 'finished',
  },
  {
    id: 'ARG-GER-GS1', group: 'D',
    home: 'Argentina', homeFlag: flag('ar'), away: 'Germany', awayFlag: flag('de'),
    date: 'Jun 13', time: '17:00', venue: 'AT&T Stadium, Dallas',
    homeScore: 3, awayScore: 0, status: 'finished',
  },
  {
    id: 'USA-MAR-GS1', group: 'A',
    home: 'USA', homeFlag: flag('us'), away: 'Morocco', awayFlag: flag('ma'),
    date: 'Jun 14', time: '20:00', venue: 'SoFi Stadium, Los Angeles',
    homeScore: 2, awayScore: 1, status: 'finished',
  },

  // Matchday 1 — upcoming
  {
    id: 'MEX-NGA-GS1', group: 'B',
    home: 'Mexico', homeFlag: flag('mx'), away: 'Nigeria', awayFlag: flag('ng'),
    date: 'Jun 14', time: '14:00', venue: 'Estadio Azteca, Mexico City',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'CAN-AUS-GS1', group: 'C',
    home: 'Canada', homeFlag: flag('ca'), away: 'Australia', awayFlag: flag('au'),
    date: 'Jun 15', time: '17:00', venue: 'BC Place, Vancouver',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'FRA-ITA-GS1', group: 'F',
    home: 'France', homeFlag: flag('fr'), away: 'Italy', awayFlag: flag('it'),
    date: 'Jun 15', time: '20:00', venue: 'Lincoln Financial Field, Philadelphia',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'BRA-POR-GS1', group: 'G',
    home: 'Brazil', homeFlag: flag('br'), away: 'Portugal', awayFlag: flag('pt'),
    date: 'Jun 16', time: '20:00', venue: 'Rose Bowl, Los Angeles',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'NED-SUI-GS1', group: 'E',
    home: 'Netherlands', homeFlag: flag('nl'), away: 'Switzerland', awayFlag: flag('ch'),
    date: 'Jun 16', time: '14:00', venue: 'Gillette Stadium, Boston',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'BEL-KSA-GS1', group: 'D',
    home: 'Belgium', homeFlag: flag('be'), away: 'Saudi Arabia', awayFlag: flag('sa'),
    date: 'Jun 16', time: '17:00', venue: 'NRG Stadium, Houston',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'URU-CRO-GS1', group: 'B',
    home: 'Uruguay', homeFlag: flag('uy'), away: 'Croatia', awayFlag: flag('hr'),
    date: 'Jun 17', time: '14:00', venue: 'Hard Rock Stadium, Miami',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'SEN-KOR-GS1', group: 'C',
    home: 'Senegal', homeFlag: flag('sn'), away: 'South Korea', awayFlag: flag('kr'),
    date: 'Jun 17', time: '17:00', venue: 'Lumen Field, Seattle',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'COL-ECU-GS1', group: 'A',
    home: 'Colombia', homeFlag: flag('co'), away: 'Ecuador', awayFlag: flag('ec'),
    date: 'Jun 17', time: '20:00', venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'DEN-BEL-GS2', group: 'D',
    home: 'Denmark', homeFlag: flag('dk'), away: 'Belgium', awayFlag: flag('be'),
    date: 'Jun 20', time: '17:00', venue: 'AT&T Stadium, Dallas',
    homeScore: null, awayScore: null, status: 'upcoming',
  },
  {
    id: 'JPN-GER-GS1', group: 'F',
    home: 'Japan', homeFlag: flag('jp'), away: 'Germany', awayFlag: flag('de'),
    date: 'Jun 13', time: '14:00', venue: 'Levi\'s Stadium, San Francisco',
    homeScore: 3, awayScore: 0, status: 'finished',
  },
]
