'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setConfirmationSent(true)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-white placeholder-text-muted focus:border-wc-cyan focus:outline-none focus:ring-1 focus:ring-wc-cyan'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6">
        <h1 className="text-center text-3xl font-display font-black tracking-tight text-white">
          THE <span className="text-wc-cyan">XI</span>
        </h1>
        <p className="mt-1 text-center text-sm text-text-secondary">
          Create your account
        </p>

        {confirmationSent ? (
          <div className="mt-8 rounded-xl border border-wc-teal/30 bg-wc-teal/10 p-4 text-center">
            <p className="font-semibold text-wc-teal">Check your email</p>
            <p className="mt-2 text-sm text-text-secondary">
              We sent a confirmation link to{' '}
              <strong className="text-white">{email}</strong>. Click the link to
              activate your account, then come back and log in.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-lg bg-wc-cyan px-4 py-2 text-sm font-bold text-bg-primary transition-opacity hover:opacity-90"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                  Display Name
                </label>
                <input id="displayName" type="text" required value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass} placeholder="Your name" maxLength={20} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <input id="password" type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass} placeholder="Min 6 characters" />
              </div>
              {error && <p className="text-sm text-wc-crimson">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-wc-cyan px-4 py-2.5 font-bold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-wc-lavender hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
