import { requireUser } from '@/lib/supabase/auth'
import { SquadView } from '@/components/squad/SquadView'
import Link from 'next/link'
import { LoadingShell } from '@/components/ui/LoadingShell'

export default async function SquadPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, formation, captain_player_id, vice_captain_player_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-display text-white">My Squad</h1>
        <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-text-secondary">Join a league to build your squad.</p>
          <Link href="/dashboard" className="mt-3 inline-block rounded-md bg-wc-purple px-4 py-2 text-sm font-semibold text-white">
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

  const { data: league } = await supabase
    .from('leagues')
    .select('lineup_locked')
    .eq('id', leagueId)
    .single()

  const isLocked = league?.lineup_locked || false

  const { data: slots } = await supabase
    .from('squad_slots')
    .select('*, player:players(id, name, nation, nation_flag_url, position, is_eliminated)')
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

  if (playerIds.length > 0) {
    const { data: events } = await supabase
      .from('match_events')
      .select('player_id, points_awarded')
      .in('player_id', playerIds)

    if (events) {
      for (const e of events) {
        playerPoints[e.player_id] = (playerPoints[e.player_id] || 0) + e.points_awarded
      }
    }
  }

  return (
    <div className="px-2 pt-2 pb-0">
      <SquadView
        leagueId={leagueId}
        formation={formation}
        slots={(slots || []) as Parameters<typeof SquadView>[0]['slots']}
        totalPoints={score?.total_points || 0}
        playerPoints={playerPoints}
        captainId={captainId}
        viceCaptainId={viceCaptainId}
        isLocked={isLocked}
      />
    </div>
  )
}
