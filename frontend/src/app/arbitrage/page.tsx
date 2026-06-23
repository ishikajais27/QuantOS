'use client'
import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api-client'

interface Opportunity {
  cycle: string[]
  profitBps: number
  detectedAt?: number
}

export default function ArbitragePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const fetchOpportunities = () => {
      setScanning(true)
      api
        .getArbitrageOpportunities()
        .then((data: any) => {
          setOpportunities(Array.isArray(data) ? data : [])
          setLastUpdated(new Date())
        })
        .catch(() => {})
        .finally(() => setScanning(false))
    }

    fetchOpportunities()
    const interval = setInterval(fetchOpportunities, 10_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Bellman-Ford Arbitrage Monitor</h2>
          <p className="text-gray-500 text-xs mt-1">
            Negative-cycle detection across exchange-rate graph · Refreshes
            every 10s
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {scanning && (
            <span className="text-yellow-400 animate-pulse">● Scanning...</span>
          )}
          {lastUpdated && <span>Last: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>

      <div className="card mb-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
          Algorithm
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>1. Build currency graph: nodes = assets, edges = -log(rate)</div>
          <div>2. Run Bellman-Ford: relax all edges n-1 times</div>
          <div>
            3. Detect further relaxation → negative cycle = arbitrage
            opportunity
          </div>
          <div>
            4. Trace and report the cycle path and estimated profit in basis
            points
          </div>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="card text-gray-500 text-center py-8">
          No arbitrage opportunities detected in the current market snapshot
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <div
              key={i}
              className="card border-green-800 hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-green-400 font-bold text-sm mb-2">
                    ⚡ Arbitrage Opportunity #{i + 1}
                  </div>
                  <div className="text-gray-300 text-sm font-mono">
                    {opp.cycle.join(' → ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">
                    {opp.profitBps} bps
                  </div>
                  <div className="text-gray-500 text-xs">estimated profit</div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-gray-600">
                <span>Vertices: {opp.cycle.length}</span>
                {opp.detectedAt && (
                  <span>
                    Detected: {new Date(opp.detectedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
