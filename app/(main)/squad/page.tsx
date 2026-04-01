import { requireUser } from '@/lib/supabase/auth'
import { SquadView } from '@/components/squad/SquadView'
import Link from 'next/link'

export default async function SquadPage() {
  const { user, supabase } = await requireUser()

  // Find user's league membership
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, formation')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">My Squad</h1>
        <div className="mt-4 rounded-lg border border-dashed border-dark-grey p-8 text-center">
          <p className="text-light-grey">Join a league to build your squad.</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-md bg-tournament-green px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const leagueId = memberships[0].league_id
  const formation = (memberships[0].formation || '4-4-2') as '4-4-2' | '4-3-3' | '4-5-1'

  // Get squad slots with player data
  const { data: slots } = await supabase
    .from('squad_slots')
    .select('*, player:players(id, name, nation, nation_flag_url, position, is_eliminated)')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)

  // Get total points
  const { data: score } = await supabase
    .from('scores')
    .select('total_points')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">My Squad</h1>
      <SquadView
        leagueId={leagueId}
        formation={formation}
        slots={(slots || []) as Parameters<typeof SquadView>[0]['slots']}
        totalPoints={score?.total_points || 0}
      />
    </div>
  )
}
