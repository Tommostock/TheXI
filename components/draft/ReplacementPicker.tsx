'use client'

import { useState } from 'react'
import { PlayerBrowser } from './PlayerBrowser'
import { makeReplacementPick } from '@/lib/draft/windows'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Player = Tables<'players'>

type EliminatedSlot = {
  slotId: string
  player: {
    id: string
    name: string
    nation: string
    nation_flag_url: string | null
    position: string
  }
}

export function ReplacementPicker({
  leagueId,
  windowType,
  eliminatedSlots,
  allPlayers,
  draftedPlayerIds,
}: {
  leagueId: string
  windowType: string
  eliminatedSlots: EliminatedSlot[]
  allPlayers: Player[]
  draftedPlayerIds: string[]
}) {
  const [replacingSlot, setReplacingSlot] = useState<EliminatedSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  async function handleReplacement(newPlayer: Player) {
    if (!replacingSlot || loading) return
    setError('')
    setLoading(true)

    const result = await makeReplacementPick(
      leagueId,
      replacingSlot.player.id,
      newPlayer.id,
      windowType as Parameters<typeof makeReplacementPick>[3]
    )

    if (result.error) {
      setError(result.error)
    } else {
      setCompleted((prev) => new Set([...prev, replacingSlot.slotId]))
      setReplacingSlot(null)
    }
    setLoading(false)
  }

  const remaining = eliminatedSlots.filter((s) => !completed.has(s.slotId))

  if (remaining.length === 0 && eliminatedSlots.length > 0) {
    return (
      <div className="rounded-lg border border-tournament-green/30 bg-tournament-green/10 p-4 text-center">
        <p className="font-medium text-tournament-green">
          All replacements confirmed
        </p>
      </div>
    )
  }

  if (eliminatedSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dark-grey bg-deep-navy p-4 text-center">
        <p className="text-light-grey">No eliminated players in your squad</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-tournament-red">
        <AlertTriangle size={16} />
        <p className="text-sm font-medium">
          {remaining.length} eliminated player{remaining.length !== 1 ? 's' : ''} to replace
        </p>
      </div>

      {error && (
        <p className="text-sm text-tournament-red">{error}</p>
      )}

      {/* Eliminated players list */}
      {!replacingSlot && (
        <div className="space-y-2">
          {remaining.map((slot) => (
            <button
              key={slot.slotId}
              onClick={() => setReplacingSlot(slot)}
              className="flex w-full items-center gap-3 rounded-lg border border-tournament-red/30 bg-tournament-red/5 p-3 text-left transition-colors hover:border-tournament-red/50"
            >
              {slot.player.nation_flag_url && (
                <img
                  src={slot.player.nation_flag_url}
                  alt={slot.player.nation}
                  className="h-5 w-7 rounded-sm object-cover opacity-50"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white line-through opacity-60">
                  {slot.player.name}
                </p>
                <p className="text-xs text-tournament-red">Eliminated</p>
              </div>
              <ArrowRight size={16} className="text-light-grey" />
            </button>
          ))}
        </div>
      )}

      {/* Replacement browser */}
      {replacingSlot && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-white">
              Replace <span className="line-through opacity-60">{replacingSlot.player.name}</span>{' '}
              <span className="text-light-grey">({replacingSlot.player.position})</span>
            </p>
            <button
              onClick={() => setReplacingSlot(null)}
              className="text-xs text-light-grey hover:text-white"
            >
              Cancel
            </button>
          </div>
          <PlayerBrowser
            players={allPlayers.filter(
              (p) => p.position === replacingSlot.player.position
            )}
            excludeIds={draftedPlayerIds}
            onSelect={handleReplacement}
            positionFilter={replacingSlot.player.position as 'GK' | 'DEF' | 'MID' | 'ATT'}
          />
          {loading && (
            <p className="mt-2 text-center text-sm text-light-grey">
              Confirming replacement...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
