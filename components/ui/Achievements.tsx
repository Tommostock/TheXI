'use client'

import { Trophy, Flame, Shield, Star, Target, Crown, Zap, Medal } from 'lucide-react'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: typeof Trophy
  color: string
  earned: boolean
}

export function getAchievements(stats: {
  totalPoints: number
  matchesPlayed: number
  goals: number
  cleanSheets: number
  rank: number
  totalUsers: number
  captainPoints: number
}): Achievement[] {
  return [
    {
      id: 'first-100',
      name: 'Century',
      description: 'Reach 100 total points',
      icon: Trophy,
      color: 'text-wc-gold',
      earned: stats.totalPoints >= 100,
    },
    {
      id: 'first-50',
      name: 'Half Century',
      description: 'Reach 50 total points',
      icon: Medal,
      color: 'text-wc-peach',
      earned: stats.totalPoints >= 50,
    },
    {
      id: 'top-scorer',
      name: 'Top of the League',
      description: 'Hold 1st place in the standings',
      icon: Crown,
      color: 'text-wc-gold',
      earned: stats.rank === 1,
    },
    {
      id: 'goal-machine',
      name: 'Goal Machine',
      description: 'Your players score 5+ goals',
      icon: Target,
      color: 'text-wc-crimson',
      earned: stats.goals >= 5,
    },
    {
      id: 'captain-fantastic',
      name: 'Captain Fantastic',
      description: 'Captain scores 10+ points in a match',
      icon: Star,
      color: 'text-wc-purple',
      earned: stats.captainPoints >= 10,
    },
    {
      id: 'clean-sheet-king',
      name: 'Clean Sheet King',
      description: 'Earn 3+ clean sheets',
      icon: Shield,
      color: 'text-wc-blue',
      earned: stats.cleanSheets >= 3,
    },
    {
      id: 'on-fire',
      name: 'On Fire',
      description: 'Score 20+ points in a single matchday',
      icon: Flame,
      color: 'text-wc-peach',
      earned: false, // Would need matchday tracking
    },
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Make all draft picks within 30 minutes',
      icon: Zap,
      color: 'text-wc-cyan',
      earned: false, // Would need draft timing tracking
    },
  ]
}

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${
      achievement.earned
        ? 'border-border bg-bg-card'
        : 'border-border/50 bg-bg-card/30 opacity-40'
    }`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
        achievement.earned ? 'bg-bg-surface' : 'bg-bg-surface/50'
      }`}>
        <Icon size={18} className={achievement.earned ? achievement.color : 'text-text-muted'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${achievement.earned ? 'text-white' : 'text-text-muted'}`}>
          {achievement.name}
        </p>
        <p className="text-[10px] text-text-muted">{achievement.description}</p>
      </div>
      {achievement.earned && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-wc-peach/20">
          <span className="text-[10px] text-wc-peach">✓</span>
        </div>
      )}
    </div>
  )
}

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const earned = achievements.filter((a) => a.earned).length

  return (
    <div>
      <div className="section-accent mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Achievements
          </p>
          <span className="text-[10px] text-text-muted">
            {earned}/{achievements.length} earned
          </span>
        </div>
      </div>
      <div className="space-y-1.5 stagger-children">
        {achievements.map((a) => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  )
}
