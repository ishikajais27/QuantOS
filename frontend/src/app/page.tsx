export default function Home() {
  const cards = [
    {
      label: 'Order Book',
      href: '/orderbook',
      desc: 'Live bid/ask depth with real-time STOMP updates',
      color: 'border-green-500',
      icon: '📊',
    },
    {
      label: 'Portfolio',
      href: '/portfolio',
      desc: 'Positions, P&L, efficient frontier chart',
      color: 'border-blue-500',
      icon: '💼',
    },
    {
      label: 'Arbitrage',
      href: '/arbitrage',
      desc: 'Bellman-Ford negative cycle detection across exchanges',
      color: 'border-yellow-500',
      icon: '⚡',
    },
    {
      label: 'Strategy',
      href: '/strategy',
      desc: 'TWAP / VWAP execution builder',
      color: 'border-purple-500',
      icon: '🎯',
    },
  ]

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Multi-Exchange Trading Platform
          </h1>
          <p className="text-gray-400 text-sm">
            Microservices architecture - Real-time WebSocket - Bellman-Ford
            arbitrage - DSA-driven analytics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`card border ${item.color} hover:bg-gray-800 transition-all duration-200 group`}
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="text-white font-bold group-hover:text-green-400 transition-colors">
                {item.label}
              </div>
              <div className="text-gray-500 text-xs mt-2 leading-relaxed">
                {item.desc}
              </div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="card">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Architecture
            </div>
            {[
              'engine:8081 - Matching Engine',
              'market-data:8082 - Feed Normaliser',
              'analytics:8083 - DSA Algorithms',
              'api:8080 - REST Gateway',
              'push:8084 - STOMP WebSocket',
              'strategy:8085 - Execution Stub',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0"
              >
                {s}
              </div>
            ))}
          </div>
          <div className="card">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Algorithms
            </div>
            {[
              'Bellman-Ford - Triangular Arbitrage',
              "Welford's Online - Volatility",
              'VWAP - 30-min Sliding Window',
              'Monotonic Stack - Support/Resistance',
              'Graham Scan - Efficient Frontier',
              'Union-Find - Asset Clustering',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0"
              >
                {s}
              </div>
            ))}
          </div>
          <div className="card">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Infrastructure
            </div>
            {[
              'PostgreSQL 15 - Persistent Storage',
              'Redis 7 - Pub/Sub + Cache',
              'nginx - Reverse Proxy',
              'Docker Compose - Orchestration',
              'Spring Boot 3 - All Services',
              'Next.js 14 - Frontend',
            ].map((s) => (
              <div
                key={s}
                className="text-xs text-gray-500 py-1 border-b border-gray-800 last:border-0"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
