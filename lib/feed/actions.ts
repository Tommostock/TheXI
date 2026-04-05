'use server'

import { getActionUser } from '@/lib/supabase/auth'

const ALLOWED_REACTIONS = ['😂', '😭', '🔥', '💀']

export async function toggleReaction(eventId: string, emoji: string) {
  if (!ALLOWED_REACTIONS.includes(emoji)) return { error: 'Invalid reaction' }

  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  const { data: event } = await supabase
    .from('activity_feed')
    .select('reactions')
    .eq('id', eventId)
    .single()

  if (!event) return { error: 'Event not found' }

  const reactions: Record<string, string[]> = (event.reactions as Record<string, string[]>) || {}
  const users = reactions[emoji] || []

  if (users.includes(user.id)) {
    reactions[emoji] = users.filter((id) => id !== user.id)
    if (reactions[emoji].length === 0) delete reactions[emoji]
  } else {
    reactions[emoji] = [...users, user.id]
  }

  const { error } = await supabase
    .from('activity_feed')
    .update({ reactions })
    .eq('id', eventId)

  if (error) return { error: error.message }
  return { success: true, reactions }
}
