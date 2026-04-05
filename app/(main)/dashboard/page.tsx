import { requireUser } from '@/lib/supabase/auth'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { JoinLeague } from '@/components/league/JoinLeague'

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'

  // Check if user is in a league
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  const hasLeague = (memberships?.length || 0) > 0

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
    <>
      {!hasLeague && (
        <div className="px-4 pt-4">
          <JoinLeague />
        </div>
      )}
      <DashboardClient
        displayName={displayName}
        eventsByMatch={eventsByMatch}
      />
    </>
  )
}
