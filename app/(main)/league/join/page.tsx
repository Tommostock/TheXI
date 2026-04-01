'use client'

import { useState } from 'react'
import { joinLeague } from '@/lib/league/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function JoinLeaguePage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await joinLeague(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-light-grey hover:text-white">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">Join a League</h1>
      <p className="mt-1 text-sm text-light-grey">
        Enter the 6-character invite code from your league creator.
      </p>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-light-grey">
            Invite Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            className="mt-1 block w-full rounded-md border border-dark-grey bg-deep-navy px-3 py-2 text-center text-lg font-mono tracking-widest text-white uppercase placeholder-dark-grey focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
            placeholder="ABC123"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-light-grey">
            Your Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            maxLength={20}
            className="mt-1 block w-full rounded-md border border-dark-grey bg-deep-navy px-3 py-2 text-white placeholder-dark-grey focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
            placeholder="e.g. Dave"
          />
        </div>

        {error && <p className="text-sm text-tournament-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-tournament-green px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join League'}
        </button>
      </form>
    </div>
  )
}
