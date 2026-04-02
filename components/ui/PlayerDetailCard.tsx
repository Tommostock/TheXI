'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, Calendar, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getNextOpponent } from '@/lib/tournament/schedule'

type PlayerDetail = {
  id: string
  name: string
  nation: string
  nation_flag_url: string | null
  position: string
  is_eliminated: boolean
}

type MatchEventRow = {
  match_id: string
  event_type: string
  minute: number | null
  points_awarded: number
  match_date: string
}

const EVENT_LABELS: Record<string, string> = {
  goal: 'Goal', assist: 'Assist', clean_sheet: 'Clean Sheet',
  own_goal: 'Own Goal', yellow: 'Yellow', red: 'Red',
  appearance_full: '90 mins', appearance_sub: 'Sub',
}

const POS_COLORS: Record<string, string> = {
  GK: 'bg-wc-purple', DEF: 'bg-wc-blue', MID: 'bg-wc-gold', ATT: 'bg-wc-crimson',
}

export function PlayerDetailCard({
  player,
  onClose,
}: {
  player: PlayerDetail
  onClose: () => void
}) {
  const [events, setEvents] = useState<MatchEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient()
      const { data } = await supabase
        .from('match_events')
        .select('match_id, event_type, minute, points_awarded, match_date')
        .eq('player_id', player.id)
        .order('match_date', { ascending: false })

      const rows = (data || []) as MatchEventRow[]
      setEvents(rows)
      setTotalPoints(rows.reduce((sum, e) => sum + e.points_awarded, 0))
      setLoading(false)
    }
    fetchEvents()
  }, [player.id])

  const nextOpp = getNextOpponent(player.nation)

  // Group events by match
  const matchMap = new Map<string, { date: string; events: MatchEventRow[]; total: number }>()
  for (const e of events) {
    if (!matchMap.has(e.match_id)) {
      matchMap.set(e.match_id, { date: e.match_date, events: [], total: 0 })
    }
    const m = matchMap.get(e.match_id)!
    m.events.push(e)
    m.total += e.points_awarded
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-bg-card animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg-card p-4">
          {player.nation_flag_url && (
            <img src={player.nation_flag_url} alt={player.nation} className="h-6 w-9 rounded-sm object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{player.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${POS_COLORS[player.position]}`}>
                {player.position}
              </span>
              <span className="text-xs text-text-secondary">{player.nation}</span>
              {player.is_eliminated && (
                <span className="text-[10px] text-wc-crimson font-medium">Eliminated</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-bg-surface p-3 text-center">
              <TrendingUp size={14} className="mx-auto text-wc-peach mb-1" />
              <p className="text-lg font-bold text-white">{loading ? '-' : totalPoints}</p>
              <p className="text-[9px] text-text-muted">Total Pts</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-surface p-3 text-center">
              <Calendar size={14} className="mx-auto text-wc-blue mb-1" />
              <p className="text-lg font-bold text-white">{loading ? '-' : matchMap.size}</p>
              <p className="text-[9px] text-text-muted">Matches</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-surface p-3 text-center">
              <Trophy size={14} className="mx-auto text-wc-gold mb-1" />
              <p className="text-lg font-bold text-white">
                {loading ? '-' : events.filter(e => e.event_type === 'goal').length}
              </p>
              <p className="text-[9px] text-text-muted">Goals</p>
            </div>
          </div>

          {/* Next Fixture */}
          {nextOpp && !player.is_eliminated && (
            <div className="rounded-lg border border-border bg-bg-surface p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Next Match</p>
              <p className="text-sm text-white">{player.nation} {nextOpp}</p>
            </div>
          )}

          {/* Match History */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Match History</p>
            {loading ? (
              <div className="animate-shimmer h-20 rounded-lg" />
            ) : matchMap.size === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No match data yet</p>
            ) : (
              <div className="space-y-2">
                {Array.from(matchMap.entries()).map(([matchId, match]) => (
                  <div key={matchId} className="rounded-lg border border-border bg-bg-surface p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-text-secondary">{match.date}</p>
                      <span className={`text-xs font-bold ${match.total > 0 ? 'text-wc-peach' : match.total < 0 ? 'text-wc-crimson' : 'text-text-muted'}`}>
                        {match.total > 0 ? '+' : ''}{match.total} pts
                      </span>
                    </div>
                    <div className="space-y-1">
                      {match.events.filter(e => EVENT_LABELS[e.event_type]).map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">
                            {e.minute ? `${e.minute}'` : ''} {EVENT_LABELS[e.event_type]}
                          </span>
                          <span className={e.points_awarded > 0 ? 'text-wc-peach font-medium' : e.points_awarded < 0 ? 'text-wc-crimson font-medium' : 'text-text-muted'}>
                            {e.points_awarded > 0 ? '+' : ''}{e.points_awarded}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
