'use client'

import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Player = Tables<'players'>
type Position = 'GK' | 'DEF' | 'MID' | 'ATT'

const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'ATT']

const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  ATT: 'Attackers',
}

const POSITION_COLORS: Record<Position, string> = {
  GK: 'bg-wc-purple/20 text-wc-purple',
  DEF: 'bg-wc-blue/20 text-wc-blue',
  MID: 'bg-wc-gold/20 text-wc-gold',
  ATT: 'bg-wc-crimson/20 text-wc-crimson',
}

const POSITION_ACCENT: Record<Position, string> = {
  GK: 'text-wc-purple',
  DEF: 'text-wc-blue',
  MID: 'text-wc-gold',
  ATT: 'text-wc-crimson',
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
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())

  // Filter players
  const filtered = useMemo(() => {
    const excluded = new Set(excludeIds)
    return players.filter((p) => {
      if (excluded.has(p.id)) return false
      if (p.is_eliminated) return false
      if (selectedPosition && p.position !== selectedPosition) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.nation.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [players, excludeIds, selectedPosition, search])

  // Group by country, then within each country group by position (GK first)
  const countryGroups = useMemo(() => {
    const map = new Map<string, { flag: string | null; players: Map<Position, Player[]> }>()

    for (const p of filtered) {
      if (!map.has(p.nation)) {
        map.set(p.nation, { flag: p.nation_flag_url, players: new Map() })
      }
      const group = map.get(p.nation)!
      const pos = p.position as Position
      if (!group.players.has(pos)) {
        group.players.set(pos, [])
      }
      group.players.get(pos)!.push(p)
    }

    // Sort countries alphabetically
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([nation, data]) => ({ nation, ...data }))
  }, [filtered])

  function toggleCountry(nation: string) {
    setExpandedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(nation)) {
        next.delete(nation)
      } else {
        next.add(nation)
      }
      return next
    })
  }

  // When searching, auto-expand all matching countries
  const isSearching = search.length > 0

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players or nations..."
          className="w-full rounded-lg border border-border bg-bg-card py-2.5 pl-9 pr-8 text-sm text-white placeholder-text-muted focus:border-wc-purple focus:outline-none focus:ring-1 focus:ring-wc-purple"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Position Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPosition(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            !selectedPosition
              ? 'bg-wc-purple text-bg-primary'
              : 'border border-border text-text-secondary hover:border-text-secondary'
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
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedPosition === pos
                ? 'bg-wc-purple text-bg-primary'
                : 'border border-border text-text-secondary hover:border-text-secondary'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-xs text-text-muted">
        {filtered.length} player{filtered.length !== 1 ? 's' : ''} across{' '}
        {countryGroups.length} nation{countryGroups.length !== 1 ? 's' : ''}
      </p>

      {/* Country Groups */}
      <div className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {countryGroups.map((group) => {
          const isOpen = isSearching || expandedCountries.has(group.nation)
          const playerCount = Array.from(group.players.values()).reduce(
            (sum, arr) => sum + arr.length,
            0
          )

          return (
            <div key={group.nation}>
              {/* Country header */}
              <button
                onClick={() => toggleCountry(group.nation)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2.5 text-left card-hover"
              >
                {group.flag && (
                  <img
                    src={group.flag}
                    alt={group.nation}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                )}
                <span className="flex-1 text-sm font-semibold text-white">
                  {group.nation}
                </span>
                <span className="text-xs text-text-muted">{playerCount}</span>
                {isOpen ? (
                  <ChevronDown size={14} className="text-text-muted" />
                ) : (
                  <ChevronRight size={14} className="text-text-muted" />
                )}
              </button>

              {/* Expanded player list grouped by position */}
              {isOpen && (
                <div className="ml-2 border-l border-wc-purple/30 pl-2 pt-1 pb-1 animate-fade-in">
                  {POSITIONS.filter((pos) => group.players.has(pos)).map(
                    (pos) => (
                      <div key={pos} className="mb-2">
                        {/* Position sub-header */}
                        {!selectedPosition && (
                          <p
                            className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${POSITION_ACCENT[pos]}`}
                          >
                            {POSITION_LABELS[pos]}
                          </p>
                        )}
                        {/* Players */}
                        <div className="space-y-0.5">
                          {group.players.get(pos)!.map((player) => (
                            <button
                              key={player.id}
                              onClick={() => onSelect?.(player)}
                              disabled={!onSelect}
                              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                onSelect
                                  ? 'hover:bg-wc-blue/10 cursor-pointer'
                                  : 'cursor-default'
                              }`}
                            >
                              <span className="flex-1 text-sm text-white truncate">
                                {player.name}
                              </span>
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${POSITION_COLORS[pos]}`}
                              >
                                {pos}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}

        {countryGroups.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">
            No players found
          </p>
        )}
      </div>
    </div>
  )
}
