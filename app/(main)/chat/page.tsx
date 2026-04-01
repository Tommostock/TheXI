import { requireUser } from '@/lib/supabase/auth'
import { GroupChat } from '@/components/league/GroupChat'
import { LoadingShell } from '@/components/ui/LoadingShell'

export default async function ChatPage() {
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, display_name')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">Group Chat</h1>
        <p className="mt-4 text-center text-text-secondary">
          Join a league to chat with your mates.
        </p>
      </div>
    )
  }

  const leagueId = memberships[0].league_id

  // Get all members for display names
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id, display_name')
    .eq('league_id', leagueId)

  // Get recent messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('league_id', leagueId)
    .order('sent_at', { ascending: true })
    .limit(100)

  const memberMap: Record<string, string> = {}
  for (const m of members || []) {
    memberMap[m.user_id] = m.display_name
  }

  return (
    <GroupChat
      leagueId={leagueId}
      currentUserId={user.id}
      memberMap={memberMap}
      initialMessages={messages || []}
    />
  )
}
