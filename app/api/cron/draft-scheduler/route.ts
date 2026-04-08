import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import {
  calculatePickDeadline,
  DEFAULT_ACTIVE_START,
  DEFAULT_ACTIVE_END,
  DEFAULT_PICK_WINDOW_MINUTES,
} from '@/lib/draft/activeHours'
import { checkAndProcessEliminations } from '@/lib/tournament/eliminations'

/**
 * GET /api/cron/draft-scheduler
 *
 * Called every 15 minutes by Vercel Cron.
 * 1. 24 hours before draft_start_time: sends "Draft begins tomorrow at 9am" push to all members
 * 2. At draft_start_time: auto-starts the draft (randomize order, set in_progress, notify first picker)
 */

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function sendPush(supabase: ReturnType<typeof getAdmin>, userId: string, payload: { title: string; body: string; url: string }) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return

  webpush.setVapidDetails('mailto:hello@thexi.app', publicKey, privateKey)

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs?.length) return

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  )

  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected' && (results[i] as PromiseRejectedResult).reason?.statusCode === 410) {
      await supabase.from('push_subscriptions').delete().eq('id', subs[i].id)
    }
  }
}

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow seed secret for manual testing
    const seedHeader = request.headers.get('x-seed-secret')
    if (seedHeader !== (process.env.SEED_SECRET || 'the-xi-seed-2026')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = getAdmin()
  const now = new Date()
  const actions: string[] = []

  // Find pre-draft leagues with a scheduled start time
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, name, draft_start_time, draft_status, draft_reminder_sent')
    .eq('draft_status', 'pre_draft')
    .not('draft_start_time', 'is', null)

  if (!leagues?.length) {
    return NextResponse.json({ message: 'No scheduled drafts', actions })
  }

  for (const league of leagues) {
    const startTime = new Date(league.draft_start_time)
    const msUntilStart = startTime.getTime() - now.getTime()
    const hoursUntilStart = msUntilStart / (1000 * 60 * 60)

    // 24-hour reminder (between 23.5 and 24.5 hours before start)
    if (hoursUntilStart >= 23.5 && hoursUntilStart <= 24.5 && !league.draft_reminder_sent) {
      const { data: members } = await supabase
        .from('league_members')
        .select('user_id')
        .eq('league_id', league.id)

      if (members) {
        const startHour = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })
        for (const m of members) {
          await sendPush(supabase, m.user_id, {
            title: 'The XI — Draft Tomorrow!',
            body: `The draft for ${league.name} begins tomorrow at ${startHour}. Get ready!`,
            url: '/draft',
          })
        }
      }

      // Mark reminder as sent
      await supabase
        .from('leagues')
        .update({ draft_reminder_sent: true } as Record<string, unknown>)
        .eq('id', league.id)

      actions.push(`Sent 24h reminder for ${league.name}`)
    }

    // Auto-start draft (within 5 minutes of start time)
    if (msUntilStart <= 0 && msUntilStart > -5 * 60 * 1000) {
      const { data: members } = await supabase
        .from('league_members')
        .select('user_id')
        .eq('league_id', league.id)

      if (!members || members.length < 2) {
        actions.push(`Skipped ${league.name}: not enough members`)
        continue
      }

      const userIds = members.map((m) => m.user_id)
      const randomOrder = shuffleArray(userIds)

      // Start the draft
      await supabase
        .from('leagues')
        .update({
          draft_status: 'in_progress',
          draft_order: randomOrder,
        })
        .eq('id', league.id)

      // Create draft window
      await supabase.from('draft_windows').insert({
        league_id: league.id,
        window_type: 'initial',
        status: 'active',
        opens_at: now.toISOString(),
      })

      // Activity feed
      await supabase.from('activity_feed').insert({
        league_id: league.id,
        event_type: 'draft_pick',
        description: 'The draft has begun! Good luck.',
      })

      // Notify all members
      for (const m of members) {
        const isFirst = m.user_id === randomOrder[0]
        await sendPush(supabase, m.user_id, {
          title: 'The XI — Draft Started!',
          body: isFirst
            ? `The draft has begun! You pick first!`
            : `The draft has begun in ${league.name}!`,
          url: `/draft/${league.id}`,
        })
      }

      actions.push(`Auto-started draft for ${league.name}`)
    }
  }

  // --- Check for expired replacement draft windows ---
  const { data: activeWindows } = await supabase
    .from('draft_windows')
    .select('id, league_id, window_type, closes_at')
    .eq('status', 'active')
    .not('window_type', 'eq', 'initial')

  for (const window of activeWindows || []) {
    if (!window.closes_at) continue
    const closesAt = new Date(window.closes_at)
    if (now >= closesAt) {
      // Window has expired — auto-replace remaining eliminated players and close it
      const windowType = window.window_type as 'post_groups' | 'post_r32' | 'post_r16' | 'post_qf' | 'post_sf'

      // Auto-replace eliminated players
      const { data: eliminatedSlots } = await supabase
        .from('squad_slots')
        .select('id, user_id, player_id, position, player:players(id, name, is_eliminated)')
        .eq('league_id', window.league_id)

      type SlotWithPlayer = { id: string; user_id: string; player_id: string; position: string; player: { id: string; name: string; is_eliminated: boolean } | null }
      const slotsNeedingReplacement = ((eliminatedSlots || []) as unknown as SlotWithPlayer[])
        .filter((s) => s.player?.is_eliminated)

      if (slotsNeedingReplacement.length > 0) {
        const { data: allSlots } = await supabase
          .from('squad_slots')
          .select('player_id')
          .eq('league_id', window.league_id)
        const draftedIds = new Set((allSlots || []).map((s) => s.player_id))

        for (const slot of slotsNeedingReplacement) {
          const { data: available } = await supabase
            .from('players')
            .select('id, name')
            .eq('position', slot.position)
            .eq('is_eliminated', false)
            .limit(50)

          const candidates = (available || []).filter((p) => !draftedIds.has(p.id))
          if (candidates.length === 0) continue

          const picked = candidates[Math.floor(Math.random() * candidates.length)]
          await supabase.from('squad_slots').update({ player_id: picked.id, updated_at: now.toISOString() }).eq('id', slot.id)
          await supabase.from('transfers').insert({
            league_id: window.league_id, user_id: slot.user_id,
            dropped_player_id: slot.player_id, picked_player_id: picked.id,
            draft_window: windowType, is_auto_pick: true,
          })

          const { data: member } = await supabase.from('league_members').select('display_name').eq('league_id', window.league_id).eq('user_id', slot.user_id).single()
          await supabase.from('activity_feed').insert({
            league_id: window.league_id, event_type: 'auto_pick',
            description: `${member?.display_name} missed the window — system replaced ${slot.player?.name} with ${picked.name}`,
            user_id: slot.user_id, player_id: picked.id,
          })
          draftedIds.add(picked.id)
        }
      }

      // Close the window
      await supabase.from('draft_windows').update({ status: 'complete' }).eq('id', window.id)
      await supabase.from('activity_feed').insert({
        league_id: window.league_id, event_type: 'transfer',
        description: 'Draft window closed. All eliminated players have been replaced.',
      })

      // Re-lock lineups
      await supabase.from('leagues').update({ lineup_locked: true }).eq('id', window.league_id)

      actions.push(`Closed expired ${windowType} window for league ${window.league_id}`)
    }
  }

  // --- Also check for new eliminations (safety net alongside live-poll) ---
  const elimResult = await checkAndProcessEliminations(supabase)
  if (elimResult.actions.length > 0) {
    actions.push(...elimResult.actions)
  }

  return NextResponse.json({ message: 'Draft scheduler ran', actions })
}
