// frontend/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, RequireAuth } from '@/context/UserContext'
import OnboardingTour from '@/components/OnboardingTour'
import {
  getMockPositions,
  getMockPnl,
  ROLE_LABELS,
  ALGO_OF_THE_DAY,
  UserRole,
} from '@/lib/mockData'

const ROLE_ACCENT_TEXT: Record<UserRole, string> = {
  retail: 'text-green-400',
  quant: 'text-purple-400',
  institutional: 'text-yellow-400',
}

const ROLE_ACCENT_BORDER: Record<UserRole, string> = {
  retail: 'border-green-500/40',
  quant: 'border-purple-500/40',
  institutional: 'border-yellow-500/40',
}

const ROLE_QUICK_ACTIONS: Record<
  UserRole,
  Array<{ label: string; href: string; desc: string }>
> = {
  retail: [
    {
      label: 'View Order Book',
      href: '/orderbook',
      desc: 'Watch live bids & asks, place a limit order.',
    },
    {
      label: 'Check Portfolio',
      href: '/portfolio',
      desc: 'See your P&L and position breakdown.',
    },
    {
      label: 'Explore Arbitrage',
      href: '/arbitrage',
      desc: 'See Bellman-Ford cycles detected right now.',
    },
  ],
  quant: [
    {
      label: 'Scan Arbitrage',
      href: '/arbitrage',
      desc: 'Live Bellman-Ford negative cycle detection.',
    },
    {
      label: 'View Frontier',
      href: '/portfolio',
      desc: 'Graham Scan efficient frontier + volatility.',
    },
    {
      label: 'Watch Order Book',
      href: '/orderbook',
      desc: 'Depth chart and STOMP WebSocket feed.',
    },
  ],
  institutional: [
    {
      label: 'Run TWAP/VWAP',
      href: '/strategy',
      desc: 'Execute large orders without moving the market.',
    },
    {
      label: 'Review Portfolio',
      href: '/portfolio',
      desc: 'Large-position P&L and risk dashboard.',
    },
    {
      label: 'Monitor Order Book',
      href: '/orderbook',
      desc: 'Live depth for execution timing.',
    },
  ],
}

function SystemStatus() {
  return (
    <div className="card border border-gray-800">
      <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
        System Status
      </div>
      <div className="space-y-2">
        {[
          { label: 'WebSocket / Push', color: 'bg-green-400', status: 'LIVE' },
          { label: 'Matching Engine', color: 'bg-green-400', status: 'LIVE' },
          { label: 'Redis Pub/Sub', color: 'bg-green-400', status: 'LIVE' },
          { label: 'Analytics Engine', color: 'bg-green-400', status: 'LIVE' },
        ].map(({ label, color, status }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{label}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span className="text-xs text-green-400 font-mono">{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardContent() {
  const { user } = useUser()
  if (!user) return null

  const positions = getMockPositions(user.role)
  const totalPnl = getMockPnl(user.role)
  const algo = ALGO_OF_THE_DAY[user.role]
  const quickActions = ROLE_QUICK_ACTIONS[user.role]
  const accentText = ROLE_ACCENT_TEXT[user.role]
  const accentBorder = ROLE_ACCENT_BORDER[user.role]

  return (
    <>
      <OnboardingTour />

      <div className="space-y-8">
        {/* Welcome header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className={accentText}>{user.name}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {ROLE_LABELS[user.role]} ·{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <div className={`text-right card border ${accentBorder} py-3 px-5`}>
            <div className="text-gray-400 text-xs mb-1">
              Total Unrealised P&L
            </div>
            <div
              className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {totalPnl >= 0 ? '+' : ''}₹
              {totalPnl.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-gray-600 text-xs mt-0.5">
              {positions.length} open position
              {positions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Quick Start
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map(({ label, href, desc }) => (
              <a
                key={href}
                href={href}
                className={`card border ${accentBorder} hover:bg-gray-800 transition-all group`}
              >
                <div
                  className={`font-bold text-sm mb-1 group-hover:${accentText} transition-colors text-white`}
                >
                  {label} →
                </div>
                <div className="text-gray-500 text-xs">{desc}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Three-column info row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Portfolio summary */}
          <div className="card border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Your Positions
            </div>
            {positions.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0"
              >
                <span className="text-gray-300 text-xs font-mono">
                  {p.instrumentId}
                </span>
                <div className="text-right">
                  <div
                    className={`text-xs font-bold ${p.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {p.unrealizedPnl >= 0 ? '+' : ''}₹
                    {p.unrealizedPnl.toLocaleString('en-IN')}
                  </div>
                  <div className="text-gray-600 text-xs">
                    qty {p.quantity.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
            {positions.length > 4 && (
              <div className="text-gray-600 text-xs mt-2">
                +{positions.length - 4} more ·{' '}
                <a href="/portfolio" className="text-green-400 hover:underline">
                  View all
                </a>
              </div>
            )}
          </div>

          {/* System status */}
          <SystemStatus />

          {/* Algorithm of the day */}
          <div className={`card border ${accentBorder}`}>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Algorithm Active Today
            </div>
            <div className={`${accentText} font-bold text-sm mb-2`}>
              {algo.name}
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">
              {algo.plain}
            </p>
            <div className="text-gray-700 text-xs font-mono">
              {algo.complexity}
            </div>
          </div>
        </div>

        {/* Architecture reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Microservices
            </div>
            {[
              'engine:8081 — Matching Engine',
              'market-data:8082 — Feed Normaliser',
              'analytics:8083 — DSA Algorithms',
              'api:8080 — REST Gateway',
              'push:8084 — STOMP WebSocket',
              'strategy:8085 — Execution Stub',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0 font-mono"
              >
                {s}
              </div>
            ))}
          </div>
          <div className="card border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Algorithms Running
            </div>
            {[
              'Bellman-Ford — Triangular Arbitrage',
              "Welford's Online — Volatility",
              'VWAP — 30-min Sliding Window',
              'Monotonic Stack — Support/Resistance',
              'Graham Scan — Efficient Frontier',
              'Union-Find — Asset Clustering',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0"
              >
                {s}
              </div>
            ))}
          </div>
          <div className="card border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Infrastructure
            </div>
            {[
              'PostgreSQL 15 — Persistent Storage',
              'Redis 7 — Pub/Sub + Cache',
              'nginx — Reverse Proxy',
              'Docker Compose — Orchestration',
              'Spring Boot 3 — All Services',
              'Next.js 14 — Frontend',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Home() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}
