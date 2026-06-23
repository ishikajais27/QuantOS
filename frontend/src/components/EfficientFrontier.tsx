'use client'
import { useEffect, useState } from 'react'

interface Portfolio {
  risk: number
  ret: number
}

const DEFAULT_PORTFOLIOS: Portfolio[] = [
  { risk: 0.05, ret: 0.08 },
  { risk: 0.08, ret: 0.12 },
  { risk: 0.12, ret: 0.15 },
  { risk: 0.15, ret: 0.17 },
  { risk: 0.2, ret: 0.18 },
  { risk: 0.25, ret: 0.19 },
  { risk: 0.3, ret: 0.195 },
]

export default function EfficientFrontier() {
  const [portfolios] = useState<Portfolio[]>(DEFAULT_PORTFOLIOS)
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 500,
    H = 220,
    pad = 40
  const maxRisk = 0.35,
    maxRet = 0.25

  const toX = (risk: number) => pad + (risk / maxRisk) * (W - 2 * pad)
  const toY = (ret: number) => H - pad - (ret / maxRet) * (H - 2 * pad)

  const points = portfolios.map((p) => `${toX(p.risk)},${toY(p.ret)}`).join(' ')

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Efficient Frontier
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            Graham Scan Convex Hull · Risk vs Return
          </div>
        </div>
        {hovered !== null && (
          <div className="text-xs text-right">
            <div className="text-white">
              σ = {(portfolios[hovered].risk * 100).toFixed(0)}%
            </div>
            <div className="text-green-400">
              r = {(portfolios[hovered].ret * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 220 }}
      >
        {/* Grid lines */}
        {[0.05, 0.1, 0.15, 0.2, 0.25].map((v) => (
          <line
            key={v}
            x1={pad}
            x2={W - pad}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#1f2937"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Shaded area under curve */}
        <polygon
          points={`${points} ${toX(maxRisk)},${H - pad} ${pad},${H - pad}`}
          fill="#22c55e"
          fillOpacity="0.05"
        />

        {/* Frontier line */}
        <polyline
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points */}
        {portfolios.map((p, i) => (
          <g key={i}>
            <circle
              cx={toX(p.risk)}
              cy={toY(p.ret)}
              r={hovered === i ? 6 : 4}
              fill={hovered === i ? '#22c55e' : '#16a34a'}
              opacity="0.9"
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          </g>
        ))}

        {/* Axes */}
        <line
          x1={pad}
          y1={H - pad}
          x2={W - pad}
          y2={H - pad}
          stroke="#374151"
        />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#374151" />

        {/* Labels */}
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

        {/* Axis ticks */}
        {[0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map((v) => (
          <text
            key={v}
            x={toX(v)}
            y={H - pad + 12}
            fill="#4b5563"
            fontSize="8"
            textAnchor="middle"
          >
            {(v * 100).toFixed(0)}%
          </text>
        ))}
      </svg>
    </div>
  )
}
