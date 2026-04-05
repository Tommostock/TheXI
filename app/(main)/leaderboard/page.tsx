import { requireUser } from '@/lib/supabase/auth'
import { LeaderboardView } from '@/components/league/LeaderboardView'
import { Trophy } from 'lucide-react'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { OnboardingTip } from '@/components/ui/OnboardingTip'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

export default async function LeaderboardPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-display text-white">Leaderboard</h1>
        <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
          <Trophy size={40} className="mx-auto text-wc-gold/40 mb-3" />
          <p className="text-white font-medium">No standings yet</p>
          <p className="mt-1 text-sm text-text-secondary">Join a league to see how you rank against your mates.</p>
        </div>
      </div>
    )
  }

  const leagueId = memberships[0].league_id

  const { data: leagueData } = await supabase
    .from('leagues')
    .select('player_of_round_id')
    .eq('id', leagueId)
    .single()

  const playerOfRoundId = (leagueData as Record<string, unknown>)?.player_of_round_id as string | null

  const { data: members } = await supabase
    .from('league_members')
    .select('user_id, display_name, formation, captain_player_id, vice_captain_player_id')
    .eq('league_id', leagueId)

  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, total_points')
    .eq('league_id', leagueId)

  // Get squad slots with player data
  const { data: allSlots } = await supabase
    .from('squad_slots')
    .select('user_id, player_id, is_starting, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', leagueId)

  // Get all match event points grouped by player
  const allPlayerIds = (allSlots || []).map((s) => s.player_id)
  let playerPointsMap: Record<string, number> = {}

  if (allPlayerIds.length > 0) {
    const { data: events } = await supabase
      .from('match_events')
      .select('player_id, points_awarded')
      .in('player_id', allPlayerIds)

    if (events) {
      for (const e of events) {
        playerPointsMap[e.player_id] = (playerPointsMap[e.player_id] || 0) + e.points_awarded
      }
    }
  }

  const scoreMap = new Map((scores || []).map((s) => [s.user_id, s.total_points]))

  const rankings = (members || [])
    .map((m) => ({
      userId: m.user_id,
      displayName: m.display_name,
      formation: m.formation,
      totalPoints: scoreMap.get(m.user_id) || 0,
      captainPlayerId: m.captain_player_id || null,
      viceCaptainPlayerId: m.vice_captain_player_id || null,
      squad: (allSlots || [])
        .filter((s) => s.user_id === m.user_id)
        .map((s) => ({
          isStarting: s.is_starting,
          playerPoints: playerPointsMap[s.player_id] || 0,
          player: s.player as unknown as { id: string; name: string; nation: string; nation_flag_url: string | null; position: string } | null,
        })),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  // Calculate achievement stats for current user
  const myRanking = rankings.find((r) => r.userId === user.id)
  const myRank = rankings.findIndex((r) => r.userId === user.id) + 1
  const myGoals = myRanking?.squad
    .filter((s) => s.isStarting)
    .reduce((sum, s) => sum + (s.playerPoints > 0 ? 1 : 0), 0) || 0

  return (
    <PullToRefresh>
    <div className="p-4">
      <h1 className="mb-3 text-2xl font-display text-white">Leaderboard</h1>

      <div className="mb-3">
        <OnboardingTip
          storageKey="leaderboard"
          title="This is the leaderboard"
          message="See how you stack up against your mates. Tap any player to see their full squad breakdown. Points update live during matches."
        />
      </div>

      {/* Prize Pool */}
      <div className="mb-4 rounded-xl border border-wc-gold/30 bg-gradient-to-b from-wc-gold/10 to-transparent p-5 text-center animate-fade-in">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wc-gold mb-2">Prize Pool</p>
        <p className="text-5xl font-display text-wc-gold">£60</p>
        <p className="mt-2 text-xs text-text-secondary">Winner takes all</p>
      </div>
      <LeaderboardView rankings={rankings} currentUserId={user.id} playerOfRoundId={playerOfRoundId} />
    </div>
    </PullToRefresh>
  )
}
