/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emerald / Mint / Neon Gradient Green palette
        brand: {
          50: '#062013',
          100: '#0a3621',
          200: '#0f5232',
          300: '#157547',
          400: '#1ba061',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Deep obsidian / charcoal / true black palette
        navy: {
          50: '#181b1f',
          100: '#22262c',
          200: '#2d333b',
          300: '#414853',
          400: '#768390',
          500: '#9ba7b4',
          600: '#adbac7',
          700: '#cdd9e5',
          800: '#e1e7ed',
          900: '#f0f3f6',
          950: '#ffffff',
        },
        dark: {
          950: '#050709',
          900: '#0a0d12',
          850: '#0e1218',
          800: '#12171f',
          750: '#181e28',
          700: '#1e2633',
        },
        accent: {
          emerald: '#10b981',
          mint: '#34d399',
          lime: '#84cc16',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        glow: '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
