'use client'

import { GROUPS } from '@/lib/tournament/groups'

type KnockoutTeam = {
  nation: string
  flag: string
} | null

type KnockoutMatch = {
  id: string
  home: KnockoutTeam
  away: KnockoutTeam
  homeScore: number | null
  awayScore: number | null
  status: 'pending' | 'upcoming' | 'finished'
}

/**
 * Auto-populate Round of 32 from group standings.
 * Top 2 from each group qualify automatically.
 * 8 best 3rd-place teams also qualify.
 * For now, slots show TBC until groups are complete.
 */
function getGroupWinners(): Map<string, { first: KnockoutTeam; second: KnockoutTeam; third: KnockoutTeam }> {
  const results = new Map<string, { first: KnockoutTeam; second: KnockoutTeam; third: KnockoutTeam }>()

  for (const [groupName, teams] of Object.entries(GROUPS)) {
    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = a.gf - a.ga
      const gdB = b.gf - b.ga
      if (gdB !== gdA) return gdB - gdA
      return b.gf - a.gf
    })

    // Only populate if at least some matches have been played
    const anyPlayed = sorted.some((t) => t.played > 0)
    const allPlayed = sorted.every((t) => t.played >= 3)

    results.set(groupName, {
      first: anyPlayed ? { nation: sorted[0].nation, flag: sorted[0].flag } : null,
      second: anyPlayed ? { nation: sorted[1].nation, flag: sorted[1].flag } : null,
      third: anyPlayed ? { nation: sorted[2].nation, flag: sorted[2].flag } : null,
    })
  }

  return results
}

function MatchSlot({ match, label }: { match: KnockoutMatch; label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
      {label && (
        <div className="px-2 py-1 border-b border-border/50">
          <p className="text-[9px] text-text-muted text-center">{label}</p>
        </div>
      )}
      <div className="flex flex-col">
        {/* Home */}
        <div className={`flex items-center gap-1.5 px-2 py-1.5 ${
          match.status === 'finished' && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore
            ? 'bg-wc-blue/10' : ''
        }`}>
          {match.home ? (
            <>
              <img src={match.home.flag} alt="" className="h-3 w-4.5 rounded-[1px] object-cover" />
              <span className="text-[10px] text-white flex-1 truncate">{match.home.nation}</span>
            </>
          ) : (
            <span className="text-[10px] text-text-muted flex-1">TBC</span>
          )}
          {match.status === 'finished' && (
            <span className="text-[10px] font-bold text-white">{match.homeScore}</span>
          )}
        </div>
        {/* Divider */}
        <div className="border-t border-border/30" />
        {/* Away */}
        <div className={`flex items-center gap-1.5 px-2 py-1.5 ${
          match.status === 'finished' && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore
            ? 'bg-wc-blue/10' : ''
        }`}>
          {match.away ? (
            <>
              <img src={match.away.flag} alt="" className="h-3 w-4.5 rounded-[1px] object-cover" />
              <span className="text-[10px] text-white flex-1 truncate">{match.away.nation}</span>
            </>
          ) : (
            <span className="text-[10px] text-text-muted flex-1">TBC</span>
          )}
          {match.status === 'finished' && (
            <span className="text-[10px] font-bold text-white">{match.awayScore}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function BracketRound({ title, matches }: { title: string; matches: KnockoutMatch[] }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center">
        {title}
      </p>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchSlot key={m.id} match={m} />
        ))}
      </div>
    </div>
  )
}

export function KnockoutBracket() {
  const winners = getGroupWinners()

  // Round of 32: 1st in group vs 2nd/3rd from other groups
  // Simplified bracket pairing for display
  const groupNames = Object.keys(GROUPS)

  const r32Matches: KnockoutMatch[] = [
    // Top half
    { id: 'R32-1', home: winners.get('A')?.first || null, away: winners.get('B')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-2', home: winners.get('C')?.first || null, away: winners.get('D')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-3', home: winners.get('E')?.first || null, away: winners.get('F')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-4', home: winners.get('G')?.first || null, away: winners.get('H')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-5', home: winners.get('I')?.first || null, away: winners.get('J')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-6', home: winners.get('K')?.first || null, away: winners.get('L')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-7', home: winners.get('B')?.first || null, away: winners.get('A')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-8', home: winners.get('D')?.first || null, away: winners.get('C')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    // Bottom half
    { id: 'R32-9', home: winners.get('F')?.first || null, away: winners.get('E')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-10', home: winners.get('H')?.first || null, away: winners.get('G')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-11', home: winners.get('J')?.first || null, away: winners.get('I')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-12', home: winners.get('L')?.first || null, away: winners.get('K')?.second || null, homeScore: null, awayScore: null, status: 'pending' },
    // 3rd place qualifiers (8 matches)
    { id: 'R32-13', home: null, away: null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-14', home: null, away: null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-15', home: null, away: null, homeScore: null, awayScore: null, status: 'pending' },
    { id: 'R32-16', home: null, away: null, homeScore: null, awayScore: null, status: 'pending' },
  ]

  // R16, QF, SF, Final — all TBC
  const r16Matches: KnockoutMatch[] = Array.from({ length: 8 }, (_, i) => ({
    id: `R16-${i + 1}`, home: null, away: null, homeScore: null, awayScore: null, status: 'pending' as const,
  }))

  const qfMatches: KnockoutMatch[] = Array.from({ length: 4 }, (_, i) => ({
    id: `QF-${i + 1}`, home: null, away: null, homeScore: null, awayScore: null, status: 'pending' as const,
  }))

  const sfMatches: KnockoutMatch[] = Array.from({ length: 2 }, (_, i) => ({
    id: `SF-${i + 1}`, home: null, away: null, homeScore: null, awayScore: null, status: 'pending' as const,
  }))

  const finalMatch: KnockoutMatch[] = [{
    id: 'FINAL', home: null, away: null, homeScore: null, awayScore: null, status: 'pending',
  }]

  return (
    <div className="flex flex-col gap-4">
      <BracketRound title="Round of 32" matches={r32Matches} />
      <BracketRound title="Round of 16" matches={r16Matches} />
      <BracketRound title="Quarter-Finals" matches={qfMatches} />
      <BracketRound title="Semi-Finals" matches={sfMatches} />

      {/* Final */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-wc-gold text-center">
          Final
        </p>
        <div className="mx-auto max-w-[200px]">
          <MatchSlot match={finalMatch[0]} />
        </div>
      </div>
    </div>
  )
}
