'use client'

import { useState, useEffect } from 'react'
import { Trophy, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { GROUPS, FIXTURES, type Fixture } from '@/lib/tournament/groups'
import { SignOutButton } from '@/components/ui/SignOutButton'

type EventRow = {
  match_id: string
  event_type: string
  minute: number | null
  points_awarded: number
  player: { name: string; nation: string } | null
}

const EVENT_LABELS: Record<string, string> = {
  goal: 'Goal',
  assist: 'Assist',
  clean_sheet: 'Clean Sheet',
  own_goal: 'Own Goal',
  yellow: 'Yellow Card',
  red: 'Red Card',
}

const EVENT_COLORS: Record<string, string> = {
  goal: 'text-wc-teal',
  assist: 'text-wc-teal',
  clean_sheet: 'text-wc-blue',
  own_goal: 'text-wc-crimson',
  yellow: 'text-wc-gold',
  red: 'text-wc-crimson',
}

// Draft countdown target
const DRAFT_DATE = new Date('2026-05-20T19:00:00Z')
const DRAFT_TOTAL_MS = DRAFT_DATE.getTime() - new Date('2026-04-01T00:00:00Z').getTime()

function DraftCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const now = Date.now()
      const diff = DRAFT_DATE.getTime() - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
        setProgress(100)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
      const elapsed = DRAFT_TOTAL_MS - diff
      setProgress(Math.min(100, Math.max(0, (elapsed / DRAFT_TOTAL_MS) * 100)))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const isLive = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0 && timeLeft.secs === 0

  return (
    <div className="rounded-xl border border-wc-cyan/30 bg-wc-cyan/5 p-4 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-wc-cyan mb-3">
        Countdown To Draft Picks
      </p>
      {isLive ? (
        <p className="text-xl font-black text-wc-cyan">Draft Picks Are Live!</p>
      ) : (
        <div className="flex justify-center gap-3">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.mins, label: 'Mins' },
            { value: timeLeft.secs, label: 'Secs' },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <span className="text-2xl font-black text-white tabular-nums w-10 text-center">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-text-muted mt-0.5">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-text-secondary">May 20th, 2026 — 7:00 PM</p>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-wc-cyan/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-wc-cyan transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function FixtureCard({
  fixture,
  events,
}: {
  fixture: Fixture
  events: EventRow[]
}) {
  const [expanded, setExpanded] = useState(false)
  const isFinished = fixture.status === 'finished'

  // Filter to only meaningful events (goals, assists, cards, clean sheets)
  const keyEvents = events.filter(
    (e) => EVENT_LABELS[e.event_type]
  )

  return (
    <div>
      <button
        onClick={() => isFinished && keyEvents.length > 0 && setExpanded(!expanded)}
        className={`relative flex w-full items-center rounded-lg border p-3 text-left transition-colors ${
          isFinished
            ? 'border-border bg-bg-card hover:border-text-muted'
            : 'border-border/50 bg-bg-card/50'
        }`}
      >
        {/* Home */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="text-xs font-semibold text-white text-right truncate">
            {fixture.home}
          </span>
          <img src={fixture.homeFlag} alt="" className="h-4 w-6 rounded-sm object-cover shrink-0" />
        </div>

        {/* Score / Time */}
        <div className="w-16 text-center shrink-0 mx-1">
          {isFinished ? (
            <span className="text-sm font-bold text-white">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <span className="text-[10px] font-medium text-text-muted">
              {fixture.time}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-1.5 flex-1">
          <img src={fixture.awayFlag} alt="" className="h-4 w-6 rounded-sm object-cover shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {fixture.away}
          </span>
        </div>

        {/* Expand indicator — absolute so it doesn't shift layout */}
        {isFinished && keyEvents.length > 0 && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {expanded ? (
              <ChevronDown size={12} className="text-text-muted" />
            ) : (
              <ChevronRight size={12} className="text-text-muted" />
            )}
          </span>
        )}
      </button>

      {/* Match details */}
      {expanded && (
        <div className="mx-2 border-x border-b border-border rounded-b-lg bg-bg-primary px-3 py-2 space-y-1">
          {keyEvents
            .sort((a, b) => (a.minute ?? 99) - (b.minute ?? 99))
            .map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-text-muted w-6 text-right shrink-0">
                  {e.minute ? `${e.minute}'` : ''}
                </span>
                <span className="text-white flex-1 truncate">
                  {e.player?.name || 'Unknown'}
                </span>
                <span className={EVENT_COLORS[e.event_type] || 'text-text-secondary'}>
                  {EVENT_LABELS[e.event_type]}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function GroupTable({ groupName, teams }: { groupName: string; teams: typeof GROUPS['A'] }) {
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.gf - a.ga
    const gdB = b.gf - b.ga
    if (gdB !== gdA) return gdB - gdA
    return b.gf - a.gf
  })

  return (
    <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-bold text-text-secondary">Group {groupName}</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="py-1.5 pl-3 text-left font-medium">Team</th>
            <th className="py-1.5 w-7 text-center font-medium">P</th>
            <th className="py-1.5 w-7 text-center font-medium">W</th>
            <th className="py-1.5 w-7 text-center font-medium">D</th>
            <th className="py-1.5 w-7 text-center font-medium">L</th>
            <th className="py-1.5 w-9 text-center font-medium">GD</th>
            <th className="py-1.5 pr-3 w-8 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr
              key={team.nation}
              className={`border-t border-border/30 ${i < 2 ? 'bg-wc-teal/5' : ''}`}
            >
              <td className="py-1.5 pl-3">
                <div className="flex items-center gap-1.5">
                  <img src={team.flag} alt="" className="h-3 w-4.5 rounded-[1px] object-cover" />
                  <span className="text-white font-medium">{team.nation}</span>
                </div>
              </td>
              <td className="text-center text-text-secondary">{team.played}</td>
              <td className="text-center text-text-secondary">{team.won}</td>
              <td className="text-center text-text-secondary">{team.drawn}</td>
              <td className="text-center text-text-secondary">{team.lost}</td>
              <td className="text-center text-text-secondary">
                {team.gf - team.ga > 0 ? '+' : ''}{team.gf - team.ga}
              </td>
              <td className="pr-3 text-center font-bold text-white">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DashboardClient({
  displayName,
  leaderboard,
  eventsByMatch,
}: {
  displayName: string
  leaderboard: Array<{ displayName: string; points: number; isMe: boolean }>
  eventsByMatch: Record<string, EventRow[]>
}) {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'groups'>('fixtures')

  const finishedFixtures = FIXTURES.filter((f) => f.status === 'finished')
  const upcomingFixtures = FIXTURES.filter((f) => f.status === 'upcoming')

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            THE <span className="text-wc-cyan">XI</span>
          </h1>
          <p className="text-sm text-text-secondary">Welcome, {displayName}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Draft Countdown */}
      <DraftCountdown />

      {/* Standings */}
      {leaderboard.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-wc-gold" />
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Standings
            </p>
          </div>
          <div className="space-y-1.5">
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                  entry.isMe ? 'bg-wc-cyan/10' : ''
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0
                      ? 'bg-wc-gold text-bg-primary'
                      : i === 1
                      ? 'bg-text-secondary text-bg-primary'
                      : i === 2
                      ? 'bg-[#CD7F32] text-bg-primary'
                      : 'bg-text-muted/30 text-text-secondary'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`flex-1 text-sm ${entry.isMe ? 'text-wc-cyan font-semibold' : 'text-white'}`}>
                  {entry.displayName}
                </span>
                <span className="text-sm font-bold text-white">{entry.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Centre Tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${
            activeTab === 'fixtures'
              ? 'bg-wc-cyan text-bg-primary'
              : 'bg-bg-card text-text-secondary'
          }`}
        >
          Fixtures
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${
            activeTab === 'groups'
              ? 'bg-wc-cyan text-bg-primary'
              : 'bg-bg-card text-text-secondary'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="flex flex-col gap-3">
          {/* Results */}
          {finishedFixtures.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Results
              </p>
              <div className="space-y-1.5">
                {finishedFixtures.map((f) => (
                  <FixtureCard
                    key={f.id}
                    fixture={f}
                    events={eventsByMatch[f.id] || []}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingFixtures.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Upcoming
              </p>
              <div className="space-y-1.5">
                {upcomingFixtures.map((f) => (
                  <FixtureCard
                    key={f.id}
                    fixture={f}
                    events={[]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="flex flex-col gap-3">
          {Object.entries(GROUPS).map(([name, teams]) => (
            <GroupTable key={name} groupName={name} teams={teams} />
          ))}
        </div>
      )}
    </div>
  )
}
