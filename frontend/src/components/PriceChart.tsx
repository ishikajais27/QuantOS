'use client'
import { useEffect, useRef } from 'react'

interface Props {
  prices: number[]
  label?: string
  color?: string
}

export default function PriceChart({
  prices,
  label = 'Price',
  color = '#22c55e',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prices.length < 2) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const rng = max - min || 1

    ctx.clearRect(0, 0, W, H)

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, H)
    gradient.addColorStop(0, color + '33')
    gradient.addColorStop(1, color + '00')

    ctx.beginPath()
    prices.forEach((price, i) => {
      const x = (i / (prices.length - 1)) * W
      const y = H - ((price - min) / rng) * (H - 10) - 5
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Fill below line
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [prices, color])

  return (
    <div className="card">
      <div className="text-gray-400 text-xs mb-2">{label}</div>
      <canvas ref={canvasRef} width={400} height={100} className="w-full" />
    </div>
  )
}
