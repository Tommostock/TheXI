'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)

  useEffect(() => {
    if (localStorage.getItem('install-prompt-dismissed')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('install-prompt-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (deferredPrompt && 'prompt' in deferredPrompt) {
      (deferredPrompt as { prompt: () => void }).prompt()
    }
    dismiss()
  }

  if (!show) return null

  return (
    <div className="rounded-xl border border-wc-purple/30 bg-wc-purple/10 p-3 animate-slide-up">
      <div className="flex items-start gap-3">
        <Download size={18} className="shrink-0 text-wc-purple mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Add The XI to your home screen</p>
          <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed">
            {isIOS
              ? 'Tap the share button in Safari, then "Add to Home Screen" for notifications and the best experience.'
              : 'Install the app for push notifications and a native feel.'}
          </p>
        </div>
        {!isIOS ? (
          <div className="flex gap-1.5 shrink-0">
            <button onClick={dismiss} className="text-text-muted hover:text-white">
              <X size={16} />
            </button>
            <button
              onClick={install}
              className="rounded-md bg-wc-purple px-3 py-1 text-xs font-semibold text-white"
            >
              Install
            </button>
          </div>
        ) : (
          <button onClick={dismiss} className="shrink-0 text-text-muted hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
