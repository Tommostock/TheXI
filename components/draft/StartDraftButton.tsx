'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startDraft } from '@/lib/draft/actions'
import { Play } from 'lucide-react'

export function StartDraftButton({
  leagueId,
  leagueName,
  memberCount,
}: {
  leagueId: string
  leagueName: string
  memberCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    setError('')
    setLoading(true)
    const result = await startDraft(leagueId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/draft/${leagueId}`)
    }
  }

  return (
    <div className="rounded-xl border border-wc-purple/40 bg-wc-purple/10 p-4 animate-fade-in">
      <p className="text-xs text-text-secondary mb-1">{leagueName} — {memberCount} players</p>
      {error && <p className="text-xs text-wc-crimson mb-2">{error}</p>}
      <button
        onClick={handleStart}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-wc-purple px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Play size={16} />
        {loading ? 'Starting Draft...' : 'Start Draft'}
      </button>
    </div>
  )
}
