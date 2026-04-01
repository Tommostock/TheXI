'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Player = Tables<'players'>
type Position = 'GK' | 'DEF' | 'MID' | 'ATT'

const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'ATT']

const POSITION_COLORS: Record<Position, string> = {
  GK: 'bg-trophy-gold/20 text-trophy-gold',
  DEF: 'bg-tournament-blue/20 text-tournament-blue',
  MID: 'bg-tournament-green/20 text-tournament-green',
  ATT: 'bg-tournament-red/20 text-tournament-red',
}

export function PlayerBrowser({
  players,
  onSelect,
  excludeIds = [],
  positionFilter,
}: {
  players: Player[]
  onSelect?: (player: Player) => void
  excludeIds?: string[]
  positionFilter?: Position | null
}) {
  const [search, setSearch] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    positionFilter ?? null
  )
  const [selectedNation, setSelectedNation] = useState<string | null>(null)

  const nations = useMemo(() => {
    const set = new Set(players.map((p) => p.nation))
    return Array.from(set).sort()
  }, [players])

  const filtered = useMemo(() => {
    const excluded = new Set(excludeIds)
    return players.filter((p) => {
      if (excluded.has(p.id)) return false
      if (p.is_eliminated) return false
      if (selectedPosition && p.position !== selectedPosition) return false
      if (selectedNation && p.nation !== selectedNation) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.nation.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [players, excludeIds, selectedPosition, selectedNation, search])

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players or nations..."
          className="w-full rounded-md border border-dark-grey bg-deep-navy py-2 pl-9 pr-8 text-sm text-white placeholder-dark-grey focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-grey hover:text-light-grey"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Position Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPosition(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedPosition
              ? 'bg-tournament-green text-white'
              : 'border border-dark-grey text-light-grey hover:border-light-grey'
          }`}
        >
          All
        </button>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() =>
              setSelectedPosition(selectedPosition === pos ? null : pos)
            }
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedPosition === pos
                ? 'bg-tournament-green text-white'
                : 'border border-dark-grey text-light-grey hover:border-light-grey'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Nation Filter */}
      <select
        value={selectedNation || ''}
        onChange={(e) => setSelectedNation(e.target.value || null)}
        className="rounded-md border border-dark-grey bg-deep-navy px-3 py-2 text-sm text-white focus:border-tournament-green focus:outline-none focus:ring-1 focus:ring-tournament-green"
      >
        <option value="">All Nations</option>
        {nations.map((nation) => (
          <option key={nation} value={nation}>
            {nation}
          </option>
        ))}
      </select>

      {/* Results Count */}
      <p className="text-xs text-dark-grey">
        {filtered.length} player{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Player List */}
      <div className="max-h-96 space-y-1 overflow-y-auto scrollbar-hide">
        {filtered.map((player) => (
          <button
            key={player.id}
            onClick={() => onSelect?.(player)}
            disabled={!onSelect}
            className={`flex w-full items-center gap-3 rounded-lg border border-dark-grey bg-deep-navy px-3 py-2.5 text-left transition-colors ${
              onSelect
                ? 'hover:border-tournament-green cursor-pointer'
                : 'cursor-default'
            }`}
          >
            {/* Flag */}
            {player.nation_flag_url && (
              <img
                src={player.nation_flag_url}
                alt={player.nation}
                className="h-5 w-7 rounded-sm object-cover"
                loading="lazy"
              />
            )}

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {player.name}
              </p>
              <p className="text-xs text-light-grey">{player.nation}</p>
            </div>

            {/* Position Badge */}
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${POSITION_COLORS[player.position as Position]}`}
            >
              {player.position}
            </span>
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-dark-grey">
            No players found
          </p>
        )}
      </div>
    </div>
  )
}
