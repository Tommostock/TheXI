'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  Trophy,
  Newspaper,
} from 'lucide-react'
import { FIXTURES } from '@/lib/tournament/groups'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/draft', label: 'Draft', icon: ListOrdered },
  { href: '/squad', label: 'Squad', icon: Users },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/feed', label: 'Feed', icon: Newspaper },
]

export function BottomNav() {
  const pathname = usePathname()
  const hasLive = FIXTURES.some((f) => f.status === 'live')

  return (
    <nav className="shrink-0 z-50 flex items-center justify-around border-t border-border bg-bg-card" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', height: 'calc(4rem + max(env(safe-area-inset-bottom), 8px))' }}>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-all duration-150 ${
              isActive ? 'text-wc-peach' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <div className={`relative transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              {item.href === '/dashboard' && hasLive && (
                <span className="absolute -top-0.5 -right-1.5 h-2 w-2 rounded-full bg-wc-crimson animate-pulse" />
              )}
            </div>
            <span className="text-[9px] font-medium">{item.label}</span>
            {/* Active dot indicator */}
            <div className={`h-1 w-1 rounded-full transition-all duration-150 ${
              isActive ? 'bg-wc-peach scale-100' : 'bg-transparent scale-0'
            }`} />
          </Link>
        )
      })}
    </nav>
  )
}
