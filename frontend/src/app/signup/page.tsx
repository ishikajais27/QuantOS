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

export default function SignupPage() {
  const router = useRouter()
  const { refreshUser } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('retail')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getUser()) router.replace('/')
  }, [router])

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Enter your name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email.')
      return
    }
    setLoading(true)
    try {
      signup(name, email, role)
      refreshUser()
      router.push('/')
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
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
          <h1 className="text-white font-bold text-lg mb-1">Create account</h1>
          <p className="text-gray-500 text-xs mb-6">
            Pick your trader type — it shapes your dashboard and mock data.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Ishika"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
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
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-2">
                Trader type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`text-center rounded p-3 border transition-all ${
                      role === r
                        ? ROLE_ACCENT[r]
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{ROLE_ICONS[r]}</div>
                    <div className="text-white text-xs font-semibold leading-tight">
                      {ROLE_LABELS[r]}
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
              {loading ? 'Creating account...' : 'Create Account & Enter'}
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
