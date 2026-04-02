'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type SquadPlayer = {
  isStarting: boolean
  playerPoints: number
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
  captainPlayerId?: string | null
  viceCaptainPlayerId?: string | null
  squad: SquadPlayer[]
}

const POS_TEXT: Record<string, string> = {
  GK: 'text-wc-purple',
  DEF: 'text-wc-blue',
  MID: 'text-wc-gold',
  ATT: 'text-wc-crimson',
}

const POS_BG: Record<string, string> = {
  GK: 'bg-wc-purple/10',
  DEF: 'bg-wc-blue/10',
  MID: 'bg-wc-gold/10',
  ATT: 'bg-wc-crimson/10',
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

        // Sort squad by points descending for expanded view
        const startersWithPoints = entry.squad
          .filter((s) => s.isStarting && s.player)
          .sort((a, b) => b.playerPoints - a.playerPoints)

        const benchWithPoints = entry.squad
          .filter((s) => !s.isStarting && s.player)
          .sort((a, b) => b.playerPoints - a.playerPoints)

        return (
          <div key={entry.userId}>
            <button
              onClick={() =>
                setExpanded(isExpanded ? null : entry.userId)
              }
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                rank === 1
                  ? 'border-wc-gold/40 bg-wc-gold/5'
                  : 'border-border bg-bg-card'
              } ${isMe ? 'ring-1 ring-wc-blue/30' : ''}`}
            >
              {/* Rank */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  rank === 1
                    ? 'bg-wc-gold text-bg-primary'
                    : rank === 2
                    ? 'bg-text-secondary text-bg-primary'
                    : rank === 3
                    ? 'bg-[#CD7F32] text-bg-primary'
                    : 'bg-border text-text-secondary'
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
                    <span className="text-xs text-wc-cyan">You</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{entry.formation}</p>
              </div>

              {/* Points */}
              <div className="shrink-0 text-right">
                <p
                  className={`text-lg font-bold ${
                    rank === 1 ? 'text-wc-gold' : 'text-white'
                  }`}
                >
                  {entry.totalPoints}
                </p>
                <p className="text-[10px] text-text-secondary">pts</p>
              </div>

              {/* Expand */}
              {isExpanded ? (
                <ChevronUp size={16} className="shrink-0 text-text-muted" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-text-muted" />
              )}
            </button>

            {/* Expanded Squad with points breakdown */}
            {isExpanded && entry.squad.length > 0 && (
              <div className="mt-1 rounded-b-lg border border-t-0 border-border bg-bg-primary p-3">
                {/* Starting XI */}
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Starting XI
                </p>
                <div className="space-y-1">
                  {startersWithPoints.map((s) => {
                    const isCap = s.player!.id === entry.captainPlayerId
                    const isVC = s.player!.id === entry.viceCaptainPlayerId
                    const displayPts = isCap ? s.playerPoints * 2 : s.playerPoints
                    return (
                      <div
                        key={s.player!.id}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${POS_BG[s.player!.position] || 'bg-bg-card'}`}
                      >
                        {s.player!.nation_flag_url && (
                          <img
                            src={s.player!.nation_flag_url}
                            alt=""
                            className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover"
                          />
                        )}
                        <span className="flex-1 truncate text-xs font-medium text-white">
                          {s.player!.name}
                        </span>
                        {/* Captain / VC badge */}
                        {isCap && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[7px] font-bold text-black">C</span>
                        )}
                        {isVC && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[7px] font-bold text-white border border-white/30">V</span>
                        )}
                        <span
                          className={`text-[10px] font-bold ${POS_TEXT[s.player!.position] || 'text-text-secondary'}`}
                        >
                          {s.player!.position}
                        </span>
                        <span
                          className={`min-w-[28px] text-right text-xs font-bold ${
                            displayPts > 0
                              ? 'text-wc-green'
                              : displayPts < 0
                              ? 'text-wc-crimson'
                              : 'text-text-muted'
                          }`}
                        >
                          {displayPts > 0 ? `+${displayPts}` : displayPts}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Bench */}
                {benchWithPoints.length > 0 && (
                  <>
                    <p className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Bench <span className="font-normal">(50% pts)</span>
                    </p>
                    <div className="space-y-1">
                      {benchWithPoints.map((s) => (
                        <div
                          key={s.player!.id}
                          className="flex items-center gap-2 rounded-lg bg-bg-card/40 px-2.5 py-2 opacity-70"
                        >
                          {s.player!.nation_flag_url && (
                            <img
                              src={s.player!.nation_flag_url}
                              alt=""
                              className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover"
                            />
                          )}
                          <span className="flex-1 truncate text-xs text-text-secondary">
                            {s.player!.name}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {s.player!.position}
                          </span>
                          <span
                            className={`min-w-[28px] text-right text-xs font-bold ${
                              s.playerPoints > 0
                                ? 'text-wc-green/70'
                                : s.playerPoints < 0
                                ? 'text-wc-crimson/70'
                                : 'text-text-muted'
                            }`}
                          >
                            {s.playerPoints > 0 ? `+${s.playerPoints}` : s.playerPoints}
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
        <p className="py-8 text-center text-text-secondary">
          No scores yet. Points will appear once matches begin.
        </p>
      )}
    </div>
  )
}
