'use client'

import { useEffect, useRef } from 'react'

const POLL_INTERVAL = 10 * 60 * 1000 // 10 minutes
const STORAGE_KEY = 'thexi_last_live_poll'

/**
 * Background poller that calls /api/live-poll every 10 minutes
 * while the app is open. No UI — just silently fetches.
 *
 * Uses localStorage to avoid redundant calls across page navigations.
 * Also polls once on mount if enough time has passed.
 */
export function LiveMatchPoller() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      const lastPoll = localStorage.getItem(STORAGE_KEY)
      const now = Date.now()

      if (lastPoll && now - Number(lastPoll) < POLL_INTERVAL) {
        return // Too soon
      }

      localStorage.setItem(STORAGE_KEY, String(now))

      try {
        await fetch('/api/live-poll')
      } catch {
        // Silently ignore — network errors, offline, etc.
      }
    }

    // Poll once on mount (if enough time has passed)
    poll()

    // Then every 10 minutes
    timerRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return null
}
