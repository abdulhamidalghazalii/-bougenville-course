/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAE0FD',
          300: '#7DC4FB',
          400: '#38A3F6',
          500: '#0F84E8',
          600: '#0367C7',
          700: '#0452A2',
          800: '#084685',
          900: '#0C3C6F',
        },
        pastelPink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F5EFE6',
          300: '#EDE4D5',
        },
        slateNavy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        card: '0 10px 30px -4px rgba(15, 23, 42, 0.08)',
        float: '0 20px 40px -6px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
