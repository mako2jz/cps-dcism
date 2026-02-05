/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tech / Performance Palette
        'cps-bg': '#0e1930',
        'cps-bg-dark': '#000000',
        'cps-primary': '#21CEAD',
        'cps-primary-alt': '#06D6A0',
        'cps-text': '#F8F7F3',
        'cps-text-muted': '#9CA3AF',
        'cps-card': '#1a2744',
        'cps-card-hover': '#243352',
        'cps-border': '#2d3f5f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
