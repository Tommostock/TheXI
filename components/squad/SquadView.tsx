'use client'

import { useState, useMemo } from 'react'
import { changeFormation, toggleStarting, setCaptain, saveTeamName } from '@/lib/squad/actions'
import { PitchView } from './PitchView'
import { PlayerDetailCard } from '@/components/ui/PlayerDetailCard'
import { ArrowUpDown, Info } from 'lucide-react'

type SquadSlot = {
  id: string
  position: string
  is_starting: boolean
  player: {
    id: string
    name: string
    nation: string
    nation_flag_url: string | null
    position: string
    is_eliminated: boolean
  } | null
}

type Formation = '4-4-2' | '4-3-3' | '4-5-1'
type ViewMode = 'pitch' | 'list'

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '4-5-1']

function PlayerActionMenu({
  slots,
  selectedPlayerId,
  showMenu,
  isLocked,
  localCaptainId,
  localViceCaptainId,
  loading,
  onDismiss,
  onSetCaptain,
  onSetViceCaptain,
  onSwap,
  onViewInfo,
}: {
  slots: SquadSlot[]
  selectedPlayerId: string | null
  showMenu: boolean
  isLocked?: boolean
  localCaptainId: string | null
  localViceCaptainId: string | null
  loading: boolean
  onDismiss: () => void
  onSetCaptain: (id: string) => void
  onSetViceCaptain: (id: string) => void
  onSwap: (a: string, b: string) => void
  onViewInfo: (player: SquadSlot['player']) => void
}) {
  if (!showMenu || !selectedPlayerId || isLocked) return null

  const selectedSlot = slots.find((s) => s.player?.id === selectedPlayerId)
  if (!selectedSlot?.player) return null

  const player = selectedSlot.player
  const isStarter = selectedSlot.is_starting
  const isCap = player.id === localCaptainId
  const isVC = player.id === localViceCaptainId

  const swapCandidates = slots.filter(
    (s) =>
      s.player &&
      s.player.id !== selectedPlayerId &&
      s.player.position === player.position &&
      s.is_starting !== isStarter
  )

  return (
    <div className="rounded-xl border border-wc-purple/40 bg-bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white">{player.name}</p>
        <button onClick={onDismiss} className="text-xs text-text-muted hover:text-white">
          Cancel
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewInfo(player)}
          className="rounded-lg border border-border bg-bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-white"
        >
          View Info
        </button>
        {isStarter && !isCap && (
          <button
            onClick={() => onSetCaptain(player.id)}
            disabled={loading}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
          >
            Make Captain
          </button>
        )}
        {isStarter && !isVC && !isCap && (
          <button
            onClick={() => onSetViceCaptain(player.id)}
            disabled={loading}
            className="rounded-lg border border-white/30 bg-black px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-black/80 disabled:opacity-50"
          >
            Make Vice Captain
          </button>
        )}
        {swapCandidates.length > 0 && (
          <>
            <p className="w-full text-[10px] text-text-muted mt-1">
              Swap with {isStarter ? 'bench' : 'starter'}:
            </p>
            {swapCandidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => onSwap(selectedSlot.id, candidate.id)}
                disabled={loading}
                className="rounded-lg border border-border bg-bg-surface px-3 py-1.5 text-xs text-white transition-colors hover:border-wc-purple disabled:opacity-50"
              >
                {candidate.player?.name.split(' ').pop()}
              </button>
            ))}
          </>
        )}
        {swapCandidates.length === 0 && (
          <p className="text-[10px] text-text-muted">No same-position players to swap with</p>
        )}
      </div>
    </div>
  )
}

const POS_COLORS: Record<string, string> = {
  GK: 'border-wc-purple/40 bg-wc-purple/10',
  DEF: 'border-wc-blue/40 bg-wc-blue/10',
  MID: 'border-wc-gold/40 bg-wc-gold/10',
  ATT: 'border-wc-crimson/40 bg-wc-crimson/10',
}

const POS_TEXT: Record<string, string> = {
  GK: 'text-wc-purple',
  DEF: 'text-wc-blue',
  MID: 'text-wc-gold',
  ATT: 'text-wc-crimson',
}

