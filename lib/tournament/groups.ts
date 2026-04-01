/**
 * FIFA World Cup 2026 — Full group stage (12 groups, 48 teams)
 * and matchday fixtures. Updated as results come in.
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

const f = (code: string) => `https://flagcdn.com/w80/${code}.png`

// ============================================
// ALL 12 GROUPS
// ============================================
export const GROUPS: Record<string, GroupTeam[]> = {
  A: [
    { nation: 'USA', flag: f('us'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Morocco', flag: f('ma'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Scotland', flag: f('gb-sct'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Peru', flag: f('pe'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  B: [
    { nation: 'Mexico', flag: f('mx'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Colombia', flag: f('co'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ecuador', flag: f('ec'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ivory Coast', flag: f('ci'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  C: [
    { nation: 'Canada', flag: f('ca'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Argentina', flag: f('ar'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Chile', flag: f('cl'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Uzbekistan', flag: f('uz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  D: [
    { nation: 'Brazil', flag: f('br'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Italy', flag: f('it'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Nigeria', flag: f('ng'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Paraguay', flag: f('py'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  E: [
    { nation: 'England', flag: f('gb-eng'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Denmark', flag: f('dk'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Australia', flag: f('au'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Tunisia', flag: f('tn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  F: [
    { nation: 'France', flag: f('fr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Germany', flag: f('de'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Japan', flag: f('jp'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Costa Rica', flag: f('cr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  G: [
    { nation: 'Spain', flag: f('es'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Netherlands', flag: f('nl'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'South Korea', flag: f('kr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Bolivia', flag: f('bo'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  H: [
    { nation: 'Portugal', flag: f('pt'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Belgium', flag: f('be'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Switzerland', flag: f('ch'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Panama', flag: f('pa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  I: [
    { nation: 'Croatia', flag: f('hr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Uruguay', flag: f('uy'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Senegal', flag: f('sn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Saudi Arabia', flag: f('sa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  J: [
    { nation: 'Serbia', flag: f('rs'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Iran', flag: f('ir'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ghana', flag: f('gh'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Jamaica', flag: f('jm'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  K: [
    { nation: 'Wales', flag: f('gb-wls'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Turkey', flag: f('tr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Cameroon', flag: f('cm'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'New Zealand', flag: f('nz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  L: [
    { nation: 'Austria', flag: f('at'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ukraine', flag: f('ua'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Egypt', flag: f('eg'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Honduras', flag: f('hn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
}

// ============================================
// MATCHDAY 1 FIXTURES (all upcoming pre-tournament)
// ============================================
export const FIXTURES: Fixture[] = [
  // June 11 — Opening Day
  { id: 'A1', group: 'A', home: 'USA', homeFlag: f('us'), away: 'Morocco', awayFlag: f('ma'), date: 'Jun 11', time: '20:00', venue: 'SoFi Stadium, Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 12
  { id: 'B1', group: 'B', home: 'Mexico', homeFlag: f('mx'), away: 'Colombia', awayFlag: f('co'), date: 'Jun 12', time: '14:00', venue: 'Estadio Azteca, Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'C1', group: 'C', home: 'Canada', homeFlag: f('ca'), away: 'Chile', awayFlag: f('cl'), date: 'Jun 12', time: '17:00', venue: 'BC Place, Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'E1', group: 'E', home: 'England', homeFlag: f('gb-eng'), away: 'Denmark', awayFlag: f('dk'), date: 'Jun 12', time: '20:00', venue: 'MetLife Stadium, New York', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 13
  { id: 'D1', group: 'D', home: 'Brazil', homeFlag: f('br'), away: 'Italy', awayFlag: f('it'), date: 'Jun 13', time: '17:00', venue: 'AT&T Stadium, Dallas', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'F1', group: 'F', home: 'France', homeFlag: f('fr'), away: 'Germany', awayFlag: f('de'), date: 'Jun 13', time: '20:00', venue: 'Lincoln Financial Field, Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'A2', group: 'A', home: 'Scotland', homeFlag: f('gb-sct'), away: 'Peru', awayFlag: f('pe'), date: 'Jun 13', time: '14:00', venue: 'Lumen Field, Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 14
  { id: 'G1', group: 'G', home: 'Spain', homeFlag: f('es'), away: 'South Korea', awayFlag: f('kr'), date: 'Jun 14', time: '14:00', venue: 'Hard Rock Stadium, Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'H1', group: 'H', home: 'Portugal', homeFlag: f('pt'), away: 'Belgium', awayFlag: f('be'), date: 'Jun 14', time: '17:00', venue: 'NRG Stadium, Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'B2', group: 'B', home: 'Ecuador', homeFlag: f('ec'), away: 'Ivory Coast', awayFlag: f('ci'), date: 'Jun 14', time: '20:00', venue: 'Mercedes-Benz Stadium, Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 15
  { id: 'I1', group: 'I', home: 'Croatia', homeFlag: f('hr'), away: 'Uruguay', awayFlag: f('uy'), date: 'Jun 15', time: '14:00', venue: 'Arrowhead Stadium, Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'C2', group: 'C', home: 'Argentina', homeFlag: f('ar'), away: 'Uzbekistan', awayFlag: f('uz'), date: 'Jun 15', time: '17:00', venue: 'Rose Bowl, Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'J1', group: 'J', home: 'Serbia', homeFlag: f('rs'), away: 'Iran', awayFlag: f('ir'), date: 'Jun 15', time: '20:00', venue: 'Gillette Stadium, Boston', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 16
  { id: 'D2', group: 'D', home: 'Nigeria', homeFlag: f('ng'), away: 'Paraguay', awayFlag: f('py'), date: 'Jun 16', time: '14:00', venue: 'Levi\'s Stadium, San Francisco', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'E2', group: 'E', home: 'Australia', homeFlag: f('au'), away: 'Tunisia', awayFlag: f('tn'), date: 'Jun 16', time: '17:00', venue: 'CenturyLink Field, Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'K1', group: 'K', home: 'Wales', homeFlag: f('gb-wls'), away: 'Turkey', awayFlag: f('tr'), date: 'Jun 16', time: '20:00', venue: 'MetLife Stadium, New York', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 17
  { id: 'F2', group: 'F', home: 'Japan', homeFlag: f('jp'), away: 'Costa Rica', awayFlag: f('cr'), date: 'Jun 17', time: '14:00', venue: 'Soldier Field, Chicago', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'G2', group: 'G', home: 'Netherlands', homeFlag: f('nl'), away: 'Bolivia', awayFlag: f('bo'), date: 'Jun 17', time: '17:00', venue: 'SoFi Stadium, Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'L1', group: 'L', home: 'Austria', homeFlag: f('at'), away: 'Ukraine', awayFlag: f('ua'), date: 'Jun 17', time: '20:00', venue: 'Mercedes-Benz Stadium, Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 18
  { id: 'H2', group: 'H', home: 'Switzerland', homeFlag: f('ch'), away: 'Panama', awayFlag: f('pa'), date: 'Jun 18', time: '14:00', venue: 'BC Place, Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'I2', group: 'I', home: 'Senegal', homeFlag: f('sn'), away: 'Saudi Arabia', awayFlag: f('sa'), date: 'Jun 18', time: '17:00', venue: 'NRG Stadium, Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'J2', group: 'J', home: 'Ghana', homeFlag: f('gh'), away: 'Jamaica', awayFlag: f('jm'), date: 'Jun 18', time: '20:00', venue: 'Hard Rock Stadium, Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  // June 19
  { id: 'K2', group: 'K', home: 'Cameroon', homeFlag: f('cm'), away: 'New Zealand', awayFlag: f('nz'), date: 'Jun 19', time: '14:00', venue: 'Estadio Azteca, Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'L2', group: 'L', home: 'Egypt', homeFlag: f('eg'), away: 'Honduras', awayFlag: f('hn'), date: 'Jun 19', time: '17:00', venue: 'AT&T Stadium, Dallas', homeScore: null, awayScore: null, status: 'upcoming' },
]
