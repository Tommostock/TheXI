import { requireUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlayerBrowser } from '@/components/draft/PlayerBrowser'
import { LoadingShell } from '@/components/ui/LoadingShell'

export default async function DraftPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  // Find user's leagues that have an active draft
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, leagues(id, name, draft_status)')
    .eq('user_id', user.id)

  type LeagueJoin = { id: string; name: string; draft_status: string }
  const activeLeagues = memberships?.flatMap((m) => {
    const l = m.leagues as unknown as LeagueJoin | null
    if (!l || l.draft_status !== 'in_progress') return []
    return [l]
  }) || []

  if (activeLeagues.length > 0) {
    // Redirect to the first active draft
    redirect(`/draft/${activeLeagues[0].id}`)
  }

  // No active draft — show player browser
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('is_eliminated', false)
    .order('name', { ascending: true })

  return (
    <div className="p-4 flex flex-col h-[calc(100dvh-4rem-max(env(safe-area-inset-bottom),12px))]">
      <h1 className="text-2xl font-display text-white shrink-0">Draft Board</h1>
      <p className="mt-1 mb-3 text-sm text-text-secondary shrink-0">
        Browse all available World Cup 2026 players by nation.
      </p>
      <PlayerBrowser players={players || []} />
    </div>
  )
}
