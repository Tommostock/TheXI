import { requireUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { DraftBoard } from '@/components/draft/DraftBoard'
import type { DraftPick } from '@/lib/draft/logic'

export default async function DraftLeaguePage({
  params,
}: {
  params: Promise<{ leagueId: string }>
}) {
  const { leagueId } = await params
  const { user, supabase } = await requireUser()

  // Get league
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single()

  if (!league) redirect('/dashboard')

  // Verify membership
  const { data: membership } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  if (league.draft_status === 'pre_draft') {
    redirect(`/league/${leagueId}`)
  }

  const draftOrder = (league.draft_order as string[]) || []

  // Get members
  const { data: members } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', leagueId)

  // Get existing picks with player data
  const { data: picks } = await supabase
    .from('draft_picks')
    .select('*, player:players(id, name, nation, nation_flag_url, position)')
    .eq('league_id', leagueId)
    .eq('draft_window', 'initial')
    .order('pick_number', { ascending: true })

  // Get all available players
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('is_eliminated', false)
    .order('name', { ascending: true })

  return (
    <div className="p-4">
      <h1 className="mb-1 text-xl font-bold text-white">{league.name}</h1>
      <p className="mb-4 text-xs text-light-grey">Initial Draft</p>
      <DraftBoard
        leagueId={leagueId}
        draftOrder={draftOrder}
        currentUserId={user.id}
        initialPicks={(picks || []) as unknown as DraftPick[]}
        members={members || []}
        players={players || []}
      />
    </div>
  )
}
