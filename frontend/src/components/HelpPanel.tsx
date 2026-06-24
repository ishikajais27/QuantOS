// frontend/components/HelpPanel.tsx
'use client'

import { useState } from 'react'

interface HelpPanelProps {
  title: string
  sections: Array<{ label: string; text: string }>
}

export default function HelpPanel({ title, sections }: HelpPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors"
        aria-expanded={open}
        aria-label="Toggle help panel"
      >
        <span className="text-base leading-none">ℹ️</span>
        <span>How this works</span>
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-40 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4">
          {/* Close */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              {title}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-600 hover:text-gray-300 text-base leading-none transition-colors"
              aria-label="Close help panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((s, i) => (
              <div key={i}>
                <div className="text-green-400 text-xs font-semibold mb-0.5">
                  {s.label}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
