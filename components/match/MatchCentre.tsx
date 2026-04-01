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
  goal: 'text-tournament-green',
  assist: 'text-tournament-green',
  clean_sheet: 'text-tournament-blue',
  own_goal: 'text-tournament-red',
  yellow: 'text-trophy-gold',
  red: 'text-tournament-red',
  appearance_full: 'text-light-grey',
  appearance_sub: 'text-dark-grey',
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
      <div className="rounded-lg border border-dashed border-dark-grey p-8 text-center">
        <p className="text-light-grey">No match data yet.</p>
        <p className="mt-1 text-sm text-dark-grey">
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
                  ? 'border-tournament-green/30 bg-tournament-green/5'
                  : 'border-dark-grey bg-deep-navy'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {nations.join(' vs ') || `Match ${match.matchId}`}
                </p>
                <p className="text-xs text-light-grey">
                  {new Date(match.matchDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              {hasMyPlayers && (
                <Circle size={6} className="fill-tournament-green text-tournament-green" />
              )}
              <span className="text-sm font-bold text-white">
                {goals} goal{goals !== 1 ? 's' : ''}
              </span>
              {isExpanded ? (
                <ChevronUp size={16} className="text-dark-grey" />
              ) : (
                <ChevronDown size={16} className="text-dark-grey" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-1 rounded-b-lg border border-t-0 border-dark-grey bg-dark-charcoal p-3">
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
                            isMine ? 'bg-tournament-green/10' : 'bg-deep-navy/50'
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
                              isMine ? 'text-tournament-green' : 'text-white'
                            }`}
                          >
                            {event.player?.name || 'Unknown'}
                          </span>
                          <span
                            className={`ml-auto text-xs ${
                              EVENT_COLORS[event.event_type] || 'text-light-grey'
                            }`}
                          >
                            {EVENT_LABELS[event.event_type] || event.event_type}
                          </span>
                          <span className="text-xs text-dark-grey">
                            {event.minute ? `${event.minute}'` : ''}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              event.points_awarded > 0
                                ? 'text-tournament-green'
                                : event.points_awarded < 0
                                ? 'text-tournament-red'
                                : 'text-dark-grey'
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
