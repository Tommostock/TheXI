'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * DEV ONLY — Auto-signs in as the test user.
 * Remove this component before deploying.
 */
export function DevAutoLogin() {
  const [status, setStatus] = useState<'checking' | 'signing-in' | 'done'>('checking')

  useEffect(() => {
    const supabase = createClient()

    async function autoLogin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStatus('done')
        return
      }

      setStatus('signing-in')
      const { error } = await supabase.auth.signInWithPassword({
        email: 'tom@thexi.test',
        password: 'test123456',
      })

      if (error) {
        console.error('Auto-login failed:', error.message)
      } else {
        // Reload to pick up the session in server components
        window.location.reload()
      }
      setStatus('done')
    }

    autoLogin()
  }, [])

  if (status === 'signing-in') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-charcoal">
        <p className="text-light-grey">Signing in as test user...</p>
      </div>
    )
  }

  return null
}
