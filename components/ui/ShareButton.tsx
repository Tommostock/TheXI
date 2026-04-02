'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

export function ShareButton({
  title,
  text,
}: {
  title: string
  text: string
}) {
  const [shared, setShared] = useState(false)

  async function handleShare() {
    const shareData = {
      title,
      text,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShared(true)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
        setShared(true)
      }
      setTimeout(() => setShared(false), 2000)
    } catch {
      // User cancelled share
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-wc-purple hover:text-wc-purple"
    >
      <Share2 size={13} />
      {shared ? 'Shared!' : 'Share'}
    </button>
  )
}
