import type { Metadata } from 'next'
import './globals.css'

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
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-8 text-sm sticky top-0 bg-gray-950 z-50">
          <a
            href="/"
            className="text-green-400 font-bold text-base tracking-wider"
          >
            QuantOS
          </a>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <span className="live-dot" />
            <span className="ml-1">LIVE</span>
          </div>
          <div className="flex gap-6 ml-4">
            <a
              href="/orderbook"
              className="hover:text-white text-gray-400 transition-colors"
            >
              Order Book
            </a>
            <a
              href="/portfolio"
              className="hover:text-white text-gray-400 transition-colors"
            >
              Portfolio
            </a>
            <a
              href="/arbitrage"
              className="hover:text-white text-gray-400 transition-colors"
            >
              Arbitrage
            </a>
            <a
              href="/strategy"
              className="hover:text-white text-gray-400 transition-colors"
            >
              Strategy
            </a>
          </div>
        </nav>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
