import { createClient } from './server'
import { redirect } from 'next/navigation'

// DEV_MODE: set to false before deploy to re-enable auth redirects
const DEV_MODE = true
const TEST_USER_ID = 'e4efa400-df79-4ea9-95df-17fa689e64a1'

/**
 * Get the current authenticated user.
 * In dev mode, returns a test user stub instead of redirecting.
 * In production, redirects to /login if not authenticated.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !DEV_MODE) {
    redirect('/login')
  }

  // In dev mode with no session yet, return a stub so pages don't crash
  const effectiveUser = user ?? {
    id: TEST_USER_ID,
    email: 'tom@thexi.test',
    user_metadata: { display_name: 'Tom' },
  }

  return { user: effectiveUser, supabase }
}
