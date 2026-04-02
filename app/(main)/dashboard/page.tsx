import { requireUser } from '@/lib/supabase/auth'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'

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
      eventsByMatch={eventsByMatch}
    />
  )
}
