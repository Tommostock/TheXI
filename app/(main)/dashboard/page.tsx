import { requireUser } from '@/lib/supabase/auth'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'

  // Fetch standings
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  let leaderboard: Array<{ displayName: string; points: number; isMe: boolean }> = []
  const leagueId = memberships?.[0]?.league_id

  if (leagueId) {
    const { data: members } = await supabase
      .from('league_members')
      .select('user_id, display_name')
      .eq('league_id', leagueId)

    const { data: scores } = await supabase
      .from('scores')
      .select('user_id, total_points')
      .eq('league_id', leagueId)

    const scoreMap = new Map((scores || []).map((s) => [s.user_id, s.total_points]))

    leaderboard = (members || [])
      .map((m) => ({
        displayName: m.display_name,
        points: scoreMap.get(m.user_id) || 0,
        isMe: m.user_id === user.id,
      }))
      .sort((a, b) => b.points - a.points)
  }

  // Get match events keyed by fixture id for result details
  const { data: matchEvents } = await supabase
    .from('match_events')
    .select('match_id, player_id, event_type, minute, points_awarded, player:players(name, nation)')
    .order('minute', { ascending: true })

  type EventRow = {
    match_id: string
    event_type: string
    minute: number | null
    points_awarded: number
    player: { name: string; nation: string } | null
  }

  const eventsByMatch: Record<string, EventRow[]> = {}
  for (const e of (matchEvents || []) as unknown as EventRow[]) {
    if (!eventsByMatch[e.match_id]) eventsByMatch[e.match_id] = []
    eventsByMatch[e.match_id].push(e)
  }

  return (
    <DashboardClient
      displayName={displayName}
      leaderboard={leaderboard}
      eventsByMatch={eventsByMatch}
    />
  )
}
