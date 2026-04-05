'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function OnboardingTip({
  storageKey,
  title,
  message,
}: {
  storageKey: string
  title: string
  message: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const key = `onboarding-${storageKey}`
    if (!localStorage.getItem(key)) {
      setVisible(true)
    }
  }, [storageKey])

  function dismiss() {
    localStorage.setItem(`onboarding-${storageKey}`, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="rounded-xl border border-wc-purple/30 bg-wc-purple/10 p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{message}</p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md bg-wc-purple/20 px-2.5 py-1 text-[10px] font-semibold text-wc-purple hover:bg-wc-purple/30 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
