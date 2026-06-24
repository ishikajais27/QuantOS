// frontend/components/ClientNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { ROLE_LABELS, UserRole } from '@/lib/mockData'

const ROLE_BADGE: Record<UserRole, string> = {
  retail: 'text-green-400 bg-green-400/10 border-green-400/30',
  quant: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  institutional: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
}

const NAV_LINKS = [
  { href: '/orderbook', label: 'Order Book' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/arbitrage', label: 'Arbitrage' },
  { href: '/strategy', label: 'Strategy' },
]

export default function ClientNav() {
  const { user, logout } = useUser()
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname === '/login' || pathname === '/signup') return null

  return (
    <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-6 text-sm sticky top-0 bg-gray-950 z-50">
      {/* Logo */}
      <Link
        href="/"
        className="text-green-400 font-bold text-base tracking-wider font-mono"
      >
        QuantOS
      </Link>

      {/* Live indicator */}
      {user && (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <span className="live-dot" />
          <span className="ml-1">LIVE</span>
        </div>
      )}

      {/* Nav links */}
      {user && (
        <div className="flex gap-5 ml-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors text-sm ${
                pathname === href
                  ? 'text-white font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right side: user info */}
      {user && (
        <div className="ml-auto flex items-center gap-3">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-mono ${ROLE_BADGE[user.role]}`}
          >
            {ROLE_LABELS[user.role]}
          </span>
          <span className="text-gray-400 text-xs hidden sm:block">
            {user.name}
          </span>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-300 text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
