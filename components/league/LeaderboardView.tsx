'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'

type SquadPlayer = {
  isStarting: boolean
  player: {
    id: string
    name: string
    nation: string
    nation_flag_url: string | null
    position: string
  } | null
}

type Ranking = {
  userId: string
  displayName: string
  formation: string
  totalPoints: number
  squad: SquadPlayer[]
}

const POS_TEXT: Record<string, string> = {
  GK: 'text-trophy-gold',
  DEF: 'text-tournament-blue',
  MID: 'text-tournament-green',
  ATT: 'text-tournament-red',
}

export function LeaderboardView({
  rankings,
  currentUserId,
}: {
  rankings: Ranking[]
  currentUserId: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {rankings.map((entry, index) => {
        const rank = index + 1
        const isExpanded = expanded === entry.userId
        const isMe = entry.userId === currentUserId

        return (
          <div key={entry.userId}>
            <button
              onClick={() =>
                setExpanded(isExpanded ? null : entry.userId)
              }
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                rank === 1
                  ? 'border-trophy-gold/40 bg-trophy-gold/5'
                  : 'border-dark-grey bg-deep-navy'
              } ${isMe ? 'ring-1 ring-tournament-green/30' : ''}`}
            >
              {/* Rank */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  rank === 1
                    ? 'bg-trophy-gold text-dark-charcoal'
                    : rank === 2
                    ? 'bg-light-grey text-dark-charcoal'
                    : rank === 3
                    ? 'bg-[#CD7F32] text-dark-charcoal'
                    : 'bg-dark-grey text-light-grey'
                }`}
              >
                {rank}
              </div>

              {/* Name + Formation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">
                    {entry.displayName}
                  </p>
                  {isMe && (
                    <span className="text-xs text-tournament-green">You</span>
                  )}
                </div>
                <p className="text-xs text-light-grey">{entry.formation}</p>
              </div>

              {/* Points */}
              <div className="shrink-0 text-right">
                <p
                  className={`text-lg font-bold ${
                    rank === 1 ? 'text-trophy-gold' : 'text-white'
                  }`}
                >
                  {entry.totalPoints}
                </p>
                <p className="text-[10px] text-light-grey">pts</p>
              </div>

              {/* Expand */}
              {isExpanded ? (
                <ChevronUp size={16} className="shrink-0 text-dark-grey" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-dark-grey" />
              )}
            </button>

            {/* Expanded Squad */}
            {isExpanded && entry.squad.length > 0 && (
              <div className="mt-1 rounded-b-lg border border-t-0 border-dark-grey bg-dark-charcoal p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-light-grey">
                  Starting XI
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {entry.squad
                    .filter((s) => s.isStarting && s.player)
                    .sort((a, b) => {
                      const order = ['GK', 'DEF', 'MID', 'ATT']
                      return (
                        order.indexOf(a.player!.position) -
                        order.indexOf(b.player!.position)
                      )
                    })
                    .map((s) => (
                      <div
                        key={s.player!.id}
                        className="flex items-center gap-1.5 rounded bg-deep-navy px-2 py-1.5"
                      >
                        {s.player!.nation_flag_url && (
                          <img
                            src={s.player!.nation_flag_url}
                            alt=""
                            className="h-3.5 w-5 rounded-sm object-cover"
                          />
                        )}
                        <span className="truncate text-xs text-white">
                          {s.player!.name.split(' ').pop()}
                        </span>
                        <span
                          className={`ml-auto text-[10px] font-bold ${
                            POS_TEXT[s.player!.position] || 'text-light-grey'
                          }`}
                        >
                          {s.player!.position}
                        </span>
                      </div>
                    ))}
                </div>

                {entry.squad.some((s) => !s.isStarting && s.player) && (
                  <>
                    <p className="mb-1 mt-3 text-xs font-medium uppercase tracking-wider text-dark-grey">
                      Bench
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {entry.squad
                        .filter((s) => !s.isStarting && s.player)
                        .map((s) => (
                          <div
                            key={s.player!.id}
                            className="flex items-center gap-1.5 rounded bg-deep-navy/50 px-2 py-1.5 opacity-60"
                          >
                            <span className="truncate text-xs text-light-grey">
                              {s.player!.name.split(' ').pop()}
                            </span>
                            <span className="ml-auto text-[10px] text-dark-grey">
                              {s.player!.position}
                            </span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}

      {rankings.length === 0 && (
        <p className="py-8 text-center text-light-grey">
          No scores yet. Points will appear once matches begin.
        </p>
      )}
    </div>
  )
}
