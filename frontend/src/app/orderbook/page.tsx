'use client'
import { useEffect, useState, useCallback } from 'react'
import OrderBookTable from '@/components/OrderBookTable'
import DepthChart from '@/components/DepthChart'
import { tradingWS } from '@/lib/websocket'
import { api } from '@/lib/api-client'

interface Level {
  price: number
  volume: number
}

const INSTRUMENTS = ['NIFTY-FUT', 'BTCUSDT']

export default function OrderBookPage() {
  const [bids, setBids] = useState<Level[]>([])
  const [asks, setAsks] = useState<Level[]>([])
  const [spread, setSpread] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)
  const [connected, setConnected] = useState(false)
  const [instrument, setInstrument] = useState('NIFTY-FUT')
  const [orderForm, setOrderForm] = useState({
    type: 'BID',
    price: '',
    quantity: '',
  })
  const [orderMsg, setOrderMsg] = useState('')

  const subscribe = useCallback((inst: string) => {
    tradingWS.subscribe(inst, (data: string) => {
      try {
        const parsed = JSON.parse(data)
        if (parsed.bids) setBids(parsed.bids)
        if (parsed.asks) setAsks(parsed.asks)
        if (parsed.price) setPrice(parsed.price)
        if (parsed.bids?.[0] && parsed.asks?.[0]) {
          setSpread(+(parsed.asks[0].price - parsed.bids[0].price).toFixed(2))
        }
        setConnected(true)
      } catch {}
    })
  }, [])

  useEffect(() => {
    tradingWS.connect(() => setConnected(true))
    subscribe(instrument)
    return () => {
      tradingWS.unsubscribe(instrument)
    }
  }, [instrument, subscribe])

  const handleSwitchInstrument = (inst: string) => {
    tradingWS.unsubscribe(instrument)
    setInstrument(inst)
    setBids([])
    setAsks([])
    setSpread(0)
    subscribe(inst)
  }

  const placeOrder = async () => {
    try {
      await api.placeOrder({
        accountId: 'demo-account',
        instrumentId: instrument,
        type: orderForm.type,
        price: parseFloat(orderForm.price),
        quantity: parseInt(orderForm.quantity),
      })
      setOrderMsg('Order placed ✓')
      setTimeout(() => setOrderMsg(''), 3000)
    } catch {
      setOrderMsg('Error placing order')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Order Book</h2>
          <div className="flex gap-2">
            {INSTRUMENTS.map((i) => (
              <button
                key={i}
                onClick={() => handleSwitchInstrument(i)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  instrument === i
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            Price:{' '}
            <span className="text-white font-bold">{price.toFixed(2)}</span>
          </span>
          <span className="text-yellow-400">Spread: {spread.toFixed(2)}</span>
          <span
            className={
              connected ? 'text-green-400 text-xs' : 'text-red-400 text-xs'
            }
          >
            {connected ? '● LIVE' : '○ CONNECTING'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrderBookTable bids={bids} asks={asks} />
        <DepthChart bids={bids} asks={asks} />
      </div>

      <div className="card max-w-md">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
          Place Order
        </div>
        <div className="flex gap-2 mb-3">
          {['BID', 'ASK'].map((t) => (
            <button
              key={t}
              onClick={() => setOrderForm((f) => ({ ...f, type: t }))}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
                orderForm.type === t
                  ? t === 'BID'
                    ? 'bg-green-500 text-black'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Price"
            value={orderForm.price}
            onChange={(e) =>
              setOrderForm((f) => ({ ...f, price: e.target.value }))
            }
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          />
          <input
            placeholder="Qty"
            value={orderForm.quantity}
            onChange={(e) =>
              setOrderForm((f) => ({ ...f, quantity: e.target.value }))
            }
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          />
        </div>
        <button
          onClick={placeOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold transition-colors"
        >
          Place {orderForm.type}
        </button>
        {orderMsg && <p className="text-green-400 text-xs mt-2">{orderMsg}</p>}
      </div>
    </div>
  )
}
