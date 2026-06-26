// frontend/app/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signup, getUser } from '@/lib/auth'
import { UserRole, ROLE_LABELS } from '@/lib/mockData'
import { useUser } from '@/context/UserContext'

const ROLE_ACCENT: Record<UserRole, string> = {
  retail: 'border-green-500 bg-green-500/10',
  quant: 'border-purple-500 bg-purple-500/10',
  institutional: 'border-yellow-500 bg-yellow-500/10',
}

const ROLE_ICONS: Record<UserRole, string> = {
  retail: '📈',
  quant: '🔬',
  institutional: '🏦',
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  retail:
    'Track a small portfolio, place limit orders, follow live bid/ask depth.',
  quant:
    'Run Bellman-Ford arbitrage scans, monitor volatility, plot efficient frontiers.',
  institutional:
    'Execute large orders with TWAP/VWAP strategies to minimise market impact.',
}

function passwordStrength(pw: string): {
  label: string
  color: string
  pct: number
} {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = [
    { label: 'Too short', color: 'bg-red-600', pct: 0 },
    { label: 'Weak', color: 'bg-red-500', pct: 25 },
    { label: 'Fair', color: 'bg-yellow-500', pct: 50 },
    { label: 'Good', color: 'bg-blue-500', pct: 75 },
    { label: 'Strong', color: 'bg-green-500', pct: 100 },
  ]
  return labels[pw.length < 6 ? 0 : score]
}

export default function SignupPage() {
  const router = useRouter()
  const { refreshUser } = useUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<UserRole>('retail')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getUser()) router.replace('/')
  }, [router])

  const strength = passwordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signup(name, email, password, role)
      refreshUser()
      router.push('/')
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="text-green-400 font-bold text-3xl tracking-widest font-mono mb-2">
          QuantOS
        </div>
        <p className="text-gray-500 text-xs">
          Multi-Exchange Algorithmic Trading Platform
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card border border-gray-800 p-8">
          <h1 className="text-white font-bold text-lg mb-1">Create account</h1>
          <p className="text-gray-500 text-xs mb-6">
            Pick your trader type — it shapes your dashboard, mock data, and
            algorithms.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Ishika"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm
                             text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm
                             text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm
                             text-white focus:outline-none focus:border-green-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300
                             text-xs transition-colors"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${strength.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Confirm Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm text-white
                            focus:outline-none transition-colors
                            ${
                              confirm && confirm !== password
                                ? 'border-red-600 focus:border-red-500'
                                : 'border-gray-700 focus:border-green-500'
                            }`}
              />
              {confirm && confirm !== password && (
                <p className="text-red-400 text-xs mt-0.5">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Trader type */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ROLE_ICONS[r]}</span>
                      <div>
                        <div className="text-white text-sm font-semibold">
                          {ROLE_LABELS[r]}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {ROLE_DESCRIPTIONS[r]}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white
                         py-2.5 rounded text-sm font-bold transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account & Enter'}
            </button>
          </form>

          <p className="text-gray-600 text-xs mt-6 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-green-400 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
