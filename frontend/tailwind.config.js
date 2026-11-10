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
        canvas: '#EDEFF2',
        cardWhite: '#FFFFFF',
        dark: {
          900: '#111315',
          800: '#1A1D20',
          700: '#262A2E',
        },
        lime: {
          DEFAULT: '#D4F648',
          hover: '#C2E436',
          light: '#F4FCCF',
        },
        iceBlue: {
          DEFAULT: '#E1F0FD',
          border: '#D0E5F9',
          dark: '#0284C7',
        },
        coral: '#FF5722',
        subText: '#7E8590',
        borderCol: '#E5E8ED',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        bento: '0 4px 20px -2px rgba(17, 19, 21, 0.04), 0 2px 6px -1px rgba(17, 19, 21, 0.02)',
        'bento-hover': '0 12px 32px -4px rgba(17, 19, 21, 0.08), 0 4px 12px -2px rgba(17, 19, 21, 0.04)',
        pill: '0 2px 10px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
        bento: '1.75rem',
      },
    },
  },
  plugins: [],
};
