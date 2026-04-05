import { requireUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { PlayerBrowser } from '@/components/draft/PlayerBrowser'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { StartDraftButton } from '@/components/draft/StartDraftButton'
import { OnboardingTip } from '@/components/ui/OnboardingTip'

export default async function DraftPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  // Find user's leagues
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, leagues(id, name, draft_status, created_by, draft_start_time)')
    .eq('user_id', user.id)

  type LeagueJoin = { id: string; name: string; draft_status: string; created_by: string; draft_start_time?: string }

  const allLeagues = memberships?.flatMap((m) => {
    const l = m.leagues as unknown as LeagueJoin | null
    if (!l) return []
    return [l]
  }) || []

  // Redirect to active or completed draft if one exists
  const activeDraft = allLeagues.find((l) => l.draft_status === 'in_progress')
  if (activeDraft) {
    redirect(`/draft/${activeDraft.id}`)
  }

  const completedDraft = allLeagues.find((l) => l.draft_status === 'completed')
  if (completedDraft) {
    redirect(`/draft/${completedDraft.id}`)
  }

  // Check for pre-draft league where user is creator
  const preDraftLeague = allLeagues.find(
    (l) => l.draft_status === 'pre_draft' && l.created_by === user.id
  )

  // Get member count for the pre-draft league
  let memberCount = 0
  if (preDraftLeague) {
    const { count } = await supabase
      .from('league_members')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', preDraftLeague.id)
    memberCount = count || 0
  }

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

      <div className="mb-3 shrink-0">
        <OnboardingTip
          storageKey="draft"
          title="This is the Draft Board"
          message="When the draft begins, you'll take turns picking real World Cup 2026 players for your squad. 15 rounds, snake order. You'll get a notification when it's your turn."
        />
      </div>

      {/* Start Draft button — shows when there's a pre-draft league */}
      {preDraftLeague && memberCount >= 2 && (
        <div className="mb-3 shrink-0">
          <StartDraftButton
            leagueId={preDraftLeague.id}
            leagueName={preDraftLeague.name}
            memberCount={memberCount}
          />
        </div>
      )}

      <PlayerBrowser players={players || []} />
    </div>
  )
}
