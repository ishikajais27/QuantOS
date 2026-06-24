// frontend/lib/api-client.ts
import { getUser } from '@/lib/auth'
import { getMockPositions, getMockOrders, getMockPnl } from '@/lib/mockData'

const API_BASE =
  typeof window !== 'undefined'
    ? ''
    : process.env.NEXT_PUBLIC_API_URL || 'http://api:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const user = getUser()
  const token = user?.token ?? 'demo-token'

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...options,
  })

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// For calls that can be satisfied by role-based mock data,
// we try the real backend first, and fall back gracefully.
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

export const api = {
  placeOrder: (order: object) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),

  cancelOrder: (id: string) =>
    request(`/api/orders/${id}`, { method: 'DELETE' }),

  getOrders: (_accountId: string) => {
    const user = getUser()
    return Promise.resolve(user ? getMockOrders(user.role) : [])
  },

  getPositions: (_accountId: string) => {
    const user = getUser()
    if (!user) return Promise.resolve([])
    // Try to load user-specific positions from localStorage first
    const key = `quantos_positions_${user.id}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        return Promise.resolve(JSON.parse(stored))
      } catch {}
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

  getRecentTrades: (instrumentId: string) =>
    requestWithMockFallback(`/api/market/${instrumentId}/trades`, () => []),

  getArbitrageOpportunities: () =>
    requestWithMockFallback('/api/arbitrage/opportunities', () => []),

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
