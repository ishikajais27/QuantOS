'use client'
import { useEffect, useRef } from 'react'

interface Props {
  prices: number[]
  label?: string
}

export default function PriceChart({ prices, label = 'Price' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prices.length < 2) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width,
      H = canvas.height
    const min = Math.min(...prices),
      max = Math.max(...prices)
    const range = max - min || 1

    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 1.5

    prices.forEach((price, i) => {
      const x = (i / (prices.length - 1)) * W
      const y = H - ((price - min) / range) * H
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [prices])

  return (
    <div className="card">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <canvas ref={canvasRef} width={400} height={120} className="w-full" />
    </div>
  )
}
