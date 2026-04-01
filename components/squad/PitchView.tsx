'use client'

import type { Tables } from '@/types/database.types'

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

/**
 * Formation row layouts: each formation defines rows from back (GK) to front (ATT).
 * Each row specifies the position type and count.
 */
const FORMATION_ROWS: Record<Formation, Array<{ position: string; count: number }>> = {
  '4-3-3': [
    { position: 'GK', count: 1 },
    { position: 'DEF', count: 4 },
    { position: 'MID', count: 3 },
    { position: 'ATT', count: 3 },
  ],
  '4-4-2': [
    { position: 'GK', count: 1 },
    { position: 'DEF', count: 4 },
    { position: 'MID', count: 4 },
    { position: 'ATT', count: 2 },
  ],
  '4-5-1': [
    { position: 'GK', count: 1 },
    { position: 'DEF', count: 4 },
    { position: 'MID', count: 5 },
    { position: 'ATT', count: 1 },
  ],
}

const POS_SHIRT: Record<string, string> = {
  GK: '#FFD100',   // wc-gold
  DEF: '#0054A0',  // wc-blue
  MID: '#006B3F',  // wc-teal
  ATT: '#B5121B',  // wc-crimson
}

function PlayerShirt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 44" width="40" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shirt body */}
      <path
        d="M8 14 L4 10 L0 14 L0 20 L8 18 L8 42 L32 42 L32 18 L40 20 L40 14 L36 10 L32 14 L28 8 L12 8 L8 14Z"
        fill={color}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      {/* Collar */}
      <path
        d="M16 8 L20 12 L24 8"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      {/* Sleeves highlight */}
      <path
        d="M8 14 L4 10 L0 14 L0 20 L8 18Z"
        fill={color}
        opacity="0.8"
      />
      <path
        d="M32 14 L36 10 L40 14 L40 20 L32 18Z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  )
}

function PitchPlayer({
  slot,
  points,
}: {
  slot: SquadSlot
  points?: number
}) {
  const player = slot.player
  if (!player) return null

  const shirtColor = POS_SHIRT[player.position] || POS_SHIRT.MID
  // Get last name, or full name if single word
  const displayName = player.name.includes(' ')
    ? player.name.split(' ').pop()!
    : player.name

  // Truncate to 10 chars
  const truncatedName = displayName.length > 10
    ? displayName.substring(0, 9) + '.'
    : displayName

  return (
    <div className="flex flex-col items-center gap-0.5 w-[70px]">
      {/* Shirt icon */}
      <div className="relative">
        <PlayerShirt color={shirtColor} />
        {player.is_eliminated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-wc-crimson/80 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">X</span>
            </div>
          </div>
        )}
      </div>

      {/* Player name badge */}
      <div className="rounded bg-bg-card/90 px-1.5 py-0.5 text-center w-full">
        <p className="text-[10px] font-medium text-white leading-tight truncate">
          {truncatedName}
        </p>
      </div>

      {/* Points (if available) */}
      {points !== undefined && (
        <div className={`rounded px-1.5 py-0 text-center ${
          points > 0 ? 'bg-wc-teal' : points < 0 ? 'bg-wc-crimson' : 'bg-text-muted'
        }`}>
          <p className="text-[9px] font-bold text-white">{points}</p>
        </div>
      )}
    </div>
  )
}

export function PitchView({
  formation,
  slots,
  totalPoints,
}: {
  formation: Formation
  slots: SquadSlot[]
  totalPoints: number
}) {
  const rows = FORMATION_ROWS[formation] || FORMATION_ROWS['4-4-2']
  const starters = slots.filter((s) => s.is_starting)
  const bench = slots.filter((s) => !s.is_starting)

  // Group starters by position
  const byPosition: Record<string, SquadSlot[]> = { GK: [], DEF: [], MID: [], ATT: [] }
  for (const slot of starters) {
    const pos = slot.player?.position || slot.position
    if (byPosition[pos]) {
      byPosition[pos].push(slot)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Points header */}
      <div className="rounded-xl border border-border bg-bg-card p-3 text-center">
        <p className="text-xs uppercase tracking-wider text-text-secondary">Total Points</p>
        <p className="text-3xl font-bold text-wc-gold">{totalPoints}</p>
      </div>

      {/* Pitch */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Pitch background */}
        <div className="relative bg-[#1a6e34]">
          {/* Pitch markings */}
          <div className="absolute inset-0">
            {/* Outer border */}
            <div className="absolute inset-2 border-2 border-white/20 rounded" />
            {/* Centre line */}
            <div className="absolute left-2 right-2 top-1/2 border-t-2 border-white/20" />
            {/* Centre circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-white/20" />
            {/* Centre dot */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/20" />
            {/* Top penalty box */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-t-0 border-white/20" />
            {/* Top goal box */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-t-0 border-white/20" />
            {/* Bottom penalty box */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-b-0 border-white/20" />
            {/* Bottom goal box */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-b-0 border-white/20" />
          </div>

          {/* Players on pitch — rows from ATT (top) to GK (bottom) */}
          <div className="relative z-10 flex flex-col gap-2 py-4 px-2">
            {[...rows].reverse().map((row, rowIdx) => {
              const positionSlots = byPosition[row.position] || []
              // Take the number needed for this row
              const rowSlots = positionSlots.slice(0, row.count)

              return (
                <div
                  key={`${row.position}-${rowIdx}`}
                  className="flex items-center justify-center gap-1"
                  style={{
                    paddingTop: rowIdx === 0 ? '8px' : '4px',
                    paddingBottom: rowIdx === rows.length - 1 ? '8px' : '4px',
                  }}
                >
                  {rowSlots.map((slot) => (
                    <PitchPlayer key={slot.id} slot={slot} />
                  ))}
                  {/* Fill empty slots if not enough players */}
                  {Array.from({ length: Math.max(0, row.count - rowSlots.length) }).map((_, i) => (
                    <div key={`empty-${rowIdx}-${i}`} className="w-[70px] h-[60px] flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full border-2 border-dashed border-white/20" />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bench / Substitutes */}
      {bench.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            Substitutes
          </p>
          <div className="rounded-xl border border-border bg-bg-card p-3">
            <div className="flex items-center justify-center gap-2">
              {bench
                .sort((a, b) => {
                  const order = ['GK', 'DEF', 'MID', 'ATT']
                  return order.indexOf(a.position) - order.indexOf(b.position)
                })
                .map((slot) => (
                  <PitchPlayer key={slot.id} slot={slot} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
