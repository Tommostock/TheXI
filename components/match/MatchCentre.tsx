'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Circle } from 'lucide-react'

type MatchEvent = {
  id: string
  match_id: string
  match_date: string
  event_type: string
  minute: number | null
  points_awarded: number
  player: {
    id: string
    name: string
    nation: string
    nation_flag_url: string | null
    position: string
  } | null
}

type Match = {
  matchId: string
  matchDate: string
  events: MatchEvent[]
}

const EVENT_LABELS: Record<string, string> = {
  goal: 'Goal',
  assist: 'Assist',
  clean_sheet: 'Clean Sheet',
  own_goal: 'Own Goal',
  yellow: 'Yellow Card',
  red: 'Red Card',
  appearance_full: 'Played 60+',
  appearance_sub: 'Played <60',
}

const EVENT_COLORS: Record<string, string> = {
  goal: 'text-wc-peach',
  assist: 'text-wc-peach',
  clean_sheet: 'text-wc-blue',
  own_goal: 'text-wc-crimson',
  yellow: 'text-wc-gold',
  red: 'text-wc-crimson',
  appearance_full: 'text-text-secondary',
  appearance_sub: 'text-text-muted',
}

export function MatchCentre({
  matches,
  myPlayerIds,
}: {
  matches: Match[]
  myPlayerIds: string[]
}) {
  const [expanded, setExpanded] = useState<string | null>(
    matches[0]?.matchId || null
  )

  const myPlayerSet = new Set(myPlayerIds)

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-text-secondary">No match data yet.</p>
        <p className="mt-1 text-sm text-text-muted">
          Scores will appear here once World Cup matches are underway.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => {
        const isExpanded = expanded === match.matchId

        // Get unique nations in this match
        const nations = [
          ...new Set(match.events.map((e) => e.player?.nation).filter(Boolean)),
        ]

        // Count goals
        const goals = match.events.filter((e) => e.event_type === 'goal').length

        // Check if any of my players are in this match
        const hasMyPlayers = match.events.some(
          (e) => e.player && myPlayerSet.has(e.player.id)
        )

        return (
          <div key={match.matchId}>
            <button
              onClick={() =>
                setExpanded(isExpanded ? null : match.matchId)
              }
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                hasMyPlayers
                  ? 'border-wc-peach/30 bg-wc-peach/5'
                  : 'border-border bg-bg-card'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {nations.join(' vs ') || `Match ${match.matchId}`}
                </p>
                <p className="text-xs text-text-secondary">
                  {new Date(match.matchDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              {hasMyPlayers && (
                <Circle size={6} className="fill-wc-peach text-wc-peach" />
              )}
              <span className="text-sm font-bold text-white">
                {goals} goal{goals !== 1 ? 's' : ''}
              </span>
              {isExpanded ? (
                <ChevronUp size={16} className="text-text-muted" />
              ) : (
                <ChevronDown size={16} className="text-text-muted" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-1 rounded-b-lg border border-t-0 border-border bg-bg-primary p-3">
                <div className="space-y-1.5">
                  {match.events
                    .filter(
                      (e) =>
                        e.event_type !== 'appearance_full' &&
                        e.event_type !== 'appearance_sub'
                    )
                    .sort((a, b) => (a.minute ?? 99) - (b.minute ?? 99))
                    .map((event) => {
                      const isMine =
                        event.player && myPlayerSet.has(event.player.id)

                      return (
                        <div
                          key={event.id}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                            isMine ? 'bg-wc-peach/10' : 'bg-bg-card/50'
                          }`}
                        >
                          {event.player?.nation_flag_url && (
                            <img
                              src={event.player.nation_flag_url}
                              alt=""
                              className="h-3.5 w-5 rounded-sm object-cover"
                            />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              isMine ? 'text-wc-peach' : 'text-white'
                            }`}
                          >
                            {event.player?.name || 'Unknown'}
                          </span>
                          <span
                            className={`ml-auto text-xs ${
                              EVENT_COLORS[event.event_type] || 'text-text-secondary'
                            }`}
                          >
                            {EVENT_LABELS[event.event_type] || event.event_type}
                          </span>
                          <span className="text-xs text-text-muted">
                            {event.minute ? `${event.minute}'` : ''}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              event.points_awarded > 0
                                ? 'text-wc-peach'
                                : event.points_awarded < 0
                                ? 'text-wc-crimson'
                                : 'text-text-muted'
                            }`}
                          >
                            {event.points_awarded > 0
                              ? `+${event.points_awarded}`
                              : event.points_awarded}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
