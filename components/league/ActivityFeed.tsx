'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type FeedEvent = Tables<'activity_feed'>

const EVENT_STYLES: Record<string, { char: string; bg: string; color: string }> = {
  scoring_event: { char: '⚽', bg: 'bg-wc-gold/20', color: '' },
  draft_pick:    { char: '📋', bg: 'bg-wc-blue/20', color: '' },
  transfer:      { char: '🔄', bg: 'bg-wc-peach/20', color: '' },
  formation_change: { char: '📐', bg: 'bg-text-secondary/20', color: '' },
  auto_pick:     { char: '⚡', bg: 'bg-wc-crimson/20', color: '' },
  league_joined: { char: '👤', bg: 'bg-wc-peach/20', color: '' },
}

function getEventChar(event: FeedEvent): string {
  if (event.event_type === 'scoring_event') {
    if (event.description.includes('assisted')) return '👟'
    if (event.description.includes('clean sheet')) return '🧤'
    if (event.description.includes('yellow')) return '🟨'
    if (event.description.includes('red')) return '🟥'
    return '⚽'
  }
  return EVENT_STYLES[event.event_type]?.char || '📌'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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
      <div className="rounded-lg border border-dashed border-border p-8 text-center animate-fade-in">
        <p className="text-text-secondary">No activity yet.</p>
        <p className="mt-1 text-sm text-text-muted">
          Events will appear here as the league progresses.
        </p>
      </div>
    )
  }

  // Group events by date
  const byDate = new Map<string, FeedEvent[]>()
  for (const event of events) {
    const dateKey = formatDate(event.created_at)
    if (!byDate.has(dateKey)) byDate.set(dateKey, [])
    byDate.get(dateKey)!.push(event)
  }

  return (
    <div className="space-y-4">
      {Array.from(byDate.entries()).map(([dateLabel, dateEvents]) => (
        <div key={dateLabel}>
          <div className="section-accent mb-2">
            <p className="text-xs font-semibold text-text-secondary">{dateLabel}</p>
          </div>
          <div className="space-y-1.5 stagger-children">
            {dateEvents.map((event) => {
              const style = EVENT_STYLES[event.event_type] || EVENT_STYLES.draft_pick
              const char = getEventChar(event)

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3 card-hover"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] leading-none ${style.bg}`}
                  >
                    {char}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{event.description}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">
                      {timeAgo(event.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
