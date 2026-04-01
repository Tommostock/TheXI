'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlayerBrowser } from './PlayerBrowser'
import { makePick } from '@/lib/draft/actions'
import {
  getCurrentDraftState,
  getPickOrderForRound,
  getRemainingPositions,
  getAllowedPositions,
  TOTAL_ROUNDS,
  POSITION_LIMITS,
  type DraftPick,
} from '@/lib/draft/logic'
import type { Tables } from '@/types/database.types'
import { Clock, Check, Zap } from 'lucide-react'

type Player = Tables<'players'>
type LeagueMember = Tables<'league_members'>

const POS_COLORS: Record<string, string> = {
  GK: 'text-wc-purple',
  DEF: 'text-wc-blue',
  MID: 'text-wc-gold',
  ATT: 'text-wc-crimson',
}

export function DraftBoard({
  leagueId,
  draftOrder,
  currentUserId,
  initialPicks,
  members,
  players,
}: {
  leagueId: string
  draftOrder: string[]
  currentUserId: string
  initialPicks: DraftPick[]
  members: LeagueMember[]
  players: Player[]
}) {
  const [picks, setPicks] = useState<DraftPick[]>(initialPicks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const memberMap = useMemo(() => {
    const map = new Map<string, LeagueMember>()
    members.forEach((m) => map.set(m.user_id, m))
    return map
  }, [members])

  const draftState = useMemo(
    () => getCurrentDraftState(draftOrder, picks),
    [draftOrder, picks]
  )

  const isMyTurn = draftState.currentPickerUserId === currentUserId
  const draftedPlayerIds = useMemo(() => picks.map((p) => p.player_id), [picks])

  const remaining = useMemo(
    () => getRemainingPositions(currentUserId, picks),
    [currentUserId, picks]
  )

  const allowedPositions = useMemo(
    () => getAllowedPositions(currentUserId, picks),
    [currentUserId, picks]
  )

  // Realtime subscription for new picks
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`draft-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_picks',
          filter: `league_id=eq.${leagueId}`,
        },
        async (payload) => {
          const newPick = payload.new as DraftPick
          // Fetch the player data for this pick
          const { data: player } = await supabase
            .from('players')
            .select('id, name, nation, nation_flag_url, position')
            .eq('id', newPick.player_id)
            .single()

          const fullPick = { ...newPick, player: player || undefined }
          setPicks((prev) => {
            if (prev.some((p) => p.id === fullPick.id)) return prev
            return [...prev, fullPick as DraftPick]
          })
          setShowPicker(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leagueId])

  async function handlePick(player: Player) {
    if (!isMyTurn || loading) return

    // Check position is allowed
    if (!allowedPositions.includes(player.position)) {
      setError(`Cannot draft more ${player.position} players`)
      return
    }

    setError('')
    setLoading(true)
    const result = await makePick(leagueId, player.id)
    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status Bar */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        {draftState.isComplete ? (
          <div className="text-center">
            <Check size={24} className="mx-auto text-wc-teal" />
            <p className="mt-2 font-bold text-white">Draft Complete</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-secondary">
                  Round {draftState.currentRound} of {TOTAL_ROUNDS}
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {isMyTurn ? (
                    <span className="text-wc-teal">Your Pick</span>
                  ) : (
                    <>
                      {memberMap.get(draftState.currentPickerUserId!)
                        ?.display_name || 'Unknown'}
                      &apos;s Pick
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">Pick #{draftState.pickNumber}</p>
                <Clock size={16} className="mt-1 inline text-text-secondary" />
              </div>
            </div>

            {/* My Position Slots */}
            {isMyTurn && (
              <div className="mt-3 flex gap-2">
                {Object.entries(POSITION_LIMITS).map(([pos, limit]) => (
                  <div
                    key={pos}
                    className={`flex-1 rounded border border-border p-2 text-center ${
                      remaining[pos] > 0 ? '' : 'opacity-40'
                    }`}
                  >
                    <p className={`text-xs font-bold ${POS_COLORS[pos]}`}>
                      {pos}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {limit - remaining[pos]}/{limit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="rounded border border-wc-crimson/30 bg-wc-crimson/10 p-2 text-center text-sm text-wc-crimson">
          {error}
        </p>
      )}

      {/* Pick Button / Player Browser */}
      {isMyTurn && !draftState.isComplete && (
        <>
          {showPicker ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  Select a player
                </p>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-xs text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <PlayerBrowser
                players={players.filter((p) =>
                  allowedPositions.includes(p.position)
                )}
                excludeIds={draftedPlayerIds}
                onSelect={handlePick}
              />
              {loading && (
                <p className="mt-2 text-center text-sm text-text-secondary">
                  Confirming pick...
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowPicker(true)}
              className="w-full rounded-lg bg-wc-teal px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Make Your Pick
            </button>
          )}
        </>
      )}

      {/* Draft Grid */}
      <div>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-text-secondary">
          Draft Board
        </h2>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border p-2 text-left text-xs text-text-muted">
                  Rd
                </th>
                {draftOrder.map((userId) => (
                  <th
                    key={userId}
                    className={`border-b border-border p-2 text-center text-xs ${
                      userId === draftState.currentPickerUserId && !draftState.isComplete
                        ? 'text-wc-teal'
                        : 'text-text-secondary'
                    }`}
                  >
                    {memberMap.get(userId)?.display_name?.substring(0, 8) ||
                      '?'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map(
                (round) => {
                  return (
                    <tr key={round}>
                      <td className="border-b border-border/50 p-2 text-xs text-text-muted">
                        {round}
                      </td>
                      {draftOrder.map((userId) => {
                        const pick = picks.find(
                          (p) =>
                            p.user_id === userId && p.round === round
                        )
                        const isCurrent =
                          !draftState.isComplete &&
                          draftState.currentRound === round &&
                          draftState.currentPickerUserId === userId

                        return (
                          <td
                            key={`${round}-${userId}`}
                            className={`border-b border-border/50 p-1 text-center ${
                              isCurrent
                                ? 'bg-wc-teal/10'
                                : ''
                            }`}
                          >
                            {pick ? (
                              <div className="rounded bg-bg-card px-1 py-1">
                                <p className="truncate text-xs font-medium text-white">
                                  {pick.player?.name?.split(' ').pop() || '?'}
                                </p>
                                <p
                                  className={`text-[10px] font-bold ${
                                    POS_COLORS[pick.player?.position || ''] || 'text-text-secondary'
                                  }`}
                                >
                                  {pick.player?.position}
                                  {pick.is_auto_pick && (
                                    <Zap
                                      size={8}
                                      className="ml-0.5 inline text-wc-gold"
                                    />
                                  )}
                                </p>
                              </div>
                            ) : isCurrent ? (
                              <div className="rounded border border-dashed border-wc-teal px-1 py-2">
                                <p className="text-[10px] text-wc-teal">
                                  NOW
                                </p>
                              </div>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
