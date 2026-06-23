const API_BASE =
  typeof window !== 'undefined'
    ? '' // browser: relative paths via nginx
    : process.env.NEXT_PUBLIC_API_URL || 'http://api:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: 'Bearer demo-token' }),
    },
    ...options,
  })

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  placeOrder: (order: object) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),

  cancelOrder: (id: string) =>
    request(`/api/orders/${id}`, { method: 'DELETE' }),

  getOrders: (accountId: string) => request(`/api/orders/account/${accountId}`),

  getPositions: (accountId: string) =>
    request(`/api/portfolio/${accountId}/positions`),

  getPnl: (accountId: string) =>
    request<number>(`/api/portfolio/${accountId}/pnl`),

  getRecentTrades: (instrumentId: string) =>
    request(`/api/market/${instrumentId}/trades`),

  getArbitrageOpportunities: () => request('/api/arbitrage/opportunities'),

  startTWAP: (params: object) =>
    request('/api/strategy/twap', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  startVWAP: (params: object) =>
    request('/api/strategy/vwap', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
}
