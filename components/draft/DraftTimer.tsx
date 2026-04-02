'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

export function DraftTimer({
  expiresAt,
  isYourTurn,
  currentPicker,
}: {
  expiresAt: string | null
  isYourTurn: boolean
  currentPicker: string
}) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    if (!expiresAt) return

    function update() {
      const diff = new Date(expiresAt!).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Time expired')
        setUrgent(true)
        return
      }

      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`)
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`)
      } else {
        setTimeLeft(`${secs}s`)
      }

      setUrgent(diff < 600000) // urgent under 10 minutes
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!expiresAt) return null

  return (
    <div className={`rounded-xl border p-4 text-center animate-fade-in ${
      isYourTurn
        ? urgent
          ? 'border-wc-crimson/50 bg-wc-crimson/10'
          : 'border-wc-purple/50 bg-wc-purple/10'
        : 'border-border bg-bg-card'
    }`}>
      {isYourTurn ? (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            {urgent ? (
              <AlertTriangle size={16} className="text-wc-crimson animate-pulse" />
            ) : (
              <Clock size={16} className="text-wc-purple" />
            )}
            <p className={`text-sm font-semibold ${urgent ? 'text-wc-crimson' : 'text-wc-purple'}`}>
              Your Turn to Pick!
            </p>
          </div>
          <p className={`text-2xl font-black tabular-nums ${urgent ? 'text-wc-crimson animate-count-pulse' : 'text-white'}`}>
            {timeLeft}
          </p>
          <p className="mt-1 text-[10px] text-text-muted">Make your pick before time runs out</p>
        </>
      ) : (
        <>
          <p className="text-xs text-text-secondary mb-1">Waiting for</p>
          <p className="text-sm font-semibold text-white">{currentPicker}</p>
          <p className="mt-1 text-xs text-text-muted tabular-nums">{timeLeft} remaining</p>
        </>
      )}
    </div>
  )
}
