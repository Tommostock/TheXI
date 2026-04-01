'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  Trophy,
  MessageCircle,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/draft', label: 'Draft', icon: ListOrdered },
  { href: '/squad', label: 'Squad', icon: Users },
  { href: '/leaderboard', label: 'Board', icon: Trophy },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-nav-height items-center justify-around border-t border-border bg-bg-card pb-safe-bottom">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
              isActive ? 'text-wc-lime' : 'text-text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
