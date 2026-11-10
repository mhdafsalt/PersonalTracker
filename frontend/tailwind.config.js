/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F7F5F0', // Main background
          200: '#EFECE4',
          300: '#E5E1D5',
          400: '#D5CFBF',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E6EDE5',
          200: '#CFDEC8',
          300: '#A7B99B', // Secondary accent
          400: '#8DA382',
          500: '#6B8F71', // Primary accent
          600: '#547359',
          700: '#405844',
          800: '#314434',
          900: '#252923', // Main text
        },
        card: '#FFFFFF',
        mainText: '#252923',
        subText: '#777D75',
        borderCol: '#E9E8E1',
        success: '#4F9B72',
        warning: '#D6A24A',
        danger: '#D96C6C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(37, 41, 35, 0.05), 0 1px 3px -1px rgba(37, 41, 35, 0.03)',
        medium: '0 8px 24px -4px rgba(37, 41, 35, 0.08), 0 2px 6px -1px rgba(37, 41, 35, 0.04)',
        hover: '0 12px 30px -4px rgba(37, 41, 35, 0.12), 0 4px 8px -1px rgba(37, 41, 35, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

