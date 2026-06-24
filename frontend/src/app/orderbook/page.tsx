// frontend/app/orderbook/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import OrderBookTable from '@/components/OrderBookTable'
import DepthChart from '@/components/DepthChart'
import HelpPanel from '@/components/HelpPanel'
import { tradingWS } from '@/lib/websocket'
import { api } from '@/lib/api-client'
import { RequireAuth, useUser } from '@/context/UserContext'

interface Level {
  price: number
  volume: number
}

const INSTRUMENTS = ['NIFTY-FUT', 'BTCUSDT']

const ORDERBOOK_HELP = {
  title: 'Order Book — How it works',
  sections: [
    {
      label: 'Bids vs Asks',
      text: 'Green rows are bids (buyers), red rows are asks (sellers). Prices are sorted so the best bid (highest buyer) and best ask (lowest seller) sit closest to the spread.',
    },
    {
      label: 'The Spread',
      text: 'The spread is the gap between the best bid and best ask. A tight spread means a liquid market — you can trade without much price slippage.',
    },
    {
      label: 'Placing an Order',
      text: 'Select BID or ASK, enter a price and quantity, and click Place. Your order goes to the Java matching engine running on port 8081, which uses a priority queue heap to match it instantly.',
    },
    {
      label: 'Live Updates',
      text: 'Data arrives via STOMP WebSocket from the Push Server (port 8084), which subscribes to Redis Pub/Sub channels published by the Market Data service (port 8082).',
    },
  ],
}

function OrderBookContent() {
  const { user } = useUser()
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
        accountId: user?.id ?? 'demo-account',
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
        <div className="flex items-center gap-4 flex-wrap">
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
          <HelpPanel
            title={ORDERBOOK_HELP.title}
            sections={ORDERBOOK_HELP.sections}
          />
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

export default function OrderBookPage() {
  return (
    <RequireAuth>
      <OrderBookContent />
    </RequireAuth>
  )
}
