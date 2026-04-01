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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6">
        <h1 className="text-center text-3xl font-display font-black tracking-tight text-white">
          THE <span className="text-wc-cyan">XI</span>
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
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-cyan focus:outline-none focus:ring-1 focus:ring-wc-cyan"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-cyan focus:outline-none focus:ring-1 focus:ring-wc-cyan"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-sm text-wc-crimson">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-wc-cyan px-4 py-2.5 font-bold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
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
