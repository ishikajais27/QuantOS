'use client'

// Visual representation of Markowitz efficient frontier
export default function EfficientFrontier() {
  const portfolios = [
    { risk: 0.05, ret: 0.08 },
    { risk: 0.08, ret: 0.12 },
    { risk: 0.12, ret: 0.15 },
    { risk: 0.15, ret: 0.17 },
    { risk: 0.2, ret: 0.18 },
    { risk: 0.25, ret: 0.19 },
  ]

  const W = 400,
    H = 200
  const pad = 30
  const maxRisk = 0.3,
    maxRet = 0.25

  const toX = (risk: number) => pad + (risk / maxRisk) * (W - 2 * pad)
  const toY = (ret: number) => H - pad - (ret / maxRet) * (H - 2 * pad)

  const points = portfolios.map((p) => `${toX(p.risk)},${toY(p.ret)}`).join(' ')

  return (
    <div className="card">
      <div className="text-gray-400 text-sm mb-2">
        Efficient Frontier (Convex Hull)
      </div>
      <svg width={W} height={H} className="w-full">
        <polyline
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          points={points}
        />
        {portfolios.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.risk)}
            cy={toY(p.ret)}
            r="4"
            fill="#22c55e"
            opacity="0.8"
          />
        ))}
        <text
          x={W / 2}
          y={H - 5}
          fill="#6b7280"
          fontSize="10"
          textAnchor="middle"
        >
          Risk (σ)
        </text>
        <text
          x="10"
          y={H / 2}
          fill="#6b7280"
          fontSize="10"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${H / 2})`}
        >
          Return
        </text>
      </svg>
    </div>
  )
}
