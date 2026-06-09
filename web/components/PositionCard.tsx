interface Position {
  instrumentId: string
  quantity: number
  averagePrice: number
  unrealizedPnl: number
}

export default function PositionCard({ position }: { position: Position }) {
  const pnl = position.unrealizedPnl ?? 0
  return (
    <div className="card">
      <div className="font-bold text-white">{position.instrumentId}</div>
      <div className="text-gray-400 text-sm mt-1">Qty: {position.quantity}</div>
      <div className="text-gray-400 text-sm">
        Avg: ₹{position.averagePrice?.toFixed(2)}
      </div>
      <div className={`mt-2 font-bold ${pnl >= 0 ? 'bid' : 'ask'}`}>
        P&L: ₹{pnl.toFixed(2)}
      </div>
    </div>
  )
}
