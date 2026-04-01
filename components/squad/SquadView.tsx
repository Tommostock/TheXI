'use client'

import { useState, useMemo } from 'react'
import { changeFormation, toggleStarting } from '@/lib/squad/actions'
import { PitchView } from './PitchView'
import { ArrowUpDown } from 'lucide-react'

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

const POS_COLORS: Record<string, string> = {
  GK: 'border-wc-gold/40 bg-wc-gold/10',
  DEF: 'border-wc-blue/40 bg-wc-blue/10',
  MID: 'border-wc-teal/40 bg-wc-teal/10',
  ATT: 'border-wc-crimson/40 bg-wc-crimson/10',
}

const POS_TEXT: Record<string, string> = {
  GK: 'text-wc-gold',
  DEF: 'text-wc-blue',
  MID: 'text-wc-teal',
  ATT: 'text-wc-crimson',
}

export function SquadView({
  leagueId,
  formation: initialFormation,
  slots: initialSlots,
  totalPoints,
}: {
  leagueId: string
  formation: Formation
  slots: SquadSlot[]
  totalPoints: number
}) {
  const [formation, setFormation] = useState<Formation>(initialFormation)
  const [slots, setSlots] = useState<SquadSlot[]>(initialSlots)
  const [loading, setLoading] = useState(false)
  const [swapSource, setSwapSource] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('pitch')

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

  async function handleFormationChange(newFormation: Formation) {
    if (newFormation === formation || loading) return
    setLoading(true)
    const result = await changeFormation(leagueId, newFormation)
    if (!result.error) {
      setFormation(newFormation)
      window.location.reload()
    }
    setLoading(false)
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
    setLoading(true)
    const result = await toggleStarting(leagueId, swapSource, slotId)
    if (!result.error) {
      setSlots((prev) =>
        prev.map((s) => {
          if (s.id === swapSource || s.id === slotId) {
            return { ...s, is_starting: !s.is_starting }
          }
          return s
        })
      )
    }
    setSwapSource(null)
    setLoading(false)
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
            ? 'border-wc-teal bg-wc-teal/10'
            : isSwapTarget && swapSource
            ? 'border-dashed border-wc-teal/50 hover:border-wc-teal'
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
          <ArrowUpDown size={14} className="shrink-0 text-wc-teal" />
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* View Mode Toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setViewMode('pitch')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${
            viewMode === 'pitch'
              ? 'bg-wc-lime text-bg-primary'
              : 'bg-bg-card text-text-secondary'
          }`}
        >
          Pitch View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${
            viewMode === 'list'
              ? 'bg-wc-lime text-bg-primary'
              : 'bg-bg-card text-text-secondary'
          }`}
        >
          List View
        </button>
      </div>

      {/* Formation Selector */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
          Formation
        </p>
        <div className="flex gap-2">
          {FORMATIONS.map((f) => (
            <button
              key={f}
              onClick={() => handleFormationChange(f)}
              disabled={loading}
              className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-bold transition-colors ${
                formation === f
                  ? 'border-wc-teal bg-wc-teal/10 text-wc-teal'
                  : 'border-border text-text-secondary hover:border-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pitch View */}
      {viewMode === 'pitch' && (
        <PitchView
          formation={formation}
          slots={slots as Parameters<typeof PitchView>[0]['slots']}
          totalPoints={totalPoints}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Points */}
          <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Total Points</p>
            <p className="mt-1 text-3xl font-bold text-wc-gold">{totalPoints}</p>
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
            <p className="rounded border border-wc-teal/30 bg-wc-teal/5 p-2 text-center text-xs text-wc-teal">
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
