export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Multi-Exchange Trading Platform
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Order Book',
            href: '/orderbook',
            desc: 'Live bid/ask heaps',
          },
          { label: 'Portfolio', href: '/portfolio', desc: 'Positions & P&L' },
          {
            label: 'Arbitrage',
            href: '/arbitrage',
            desc: 'Bellman-Ford opportunities',
          },
          {
            label: 'Strategy',
            href: '/strategy',
            desc: 'TWAP / VWAP execution',
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="card hover:border-green-500 transition"
          >
            <div className="text-green-400 font-bold">{item.label}</div>
            <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
