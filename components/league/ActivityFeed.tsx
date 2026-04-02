'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type FeedEvent = Tables<'activity_feed'>

const EVENT_STYLES: Record<string, { char: string; bg: string; textColor: string }> = {
  scoring_event: { char: 'G', bg: 'bg-wc-peach/20', textColor: 'text-wc-peach' },
  draft_pick:    { char: 'D', bg: 'bg-wc-blue/20', textColor: 'text-wc-blue' },
  transfer:      { char: 'T', bg: 'bg-wc-purple/20', textColor: 'text-wc-purple' },
  formation_change: { char: 'F', bg: 'bg-text-secondary/20', textColor: 'text-text-secondary' },
  auto_pick:     { char: 'A', bg: 'bg-wc-crimson/20', textColor: 'text-wc-crimson' },
  league_joined: { char: 'J', bg: 'bg-wc-peach/20', textColor: 'text-wc-peach' },
}

function getEventStyle(event: FeedEvent): { char: string; bg: string; textColor: string } {
  if (event.event_type === 'scoring_event') {
    const desc = event.description.toLowerCase()
    if (desc.includes('assisted')) return { char: 'A', bg: 'bg-wc-blue/20', textColor: 'text-wc-blue' }
    if (desc.includes('clean sheet')) return { char: 'CS', bg: 'bg-wc-purple/20', textColor: 'text-wc-purple' }
    if (desc.includes('yellow card') || desc.includes('yellow —')) return { char: 'Y', bg: 'bg-wc-gold/20', textColor: 'text-wc-gold' }
    if (desc.includes('red card') || desc.includes('red —')) return { char: 'R', bg: 'bg-wc-crimson/20', textColor: 'text-wc-crimson' }
    return { char: 'G', bg: 'bg-wc-peach/20', textColor: 'text-wc-peach' }
  }
  return EVENT_STYLES[event.event_type] || EVENT_STYLES.draft_pick
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
              const style = getEventStyle(event)

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3 card-hover"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${style.bg} ${style.textColor}`}
                  >
                    {style.char}
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
