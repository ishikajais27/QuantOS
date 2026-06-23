/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bid: '#22c55e',
        ask: '#ef4444',
        card: '#111827',
      },
    },
  },
  plugins: [],
}
