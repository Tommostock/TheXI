'use client'

import { useState } from 'react'
import { createLeague } from '@/lib/league/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateLeaguePage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createLeague(formData)
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

      <h1 className="mt-4 text-2xl font-bold text-white">Create a League</h1>
      <p className="mt-1 text-sm text-light-grey">
        Start a new league and invite your mates with the code.
      </p>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-light-grey">
            League Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={30}
            className="mt-1 block w-full rounded-md border border-dark-grey bg-deep-navy px-3 py-2 text-white placeholder-dark-grey focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
            placeholder="e.g. The Lads WC 2026"
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
            placeholder="e.g. Tom"
          />
        </div>

        {error && <p className="text-sm text-tournament-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-tournament-green px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create League'}
        </button>
      </form>
    </div>
  )
}
