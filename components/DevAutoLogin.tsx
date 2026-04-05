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
    // Only auto-login in local dev, not on Vercel
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      setStatus('done')
      return
    }

    const supabase = createClient()

    async function autoLogin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStatus('done')
        return
      }

      setStatus('signing-in')
      const { error } = await supabase.auth.signInWithPassword({
        email: 'testplayer@thexi.dev',
        password: 'thexi2026test',
      })

      if (error) {
        console.error('Auto-login failed:', error.message)
        setStatus('done')
      } else {
        window.location.reload()
      }
    }

    autoLogin()
  }, [])

  if (status === 'signing-in') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">Signing in...</p>
      </div>
    )
  }

  return null
}