export function SquadView({
  leagueId,
  formation: initialFormation,
  slots: initialSlots,
  totalPoints,
  playerPoints = {},
  captainId = null,
  viceCaptainId = null,
  isLocked = false,
  teamName = '',
}: {
  leagueId: string
  formation: Formation
  slots: SquadSlot[]
  totalPoints: number
  playerPoints?: Record<string, number>
  captainId?: string | null
  viceCaptainId?: string | null
  isLocked?: boolean
  teamName?: string
}) {
  const [formation, setFormation] = useState<Formation>(initialFormation)
  const [slots, setSlots] = useState<SquadSlot[]>(initialSlots)
  const [loading, setLoading] = useState(false)
  const [swapSource, setSwapSource] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('pitch')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [showPlayerMenu, setShowPlayerMenu] = useState(false)
  const [localCaptainId, setLocalCaptainId] = useState<string | null>(captainId ?? null)
  const [localViceCaptainId, setLocalViceCaptainId] = useState<string | null>(viceCaptainId ?? null)
  const [localTeamName, setLocalTeamName] = useState(teamName || '')
  const [editingTeamName, setEditingTeamName] = useState(false)

  const starters = useMemo(
    () =>
      slots
        .filter((s) => s.is_starting)
        .sort((a, b) => {
          const order = ['GK', 'DEF', 'MID', 'ATT']
          return order.indexOf(a.position) - order.indexOf(b.position)
        }),
    [slots]
  )

  const bench = useMemo(
    () =>
      slots
        .filter((s) => !s.is_starting)
        .sort((a, b) => {
          const order = ['GK', 'DEF', 'MID', 'ATT']
          return order.indexOf(a.position) - order.indexOf(b.position)
        }),
    [slots]
  )

  const FORMATION_SLOTS: Record<string, Record<string, number>> = {
    '4-4-2': { GK: 1, DEF: 4, MID: 4, ATT: 2 },
    '4-3-3': { GK: 1, DEF: 4, MID: 3, ATT: 3 },
    '4-5-1': { GK: 1, DEF: 4, MID: 5, ATT: 1 },
  }

  async function handleFormationChange(newFormation: Formation) {
    if (newFormation === formation) return
    const prevFormation = formation
    const prevSlots = slots

    // Optimistic — change formation AND reassign starters client-side
    setFormation(newFormation)
    const needed = FORMATION_SLOTS[newFormation]
    if (needed) {
      const byPos: Record<string, typeof slots> = { GK: [], DEF: [], MID: [], ATT: [] }
      for (const s of slots) {
        const pos = s.player?.position || s.position
        if (byPos[pos]) byPos[pos].push(s)
      }
      const updatedSlots = slots.map((s) => {
        const pos = s.player?.position || s.position
        const posSlots = byPos[pos] || []
        const idx = posSlots.indexOf(s)
        const limit = needed[pos] || 0
        return { ...s, is_starting: idx < limit }
      })
      setSlots(updatedSlots)
    }

    // Background server call
    const result = await changeFormation(leagueId, newFormation)
    if (result.error) {
      setFormation(prevFormation)
      setSlots(prevSlots)
    }
  }

  async function handleSwap(slotId: string) {
    if (!swapSource) {
      setSwapSource(slotId)
      return
    }
    if (swapSource === slotId) {
      setSwapSource(null)
      return
    }
    // Optimistic update for list view swap
    const prevSlots = slots
    const sourceId = swapSource
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === sourceId || s.id === slotId) {
          return { ...s, is_starting: !s.is_starting }
        }
        return s
      })
    )
    setSwapSource(null)

    // Background server call
    const result = await toggleStarting(leagueId, sourceId, slotId)
    if (result.error) {
      setSlots(prevSlots) // revert
    }
  }

  // Pitch view: tap to select, tap same-position opposite to swap
  function handlePitchPlayerTap(playerId: string) {
    if (isLocked) return
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null)
      return
    }

    if (selectedPlayerId) {
      const sourceSlot = slots.find((s) => s.player?.id === selectedPlayerId)
      const targetSlot = slots.find((s) => s.player?.id === playerId)
      if (sourceSlot && targetSlot) {
        const sourcePos = sourceSlot.player?.position || sourceSlot.position
        const targetPos = targetSlot.player?.position || targetSlot.position
        if (sourcePos === targetPos && sourceSlot.is_starting !== targetSlot.is_starting) {
          handlePitchSwap(sourceSlot.id, targetSlot.id)
          return
        }
      }
      // Different position or same side — just reselect
      setSelectedPlayerId(playerId)
      return
    }

    setSelectedPlayerId(playerId)
  }

  async function handlePitchSwap(slotIdA: string, slotIdB: string) {
    // Optimistic update — swap UI instantly
    setSelectedPlayerId(null)
    setShowPlayerMenu(false)

    const slotA = slots.find((s) => s.id === slotIdA)
    const slotB = slots.find((s) => s.id === slotIdB)
    const prevSlots = slots

    // Swap immediately in state
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotIdA || s.id === slotIdB) {
          return { ...s, is_starting: !s.is_starting }
        }
        return s
      })
    )

    // Captain/VC inheritance — update immediately
    const playerGoingToBench = slotA?.is_starting ? slotA : slotB
    const playerGoingToStarting = slotA?.is_starting ? slotB : slotA

    if (playerGoingToBench?.player && playerGoingToStarting?.player) {
      if (playerGoingToBench.player.id === localCaptainId) {
        setLocalCaptainId(playerGoingToStarting.player.id)
        // Fire captain update in background
        setCaptain(leagueId, playerGoingToStarting.player.id, localViceCaptainId || '')
      }
      if (playerGoingToBench.player.id === localViceCaptainId) {
        setLocalViceCaptainId(playerGoingToStarting.player.id)
        setCaptain(leagueId, localCaptainId || '', playerGoingToStarting.player.id)
      }
    }

    // Fire server call in background — revert on failure
    const result = await toggleStarting(leagueId, slotIdA, slotIdB)
    if (result.error) {
      // Revert optimistic update
      setSlots(prevSlots)
    }
  }

  async function handleSetCaptain(playerId: string) {
    if (isLocked) return
    const prevCap = localCaptainId
    const prevVC = localViceCaptainId
    setLocalCaptainId(playerId)

    // If no VC set, or VC is same as new captain, pick a different starter as VC
    let vcId = localViceCaptainId
    if (!vcId || vcId === playerId) {
      const otherStarter = slots.find(
        (s) => s.is_starting && s.player && s.player.id !== playerId
      )
      vcId = otherStarter?.player?.id || null
      if (vcId) setLocalViceCaptainId(vcId)
    }

    setSelectedPlayerId(null)
    if (vcId) {
      const result = await setCaptain(leagueId, playerId, vcId)
      if (result.error) {
        setLocalCaptainId(prevCap)
        setLocalViceCaptainId(prevVC)
      }
    }
  }

  async function handleSetViceCaptain(playerId: string) {
    if (isLocked) return
    const prevCap = localCaptainId
    const prevVC = localViceCaptainId
    setLocalViceCaptainId(playerId)

    // If no captain set, or captain is same as new VC, pick a different starter as captain
    let capId = localCaptainId
    if (!capId || capId === playerId) {
      const otherStarter = slots.find(
        (s) => s.is_starting && s.player && s.player.id !== playerId
      )
      capId = otherStarter?.player?.id || null
      if (capId) setLocalCaptainId(capId)
    }

    setSelectedPlayerId(null)
    if (capId) {
      const result = await setCaptain(leagueId, capId, playerId)
      if (result.error) {
        setLocalCaptainId(prevCap)
        setLocalViceCaptainId(prevVC)
      }
    }
  }

  function dismissSelection() {
    setSelectedPlayerId(null)
    setShowPlayerMenu(false)
  }

  function PlayerCard({ slot, isSwapTarget }: { slot: SquadSlot; isSwapTarget: boolean }) {
    const player = slot.player
    if (!player) return null

    const isSelected = swapSource === slot.id
    const isEliminated = player.is_eliminated

    return (
      <button
        onClick={() => handleSwap(slot.id)}
        className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-all ${
          isSelected
            ? 'border-wc-peach bg-wc-peach/10'
            : isSwapTarget && swapSource
            ? 'border-dashed border-wc-peach/50 hover:border-wc-peach'
            : POS_COLORS[slot.position]
        } ${isEliminated ? 'opacity-40' : ''}`}
      >
        {player.nation_flag_url && (
          <img
            src={player.nation_flag_url}
            alt={player.nation}
            className="h-5 w-7 shrink-0 rounded-sm object-cover"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${
              isEliminated ? 'line-through text-text-muted' : 'text-white'
            }`}
          >
            {player.name}
          </p>
          <p className="text-xs text-text-secondary">{player.nation}</p>
        </div>
        <span className={`shrink-0 text-xs font-bold ${POS_TEXT[slot.position]}`}>
          {slot.position}
        </span>
        {isSelected && (
          <ArrowUpDown size={14} className="shrink-0 text-wc-peach" />
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Lock Banner */}
      {isLocked && (
        <div className="rounded-lg border border-wc-crimson/30 bg-wc-crimson/5 px-3 py-3 text-center">
          <p className="text-xs font-semibold text-wc-crimson">
            Lineup Locked
          </p>
          <p className="text-[10px] text-wc-crimson/70 mt-0.5">
            Formation and squad changes are locked during the match round. Changes will be available between matchdays.
          </p>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setViewMode('pitch')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${
            viewMode === 'pitch' ? 'bg-wc-purple text-white' : 'bg-bg-card text-text-secondary'
          }`}
        >
          Pitch View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${
            viewMode === 'list' ? 'bg-wc-purple text-white' : 'bg-bg-card text-text-secondary'
          }`}
        >
          List View
        </button>
      </div>

      {/* Formation selector — hidden when locked */}
      {!isLocked && (
        <div className="flex gap-1">
          {FORMATIONS.map((f) => (
            <button
              key={f}
              onClick={() => handleFormationChange(f)}
              className={`flex-1 rounded-md border py-1.5 text-center text-[11px] font-bold transition-colors ${
                formation === f
                  ? 'border-wc-purple bg-wc-purple/15 text-white'
                  : 'border-border text-text-secondary hover:border-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Team Name + Points — centred */}
      <div className="text-center py-1">
        {editingTeamName ? (
          <input
            type="text"
            value={localTeamName}
            onChange={(e) => setLocalTeamName(e.target.value)}
            onBlur={() => { setEditingTeamName(false); saveTeamName(leagueId, localTeamName) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditingTeamName(false); saveTeamName(leagueId, localTeamName) } }}
            maxLength={25}
            autoFocus
            className="bg-transparent text-xl font-team text-white border-b border-wc-purple outline-none text-center w-56"
          />
        ) : (
          <button
            onClick={() => !isLocked && setEditingTeamName(true)}
            className="relative text-xl font-team text-white hover:text-wc-peach transition-colors"
          >
            {localTeamName || 'Tap to set team name'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-4 top-1 opacity-30"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        )}
        <p className="text-2xl font-display text-wc-peach mt-1">
          <span className="text-text-muted">&mdash;</span> <span className="underline underline-offset-4 decoration-wc-peach/40">{totalPoints}</span> <span className="text-text-muted">&mdash;</span>
        </p>
      </div>

      {/* Pitch View */}
      {viewMode === 'pitch' && (
        <>
          <PitchView
            formation={formation}
            slots={slots as Parameters<typeof PitchView>[0]['slots']}
            totalPoints={totalPoints}
            playerPoints={playerPoints}
            captainId={localCaptainId}
            viceCaptainId={localViceCaptainId}
            selectedPlayerId={selectedPlayerId}
            onPlayerTap={handlePitchPlayerTap}
            isLocked={isLocked}
          />

          {/* Captain/VC toggle + swap hint */}
          {selectedPlayerId && (() => {
            const selectedSlot = slots.find((s) => s.player?.id === selectedPlayerId)
            const isStarter = selectedSlot?.is_starting
            const isCap = selectedPlayerId === localCaptainId
            const isVC = selectedPlayerId === localViceCaptainId
            return (
              <div className="flex flex-col gap-1.5">
                {/* Captain/VC buttons — only for starters */}
                {isStarter && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => { handleSetCaptain(selectedPlayerId); setSelectedPlayerId(null) }}
                      className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${
                        isCap ? 'bg-white text-black' : 'border border-white/40 text-white hover:bg-white/10'
                      }`}
                    >
                      {isCap ? 'Captain' : 'Make Captain'}
                    </button>
                    <button
                      onClick={() => { handleSetViceCaptain(selectedPlayerId); setSelectedPlayerId(null) }}
                      className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${
                        isVC ? 'bg-black text-white border border-white/30' : 'border border-white/40 text-white hover:bg-white/10'
                      }`}
                    >
                      {isVC ? 'Vice Captain' : 'Make Vice Captain'}
                    </button>
                  </div>
                )}
                <p className="rounded-lg border border-white/20 p-1.5 text-center text-[10px] text-white">
                  Tap a same-position player to swap, or tap again to deselect
                </p>
              </div>
            )
          })()}
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Points */}
          <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Total Points</p>
            <p className="mt-1 text-3xl font-bold text-white">{totalPoints}</p>
          </div>

          {/* Starting XI */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Starting XI
            </p>
            <div className="space-y-1.5">
              {starters.map((slot) => (
                <PlayerCard key={slot.id} slot={slot} isSwapTarget={false} />
              ))}
            </div>
          </div>

          {/* Swap Hint */}
          {swapSource && (
            <p className="rounded border border-wc-peach/30 bg-wc-peach/5 p-2 text-center text-xs text-wc-peach">
              Tap a player to swap with
            </p>
          )}

          {/* Bench */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Bench (50% points)
            </p>
            <div className="space-y-1.5">
              {bench.map((slot) => (
                <PlayerCard key={slot.id} slot={slot} isSwapTarget={true} />
              ))}
            </div>
          </div>
        </>
      )}

      {slots.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-text-secondary">No players drafted yet.</p>
          <p className="mt-1 text-sm text-text-muted">
            Complete the draft to build your squad.
          </p>
        </div>
      )}
    </div>
  )
}
