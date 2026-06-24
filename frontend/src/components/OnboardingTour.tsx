// frontend/components/OnboardingTour.tsx
'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { UserRole } from '@/lib/mockData'

const STEPS: Array<{
  title: string
  body: (role: UserRole) => string
  icon: string
  cta: string
}> = [
  {
    icon: '⚡',
    title: 'Welcome to QuantOS',
    body: (role) =>
      role === 'institutional'
        ? "You're logged in as an Institutional Trader. Your dashboard shows large-position portfolio analytics, and your primary tools are the TWAP and VWAP strategy executors."
        : role === 'quant'
          ? "You're logged in as a Quant Trader. Your dashboard highlights the Bellman-Ford arbitrage scanner and the Markowitz Efficient Frontier chart."
          : "You're logged in as a Retail Trader. Your dashboard focuses on the live Order Book and a simple P&L view of your portfolio.",
    cta: 'Next →',
  },
  {
    icon: '📊',
    title: 'Order Book',
    body: () =>
      'Watch live bid (green) and ask (red) depth update in real time via STOMP WebSocket. The spread is the gap between best bid and best ask — tighter is better. You can place a limit order directly from this page.',
    cta: 'Next →',
  },
  {
    icon: '💼',
    title: 'Portfolio',
    body: () =>
      'Your positions, unrealised P&L, and a Markowitz Efficient Frontier chart live here. The frontier curve (green) shows the optimal risk/return boundary computed by a Graham Scan convex hull algorithm running in the analytics service.',
    cta: 'Next →',
  },
  {
    icon: '🎯',
    title: 'Arbitrage & Strategy',
    body: (role) =>
      role === 'institutional'
        ? 'The Strategy page is your primary tool. Configure TWAP (equal time slices) or VWAP (volume-weighted slices) to execute large orders without moving the market against you.'
        : "The Arbitrage page runs Bellman-Ford over a currency exchange graph every 10 seconds. A negative cycle means USD→EUR→GBP→USD returns more than you started with — that's a real arbitrage opportunity.",
    cta: 'Start trading',
  },
]

export default function OnboardingTour() {
  const { user, completeTour } = useUser()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)

  if (!user || user.hasSeenTour || !visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      completeTour()
      setVisible(false)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSkip = () => {
    completeTour()
    setVisible(false)
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Onboarding tour"
      >
        {/* Step indicators */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-4xl mb-4">{current.icon}</div>

        {/* Content */}
        <h2 className="text-white font-bold text-xl mb-3">{current.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          {current.body(user.role)}
        </p>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleSkip}
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-bold transition-colors"
          >
            {current.cta}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-gray-700 text-xs text-center mt-4">
          {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
