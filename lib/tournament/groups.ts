/**
 * FIFA World Cup 2026 — Official groups and full match schedule.
 * 48 teams, 12 groups of 4. Top 2 + 8 best 3rd-place advance to R32.
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
  matchday: number
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
// OFFICIAL GROUPS
// ============================================
export const GROUPS: Record<string, GroupTeam[]> = {
  A: [
    { nation: 'Mexico', flag: f('mx'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'South Korea', flag: f('kr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'South Africa', flag: f('za'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Czech Republic', flag: f('cz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  B: [
    { nation: 'Canada', flag: f('ca'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Qatar', flag: f('qa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Switzerland', flag: f('ch'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Bosnia & Herzegovina', flag: f('ba'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  C: [
    { nation: 'Brazil', flag: f('br'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Morocco', flag: f('ma'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Scotland', flag: f('gb-sct'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Haiti', flag: f('ht'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  D: [
    { nation: 'USA', flag: f('us'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Turkey', flag: f('tr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Australia', flag: f('au'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Paraguay', flag: f('py'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  E: [
    { nation: 'Germany', flag: f('de'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ecuador', flag: f('ec'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ivory Coast', flag: f('ci'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Curacao', flag: f('cw'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  F: [
    { nation: 'Netherlands', flag: f('nl'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Japan', flag: f('jp'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Sweden', flag: f('se'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Tunisia', flag: f('tn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  G: [
    { nation: 'Belgium', flag: f('be'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Iran', flag: f('ir'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Egypt', flag: f('eg'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'New Zealand', flag: f('nz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  H: [
    { nation: 'Spain', flag: f('es'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Saudi Arabia', flag: f('sa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Uruguay', flag: f('uy'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Cape Verde', flag: f('cv'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  I: [
    { nation: 'France', flag: f('fr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Norway', flag: f('no'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Senegal', flag: f('sn'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Iraq', flag: f('iq'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  J: [
    { nation: 'Argentina', flag: f('ar'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Austria', flag: f('at'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Algeria', flag: f('dz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Jordan', flag: f('jo'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  K: [
    { nation: 'Portugal', flag: f('pt'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Colombia', flag: f('co'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Uzbekistan', flag: f('uz'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'DR Congo', flag: f('cd'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  L: [
    { nation: 'England', flag: f('gb-eng'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Croatia', flag: f('hr'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Ghana', flag: f('gh'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { nation: 'Panama', flag: f('pa'), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
}

// ============================================
// FULL MATCH SCHEDULE
// ============================================
export const FIXTURES: Fixture[] = [
  // ======== MATCHDAY 1 ========
  // Jun 11
  { id: 'M1', group: 'A', matchday: 1, home: 'Mexico', homeFlag: f('mx'), away: 'South Africa', awayFlag: f('za'), date: 'Jun 11', time: '20:00', venue: 'Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 12
  { id: 'M2', group: 'A', matchday: 1, home: 'South Korea', homeFlag: f('kr'), away: 'Czech Republic', awayFlag: f('cz'), date: 'Jun 12', time: '03:00', venue: 'Zapopan', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M3', group: 'B', matchday: 1, home: 'Canada', homeFlag: f('ca'), away: 'Bosnia & Herzegovina', awayFlag: f('ba'), date: 'Jun 12', time: '20:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 13
  { id: 'M4', group: 'D', matchday: 1, home: 'USA', homeFlag: f('us'), away: 'Paraguay', awayFlag: f('py'), date: 'Jun 13', time: '02:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M5', group: 'B', matchday: 1, home: 'Qatar', homeFlag: f('qa'), away: 'Switzerland', awayFlag: f('ch'), date: 'Jun 13', time: '20:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M6', group: 'C', matchday: 1, home: 'Brazil', homeFlag: f('br'), away: 'Morocco', awayFlag: f('ma'), date: 'Jun 13', time: '23:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 14
  { id: 'M7', group: 'C', matchday: 1, home: 'Haiti', homeFlag: f('ht'), away: 'Scotland', awayFlag: f('gb-sct'), date: 'Jun 14', time: '02:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M8', group: 'D', matchday: 1, home: 'Australia', homeFlag: f('au'), away: 'Turkey', awayFlag: f('tr'), date: 'Jun 14', time: '05:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M9', group: 'E', matchday: 1, home: 'Germany', homeFlag: f('de'), away: 'Curacao', awayFlag: f('cw'), date: 'Jun 14', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M10', group: 'F', matchday: 1, home: 'Netherlands', homeFlag: f('nl'), away: 'Japan', awayFlag: f('jp'), date: 'Jun 14', time: '21:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 15
  { id: 'M11', group: 'E', matchday: 1, home: 'Ivory Coast', homeFlag: f('ci'), away: 'Ecuador', awayFlag: f('ec'), date: 'Jun 15', time: '00:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M12', group: 'F', matchday: 1, home: 'Sweden', homeFlag: f('se'), away: 'Tunisia', awayFlag: f('tn'), date: 'Jun 15', time: '03:00', venue: 'Guadalupe', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M13', group: 'H', matchday: 1, home: 'Spain', homeFlag: f('es'), away: 'Cape Verde', awayFlag: f('cv'), date: 'Jun 15', time: '17:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M14', group: 'G', matchday: 1, home: 'Belgium', homeFlag: f('be'), away: 'Egypt', awayFlag: f('eg'), date: 'Jun 15', time: '20:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M15', group: 'H', matchday: 1, home: 'Saudi Arabia', homeFlag: f('sa'), away: 'Uruguay', awayFlag: f('uy'), date: 'Jun 15', time: '23:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 16
  { id: 'M16', group: 'G', matchday: 1, home: 'Iran', homeFlag: f('ir'), away: 'New Zealand', awayFlag: f('nz'), date: 'Jun 16', time: '02:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M17', group: 'I', matchday: 1, home: 'France', homeFlag: f('fr'), away: 'Senegal', awayFlag: f('sn'), date: 'Jun 16', time: '20:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M18', group: 'I', matchday: 1, home: 'Iraq', homeFlag: f('iq'), away: 'Norway', awayFlag: f('no'), date: 'Jun 16', time: '23:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 17
  { id: 'M19', group: 'J', matchday: 1, home: 'Argentina', homeFlag: f('ar'), away: 'Algeria', awayFlag: f('dz'), date: 'Jun 17', time: '02:00', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M20', group: 'J', matchday: 1, home: 'Austria', homeFlag: f('at'), away: 'Jordan', awayFlag: f('jo'), date: 'Jun 17', time: '05:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M21', group: 'K', matchday: 1, home: 'Portugal', homeFlag: f('pt'), away: 'DR Congo', awayFlag: f('cd'), date: 'Jun 17', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M22', group: 'L', matchday: 1, home: 'England', homeFlag: f('gb-eng'), away: 'Croatia', awayFlag: f('hr'), date: 'Jun 17', time: '21:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 18
  { id: 'M23', group: 'L', matchday: 1, home: 'Ghana', homeFlag: f('gh'), away: 'Panama', awayFlag: f('pa'), date: 'Jun 18', time: '00:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M24', group: 'K', matchday: 1, home: 'Uzbekistan', homeFlag: f('uz'), away: 'Colombia', awayFlag: f('co'), date: 'Jun 18', time: '03:00', venue: 'Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== MATCHDAY 2 ========
  // Jun 18
  { id: 'M25', group: 'A', matchday: 2, home: 'Czech Republic', homeFlag: f('cz'), away: 'South Africa', awayFlag: f('za'), date: 'Jun 18', time: '17:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M26', group: 'B', matchday: 2, home: 'Switzerland', homeFlag: f('ch'), away: 'Bosnia & Herzegovina', awayFlag: f('ba'), date: 'Jun 18', time: '20:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M27', group: 'B', matchday: 2, home: 'Canada', homeFlag: f('ca'), away: 'Qatar', awayFlag: f('qa'), date: 'Jun 18', time: '23:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 19
  { id: 'M28', group: 'A', matchday: 2, home: 'Mexico', homeFlag: f('mx'), away: 'South Korea', awayFlag: f('kr'), date: 'Jun 19', time: '02:00', venue: 'Zapopan', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M29', group: 'D', matchday: 2, home: 'USA', homeFlag: f('us'), away: 'Australia', awayFlag: f('au'), date: 'Jun 19', time: '20:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M30', group: 'C', matchday: 2, home: 'Scotland', homeFlag: f('gb-sct'), away: 'Morocco', awayFlag: f('ma'), date: 'Jun 19', time: '23:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 20
  { id: 'M31', group: 'C', matchday: 2, home: 'Brazil', homeFlag: f('br'), away: 'Haiti', awayFlag: f('ht'), date: 'Jun 20', time: '02:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M32', group: 'D', matchday: 2, home: 'Turkey', homeFlag: f('tr'), away: 'Paraguay', awayFlag: f('py'), date: 'Jun 20', time: '05:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M33', group: 'F', matchday: 2, home: 'Netherlands', homeFlag: f('nl'), away: 'Sweden', awayFlag: f('se'), date: 'Jun 20', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M34', group: 'E', matchday: 2, home: 'Germany', homeFlag: f('de'), away: 'Ivory Coast', awayFlag: f('ci'), date: 'Jun 20', time: '21:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 21
  { id: 'M35', group: 'E', matchday: 2, home: 'Ecuador', homeFlag: f('ec'), away: 'Curacao', awayFlag: f('cw'), date: 'Jun 21', time: '01:00', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M36', group: 'F', matchday: 2, home: 'Tunisia', homeFlag: f('tn'), away: 'Japan', awayFlag: f('jp'), date: 'Jun 21', time: '05:00', venue: 'Guadalupe', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M37', group: 'H', matchday: 2, home: 'Spain', homeFlag: f('es'), away: 'Saudi Arabia', awayFlag: f('sa'), date: 'Jun 21', time: '17:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M38', group: 'G', matchday: 2, home: 'Belgium', homeFlag: f('be'), away: 'Iran', awayFlag: f('ir'), date: 'Jun 21', time: '20:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M39', group: 'H', matchday: 2, home: 'Uruguay', homeFlag: f('uy'), away: 'Cape Verde', awayFlag: f('cv'), date: 'Jun 21', time: '23:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 22
  { id: 'M40', group: 'G', matchday: 2, home: 'New Zealand', homeFlag: f('nz'), away: 'Egypt', awayFlag: f('eg'), date: 'Jun 22', time: '02:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M41', group: 'J', matchday: 2, home: 'Argentina', homeFlag: f('ar'), away: 'Austria', awayFlag: f('at'), date: 'Jun 22', time: '18:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M42', group: 'I', matchday: 2, home: 'France', homeFlag: f('fr'), away: 'Iraq', awayFlag: f('iq'), date: 'Jun 22', time: '22:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 23
  { id: 'M43', group: 'I', matchday: 2, home: 'Norway', homeFlag: f('no'), away: 'Senegal', awayFlag: f('sn'), date: 'Jun 23', time: '01:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M44', group: 'J', matchday: 2, home: 'Jordan', homeFlag: f('jo'), away: 'Algeria', awayFlag: f('dz'), date: 'Jun 23', time: '04:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M45', group: 'K', matchday: 2, home: 'Portugal', homeFlag: f('pt'), away: 'Uzbekistan', awayFlag: f('uz'), date: 'Jun 23', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M46', group: 'L', matchday: 2, home: 'England', homeFlag: f('gb-eng'), away: 'Ghana', awayFlag: f('gh'), date: 'Jun 23', time: '21:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 24
  { id: 'M47', group: 'L', matchday: 2, home: 'Panama', homeFlag: f('pa'), away: 'Croatia', awayFlag: f('hr'), date: 'Jun 24', time: '00:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M48', group: 'K', matchday: 2, home: 'Colombia', homeFlag: f('co'), away: 'DR Congo', awayFlag: f('cd'), date: 'Jun 24', time: '03:00', venue: 'Zapopan', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== MATCHDAY 3 ========
  // Jun 24
  { id: 'M49', group: 'B', matchday: 3, home: 'Switzerland', homeFlag: f('ch'), away: 'Canada', awayFlag: f('ca'), date: 'Jun 24', time: '20:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M50', group: 'B', matchday: 3, home: 'Bosnia & Herzegovina', homeFlag: f('ba'), away: 'Qatar', awayFlag: f('qa'), date: 'Jun 24', time: '20:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M51', group: 'C', matchday: 3, home: 'Morocco', homeFlag: f('ma'), away: 'Haiti', awayFlag: f('ht'), date: 'Jun 24', time: '23:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M52', group: 'C', matchday: 3, home: 'Scotland', homeFlag: f('gb-sct'), away: 'Brazil', awayFlag: f('br'), date: 'Jun 24', time: '23:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 25
  { id: 'M53', group: 'A', matchday: 3, home: 'South Africa', homeFlag: f('za'), away: 'South Korea', awayFlag: f('kr'), date: 'Jun 25', time: '02:00', venue: 'Guadalupe', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M54', group: 'A', matchday: 3, home: 'Czech Republic', homeFlag: f('cz'), away: 'Mexico', awayFlag: f('mx'), date: 'Jun 25', time: '02:00', venue: 'Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M55', group: 'E', matchday: 3, home: 'Curacao', homeFlag: f('cw'), away: 'Ivory Coast', awayFlag: f('ci'), date: 'Jun 25', time: '21:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M56', group: 'E', matchday: 3, home: 'Ecuador', homeFlag: f('ec'), away: 'Germany', awayFlag: f('de'), date: 'Jun 25', time: '21:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 26
  { id: 'M57', group: 'F', matchday: 3, home: 'Tunisia', homeFlag: f('tn'), away: 'Netherlands', awayFlag: f('nl'), date: 'Jun 26', time: '00:00', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M58', group: 'F', matchday: 3, home: 'Japan', homeFlag: f('jp'), away: 'Sweden', awayFlag: f('se'), date: 'Jun 26', time: '00:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M59', group: 'D', matchday: 3, home: 'Turkey', homeFlag: f('tr'), away: 'USA', awayFlag: f('us'), date: 'Jun 26', time: '03:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M60', group: 'D', matchday: 3, home: 'Paraguay', homeFlag: f('py'), away: 'Australia', awayFlag: f('au'), date: 'Jun 26', time: '03:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M61', group: 'I', matchday: 3, home: 'Norway', homeFlag: f('no'), away: 'France', awayFlag: f('fr'), date: 'Jun 26', time: '20:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M62', group: 'I', matchday: 3, home: 'Senegal', homeFlag: f('sn'), away: 'Iraq', awayFlag: f('iq'), date: 'Jun 26', time: '20:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 27
  { id: 'M63', group: 'H', matchday: 3, home: 'Cape Verde', homeFlag: f('cv'), away: 'Saudi Arabia', awayFlag: f('sa'), date: 'Jun 27', time: '01:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M64', group: 'H', matchday: 3, home: 'Uruguay', homeFlag: f('uy'), away: 'Spain', awayFlag: f('es'), date: 'Jun 27', time: '01:00', venue: 'Zapopan', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M65', group: 'G', matchday: 3, home: 'New Zealand', homeFlag: f('nz'), away: 'Belgium', awayFlag: f('be'), date: 'Jun 27', time: '04:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M66', group: 'G', matchday: 3, home: 'Egypt', homeFlag: f('eg'), away: 'Iran', awayFlag: f('ir'), date: 'Jun 27', time: '04:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M67', group: 'L', matchday: 3, home: 'Panama', homeFlag: f('pa'), away: 'England', awayFlag: f('gb-eng'), date: 'Jun 27', time: '22:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M68', group: 'L', matchday: 3, home: 'Croatia', homeFlag: f('hr'), away: 'Ghana', awayFlag: f('gh'), date: 'Jun 27', time: '22:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  // Jun 28
  { id: 'M69', group: 'K', matchday: 3, home: 'Colombia', homeFlag: f('co'), away: 'Portugal', awayFlag: f('pt'), date: 'Jun 28', time: '00:30', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M70', group: 'K', matchday: 3, home: 'DR Congo', homeFlag: f('cd'), away: 'Uzbekistan', awayFlag: f('uz'), date: 'Jun 28', time: '00:30', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M71', group: 'J', matchday: 3, home: 'Algeria', homeFlag: f('dz'), away: 'Austria', awayFlag: f('at'), date: 'Jun 28', time: '03:00', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M72', group: 'J', matchday: 3, home: 'Jordan', homeFlag: f('jo'), away: 'Argentina', awayFlag: f('ar'), date: 'Jun 28', time: '03:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== ROUND OF 32 ========
  { id: 'M73', group: 'R32', matchday: 0, home: '2nd Group A', homeFlag: '', away: '2nd Group B', awayFlag: '', date: 'Jun 28', time: '20:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M74', group: 'R32', matchday: 0, home: '1st Group E', homeFlag: '', away: '3rd A/B/C/D/F', awayFlag: '', date: 'Jun 29', time: '21:30', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M75', group: 'R32', matchday: 0, home: '1st Group F', homeFlag: '', away: '2nd Group C', awayFlag: '', date: 'Jun 30', time: '02:00', venue: 'Guadalupe', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M76', group: 'R32', matchday: 0, home: '1st Group C', homeFlag: '', away: '2nd Group F', awayFlag: '', date: 'Jun 29', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M77', group: 'R32', matchday: 0, home: '1st Group I', homeFlag: '', away: '3rd C/D/F/G/H', awayFlag: '', date: 'Jun 30', time: '22:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M78', group: 'R32', matchday: 0, home: '2nd Group E', homeFlag: '', away: '2nd Group I', awayFlag: '', date: 'Jun 30', time: '18:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M79', group: 'R32', matchday: 0, home: '1st Group A', homeFlag: '', away: '3rd C/E/F/H/I', awayFlag: '', date: 'Jul 1', time: '02:00', venue: 'Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M80', group: 'R32', matchday: 0, home: '1st Group L', homeFlag: '', away: '3rd E/H/I/J/K', awayFlag: '', date: 'Jul 1', time: '17:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M81', group: 'R32', matchday: 0, home: '1st Group D', homeFlag: '', away: '3rd B/E/F/I/J', awayFlag: '', date: 'Jul 2', time: '01:00', venue: 'Santa Clara', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M82', group: 'R32', matchday: 0, home: '1st Group G', homeFlag: '', away: '3rd A/E/H/I/J', awayFlag: '', date: 'Jul 1', time: '21:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M83', group: 'R32', matchday: 0, home: '2nd Group K', homeFlag: '', away: '2nd Group L', awayFlag: '', date: 'Jul 3', time: '00:00', venue: 'Toronto', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M84', group: 'R32', matchday: 0, home: '1st Group H', homeFlag: '', away: '2nd Group J', awayFlag: '', date: 'Jul 2', time: '20:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M85', group: 'R32', matchday: 0, home: '1st Group B', homeFlag: '', away: '3rd E/F/G/I/J', awayFlag: '', date: 'Jul 3', time: '04:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M86', group: 'R32', matchday: 0, home: '1st Group J', homeFlag: '', away: '2nd Group H', awayFlag: '', date: 'Jul 3', time: '23:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M87', group: 'R32', matchday: 0, home: '1st Group K', homeFlag: '', away: '3rd D/E/I/J/L', awayFlag: '', date: 'Jul 4', time: '02:30', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M88', group: 'R32', matchday: 0, home: '2nd Group D', homeFlag: '', away: '2nd Group G', awayFlag: '', date: 'Jul 3', time: '19:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== ROUND OF 16 ========
  { id: 'M89', group: 'R16', matchday: 0, home: 'W74', homeFlag: '', away: 'W77', awayFlag: '', date: 'Jul 4', time: '22:00', venue: 'Philadelphia', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M90', group: 'R16', matchday: 0, home: 'W73', homeFlag: '', away: 'W75', awayFlag: '', date: 'Jul 4', time: '18:00', venue: 'Houston', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M91', group: 'R16', matchday: 0, home: 'W76', homeFlag: '', away: 'W78', awayFlag: '', date: 'Jul 5', time: '21:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M92', group: 'R16', matchday: 0, home: 'W79', homeFlag: '', away: 'W80', awayFlag: '', date: 'Jul 6', time: '01:00', venue: 'Mexico City', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M93', group: 'R16', matchday: 0, home: 'W83', homeFlag: '', away: 'W84', awayFlag: '', date: 'Jul 6', time: '20:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M94', group: 'R16', matchday: 0, home: 'W81', homeFlag: '', away: 'W82', awayFlag: '', date: 'Jul 7', time: '01:00', venue: 'Seattle', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M95', group: 'R16', matchday: 0, home: 'W86', homeFlag: '', away: 'W88', awayFlag: '', date: 'Jul 7', time: '17:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M96', group: 'R16', matchday: 0, home: 'W85', homeFlag: '', away: 'W87', awayFlag: '', date: 'Jul 7', time: '21:00', venue: 'Vancouver', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== QUARTER-FINALS ========
  { id: 'M97', group: 'QF', matchday: 0, home: 'W89', homeFlag: '', away: 'W90', awayFlag: '', date: 'Jul 9', time: '21:00', venue: 'Foxborough', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M98', group: 'QF', matchday: 0, home: 'W93', homeFlag: '', away: 'W94', awayFlag: '', date: 'Jul 10', time: '20:00', venue: 'Los Angeles', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M99', group: 'QF', matchday: 0, home: 'W91', homeFlag: '', away: 'W92', awayFlag: '', date: 'Jul 11', time: '22:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M100', group: 'QF', matchday: 0, home: 'W95', homeFlag: '', away: 'W96', awayFlag: '', date: 'Jul 12', time: '02:00', venue: 'Kansas City', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== SEMI-FINALS ========
  { id: 'M101', group: 'SF', matchday: 0, home: 'W97', homeFlag: '', away: 'W98', awayFlag: '', date: 'Jul 14', time: '20:00', venue: 'Arlington', homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'M102', group: 'SF', matchday: 0, home: 'W99', homeFlag: '', away: 'W100', awayFlag: '', date: 'Jul 15', time: '20:00', venue: 'Atlanta', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== 3RD PLACE ========
  { id: 'M103', group: '3RD', matchday: 0, home: 'L101', homeFlag: '', away: 'L102', awayFlag: '', date: 'Jul 18', time: '22:00', venue: 'Miami', homeScore: null, awayScore: null, status: 'upcoming' },

  // ======== FINAL ========
  { id: 'M104', group: 'FINAL', matchday: 0, home: 'W101', homeFlag: '', away: 'W102', awayFlag: '', date: 'Jul 19', time: '20:00', venue: 'New Jersey', homeScore: null, awayScore: null, status: 'upcoming' },
]
