const API_BASE = 'https://v3.football.api-sports.io'

export async function apiFetch(endpoint: string) {
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY environment variable is not set')
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'x-apisports-key': apiKey,
    },
  })

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// World Cup 2026 league ID in API-Football is 1
export const WORLD_CUP_LEAGUE_ID = 1
export const WORLD_CUP_SEASON = 2026
