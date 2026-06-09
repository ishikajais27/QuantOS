'use client'
import { useState } from 'react'
import { api } from '@/lib/api-client'

export default function StrategyPage() {
  const [instrument, setInstrument] = useState('NIFTY-FUT')
  const [quantity, setQuantity] = useState(1000)
  const [duration, setDuration] = useState(3600000)
  const [slices, setSlices] = useState(10)
  const [status, setStatus] = useState('')

  const startTWAP = async () => {
    try {
      await api.startTWAP({
        instrumentId: instrument,
        quantity,
        durationMs: duration,
        slices,
      })
      setStatus('TWAP strategy started')
    } catch {
      setStatus('Error starting TWAP')
    }
  }

  const startVWAP = async () => {
    try {
      await api.startVWAP({ instrumentId: instrument, quantity })
      setStatus('VWAP strategy started')
    } catch {
      setStatus('Error starting VWAP')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold">Strategy Builder</h2>
      <div className="card space-y-4">
        <div>
          <label className="text-gray-400 text-sm">Instrument</label>
          <input
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm">Duration (ms)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(+e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm">Slices (TWAP)</label>
          <input
            type="number"
            value={slices}
            onChange={(e) => setSlices(+e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={startTWAP}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Start TWAP
          </button>
          <button
            onClick={startVWAP}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Start VWAP
          </button>
        </div>
        {status && <p className="text-green-400 text-sm">{status}</p>}
      </div>
    </div>
  )
}
