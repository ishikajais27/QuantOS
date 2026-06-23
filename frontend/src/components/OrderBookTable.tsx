interface Level {
  price: number
  volume: number
}
interface Props {
  bids: Level[]
  asks: Level[]
}

export default function OrderBookTable({ bids, asks }: Props) {
  const maxVol = Math.max(
    ...bids.map((b) => b.volume),
    ...asks.map((a) => a.volume),
    1,
  )

  return (
    <div className="card font-mono text-xs">
      <div className="grid grid-cols-3 gap-2 text-gray-600 mb-2 text-xs uppercase tracking-wider">
        <span>Price</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Depth</span>
      </div>

      {asks
        .slice(0, 10)
        .reverse()
        .map((level, i) => (
          <div
            key={`ask-${i}`}
            className="grid grid-cols-3 gap-2 py-0.5 hover:bg-gray-800 rounded transition-colors"
          >
            <span className="ask">{level.price.toFixed(2)}</span>
            <span className="text-right text-gray-400">
              {level.volume.toLocaleString()}
            </span>
            <div className="flex justify-end items-center">
              <div
                className="h-2 bg-red-900 rounded"
                style={{ width: `${(level.volume / maxVol) * 60}px` }}
              />
            </div>
          </div>
        ))}

      <div className="my-2 border-t border-gray-700" />

      {bids.slice(0, 10).map((level, i) => (
        <div
          key={`bid-${i}`}
          className="grid grid-cols-3 gap-2 py-0.5 hover:bg-gray-800 rounded transition-colors"
        >
          <span className="bid">{level.price.toFixed(2)}</span>
          <span className="text-right text-gray-400">
            {level.volume.toLocaleString()}
          </span>
          <div className="flex justify-end items-center">
            <div
              className="h-2 bg-green-900 rounded"
              style={{ width: `${(level.volume / maxVol) * 60}px` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
