'use client'
import PriceChart from './PriceChart'

interface Props {
  prices: number[]
  vwaps: number[]
}

export default function VWAPChart({ prices, vwaps }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-gray-400 text-xs uppercase tracking-wider">
        Price vs VWAP (30-min window)
      </div>
      <PriceChart prices={prices} label="Price" color="#22c55e" />
      <PriceChart
        prices={vwaps}
        label="VWAP (30-min sliding)"
        color="#3b82f6"
      />
    </div>
  )
}
