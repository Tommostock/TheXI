import { BottomNav } from '@/components/ui/BottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(4rem + max(env(safe-area-inset-bottom), 12px))' }}>{children}</main>
      <BottomNav />
    </>
  )
}
