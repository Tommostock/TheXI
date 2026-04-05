'use client'

import { useState } from 'react'
import { joinLeague } from '@/lib/league/actions'

export function JoinLeague() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await joinLeague(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Join a League</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="displayName"
          type="text"
          required
          placeholder="Your display name"
          maxLength={20}
          className="block w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-white placeholder-text-muted focus:border-wc-purple focus:outline-none"
        />
        <input
          name="code"
          type="text"
          required
          placeholder="6-character invite code"
          maxLength={6}
          className="block w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-white placeholder-text-muted focus:border-wc-purple focus:outline-none uppercase tracking-widest text-center"
        />
        {error && <p className="text-xs text-wc-crimson">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-wc-purple py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join League'}
        </button>
      </form>
    </div>
  )
}
