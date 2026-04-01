'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type FeedEvent = Tables<'activity_feed'>

const EVENT_ICONS: Record<string, string> = {
  draft_pick: 'bg-tournament-blue/20 text-tournament-blue',
  transfer: 'bg-tournament-green/20 text-tournament-green',
  formation_change: 'bg-light-grey/20 text-light-grey',
  scoring_event: 'bg-trophy-gold/20 text-trophy-gold',
  auto_pick: 'bg-tournament-red/20 text-tournament-red',
  league_joined: 'bg-tournament-green/20 text-tournament-green',
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
      <div className="rounded-lg border border-dashed border-dark-grey p-8 text-center">
        <p className="text-light-grey">No activity yet.</p>
        <p className="mt-1 text-sm text-dark-grey">
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
          className="flex items-start gap-3 rounded-lg border border-dark-grey bg-deep-navy p-3"
        >
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
              EVENT_ICONS[event.event_type] || 'bg-dark-grey/20 text-dark-grey'
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
            <p className="mt-0.5 text-xs text-dark-grey">
              {timeAgo(event.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
