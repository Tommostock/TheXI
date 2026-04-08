import { requireUser } from '@/lib/supabase/auth'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { JoinLeague } from '@/components/league/JoinLeague'
import { ReplacementBanner } from '@/components/ui/ReplacementBanner'
import { NotificationPrompt } from '@/components/ui/NotificationPrompt'

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

  // Check for active replacement window with eliminated squad players
  let activeWindow: { window_type: string; closes_at: string | null } | null = null
  let eliminatedCount = 0

  if (hasLeague) {
    const leagueId = memberships![0].league_id

    const { data: window } = await supabase
      .from('draft_windows')
      .select('window_type, closes_at')
      .eq('league_id', leagueId)
      .eq('status', 'active')
      .not('window_type', 'eq', 'initial')
      .maybeSingle()

    if (window) {
      activeWindow = window

      const { data: slots } = await supabase
        .from('squad_slots')
        .select('player:players(is_eliminated)')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)

      type SlotWithElim = { player: { is_eliminated: boolean } | null }
      eliminatedCount = ((slots || []) as unknown as SlotWithElim[])
        .filter((s) => s.player?.is_eliminated).length
    }
  }

  return (
    <>
      <NotificationPrompt />
      {!hasLeague && (
        <div className="px-4 pt-4">
          <JoinLeague />
        </div>
      )}
      {activeWindow && eliminatedCount > 0 && hasLeague && (
        <div className="px-4 pt-3">
          <ReplacementBanner
            leagueId={memberships![0].league_id}
            windowType={activeWindow.window_type}
            eliminatedCount={eliminatedCount}
            closesAt={activeWindow.closes_at}
          />
        </div>
      )}
      <DashboardClient
        displayName={displayName}
        eventsByMatch={eventsByMatch}
      />
    </>
  )
}
