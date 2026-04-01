'use client'

import { getNextOpponent } from '@/lib/tournament/schedule'

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
  GK: '#5B2C86',
  DEF: '#0054A0',
  MID: '#FFD100',
  ATT: '#B5121B',
}

function PlayerShirt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 44" width="36" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14 L4 10 L0 14 L0 20 L8 18 L8 42 L32 42 L32 18 L40 20 L40 14 L36 10 L32 14 L28 8 L12 8 L8 14Z"
        fill={color}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      <path d="M16 8 L20 12 L24 8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  )
}

function PitchPlayer({
  slot,
  points,
}: {
  slot: SquadSlot
  points: number
}) {
  const player = slot.player
  if (!player) return null

  const shirtColor = POS_SHIRT[player.position] || POS_SHIRT.MID

  // Last name for display
  const displayName = player.name.includes(' ')
    ? player.name.split(' ').pop()!
    : player.name
  const truncatedName = displayName.length > 10
    ? displayName.substring(0, 9) + '.'
    : displayName

  const nextOpp = getNextOpponent(player.nation)

  return (
    <div className="flex flex-col items-center w-[72px]">
      {/* Shirt */}
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

      {/* Info card below shirt */}
      <div className="rounded-md bg-bg-card/95 w-full px-1 py-1 text-center -mt-0.5">
        {/* Name */}
        <p className="text-[10px] font-semibold text-white leading-tight truncate">
          {truncatedName}
        </p>
        {/* Flag + next opponent row */}
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {player.nation_flag_url && (
            <img
              src={player.nation_flag_url}
              alt={player.nation}
              className="h-2.5 w-4 rounded-[1px] object-cover"
            />
          )}
          {nextOpp && (
            <span className="text-[8px] text-text-secondary font-medium">
              {nextOpp}
            </span>
          )}
        </div>
      </div>

      {/* Points pill */}
      <div
        className={`rounded-b-md w-full text-center py-0.5 -mt-px ${
          points > 0
            ? 'bg-wc-teal'
            : points < 0
            ? 'bg-wc-crimson'
            : 'bg-text-muted/60'
        }`}
      >
        <p className="text-[9px] font-bold text-white">{points}</p>
      </div>
    </div>
  )
}

function BenchPlayer({
  slot,
  points,
}: {
  slot: SquadSlot
  points: number
}) {
  const player = slot.player
  if (!player) return null

  const shirtColor = POS_SHIRT[player.position] || POS_SHIRT.MID

  const displayName = player.name.includes(' ')
    ? player.name.split(' ').pop()!
    : player.name
  const truncatedName = displayName.length > 9
    ? displayName.substring(0, 8) + '.'
    : displayName

  const nextOpp = getNextOpponent(player.nation)

  return (
    <div className="flex flex-col items-center w-[68px]">
      <PlayerShirt color={shirtColor} />
      <div className="rounded-md bg-bg-primary/90 w-full px-1 py-1 text-center -mt-0.5">
        <p className="text-[9px] font-semibold text-white leading-tight truncate">
          {truncatedName}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {player.nation_flag_url && (
            <img
              src={player.nation_flag_url}
              alt={player.nation}
              className="h-2.5 w-4 rounded-[1px] object-cover"
            />
          )}
          {nextOpp && (
            <span className="text-[8px] text-text-muted font-medium">
              {nextOpp}
            </span>
          )}
        </div>
      </div>
      <div
        className={`rounded-b-md w-full text-center py-0.5 -mt-px ${
          points > 0
            ? 'bg-wc-teal/70'
            : points < 0
            ? 'bg-wc-crimson/70'
            : 'bg-text-muted/40'
        }`}
      >
        <p className="text-[9px] font-bold text-white">{points}</p>
      </div>
    </div>
  )
}

export function PitchView({
  formation,
  slots,
  totalPoints,
  playerPoints = {},
}: {
  formation: Formation
  slots: SquadSlot[]
  totalPoints: number
  playerPoints?: Record<string, number>
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
        <div className="relative bg-[#1a6e34]">
          {/* Pitch markings */}
          <div className="absolute inset-0">
            <div className="absolute inset-2 border-2 border-white/20 rounded" />
            <div className="absolute left-2 right-2 top-1/2 border-t-2 border-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/20" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-t-0 border-white/20" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-t-0 border-white/20" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-b-0 border-white/20" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-b-0 border-white/20" />
          </div>

          {/* Players — rows from ATT (top) to GK (bottom) */}
          <div className="relative z-10 flex flex-col gap-1 py-3 px-1">
            {[...rows].reverse().map((row, rowIdx) => {
              const positionSlots = byPosition[row.position] || []
              const rowSlots = positionSlots.slice(0, row.count)

              return (
                <div
                  key={`${row.position}-${rowIdx}`}
                  className="flex items-start justify-center gap-0.5"
                  style={{
                    paddingTop: rowIdx === 0 ? '6px' : '2px',
                    paddingBottom: rowIdx === rows.length - 1 ? '6px' : '2px',
                  }}
                >
                  {rowSlots.map((slot) => (
                    <PitchPlayer
                      key={slot.id}
                      slot={slot}
                      points={playerPoints[slot.player?.id || ''] ?? 0}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, row.count - rowSlots.length) }).map((_, i) => (
                    <div key={`empty-${rowIdx}-${i}`} className="w-[72px] h-[70px] flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full border-2 border-dashed border-white/20" />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Substitutes */}
      {bench.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            Substitutes
          </p>
          <div className="rounded-xl border border-border bg-bg-card p-3">
            <div className="flex items-start justify-center gap-1">
              {bench
                .sort((a, b) => {
                  const order = ['GK', 'DEF', 'MID', 'ATT']
                  return order.indexOf(a.position) - order.indexOf(b.position)
                })
                .map((slot) => (
                  <BenchPlayer
                    key={slot.id}
                    slot={slot}
                    points={playerPoints[slot.player?.id || ''] ?? 0}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
