'use client'
import { useEffect, useState } from 'react'
import OrderBookTable from '@/components/OrderBookTable'
import DepthChart from '@/components/DepthChart'
import { tradingWS } from '@/lib/websocket'

interface Level {
  price: number
  volume: number
}

export default function OrderBookPage() {
  const [bids, setBids] = useState<Level[]>([])
  const [asks, setAsks] = useState<Level[]>([])
  const [spread, setSpread] = useState<number>(0)

  useEffect(() => {
    tradingWS.connect()
    tradingWS.subscribe('NIFTY-FUT', (data) => {
      const parsed = JSON.parse(data)
      if (parsed.bids) setBids(parsed.bids)
      if (parsed.asks) setAsks(parsed.asks)
      if (parsed.bids?.[0] && parsed.asks?.[0])
        setSpread(+(parsed.asks[0].price - parsed.bids[0].price).toFixed(2))
    })

    return () => {
      tradingWS.unsubscribe('NIFTY-FUT')
    }
  }, [])
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">NIFTY-FUT Order Book</h2>
        <span className="text-yellow-400">Spread: ₹{spread}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <OrderBookTable bids={bids} asks={asks} />
        <DepthChart bids={bids} asks={asks} />
      </div>
    </div>
  )
}
