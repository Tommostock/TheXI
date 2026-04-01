import { requireUser } from '@/lib/supabase/auth'
import { MatchCentre } from '@/components/match/MatchCentre'

export default async function MatchesPage() {
  const { user, supabase } = await requireUser()

  // Get user's first league
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  const leagueId = memberships?.[0]?.league_id

  // Get recent match events grouped by match
  const { data: events } = await supabase
    .from('match_events')
    .select('*, player:players(id, name, nation, nation_flag_url, position)')
    .order('match_date', { ascending: false })
    .limit(200)

  // Get user's squad to highlight relevant players
  let myPlayerIds: string[] = []
  if (leagueId) {
    const { data: slots } = await supabase
      .from('squad_slots')
      .select('player_id')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)

    myPlayerIds = (slots || []).map((s) => s.player_id)
  }

  type EventWithPlayer = NonNullable<typeof events>[number] & {
    player: { id: string; name: string; nation: string; nation_flag_url: string | null; position: string } | null
  }

  // Group events by match
  const matchMap = new Map<string, {
    matchId: string
    matchDate: string
    events: EventWithPlayer[]
  }>()

  for (const event of (events || []) as EventWithPlayer[]) {
    if (!matchMap.has(event.match_id)) {
      matchMap.set(event.match_id, {
        matchId: event.match_id,
        matchDate: event.match_date,
        events: [],
      })
    }
    matchMap.get(event.match_id)!.events.push(event)
  }

  const matches = Array.from(matchMap.values())

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">Match Centre</h1>
      <MatchCentre matches={matches} myPlayerIds={myPlayerIds} />
    </div>
  )
}
