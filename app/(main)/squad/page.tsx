import { requireUser } from '@/lib/supabase/auth'
import { SquadView } from '@/components/squad/SquadView'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

export default async function SquadPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, formation, captain_player_id, vice_captain_player_id, team_name')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-display text-white">My Squad</h1>
        <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
          <Users size={40} className="mx-auto text-wc-purple/40 mb-3" />
          <p className="text-white font-medium">No squad yet</p>
          <p className="mt-1 text-sm text-text-secondary">Join a league and complete the draft to build your squad.</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-wc-purple px-4 py-2 text-sm font-semibold text-white">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const leagueId = memberships[0].league_id
  const formation = (memberships[0].formation || '4-4-2') as '4-4-2' | '4-3-3' | '4-5-1'
  const captainId = memberships[0].captain_player_id || null
  const viceCaptainId = memberships[0].vice_captain_player_id || null
  const teamName = (memberships[0] as Record<string, unknown>).team_name as string || ''

  const { data: league } = await supabase
    .from('leagues')
    .select('lineup_locked')
    .eq('id', leagueId)
    .single()

  const isLocked = league?.lineup_locked || false

  const { data: slots } = await supabase
    .from('squad_slots')
    .select('*, player:players(id, name, nation, nation_flag_url, photo_url, position, is_eliminated)')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)

  const { data: score } = await supabase
    .from('scores')
    .select('total_points')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .maybeSingle()

  const playerIds = (slots || []).map((s) => s.player_id)
  let playerPoints: Record<string, number> = {}
  let playerEvents: Record<string, Array<{ event_type: string; points_awarded: number }>> = {}

  if (playerIds.length > 0) {
    const { data: events } = await supabase
      .from('match_events')
      .select('player_id, event_type, points_awarded')
      .in('player_id', playerIds)

    if (events) {
      for (const e of events) {
        playerPoints[e.player_id] = (playerPoints[e.player_id] || 0) + e.points_awarded
        if (!playerEvents[e.player_id]) playerEvents[e.player_id] = []
        playerEvents[e.player_id].push({ event_type: e.event_type, points_awarded: e.points_awarded })
      }
    }
  }

  return (
    <PullToRefresh>
    <div className="px-2 pt-2 pb-0">
      <h1 className="mb-2 text-2xl font-display text-white px-1">My Squad</h1>
      <SquadView
        leagueId={leagueId}
        formation={formation}
        slots={(slots || []) as Parameters<typeof SquadView>[0]['slots']}
        totalPoints={score?.total_points || 0}
        playerPoints={playerPoints}
        playerEvents={playerEvents}
        captainId={captainId}
        viceCaptainId={viceCaptainId}
        isLocked={isLocked}
        teamName={teamName}
      />
    </div>
    </PullToRefresh>
  )
}
