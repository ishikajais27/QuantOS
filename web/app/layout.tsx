import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trading Platform',
  description: 'Real-Time Multi-Exchange Order Book & Arbitrage Engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-mono">
        <nav className="border-b border-gray-800 px-6 py-3 flex gap-8 text-sm">
          <a href="/" className="text-green-400 font-bold">
            TradePlatform
          </a>
          <a href="/orderbook" className="hover:text-white text-gray-400">
            Order Book
          </a>
          <a href="/portfolio" className="hover:text-white text-gray-400">
            Portfolio
          </a>
          <a href="/arbitrage" className="hover:text-white text-gray-400">
            Arbitrage
          </a>
          <a href="/strategy" className="hover:text-white text-gray-400">
            Strategy
          </a>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
