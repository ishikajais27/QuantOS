'use client'
interface Level {
  price: number
  volume: number
}
interface Props {
  bids: Level[]
  asks: Level[]
}

export default function DepthChart({ bids, asks }: Props) {
  const maxVol = Math.max(
    ...bids.map((b) => b.volume),
    ...asks.map((a) => a.volume),
    1,
  )

  return (
    <div className="card space-y-1">
      <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
        Market Depth
      </div>

      {asks
        .slice(0, 8)
        .reverse()
        .map((level, i) => (
          <div key={`ask-${i}`} className="flex items-center gap-3">
            <span className="ask w-24 text-right text-xs font-mono">
              {level.price.toFixed(2)}
            </span>
            <div className="flex-1 bg-gray-800 rounded h-5 relative overflow-hidden">
              <div
                className="bg-red-900/70 h-full rounded transition-all duration-300"
                style={{ width: `${(level.volume / maxVol) * 100}%` }}
              />
              <span className="absolute right-2 top-0 h-full flex items-center text-xs text-gray-400">
                {level.volume.toLocaleString()}
              </span>
            </div>
          </div>
        ))}

      <div className="border-t border-gray-700 my-2" />

      {bids.slice(0, 8).map((level, i) => (
        <div key={`bid-${i}`} className="flex items-center gap-3">
          <span className="bid w-24 text-right text-xs font-mono">
            {level.price.toFixed(2)}
          </span>
          <div className="flex-1 bg-gray-800 rounded h-5 relative overflow-hidden">
            <div
              className="bg-green-900/70 h-full rounded transition-all duration-300"
              style={{ width: `${(level.volume / maxVol) * 100}%` }}
            />
            <span className="absolute right-2 top-0 h-full flex items-center text-xs text-gray-400">
              {level.volume.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
