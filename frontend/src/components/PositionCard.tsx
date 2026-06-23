interface Position {
  instrumentId: string
  quantity: number
  averagePrice: number
  unrealizedPnl: number
}

export default function PositionCard({ position }: { position: Position }) {
  const pnl = position.unrealizedPnl ?? 0
  const isLong = position.quantity > 0
  const pnlPct = position.averagePrice
    ? (
        (pnl / (position.averagePrice * Math.abs(position.quantity))) *
        100
      ).toFixed(2)
    : '0.00'

  return (
    <div
      className={`card border ${pnl >= 0 ? 'border-green-900' : 'border-red-900'} hover:border-opacity-100 transition-colors`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="font-bold text-white text-sm">
          {position.instrumentId}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded ${isLong ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}
        >
          {isLong ? 'LONG' : 'SHORT'}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>Qty</span>
          <span className="text-white font-mono">
            {Math.abs(position.quantity)}
          </span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Avg Price</span>
          <span className="text-white font-mono">
            ₹{position.averagePrice?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-800">
          <span className="text-gray-400">Unrealised P&L</span>
          <div className="text-right">
            <div
              className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
            </div>
            <div
              className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {pnl >= 0 ? '+' : ''}
              {pnlPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
