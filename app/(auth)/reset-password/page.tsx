'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6">
        <h1 className="text-center text-3xl font-display font-black tracking-tight text-white">
          THE <span className="text-wc-purple">XI</span>
        </h1>
        <p className="mt-1 text-center text-sm text-text-secondary">Set a new password</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-text-secondary">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
              placeholder="Repeat password"
            />
          </div>

          {error && <p className="text-sm text-wc-crimson">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-wc-purple px-4 py-2.5 font-bold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
