'use client'
import { useEffect, useState } from 'react'
import PositionCard from '@/components/PositionCard'
import EfficientFrontier from '@/components/EfficientFrontier'
import { api } from '@/lib/api-client'

export default function PortfolioPage() {
  const [positions, setPositions] = useState<any[]>([])
  const [pnl, setPnl] = useState<number>(0)
  const accountId = 'demo-account'

  useEffect(() => {
    api
      .getPositions(accountId)
      .then((data: any) => setPositions(data))
      .catch(() => {})
    api
      .getPnl(accountId)
      .then((val: any) => setPnl(val))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Portfolio</h2>
        <span className={pnl >= 0 ? 'bid text-xl' : 'ask text-xl'}>
          Total P&L: ₹{pnl.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {positions.map((p) => (
          <PositionCard key={p.id} position={p} />
        ))}
      </div>
      <EfficientFrontier />
    </div>
  )
}
