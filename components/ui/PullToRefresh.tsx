'use client'

import { useCallback, useRef, useState } from 'react'

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pulling, setPulling] = useState(false)
  const startY = useRef(0)
  const scrollEl = useRef<HTMLDivElement>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollEl.current && scrollEl.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!pulling) return
    const diff = e.changedTouches[0].clientY - startY.current
    if (diff > 80) {
      window.location.reload()
    }
    setPulling(false)
  }, [pulling])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (scrollEl.current && scrollEl.current.scrollTop === 0) {
      const diff = e.touches[0].clientY - startY.current
      if (diff > 30) setPulling(true)
    }
  }, [])

  return (
    <div
      ref={scrollEl}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {pulling && (
        <div className="flex justify-center py-2 text-xs text-text-muted animate-pulse">
          Release to refresh
        </div>
      )}
      {children}
    </div>
  )
}
