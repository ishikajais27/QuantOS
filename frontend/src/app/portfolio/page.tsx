'use client'
import { useEffect, useState } from 'react'
import PositionCard from '@/components/PositionCard'
import EfficientFrontier from '@/components/EfficientFrontier'
import { api } from '@/lib/api-client'

const DEMO_POSITIONS = [
  {
    id: '1',
    instrumentId: 'NIFTY-FUT',
    quantity: 50,
    averagePrice: 22310.0,
    unrealizedPnl: 680.5,
  },
  {
    id: '2',
    instrumentId: 'BTCUSDT',
    quantity: 2,
    averagePrice: 41500.0,
    unrealizedPnl: 1100.0,
  },
  {
    id: '3',
    instrumentId: 'BANKNIFTY',
    quantity: 25,
    averagePrice: 47800.0,
    unrealizedPnl: -320.75,
  },
  {
    id: '4',
    instrumentId: 'RELIANCE',
    quantity: 200,
    averagePrice: 2840.0,
    unrealizedPnl: 410.0,
  },
]

export default function PortfolioPage() {
  const [positions, setPositions] = useState<any[]>([])
  const [pnl, setPnl] = useState<number>(0)
  const accountId = 'demo-account'

  useEffect(() => {
    api
      .getPositions(accountId)
      .then((data: any) => setPositions(data?.length ? data : DEMO_POSITIONS))
      .catch(() => setPositions(DEMO_POSITIONS))
    api
      .getPnl(accountId)
      .then((val: any) => setPnl(typeof val === 'number' ? val : 1869.75))
      .catch(() => setPnl(1869.75))
  }, [])

  const totalPnl = positions.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold">Portfolio</h2>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-400">
            Positions: <span className="text-white">{positions.length}</span>
          </span>
          <span
            className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)} P&L
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {positions.map((p: any) => (
          <PositionCard key={p.id} position={p} />
        ))}
      </div>

      <EfficientFrontier />
    </div>
  )
}
