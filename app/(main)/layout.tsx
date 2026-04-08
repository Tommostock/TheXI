import { BottomNav } from '@/components/ui/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { LiveMatchPoller } from '@/components/ui/LiveMatchPoller'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ToastProvider />
      <LiveMatchPoller />
      <div className="px-3 pt-2"><InstallPrompt /></div>
      <main className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: 'calc(4rem + max(env(safe-area-inset-bottom), 12px))' }}>{children}</main>
      <BottomNav />
    </div>
  )
}
