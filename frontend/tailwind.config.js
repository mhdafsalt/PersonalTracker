/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mira Design System Tokens
        mira: {
          bg: '#efefee',
          surface: '#ffffff',
          subsurface: '#f6f6f5',
          subtle: '#f1f1ef',
          border: '#e8e8e5',
          borderStrong: '#d2d2ce',
          borderMuted: '#ececea',
          dark: '#0f110f',
          darkCard: '#141714',
          darkBorder: '#232723',
          lime: '#d7f43a',
          limeSoft: '#f1f7da',
          limeGlow: '#f1f7c8',
          green: '#8fd94e',
          forest: '#3f7a1e',
          coral: '#ff8a4a',
          coralSoft: '#ffd9c7',
          coralDark: '#b4501e',
          textPrimary: '#0f110f',
          textSecondary: '#4a4a47',
          textMuted: '#6b6b68',
          textSubtle: '#94948f',
        },
        cream: {
          50: '#FAF9F6',
          100: '#efefee', // Mira main background
          200: '#f1f1ef',
          300: '#e8e8e5',
          400: '#d2d2ce',
        },
        sage: {
          50: '#f8faf6',
          100: '#f1f7da',
          200: '#e1efc5',
          300: '#c5e498',
          400: '#8fd94e',
          500: '#6b8f71',
          600: '#3f7a1e',
          700: '#2b5415',
          800: '#1b330d',
          900: '#0f110f',
        },
        card: '#ffffff',
        mainText: '#0f110f',
        subText: '#6b6b68',
        borderCol: '#e8e8e5',
        success: '#3f7a1e',
        warning: '#ff8a4a',
        danger: '#d96c6c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        bento: '0 4px 24px -2px rgba(15, 17, 15, 0.03), 0 1px 3px -1px rgba(15, 17, 15, 0.02)',
        'bento-hover': '0 12px 32px -4px rgba(15, 17, 15, 0.06), 0 4px 8px -1px rgba(15, 17, 15, 0.03)',
        pill: 'inset 0 0 0 1px rgba(255, 255, 255, 0.7), 0 10px 30px 0 rgba(15, 17, 15, 0.08)',
        darkGlow: '0 0 80px -10px rgba(215, 244, 58, 0.25)',
      },
      borderRadius: {
        'bento': '32px',
        'subcard': '22px',
        'pill': '9999px',
        '2xl': '1.25rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
