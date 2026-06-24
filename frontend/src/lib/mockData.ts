// frontend/lib/mockData.ts

export type UserRole = 'retail' | 'quant' | 'institutional'

export interface MockPosition {
  id: string
  instrumentId: string
  quantity: number
  averagePrice: number
  unrealizedPnl: number
}

export interface MockOrder {
  id: string
  instrumentId: string
  type: 'BID' | 'ASK'
  price: number
  quantity: number
  status: 'PENDING' | 'FILLED' | 'CANCELLED'
  createdAt: string
}

const RETAIL_POSITIONS: MockPosition[] = [
  {
    id: 'r1',
    instrumentId: 'NIFTY-FUT',
    quantity: 10,
    averagePrice: 22310.0,
    unrealizedPnl: 340.5,
  },
  {
    id: 'r2',
    instrumentId: 'RELIANCE',
    quantity: 20,
    averagePrice: 2840.0,
    unrealizedPnl: 120.0,
  },
]

const QUANT_POSITIONS: MockPosition[] = [
  {
    id: 'q1',
    instrumentId: 'NIFTY-FUT',
    quantity: 50,
    averagePrice: 22310.0,
    unrealizedPnl: 680.5,
  },
  {
    id: 'q2',
    instrumentId: 'BTCUSDT',
    quantity: 2,
    averagePrice: 41500.0,
    unrealizedPnl: 1100.0,
  },
  {
    id: 'q3',
    instrumentId: 'BANKNIFTY',
    quantity: 25,
    averagePrice: 47800.0,
    unrealizedPnl: -320.75,
  },
  {
    id: 'q4',
    instrumentId: 'ETHUSDT',
    quantity: 5,
    averagePrice: 2200.0,
    unrealizedPnl: 250.0,
  },
]

const INSTITUTIONAL_POSITIONS: MockPosition[] = [
  {
    id: 'i1',
    instrumentId: 'NIFTY-FUT',
    quantity: 5000,
    averagePrice: 22310.0,
    unrealizedPnl: 68050.0,
  },
  {
    id: 'i2',
    instrumentId: 'BTCUSDT',
    quantity: 50,
    averagePrice: 41500.0,
    unrealizedPnl: 27500.0,
  },
  {
    id: 'i3',
    instrumentId: 'BANKNIFTY',
    quantity: 1200,
    averagePrice: 47800.0,
    unrealizedPnl: -15675.0,
  },
  {
    id: 'i4',
    instrumentId: 'RELIANCE',
    quantity: 10000,
    averagePrice: 2840.0,
    unrealizedPnl: 20500.0,
  },
  {
    id: 'i5',
    instrumentId: 'ETHUSDT',
    quantity: 200,
    averagePrice: 2200.0,
    unrealizedPnl: 10000.0,
  },
]

const RETAIL_ORDERS: MockOrder[] = [
  {
    id: 'ro1',
    instrumentId: 'NIFTY-FUT',
    type: 'BID',
    price: 22300.0,
    quantity: 5,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ro2',
    instrumentId: 'RELIANCE',
    type: 'ASK',
    price: 2860.0,
    quantity: 10,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
]

const QUANT_ORDERS: MockOrder[] = [
  {
    id: 'qo1',
    instrumentId: 'BTCUSDT',
    type: 'BID',
    price: 41400.0,
    quantity: 1,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'qo2',
    instrumentId: 'NIFTY-FUT',
    type: 'ASK',
    price: 22500.0,
    quantity: 25,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'qo3',
    instrumentId: 'BANKNIFTY',
    type: 'BID',
    price: 47700.0,
    quantity: 10,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'qo4',
    instrumentId: 'ETHUSDT',
    type: 'BID',
    price: 2190.0,
    quantity: 3,
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
]

const INSTITUTIONAL_ORDERS: MockOrder[] = [
  {
    id: 'io1',
    instrumentId: 'NIFTY-FUT',
    type: 'BID',
    price: 22300.0,
    quantity: 2500,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'io2',
    instrumentId: 'NIFTY-FUT',
    type: 'BID',
    price: 22320.0,
    quantity: 2500,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'io3',
    instrumentId: 'BTCUSDT',
    type: 'BID',
    price: 41200.0,
    quantity: 30,
    status: 'FILLED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'io4',
    instrumentId: 'RELIANCE',
    type: 'ASK',
    price: 2870.0,
    quantity: 5000,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
]

export function getMockPositions(role: UserRole): MockPosition[] {
  const base =
    role === 'retail'
      ? RETAIL_POSITIONS
      : role === 'quant'
        ? QUANT_POSITIONS
        : INSTITUTIONAL_POSITIONS

  // Personalise slightly with a deterministic price drift
  return base.map((p) => ({ ...p }))
}

export function getMockOrders(role: UserRole): MockOrder[] {
  return role === 'retail'
    ? RETAIL_ORDERS
    : role === 'quant'
      ? QUANT_ORDERS
      : INSTITUTIONAL_ORDERS
}

export function getMockPnl(role: UserRole): number {
  const positions = getMockPositions(role)
  return positions.reduce((sum, p) => sum + p.unrealizedPnl, 0)
}

export const ROLE_LABELS: Record<UserRole, string> = {
  retail: 'Retail Trader',
  quant: 'Quant Trader',
  institutional: 'Institutional Trader',
}

export const ALGO_OF_THE_DAY: Record<
  UserRole,
  { name: string; plain: string; complexity: string }
> = {
  retail: {
    name: 'Priority Queue (Order Book)',
    plain:
      'Your order book is powered by two heaps — a max-heap for bids (highest buyer price first) and a min-heap for asks (lowest seller price first). Every time you place an order, the engine checks if the best bid ≥ best ask. If yes, a trade fires instantly. Otherwise your order waits in queue, sorted by price-time priority.',
    complexity: 'O(log n) insert & match',
  },
  quant: {
    name: 'Bellman-Ford Arbitrage',
    plain:
      "The analytics engine builds a directed graph where each currency or asset is a node and exchange rates are edge weights (-log(rate)). Bellman-Ford relaxes all edges V-1 times. If a further relaxation is possible, a negative cycle exists — meaning you can trade A→B→C→A and arrive with more money than you started. That's the arbitrage opportunity flashing on your screen.",
    complexity: 'O(V·E) per scan, runs every 10s',
  },
  institutional: {
    name: 'TWAP Execution Algorithm',
    plain:
      'Splitting a 10,000-lot order into one trade would crash the price against you. TWAP divides your total quantity into N equal slices and fires one slice every (duration/N) minutes. The market absorbs each small order normally, so your average execution price tracks the time-weighted mean rather than the worst-case single print.',
    complexity: 'O(1) per slice, O(N) total orders',
  },
}
