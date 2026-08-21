import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EXP/OS — Experimentation Governance OS',
  description: 'AirGroup Digital Hangar · Experiment quality governance platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>{children}</body>
    </html>
  )
}
