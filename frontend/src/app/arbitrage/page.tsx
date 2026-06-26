'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import HelpPanel from '@/components/HelpPanel'
import { RequireAuth, useUser } from '@/context/UserContext'

interface Opportunity {
  cycle: string[]
  profitBps: number
  detectedAt?: number
}

const ARBITRAGE_HELP = {
  title: 'Arbitrage — How it works',
  sections: [
    {
      label: 'Bellman-Ford Algorithm',
      text: 'The analytics service builds a directed graph where nodes are currencies/assets and edge weights are -log(exchange_rate). Bellman-Ford relaxes all edges V-1 times, then checks if another relaxation is possible. If yes, a negative cycle exists.',
    },
    {
      label: 'What a Negative Cycle Means',
      text: "USD→EUR→GBP→USD with a negative cycle means: convert $1 → €0.92 → £0.79 → $1.003. You get back more than you started with — that's risk-free profit (in theory).",
    },
    {
      label: 'Profit in Basis Points',
      text: '1 basis point = 0.01%. A 15 bps opportunity means a 0.15% gain per cycle. At institutional scale, this is significant. The analytics service runs this check every 10 seconds.',
    },
    {
      label: 'Why Opportunities Vanish',
      text: 'Real arbitrage lasts milliseconds. Other algorithms close the mispricing the moment they detect it. The scanner alerts you; execution speed determines profit.',
    },
  ],
}

function RestrictedFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <div className="card border border-yellow-800 p-10 text-center max-w-md mx-auto mt-16">
        <div className="text-yellow-400 font-bold text-lg mb-2">{title}</div>
        <p className="text-gray-400 text-sm mb-6">{desc}</p>

        <a>
          {' '}
          href="/signup" className="inline-block bg-yellow-600
          hover:bg-yellow-700 text-white px-6 py-2 rounded text-sm font-bold
          transition-colors" Upgrade Account
        </a>
        <div className="mt-4">
          <a
            href="/"
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </>
  )
}

function ArbitrageContent() {
  const { user } = useUser()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [scanning, setScanning] = useState(false)

  // Role guard — Retail traders don't have access to arbitrage scanning
  if (user && user.role === 'retail') {
    return (
      <RestrictedFeature
        title="Quant Feature"
        desc="Bellman-Ford arbitrage scanning is available to Quant and Institutional traders. Upgrade your account to unlock real-time negative-cycle detection across the exchange-rate graph."
      />
    )
  }

  useEffect(() => {
    const fetch = () => {
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
    fetch()
    const id = setInterval(fetch, 10_000)
    return () => clearInterval(id)
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
            <span className="text-yellow-400 animate-pulse">● Scanning…</span>
          )}
          {lastUpdated && <span>Last: {lastUpdated.toLocaleTimeString()}</span>}
          <HelpPanel
            title={ARBITRAGE_HELP.title}
            sections={ARBITRAGE_HELP.sections}
          />
        </div>
      </div>

      <div className="card mb-4 border border-gray-800">
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
        <div className="card border border-gray-800 text-gray-500 text-center py-8">
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

export default function ArbitragePage() {
  return (
    <RequireAuth>
      <ArbitrageContent />
    </RequireAuth>
  )
}
