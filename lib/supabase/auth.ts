import { createClient } from './server'
import { redirect } from 'next/navigation'

// DEV_MODE: set to false before deploy to re-enable auth redirects
const DEV_MODE = true

/**
 * Get the current authenticated user for pages.
 * In dev mode, returns null user without redirecting (DevAutoLogin handles sign-in).
 * In production, redirects to /login if not authenticated.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !DEV_MODE) {
    redirect('/login')
  }

  return { user, supabase }
}

/**
 * Get the current authenticated user for server actions.
 * Returns null instead of redirecting so actions can return error messages.
 */
export async function getActionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, supabase }
  }

  return { user, supabase }
}
