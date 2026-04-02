'use client'

import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

type SummaryData = {
  matchday: string
  yourPoints: number
  bestPlayer: string
  bestPlayerPoints: number
  rankChange: number
  currentRank: number
}

export function MatchdaySummary({ data }: { data: SummaryData | null }) {
  if (!data) return null

  return (
    <div className="rounded-xl border border-wc-purple/30 bg-wc-purple/5 p-4 animate-fade-in-up">
      <p className="text-[10px] font-bold uppercase tracking-wider text-wc-purple mb-3">
        {data.matchday} Complete
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-bg-card p-3 text-center">
          <p className="text-2xl font-bold text-white">{data.yourPoints}</p>
          <p className="text-[9px] text-text-muted">Points Earned</p>
        </div>
        <div className="rounded-lg border border-border bg-bg-card p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {data.rankChange < 0 ? (
              <TrendingUp size={14} className="text-wc-peach" />
            ) : data.rankChange > 0 ? (
              <TrendingDown size={14} className="text-wc-crimson" />
            ) : null}
            <p className="text-2xl font-bold text-white">{data.currentRank}</p>
            <p className="text-[10px] text-text-muted">
              {data.currentRank === 1 ? 'st' : data.currentRank === 2 ? 'nd' : data.currentRank === 3 ? 'rd' : 'th'}
            </p>
          </div>
          <p className="text-[9px] text-text-muted">Current Rank</p>
        </div>
      </div>

      {data.bestPlayer && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-bg-card p-3">
          <Trophy size={14} className="text-wc-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              Best Performer: {data.bestPlayer}
            </p>
            <p className="text-[10px] text-wc-peach">{data.bestPlayerPoints} pts</p>
          </div>
        </div>
      )}
    </div>
  )
}
