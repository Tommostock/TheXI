import { requireUser } from '@/lib/supabase/auth'
import { LoadingShell } from '@/components/ui/LoadingShell'
import Link from 'next/link'
import { Trophy, ChevronRight, Calendar } from 'lucide-react'
import { SignOutButton } from '@/components/ui/SignOutButton'

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'

  // Fetch user's leagues
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, display_name, formation, leagues(id, name, invite_code, draft_status, current_stage)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  type LeagueJoin = { id: string; name: string; invite_code: string; draft_status: string; current_stage: string }

  const leagues = memberships?.flatMap((m) => {
    const l = m.leagues as unknown as LeagueJoin | null
    if (!l) return []
    return [{ ...l, userDisplayName: m.display_name, formation: m.formation }]
  }) || []

  // Get scores for leaderboard (first league)
  let leaderboard: Array<{ displayName: string; points: number; isMe: boolean }> = []
  let myRank = 0
  let activeLeagueId: string | null = null

  if (leagues.length > 0) {
    activeLeagueId = leagues[0].id

    const { data: members } = await supabase
      .from('league_members')
      .select('user_id, display_name')
      .eq('league_id', activeLeagueId)

    const { data: scores } = await supabase
      .from('scores')
      .select('user_id, total_points')
      .eq('league_id', activeLeagueId)

    const scoreMap = new Map((scores || []).map((s) => [s.user_id, s.total_points]))

    leaderboard = (members || [])
      .map((m) => ({
        displayName: m.display_name,
        points: scoreMap.get(m.user_id) || 0,
        isMe: m.user_id === user.id,
      }))
      .sort((a, b) => b.points - a.points)

    myRank = leaderboard.findIndex((e) => e.isMe) + 1
  }

  // Check for active draft windows
  let activeDraftWindow = false
  if (activeLeagueId) {
    const { data: windows } = await supabase
      .from('draft_windows')
      .select('id')
      .eq('league_id', activeLeagueId)
      .eq('status', 'active')
      .limit(1)

    activeDraftWindow = (windows?.length || 0) > 0
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            THE <span className="text-wc-lime">XI</span>
          </h1>
          <p className="text-sm text-text-secondary">Welcome, {displayName}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Draft Window Alert */}
      {activeDraftWindow && (
        <Link
          href={activeLeagueId ? `/draft/${activeLeagueId}` : '/draft'}
          className="mt-4 flex items-center gap-2 rounded-xl border border-wc-crimson/40 bg-wc-crimson/10 p-3"
        >
          <div className="h-2 w-2 rounded-full bg-wc-crimson animate-pulse" />
          <p className="flex-1 text-sm font-medium text-wc-crimson">
            Draft window is open — replace eliminated players
          </p>
          <ChevronRight size={16} className="text-wc-crimson" />
        </Link>
      )}

      {/* Standings */}
      {leaderboard.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-wc-gold" />
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Standings
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs text-wc-lime hover:underline"
            >
              Full board
            </Link>
          </div>
          <div className="space-y-1.5">
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                  entry.isMe ? 'bg-wc-lime/10' : ''
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0
                      ? 'bg-wc-gold text-bg-primary'
                      : i === 1
                      ? 'bg-text-secondary text-bg-primary'
                      : i === 2
                      ? 'bg-[#CD7F32] text-bg-primary'
                      : 'bg-text-muted/30 text-text-secondary'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`flex-1 text-sm ${entry.isMe ? 'text-wc-lime font-semibold' : 'text-white'}`}>
                  {entry.displayName}
                </span>
                <span className="text-sm font-bold text-white">
                  {entry.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches quick link */}
      <Link
        href="/matches"
        className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-wc-blue"
      >
        <Calendar size={20} className="text-wc-blue" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Match Centre</p>
          <p className="text-xs text-text-secondary">Results, events and points</p>
        </div>
        <ChevronRight size={16} className="text-text-muted" />
      </Link>

      {/* League info */}
      {leagues.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-bg-card p-4">
          <p className="font-semibold text-white">{leagues[0].name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {leagues[0].draft_status === 'pre_draft'
              ? 'Pre-Draft'
              : leagues[0].draft_status === 'in_progress'
              ? 'Draft In Progress'
              : 'Draft Complete'}
            {' | '}
            {(leagues[0].current_stage || 'pre_tournament').replace(/_/g, ' ')}
          </p>
        </div>
      )}
    </div>
  )
}
