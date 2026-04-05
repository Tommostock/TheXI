'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlayerBrowser } from './PlayerBrowser'
import { getShortName } from '@/lib/utils/names'
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
import { showToast } from '@/components/ui/Toast'
import { DraftTimer } from './DraftTimer'
import { DraftOrderReveal } from './DraftOrderReveal'

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
  pickDeadline,
}: {
  leagueId: string
  draftOrder: string[]
  currentUserId: string
  initialPicks: DraftPick[]
  members: LeagueMember[]
  players: Player[]
  pickDeadline: string | null
}) {
  const [picks, setPicks] = useState<DraftPick[]>(initialPicks)
  const [currentDeadline, setCurrentDeadline] = useState<string | null>(pickDeadline)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null)
  const [showReveal, setShowReveal] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(`draft-reveal-${leagueId}`) && initialPicks.length === 0
  })

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

  // Client-side auto-pick: when deadline expires, trigger auto-pick API
  useEffect(() => {
    if (!currentDeadline || draftState.isComplete) return

    const checkExpiry = () => {
      if (new Date(currentDeadline).getTime() <= Date.now()) {
        fetch('/api/draft/auto-pick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leagueId }),
        }).catch(() => {})
      }
    }

    // Check immediately on load (in case deadline already passed)
    checkExpiry()

    // Then check every 30 seconds
    const interval = setInterval(checkExpiry, 30000)
    return () => clearInterval(interval)
  }, [currentDeadline, leagueId, draftState.isComplete])

  // Realtime subscriptions for picks and deadline updates
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'draft_windows',
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          const updated = payload.new as { current_pick_deadline: string | null }
          setCurrentDeadline(updated.current_pick_deadline)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leagueId])

  function handlePlayerSelect(player: Player) {
    if (!isMyTurn || loading) return

    // Check position is allowed
    if (!allowedPositions.includes(player.position)) {
      showToast(`Cannot draft more ${player.position} players`)
      return
    }

    // Check nation limit — show toast feedback
    const userPicks = picks.filter((p) => p.user_id === currentUserId)
    const nationCount = userPicks.filter((p) => p.player?.nation === player.nation).length
    if (nationCount >= 3) {
      showToast(`You already have 3 players from ${player.nation} — that's the limit`)
      return
    }

    setError('')
    setPendingPlayer(player)
  }

  async function confirmPick() {
    if (!pendingPlayer || loading) return
    setLoading(true)
    const result = await makePick(leagueId, pendingPlayer.id)
    if (result.error) {
      setError(result.error)
    }
    setPendingPlayer(null)
    setLoading(false)
  }

  function cancelPick() {
    setPendingPlayer(null)
  }

  if (showReveal) {
    const nameMap: Record<string, string> = {}
    members.forEach((m) => { nameMap[m.user_id] = m.display_name })
    return (
      <DraftOrderReveal
        draftOrder={draftOrder}
        memberNames={nameMap}
        onComplete={() => {
          localStorage.setItem(`draft-reveal-${leagueId}`, '1')
          setShowReveal(false)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status Bar */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        {draftState.isComplete ? (
          <div className="text-center">
            <Check size={24} className="mx-auto text-wc-peach" />
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
                    <span className="text-wc-peach">Your Pick</span>
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

      {!draftState.isComplete && (
        <DraftTimer
          expiresAt={currentDeadline}
          isYourTurn={isMyTurn}
          currentPicker={
            memberMap.get(draftState.currentPickerUserId!)?.display_name || 'Unknown'
          }
        />
      )}

      {error && (
        <p className="rounded border border-wc-crimson/30 bg-wc-crimson/10 p-2 text-center text-sm text-wc-crimson">
          {error}
        </p>
      )}

      {/* Pick Button / Player Browser */}
      {/* Confirmation Overlay — fixed so it floats wherever user has scrolled */}
      {pendingPlayer && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center pb-24 px-4" onClick={cancelPick}>
          <div
            className="w-full max-w-sm rounded-xl border border-wc-purple/40 bg-bg-card p-4 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xs text-text-secondary mb-1">Confirm your pick</p>
            <p className="text-center text-lg font-bold text-white">{pendingPlayer.name}</p>
            <p className="text-center text-sm text-text-secondary">{pendingPlayer.nation} &middot; {pendingPlayer.position}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={cancelPick}
                disabled={loading}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPick}
                disabled={loading}
                className="flex-1 rounded-lg bg-wc-peach py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Picking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMyTurn && !draftState.isComplete && !pendingPlayer && (
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
                onSelect={handlePlayerSelect}
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
              className="w-full rounded-lg bg-wc-peach px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
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
                        ? 'text-wc-peach'
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
                                ? 'bg-wc-peach/10'
                                : ''
                            }`}
                          >
                            {pick ? (
                              <div className="rounded bg-bg-card px-1 py-1">
                                <p className="truncate text-xs font-medium text-white">
                                  {pick.player?.name ? getShortName(pick.player.name) : '?'}
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
                              <div className="rounded border border-dashed border-wc-peach px-1 py-2">
                                <p className="text-[10px] text-wc-peach">
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
