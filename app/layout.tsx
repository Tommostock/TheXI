import type { Metadata, Viewport } from 'next'
import { Poppins, Jersey_25 } from 'next/font/google'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import { DevAutoLogin } from '@/components/DevAutoLogin'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['200', '300', '400'],
  subsets: ['latin'],
})

const jersey = Jersey_25({
  variable: '--font-jersey',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'The XI - World Cup 2026 Draft',
  description:
    'Draft real World Cup 2026 players and compete with your mates',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The XI',
  },
}

export const viewport: Viewport = {
  themeColor: '#00F0C0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${jersey.variable} h-full`}>
      <body className="flex min-h-dvh flex-col bg-bg-primary font-sans text-white">
        {/* TODO: Remove DevAutoLogin before deploy */}
        <DevAutoLogin />
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
