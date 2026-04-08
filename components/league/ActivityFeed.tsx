'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type FeedEvent = Tables<'activity_feed'>

function getEventIcon(event: FeedEvent): { text: string; color: string } {
  if (event.event_type === 'scoring_event') {
    const desc = event.description.toLowerCase()
    if (desc.includes('assisted')) return { text: '👟', color: '' }
    if (desc.includes('clean sheet')) return { text: '🧤', color: '' }
    if (desc.includes('yellow')) return { text: '🟨', color: '' }
    if (desc.includes('red card')) return { text: '🟥', color: '' }
    if (desc.includes('scored')) return { text: '⚽', color: '' }
    return { text: '⚽', color: '' }
  }
  if (event.event_type === 'draft_pick') return { text: '🔄', color: '' }
  if (event.event_type === 'transfer') return { text: '🔄', color: '' }
  if (event.event_type === 'formation_change') return { text: '📋', color: '' }
  if (event.event_type === 'auto_pick') return { text: '⚡', color: '' }
  if (event.event_type === 'league_joined') return { text: '👋', color: '' }
  return { text: '📌', color: '' }
}

function formatPoints(desc: string): React.ReactNode {
  // Find patterns like "+5 pts" or "-2 pts" or "— +5 pts" or "— -3 pts"
  const match = desc.match(/(.*?)([+-]\d+)\s*pts(.*)/)
  if (!match) return <>{desc}</>

  const [, before, points, after] = match
  const num = parseInt(points)
  const color = num > 0 ? 'text-wc-peach' : 'text-wc-crimson'

  return <>{before}<span className={`font-semibold ${color}`}>{points} pts</span>{after}</>
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
            {dateEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3 card-hover"
              >
                <span className="text-lg shrink-0 leading-none">{getEventIcon(event).text}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{formatPoints(event.description)}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-text-muted">
                      {timeAgo(event.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
