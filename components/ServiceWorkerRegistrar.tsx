'use client'

import { useEffect } from 'react'
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

async function subscribeToPush(registration: ServiceWorkerRegistration) {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return

  // Check if already subscribed
  const existing = await registration.pushManager.getSubscription()
  if (existing) return

  // Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  // Subscribe
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
  })

  // Extract keys
  const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
  const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))

  // Save to Supabase
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh,
      auth,
    },
    { onConflict: 'user_id,endpoint' }
  )
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          // New SW available — will activate on next page load
        })
        return navigator.serviceWorker.ready
      })
      .then((registration) => {
        subscribeToPush(registration).catch(() => {
          // Push subscription failed — non-critical
        })
      })
      .catch(() => {
        // Service worker registration failed — non-critical
      })
  }, [])

  return null
}
