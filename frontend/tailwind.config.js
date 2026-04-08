/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#0a0a0b',
        surface: '#111114',
        card: '#16161a',
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.125)',
        purple: '#7c6df8',
        'purple-dim': 'rgba(124,109,248,0.125)',
        green: '#22c97e',
        'green-dim': 'rgba(34,201,126,0.094)',
        amber: '#f5a623',
        'amber-dim': 'rgba(245,166,35,0.094)',
        red: '#ff5a5a',
        'red-dim': 'rgba(255,90,90,0.094)',
        blue: '#4a9eff',
        muted: '#888888',
        dim: '#555555',
      },
      animation: {
        pulse2: 'pulse2 2s infinite',
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      },
    },
  },
  plugins: [],
};
