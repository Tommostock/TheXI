'use client'

import { useState, useEffect } from 'react'
import { Trophy, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { GROUPS, FIXTURES, type Fixture } from '@/lib/tournament/groups'
import { SignOutButton } from '@/components/ui/SignOutButton'
import { HowToPlayButton } from './HowToPlay'
import { KnockoutBracket } from './KnockoutBracket'

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
  goal: 'text-wc-peach',
  assist: 'text-wc-peach',
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
    <div className="rounded-xl border border-wc-purple/30 bg-wc-purple/5 p-5 text-center animate-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wc-purple mb-4">
        Countdown To Draft Picks
      </p>
      {isLive ? (
        <p className="text-xl font-black text-wc-purple animate-pulse-glow">Draft Picks Are Live!</p>
      ) : (
        <div className="flex justify-center gap-2.5">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hrs' },
            { value: timeLeft.mins, label: 'Min' },
            { value: timeLeft.secs, label: 'Sec' },
          ].map((unit, i) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-lg border border-wc-purple/30 bg-bg-card ${
                i === 3 ? 'animate-count-pulse' : ''
              }`}>
                <span className="text-2xl font-black text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mt-1.5">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-[10px] text-text-secondary">May 20th, 2026 — 7:00 PM</p>
      <div className="mt-2.5 h-1 w-full rounded-full bg-wc-purple/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-wc-purple transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function FixtureGroup({
  fixtures,
  eventsByMatch,
}: {
  fixtures: Fixture[]
  eventsByMatch: Record<string, EventRow[]>
}) {
  // Group by date
  const byDate = new Map<string, Fixture[]>()
  for (const fx of fixtures) {
    if (!byDate.has(fx.date)) byDate.set(fx.date, [])
    byDate.get(fx.date)!.push(fx)
  }

  return (
    <div className="space-y-4">
      {Array.from(byDate.entries()).map(([date, dateFx]) => (
        <div key={date} className="animate-fade-in">
          <div className="section-accent mb-2">
            <p className="text-xs font-semibold text-text-secondary">
              {date}
            </p>
          </div>
          <div className="space-y-1.5 stagger-children">
            {dateFx.map((fx) => (
              <FixtureCard key={fx.id} fixture={fx} events={eventsByMatch[fx.id] || []} />
            ))}
          </div>
        </div>
      ))}
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
        className={`relative flex w-full flex-col rounded-lg border px-3 py-2.5 text-left card-hover ${
          isFinished
            ? 'border-border bg-bg-card'
            : 'border-border/50 bg-bg-card/50'
        }`}
      >
        {/* Teams row */}
        <div className="flex w-full items-center">
          {/* Home */}
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <span className={`text-right truncate ${fixture.homeFlag ? 'text-xs font-semibold text-white' : 'text-[9px] text-text-secondary'}`}>
              {fixture.home}
            </span>
            {fixture.homeFlag && (
              <img src={fixture.homeFlag} alt="" className="h-4 w-6 rounded-sm object-cover shrink-0" />
            )}
          </div>

          {/* Score / Time */}
          <div className="w-16 text-center shrink-0 mx-1">
            {isFinished ? (
              <span className="text-sm font-bold text-white">
                {fixture.homeScore} - {fixture.awayScore}
              </span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-medium text-text-secondary">
                  {fixture.time}
                </span>
                <span className="text-[8px] text-text-muted">BST</span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-1.5 flex-1">
            {fixture.awayFlag && (
              <img src={fixture.awayFlag} alt="" className="h-4 w-6 rounded-sm object-cover shrink-0" />
            )}
            <span className={`truncate ${fixture.awayFlag ? 'text-xs font-semibold text-white' : 'text-[9px] text-text-secondary'}`}>
              {fixture.away}
            </span>
          </div>
        </div>

        {/* Venue line */}
        <p className="mt-1.5 text-center text-[9px] text-text-muted w-full flex items-center justify-center gap-1">
          <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" className="opacity-50"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.4c-3.5 0-6.4-2.9-6.4-6.4S4.5 1.6 8 1.6s6.4 2.9 6.4 6.4-2.9 6.4-6.4 6.4zM4 6h8v1H4zm-1 3h10v1H3z"/></svg>
          {fixture.venue}
        </p>

        {/* Expand indicator */}
        {isFinished && keyEvents.length > 0 && (
          <span className="absolute right-2 top-3">
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
              className={`border-t border-border/30 ${i < 2 ? 'bg-wc-peach/5' : ''}`}
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
  const [activeTab, setActiveTab] = useState<'fixtures' | 'groups' | 'knockouts'>('fixtures')

  const groupStages = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const knockoutStages = ['R32','R16','QF','SF','3RD','FINAL']

  const finishedFixtures = FIXTURES.filter((fx) => fx.status === 'finished')
  const upcomingGroupFixtures = FIXTURES.filter((fx) => fx.status === 'upcoming' && groupStages.includes(fx.group))
  const upcomingKnockoutFixtures = FIXTURES.filter((fx) => fx.status === 'upcoming' && knockoutStages.includes(fx.group))

  const ROUND_LABELS: Record<string, string> = {
    R32: 'Round of 32',
    R16: 'Round of 16',
    QF: 'Quarter-Final',
    SF: 'Semi-Final',
    '3RD': 'Third Place Playoff',
    FINAL: 'Final',
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white">
            THE <span className="text-wc-purple">XI</span>
          </h1>
          <p className="text-xs text-wc-peach">World Cup 2026 Draft</p>
          <p className="text-sm text-text-secondary mt-0.5">Welcome, {displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <HowToPlayButton />
          <SignOutButton />
        </div>
      </div>

      {/* Draft Countdown */}
      <DraftCountdown />

      {/* Standings */}
      {leaderboard.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-4 animate-fade-in-up">
          <div className="section-accent flex items-center gap-2 mb-3">
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
                  entry.isMe ? 'bg-wc-peach/10' : ''
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
                <span className={`flex-1 text-sm ${entry.isMe ? 'text-wc-peach font-semibold' : 'text-white'}`}>
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
        {(['fixtures', 'knockouts', 'groups'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-wc-purple text-white'
                : 'bg-bg-card text-text-secondary'
            }`}
          >
            {tab === 'fixtures' ? 'Fixtures' : tab === 'groups' ? 'Groups' : 'Knockouts'}
          </button>
        ))}
      </div>

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="flex flex-col gap-4">
          {/* Results */}
          {finishedFixtures.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Results
              </p>
              <FixtureGroup fixtures={finishedFixtures} eventsByMatch={eventsByMatch} />
            </div>
          )}

          {/* Upcoming Group Stage */}
          {upcomingGroupFixtures.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Group Stage
              </p>
              <FixtureGroup fixtures={upcomingGroupFixtures} eventsByMatch={eventsByMatch} />
            </div>
          )}

          {/* Upcoming Knockouts */}
          {upcomingKnockoutFixtures.length > 0 && (
            <div>
              {Object.entries(
                upcomingKnockoutFixtures.reduce((acc, fx) => {
                  const label = ROUND_LABELS[fx.group] || fx.group
                  if (!acc[label]) acc[label] = []
                  acc[label].push(fx)
                  return acc
                }, {} as Record<string, Fixture[]>)
              ).map(([roundLabel, roundFx]) => (
                <div key={roundLabel} className="mb-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-wc-blue">
                    {roundLabel}
                  </p>
                  <FixtureGroup fixtures={roundFx} eventsByMatch={eventsByMatch} />
                </div>
              ))}
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

      {/* Knockouts Tab */}
      {activeTab === 'knockouts' && (
        <div className="flex flex-col gap-3">
          {Object.entries(
            upcomingKnockoutFixtures.reduce((acc, fx) => {
              const label = ROUND_LABELS[fx.group] || fx.group
              if (!acc[label]) acc[label] = []
              acc[label].push(fx)
              return acc
            }, {} as Record<string, Fixture[]>)
          ).map(([roundLabel, roundFx]) => (
            <div key={roundLabel}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-wc-blue">
                {roundLabel}
              </p>
              <FixtureGroup fixtures={roundFx} eventsByMatch={eventsByMatch} />
            </div>
          ))}
          {upcomingKnockoutFixtures.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              Knockout fixtures will appear once the group stage is complete.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
