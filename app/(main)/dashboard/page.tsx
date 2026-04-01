import { requireUser } from '@/lib/supabase/auth'
import Link from 'next/link'
import { Plus, LogIn, ChevronRight, Trophy, Calendar, Newspaper } from 'lucide-react'
import { SignOutButton } from '@/components/ui/SignOutButton'

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()

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

  // Get scores for mini-leaderboard (first league)
  let miniLeaderboard: Array<{ displayName: string; points: number; isMe: boolean }> = []
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

    miniLeaderboard = (members || [])
      .map((m) => ({
        displayName: m.display_name,
        points: scoreMap.get(m.user_id) || 0,
        isMe: m.user_id === user.id,
      }))
      .sort((a, b) => b.points - a.points)

    myRank = miniLeaderboard.findIndex((e) => e.isMe) + 1
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

      {/* Mini Leaderboard */}
      {miniLeaderboard.length > 0 && (
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
            {miniLeaderboard.slice(0, 3).map((entry, i) => (
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
            {myRank > 3 && (
              <>
                <div className="text-center text-xs text-text-muted">...</div>
                <div className="flex items-center gap-2 rounded-lg bg-wc-lime/10 px-2 py-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-text-muted/30 text-[10px] font-bold text-text-secondary">
                    {myRank}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-wc-lime">
                    {miniLeaderboard[myRank - 1]?.displayName}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {miniLeaderboard[myRank - 1]?.points}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link
          href="/matches"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-bg-card p-3 transition-colors hover:border-wc-blue"
        >
          <Calendar size={18} className="text-wc-blue" />
          <span className="text-xs text-text-secondary">Matches</span>
        </Link>
        <Link
          href="/feed"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-bg-card p-3 transition-colors hover:border-wc-lavender"
        >
          <Newspaper size={18} className="text-wc-lavender" />
          <span className="text-xs text-text-secondary">Feed</span>
        </Link>
        <Link
          href="/leaderboard"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-bg-card p-3 transition-colors hover:border-wc-gold"
        >
          <Trophy size={18} className="text-wc-gold" />
          <span className="text-xs text-text-secondary">Board</span>
        </Link>
      </div>

      {/* League Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/league/create"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-wc-lime"
        >
          <Plus size={24} className="text-wc-lime" />
          <span className="text-sm font-semibold text-white">Create League</span>
        </Link>
        <Link
          href="/league/join"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-wc-orange"
        >
          <LogIn size={24} className="text-wc-orange" />
          <span className="text-sm font-semibold text-white">Join League</span>
        </Link>
      </div>

      {/* User's Leagues */}
      <div className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Your Leagues
        </h2>

        {leagues.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-text-secondary">No leagues yet.</p>
            <p className="mt-1 text-sm text-text-muted">
              Create a league or join one with an invite code.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/league/${league.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-wc-purple"
              >
                <div>
                  <p className="font-semibold text-white">{league.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {league.draft_status === 'pre_draft'
                      ? 'Pre-Draft'
                      : league.draft_status === 'in_progress'
                      ? 'Draft In Progress'
                      : 'Draft Complete'}
                    {' | '}
                    {league.current_stage.replace(/_/g, ' ')}
                  </p>
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
