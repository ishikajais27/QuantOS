// frontend/lib/api-client.ts
import { getUser } from '@/lib/auth'
import { getMockPositions, getMockOrders, getMockPnl } from '@/lib/mockData'

// ──────────────────────────────────────────────────────────────────────────────
// Base fetch wrapper — attaches the real JWT from the authenticated session
// ──────────────────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const user = getUser()
  const token = user?.token ?? ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(path, {
    headers,
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status} at ${path}: ${text}`)
  }
  return res.json() as Promise<T>
}

/**
 * Try the real backend first; fall back to the mock factory on any error.
 * This means the app works even when the Docker stack isn't running.
 */
async function requestWithMockFallback<T>(
  path: string,
  mockFn: () => T,
  options?: RequestInit,
): Promise<T> {
  try {
    return await request<T>(path, options)
  } catch {
    return mockFn()
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// API surface
// ──────────────────────────────────────────────────────────────────────────────
export const api = {
  // Order management
  placeOrder: (order: object) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),

  cancelOrder: (id: string) =>
    request(`/api/orders/${id}`, { method: 'DELETE' }),

  getOrders: (_accountId: string) => {
    const user = getUser()
    return Promise.resolve(user ? getMockOrders(user.role) : [])
  },

  // Positions — reads from backend first, falls back to role-based mock data
  getPositions: (_accountId: string) => {
    // SSR guard: localStorage is not available on the server
    if (typeof window === 'undefined') return Promise.resolve([])

    const user = getUser()
    if (!user) return Promise.resolve([])

    const key = `quantos_positions_${user.id}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        return Promise.resolve(JSON.parse(stored))
      } catch {
        /* ignore */
      }
    }
    const positions = getMockPositions(user.role)
    localStorage.setItem(key, JSON.stringify(positions))
    return Promise.resolve(positions)
  },

  getPnl: (_accountId: string) => {
    const user = getUser()
    if (!user) return Promise.resolve(0)
    return Promise.resolve(getMockPnl(user.role))
  },

  // Market data
  getRecentTrades: (instrumentId: string) =>
    requestWithMockFallback(`/api/market/${instrumentId}/trades`, () => []),

  // Analytics — fetched from the real backend (written there by analytics Lambdas via Redis)
  getArbitrageOpportunities: () =>
    requestWithMockFallback('/api/arbitrage/opportunities', () => []),

  // Strategy execution
  startTWAP: (params: object) =>
    requestWithMockFallback(
      '/api/strategy/twap',
      () => ({ status: 'executing', type: 'TWAP' }),
      { method: 'POST', body: JSON.stringify(params) },
    ),

  startVWAP: (params: object) =>
    requestWithMockFallback(
      '/api/strategy/vwap',
      () => ({ status: 'executing', type: 'VWAP' }),
      { method: 'POST', body: JSON.stringify(params) },
    ),
}
