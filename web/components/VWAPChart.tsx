'use client'
import PriceChart from './PriceChart'

interface Props {
  prices: number[]
  vwaps: number[]
}

export default function VWAPChart({ prices, vwaps }: Props) {
  return (
    <div className="card space-y-3">
      <div className="text-gray-400 text-sm">Price vs VWAP</div>
      <PriceChart prices={prices} label="Price" />
      <PriceChart prices={vwaps} label="VWAP (30min sliding window)" />
    </div>
  )
}
