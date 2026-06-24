// frontend/app/strategy/page.tsx
'use client'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import HelpPanel from '@/components/HelpPanel'
import { RequireAuth, useUser } from '@/context/UserContext'

type StrategyType = 'TWAP' | 'VWAP'

const STRATEGY_HELP = {
  title: 'Strategy Builder — How it works',
  sections: [
    {
      label: 'Why TWAP?',
      text: 'Time-Weighted Average Price splits your total quantity into N equal slices and executes one per time interval. Ideal for liquid markets — it hides your total size by spreading orders over time, minimising market impact.',
    },
    {
      label: 'Why VWAP?',
      text: "Volume-Weighted Average Price adjusts slice sizes based on historical volume distribution. Heavier trading periods get larger slices. Benchmarks your execution against the day's average price — standard for institutional reporting.",
    },
    {
      label: 'Market Impact',
      text: 'Placing a 10,000-lot order in one shot moves the market against you — sellers raise their asks as they see a large buyer. Splitting into 20 × 500-lot orders lets the market absorb each without spiking.',
    },
    {
      label: 'The Backend',
      text: "Your strategy request goes to the Strategy Service (port 8085), which stubs the execution. In a production build, it would call the Matching Engine via the API Gateway and route to the cheapest exchange using Dijkstra's shortest-path algorithm.",
    },
  ],
}

function StrategyContent() {
  const { user } = useUser()
  const [instrument, setInstrument] = useState('NIFTY-FUT')
  const [quantity, setQuantity] = useState(1000)
  const [duration, setDuration] = useState(3600000)
  const [slices, setSlices] = useState(10)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState<StrategyType | null>(null)

  // Institutional traders get higher default quantities
  const defaultQty =
    user?.role === 'institutional'
      ? 10000
      : user?.role === 'quant'
        ? 2000
        : 1000

  const execute = async (type: StrategyType) => {
    setLoading(type)
    setStatus('')
    try {
      const params = {
        instrumentId: instrument,
        quantity,
        durationMs: duration,
        slices,
      }
      if (type === 'TWAP') await api.startTWAP(params)
      else await api.startVWAP(params)
      setStatus(`✓ ${type} strategy queued for ${instrument}`)
    } catch {
      setStatus(`✗ Error starting ${type} strategy`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Strategy Builder</h2>
          <p className="text-gray-500 text-xs mt-1">
            Configure and launch TWAP / VWAP execution strategies
          </p>
        </div>
        <HelpPanel
          title={STRATEGY_HELP.title}
          sections={STRATEGY_HELP.sections}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4 border border-gray-800">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Parameters
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Instrument
            </label>
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
            >
              {['NIFTY-FUT', 'BTCUSDT', 'BANKNIFTY', 'RELIANCE', 'ETHUSDT'].map(
                (i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Total Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Duration (ms) — {(duration / 60000).toFixed(0)} min
            </label>
            <input
              type="range"
              min={60000}
              max={86400000}
              step={60000}
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1 min</span>
              <span>1 day</span>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              TWAP Slices: {slices}
            </label>
            <input
              type="range"
              min={2}
              max={100}
              value={slices}
              onChange={(e) => setSlices(+e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>2</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => execute('TWAP')}
              disabled={!!loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded text-sm font-bold transition-colors"
            >
              {loading === 'TWAP' ? 'Queuing...' : '▶ TWAP'}
            </button>
            <button
              onClick={() => execute('VWAP')}
              disabled={!!loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded text-sm font-bold transition-colors"
            >
              {loading === 'VWAP' ? 'Queuing...' : '▶ VWAP'}
            </button>
          </div>

          {status && (
            <p
              className={`text-xs mt-1 ${status.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}
            >
              {status}
            </p>
          )}
        </div>

        <div className="card space-y-4 border border-gray-800">
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Strategy Info
          </div>
          <div className="space-y-4">
            <div className="border border-blue-800 rounded p-3">
              <div className="text-blue-400 font-bold text-sm mb-2">
                TWAP — Time Weighted Average Price
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Splits total quantity into {slices} equal slices</div>
                <div>
                  • Executes one slice every{' '}
                  {(duration / slices / 60000).toFixed(1)} min
                </div>
                <div>
                  • Minimises market impact by spreading execution over time
                </div>
                <div>• Ideal for large orders in liquid markets</div>
              </div>
            </div>
            <div className="border border-purple-800 rounded p-3">
              <div className="text-purple-400 font-bold text-sm mb-2">
                VWAP — Volume Weighted Average Price
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Targets execution at or better than the day's VWAP</div>
                <div>
                  • Adjusts slice sizes based on historical volume profile
                </div>
                <div>• Benchmarked against 30-min sliding window VWAP</div>
                <div>
                  • Best for minimising execution cost vs market average
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StrategyPage() {
  return (
    <RequireAuth>
      <StrategyContent />
    </RequireAuth>
  )
}
