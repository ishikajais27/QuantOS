'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

interface Opportunity {
  cycle: string[]
  profitBps: number
}

export default function ArbitragePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  useEffect(() => {
    const fetch = () =>
      api
        .getArbitrageOpportunities()
        .then((data: any) => setOpportunities(data || []))
        .catch(() => {})
    fetch()
    const interval = setInterval(fetch, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Bellman-Ford Arbitrage Monitor</h2>
      <p className="text-gray-500 text-sm">
        Negative cycle detection across exchange rate graph
      </p>
      {opportunities.length === 0 ? (
        <div className="card text-gray-500">
          No arbitrage opportunities detected
        </div>
      ) : (
        opportunities.map((opp, i) => (
          <div key={i} className="card border-green-500">
            <div className="text-green-400 font-bold">
              Profit: {opp.profitBps} bps
            </div>
            <div className="text-gray-400 mt-1">
              Cycle: {opp.cycle.join(' → ')}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
