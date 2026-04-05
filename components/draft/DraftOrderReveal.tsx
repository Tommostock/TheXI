'use client'

import { useState, useEffect } from 'react'

export function DraftOrderReveal({
  draftOrder,
  memberNames,
  onComplete,
}: {
  draftOrder: string[]
  memberNames: Record<string, string>
  onComplete: () => void
}) {
  const [revealedIndex, setRevealedIndex] = useState(-1)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (revealedIndex < draftOrder.length - 1) {
      const timer = setTimeout(() => setRevealedIndex((i) => i + 1), 600)
      return () => clearTimeout(timer)
    } else if (revealedIndex === draftOrder.length - 1) {
      const timer = setTimeout(() => setShowAll(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [revealedIndex, draftOrder.length])

  useEffect(() => {
    if (showAll) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [showAll, onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary">
      <div className="text-center px-6 w-full max-w-sm">
        <h2 className="text-2xl font-display text-white mb-2">Draft Order</h2>
        <p className="text-xs text-text-secondary mb-8">The order has been randomised</p>

        <div className="space-y-3">
          {draftOrder.map((userId, index) => (
            <div
              key={userId}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-500 ${
                index <= revealedIndex
                  ? 'border-wc-purple/40 bg-wc-purple/10 opacity-100 translate-y-0'
                  : 'border-transparent opacity-0 translate-y-4'
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wc-purple text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="text-lg font-semibold text-white">
                {memberNames[userId] || 'Player'}
              </p>
              {index === 0 && index <= revealedIndex && (
                <span className="ml-auto text-xs text-wc-peach">First pick</span>
              )}
            </div>
          ))}
        </div>

        {showAll && (
          <button
            onClick={onComplete}
            className="mt-6 rounded-lg bg-wc-peach px-6 py-2.5 text-sm font-semibold text-white animate-fade-in"
          >
            Start Drafting
          </button>
        )}
      </div>
    </div>
  )
}
