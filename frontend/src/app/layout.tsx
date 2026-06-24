// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/context/UserContext'
import ClientNav from '@/components/ClientNav'

export const metadata: Metadata = {
  title: 'QuantOS — Trading Platform',
  description: 'Real-Time Multi-Exchange Order Book & Arbitrage Engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <UserProvider>
          <ClientNav />
          <main className="p-6 max-w-7xl mx-auto">{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
