'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function NotificationPrompt() {
  const [status, setStatus] = useState<'loading' | 'granted' | 'prompt' | 'denied' | 'unsupported'>('loading')
  const [working, setWorking] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission as 'granted' | 'prompt' | 'denied')
    // Check if user dismissed this banner before
    if (localStorage.getItem('thexi_notif_dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  async function enable() {
    setWorking(true)
    try {
      const permission = await Notification.requestPermission()
      setStatus(permission as 'granted' | 'prompt' | 'denied')

      if (permission === 'granted') {
        // Subscribe and save to Supabase
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (vapidKey && 'serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          let sub = await reg.pushManager.getSubscription()
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
            })
          }
          const p256dh = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!)))
          const auth = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)))
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('push_subscriptions').upsert(
              { user_id: user.id, endpoint: sub.endpoint, p256dh, auth },
              { onConflict: 'user_id,endpoint' }
            )
          }
        }
        setJustEnabled(true)
        setTimeout(() => setJustEnabled(false), 3000)
      }
    } catch {
      // Silently ignore
    }
    setWorking(false)
  }

  function dismiss() {
    localStorage.setItem('thexi_notif_dismissed', '1')
    setDismissed(true)
  }

  if (status === 'loading' || status === 'unsupported' || dismissed) return null
  if (status === 'granted' && !justEnabled) return null

  if (justEnabled) {
    return (
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
        <Bell size={15} className="shrink-0" />
        <span>Notifications enabled!</span>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-wc-gold/30 bg-wc-gold/10 px-3 py-2.5">
      <BellOff size={16} className="shrink-0 text-wc-gold" />
      <p className="flex-1 text-xs text-text-secondary">
        Enable notifications to get alerts when it&apos;s your pick.
      </p>
      <button
        onClick={enable}
        disabled={working}
        className="shrink-0 rounded-md bg-wc-gold px-2.5 py-1 text-xs font-semibold text-bg-base disabled:opacity-50"
      >
        {working ? '…' : 'Enable'}
      </button>
      <button onClick={dismiss} className="shrink-0 text-text-muted hover:text-white">
        <X size={14} />
      </button>
    </div>
  )
}
