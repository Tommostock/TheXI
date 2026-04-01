'use server'

import { getActionUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createLeague(formData: FormData) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  const name = (formData.get('name') as string)?.trim()
  if (!name || name.length < 2) {
    return { error: 'League name must be at least 2 characters' }
  }

  const displayName = (formData.get('displayName') as string)?.trim()
  if (!displayName || displayName.length < 2) {
    return { error: 'Display name must be at least 2 characters' }
  }

  // Generate unique invite code — use maybeSingle to avoid error on zero rows
  let inviteCode = generateInviteCode()
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from('leagues')
      .select('id')
      .eq('invite_code', inviteCode)
      .maybeSingle()

    if (!existing) break
    inviteCode = generateInviteCode()
  }

  // Create league
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
      draft_order: [user.id],
    })
    .select()
    .single()

  if (leagueError) {
    return { error: leagueError.message }
  }

  // Add creator as first member
  const { error: memberError } = await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: user.id,
    display_name: displayName,
  })

  if (memberError) {
    return { error: memberError.message }
  }

  redirect(`/league/${league.id}`)
}

export async function joinLeague(formData: FormData) {
  const { user, supabase } = await getActionUser()
  if (!user) return { error: 'Not signed in' }

  const code = (formData.get('code') as string)?.trim().toUpperCase()
  if (!code || code.length !== 6) {
    return { error: 'Enter a valid 6-character invite code' }
  }

  const displayName = (formData.get('displayName') as string)?.trim()
  if (!displayName || displayName.length < 2) {
    return { error: 'Display name must be at least 2 characters' }
  }

  // Find league by invite code
  const { data: league } = await supabase
    .from('leagues')
    .select('id, draft_order')
    .eq('invite_code', code)
    .maybeSingle()

  if (!league) {
    return { error: 'No league found with that invite code' }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', league.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    redirect(`/league/${league.id}`)
  }

  // Check member count (max 6)
  const { count } = await supabase
    .from('league_members')
    .select('id', { count: 'exact', head: true })
    .eq('league_id', league.id)

  if (count !== null && count >= 6) {
    return { error: 'This league is full (maximum 6 participants)' }
  }

  // Add member
  const { error: memberError } = await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: user.id,
    display_name: displayName,
  })

  if (memberError) {
    return { error: memberError.message }
  }

  // Update draft order
  const currentOrder = (league.draft_order as string[]) || []
  const newOrder = [...currentOrder, user.id]

  await supabase
    .from('leagues')
    .update({ draft_order: newOrder })
    .eq('id', league.id)

  redirect(`/league/${league.id}`)
}
