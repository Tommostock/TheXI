import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/notifications/push'
import { createServiceRoleClient } from '@/lib/supabase/server'

const SECRET = process.env.SEED_SECRET || 'the-xi-seed-2026'
const TOM_ID = '69892f2f-ebbf-43e2-8598-7dce101ee4ae'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-seed-secret') !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check how many subscriptions Tom has
  const supabase = createServiceRoleClient()
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint')
    .eq('user_id', TOM_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!subs?.length) {
    return NextResponse.json({
      ok: false,
      message: 'No push subscriptions found for your account. Open the app in your browser/PWA first so it can register a subscription.',
      subscriptions: 0,
    })
  }

  await sendPushToUser(TOM_ID, {
    title: '🏆 The XI — Test Notification',
    body: 'Push notifications are working! Your World Cup fantasy squad awaits.',
    url: '/dashboard',
  })

  return NextResponse.json({
    ok: true,
    message: `Test notification sent to ${subs.length} subscription(s).`,
    subscriptions: subs.length,
    endpoints: subs.map((s) => s.endpoint.substring(0, 60) + '…'),
  })
}
