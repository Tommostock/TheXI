import { apiFetch, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from './client'

type ApiPlayer = {
  id: number
  name: string
  position: string
}

type ApiTeam = {
  id: number
  name: string
  logo: string
}

type SquadResponse = {
  response: Array<{
    team: ApiTeam
    players: ApiPlayer[]
  }>
}

function mapPosition(pos: string): 'GK' | 'DEF' | 'MID' | 'ATT' {
  switch (pos) {
    case 'Goalkeeper':
      return 'GK'
    case 'Defender':
      return 'DEF'
    case 'Midfielder':
      return 'MID'
    case 'Attacker':
      return 'ATT'
    default:
      return 'MID'
  }
}

export type PlayerData = {
  api_football_id: number
  name: string
  nation: string
  nation_flag_url: string
  position: 'GK' | 'DEF' | 'MID' | 'ATT'
}

/**
 * Fetch all World Cup 2026 teams, then fetch squads for each.
 * WARNING: This uses multiple API requests. Budget carefully with 100/day limit.
 * Call getTeams first (1 request), then fetchSquad per team (1 request each).
 */
export async function getWorldCupTeams(): Promise<Array<{ id: number; name: string; logo: string }>> {
  const data = await apiFetch(
    `/teams?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
  )
  return data.response.map((r: { team: ApiTeam }) => r.team)
}

export async function fetchSquad(teamId: number): Promise<SquadResponse> {
  return apiFetch(`/players/squads?team=${teamId}`)
}

export async function fetchTeamSquadAsPlayers(
  teamId: number,
  teamName: string,
  teamLogo: string
): Promise<PlayerData[]> {
  const data = await fetchSquad(teamId)
  if (!data.response?.[0]?.players) return []

  return data.response[0].players.map((p) => ({
    api_football_id: p.id,
    name: p.name,
    nation: teamName,
    nation_flag_url: teamLogo,
    position: mapPosition(p.position),
  }))
}
