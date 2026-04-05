import webpush from 'web-push'
import { createServiceRoleClient } from '@/lib/supabase/server'

type PushPayload = {
  title: string
  body: string
  url: string
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return

  webpush.setVapidDetails('mailto:hello@thexi.app', publicKey, privateKey)

  const supabase = createServiceRoleClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs?.length) return

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
    )
  )

  // Clean up stale subscriptions (HTTP 410 Gone)
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'rejected' && (result.reason as { statusCode?: number })?.statusCode === 410) {
      await supabase.from('push_subscriptions').delete().eq('id', subs[i].id)
    }
  }
}
