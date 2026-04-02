'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type FeedEvent = Tables<'activity_feed'>

const EVENT_ICONS: Record<string, string> = {
  draft_pick: 'bg-wc-blue/20 text-wc-blue',
  transfer: 'bg-wc-peach/20 text-wc-peach',
  formation_change: 'bg-text-secondary/20 text-text-secondary',
  scoring_event: 'bg-wc-gold/20 text-wc-gold',
  auto_pick: 'bg-wc-crimson/20 text-wc-crimson',
  league_joined: 'bg-wc-peach/20 text-wc-peach',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ActivityFeed({
  leagueId,
  initialEvents,
}: {
  leagueId: string
  initialEvents: FeedEvent[]
}) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`feed-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new as FeedEvent, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leagueId])

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-text-secondary">No activity yet.</p>
        <p className="mt-1 text-sm text-text-muted">
          Events will appear here as the league progresses.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-bg-card p-3"
        >
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
              EVENT_ICONS[event.event_type] || 'bg-border/20 text-text-muted'
            }`}
          >
            {event.event_type === 'scoring_event'
              ? 'P'
              : event.event_type === 'draft_pick'
              ? 'D'
              : event.event_type === 'transfer'
              ? 'T'
              : event.event_type === 'formation_change'
              ? 'F'
              : event.event_type === 'auto_pick'
              ? 'A'
              : 'L'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white">{event.description}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {timeAgo(event.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
