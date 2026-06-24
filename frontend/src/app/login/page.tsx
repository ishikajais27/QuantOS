// frontend/app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, getUser } from '@/lib/auth'
import { UserRole, ROLE_LABELS } from '@/lib/mockData'
import { useUser } from '@/context/UserContext'

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  retail:
    'Track a small portfolio, place limit orders, follow live bid/ask depth.',
  quant:
    'Run Bellman-Ford arbitrage scans, monitor volatility, plot efficient frontiers.',
  institutional:
    'Execute large orders with TWAP/VWAP strategies to minimise market impact.',
}

const ROLE_ACCENT: Record<UserRole, string> = {
  retail: 'border-green-500 bg-green-500/10',
  quant: 'border-purple-500 bg-purple-500/10',
  institutional: 'border-yellow-500 bg-yellow-500/10',
}

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useUser()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('retail')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getUser()) router.replace('/')
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter your email to continue.')
      return
    }
    setLoading(true)
    try {
      login(email, role)
      refreshUser()
      router.push('/')
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-green-400 font-bold text-3xl tracking-widest font-mono mb-2">
          QuantOS
        </div>
        <p className="text-gray-500 text-xs">
          Multi-Exchange Algorithmic Trading Platform
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card border border-gray-800 p-8">
          <h1 className="text-white font-bold text-lg mb-1">Sign in</h1>
          <p className="text-gray-500 text-xs mb-6">
            No password needed — this is a demo environment.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs block mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">
                I am a —
              </label>
              <div className="space-y-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full text-left rounded p-3 border transition-all ${
                      role === r
                        ? ROLE_ACCENT[r]
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-white text-sm font-semibold">
                      {ROLE_LABELS[r]}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {ROLE_DESCRIPTIONS[r]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded text-sm font-bold transition-colors"
            >
              {loading ? 'Signing in...' : 'Enter Platform'}
            </button>
          </form>

          <p className="text-gray-600 text-xs mt-6 text-center">
            First time?{' '}
            <a href="/signup" className="text-green-400 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
