/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#0e0e10',
        'panel-bg': '#141416',
        'accent': '#6e7bf2',
        'accent-hover': '#8b96f7',
        'success': '#3ecf71',
        'error': '#e5484d',
        'warning': '#f0a641',
        'text-primary': '#ededef',
        'text-secondary': '#7a7a80',
        'border': 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        'code': ['JetBrains Mono', 'monospace'],
        'ui': ['Inter', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
