'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setResetSent(true)
  }

  if (forgotMode) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6">
          <h1 className="text-center text-3xl font-display font-black tracking-tight text-white">
            THE <span className="text-wc-purple">XI</span>
          </h1>
          <p className="mt-1 text-center text-sm text-text-secondary">Reset your password</p>

          {resetSent ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-text-secondary">
                Check your email — we've sent a password reset link to <span className="text-white">{email}</span>.
              </p>
              <button
                onClick={() => { setForgotMode(false); setResetSent(false) }}
                className="text-sm font-medium text-wc-lavender hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-wc-crimson">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-wc-purple px-4 py-2.5 font-bold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-text-secondary">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="font-medium text-wc-lavender hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6">
        <h1 className="text-center text-3xl font-display font-black tracking-tight text-white">
          THE <span className="text-wc-purple">XI</span>
        </h1>
        <p className="mt-1 text-center text-sm text-text-secondary">
          World Cup 2026 Draft
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-xs text-wc-lavender hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-sm text-wc-crimson">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-wc-purple px-4 py-2.5 font-bold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          No account?{' '}
          <Link href="/signup" className="font-medium text-wc-lavender hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
