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
      <div className="text-gray-400 text-sm mb-2">Depth Chart</div>
      {asks
        .slice(0, 8)
        .reverse()
        .map((level, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="ask w-20 text-right text-xs">
              {level.price.toFixed(2)}
            </span>
            <div className="flex-1 bg-gray-800 rounded-sm h-4 relative">
              <div
                className="bg-red-900 h-full rounded-sm"
                style={{ width: `${(level.volume / maxVol) * 100}%` }}
              />
            </div>
          </div>
        ))}
      <div className="border-t border-gray-700 my-1" />
      {bids.slice(0, 8).map((level, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="bid w-20 text-right text-xs">
            {level.price.toFixed(2)}
          </span>
          <div className="flex-1 bg-gray-800 rounded-sm h-4 relative">
            <div
              className="bg-green-900 h-full rounded-sm"
              style={{ width: `${(level.volume / maxVol) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
