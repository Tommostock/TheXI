import { BottomNav } from '@/components/ui/BottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="flex-1 overflow-y-auto pb-nav-height">{children}</main>
      <BottomNav />
    </>
  )
}
