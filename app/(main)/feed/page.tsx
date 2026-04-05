import { requireUser } from '@/lib/supabase/auth'
import { ActivityFeed } from '@/components/league/ActivityFeed'
import { LoadingShell } from '@/components/ui/LoadingShell'
import { Newspaper } from 'lucide-react'
import { OnboardingTip } from '@/components/ui/OnboardingTip'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

export default async function FeedPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-display text-white">Activity Feed</h1>
        <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
          <Newspaper size={40} className="mx-auto text-wc-peach/40 mb-3" />
          <p className="text-white font-medium">No activity yet</p>
          <p className="mt-1 text-sm text-text-secondary">Join a league to see draft picks, goals, and score updates.</p>
        </div>
      </div>
    )
  }

  const leagueId = memberships[0].league_id

  const { data: events } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <PullToRefresh>
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-display text-white">Activity Feed</h1>
      <div className="mb-3">
        <OnboardingTip
          storageKey="feed"
          title="This is the activity feed"
          message="Every draft pick, goal, assist, card and score update appears here in real time. Stay on top of what's happening in your league."
        />
      </div>
      <ActivityFeed leagueId={leagueId} initialEvents={events || []} />
    </div>
    </PullToRefresh>
  )
}
