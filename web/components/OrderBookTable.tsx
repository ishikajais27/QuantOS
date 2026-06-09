interface Level {
  price: number
  volume: number
}
interface Props {
  bids: Level[]
  asks: Level[]
}

export default function OrderBookTable({ bids, asks }: Props) {
  return (
    <div className="card font-mono text-sm">
      <div className="grid grid-cols-2 gap-2 text-gray-500 mb-2">
        <span>Price</span>
        <span className="text-right">Volume</span>
      </div>
      {asks
        .slice(0, 10)
        .reverse()
        .map((level, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <span className="ask">{level.price.toFixed(2)}</span>
            <span className="text-right text-gray-400">{level.volume}</span>
          </div>
        ))}
      <div className="my-2 border-t border-gray-700" />
      {bids.slice(0, 10).map((level, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          <span className="bid">{level.price.toFixed(2)}</span>
          <span className="text-right text-gray-400">{level.volume}</span>
        </div>
      ))}
    </div>
  )
}
