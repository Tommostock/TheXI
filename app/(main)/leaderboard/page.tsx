import { requireUser } from '@/lib/supabase/auth'
import { LeaderboardView } from '@/components/league/LeaderboardView'

export default async function LeaderboardPage() {
  const { user, supabase } = await requireUser()

  // Get user's first league
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="mt-4 text-center text-light-grey">
          Join a league to see standings.
        </p>
      </div>
    )
  }

  const leagueId = memberships[0].league_id

  // Get all members with scores
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id, display_name, formation')
    .eq('league_id', leagueId)

  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, total_points')
    .eq('league_id', leagueId)

  // Get squad slots for expandable view
  const { data: allSlots } = await supabase
    .from('squad_slots')
    .select('user_id, is_starting, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', leagueId)

  const scoreMap = new Map((scores || []).map((s) => [s.user_id, s.total_points]))

  const rankings = (members || [])
    .map((m) => ({
      userId: m.user_id,
      displayName: m.display_name,
      formation: m.formation,
      totalPoints: scoreMap.get(m.user_id) || 0,
      squad: (allSlots || [])
        .filter((s) => s.user_id === m.user_id)
        .map((s) => ({
          isStarting: s.is_starting,
          player: s.player as unknown as { id: string; name: string; nation: string; nation_flag_url: string | null; position: string } | null,
        })),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">Leaderboard</h1>
      <LeaderboardView rankings={rankings} currentUserId={user.id} />
    </div>
  )
}
