import { requireUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { LeagueLobby } from '@/components/league/LeagueLobby'
import { LoadingShell } from '@/components/ui/LoadingShell'

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user, supabase } = await requireUser()
  if (!user) return <LoadingShell />

  // Fetch league data
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single()

  if (!league) redirect('/dashboard')

  // Fetch members
  const { data: members } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', id)
    .order('joined_at', { ascending: true })

  // Check if current user is a member
  const isMember = members?.some((m) => m.user_id === user.id)
  if (!isMember) redirect('/dashboard')

  const isCreator = league.created_by === user.id

  return (
    <LeagueLobby
      league={league}
      members={members || []}
      currentUserId={user.id}
      isCreator={isCreator}
    />
  )
}
