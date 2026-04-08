'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

type Props = {
  leagueId: string
  windowType: string
  eliminatedCount: number
  closesAt: string | null
}

export function ReplacementBanner({ leagueId, windowType, eliminatedCount, closesAt }: Props) {
  const timeLeft = closesAt ? getTimeLeft(closesAt) : null

  return (
    <div className="mx-1 mb-3 rounded-xl border border-wc-crimson/40 bg-wc-crimson/10 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-wc-crimson" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {eliminatedCount} player{eliminatedCount !== 1 ? 's' : ''} eliminated
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Replace them before the window closes{timeLeft ? ` (${timeLeft})` : ''}.
          </p>
          <Link
            href={`/draft/${leagueId}?replace=${windowType}`}
            className="mt-2 inline-block rounded-md bg-wc-purple px-3 py-1.5 text-xs font-bold text-white"
          >
            Replace Players
          </Link>
        </div>
      </div>
    </div>
  )
}

function getTimeLeft(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return 'closing soon'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}
