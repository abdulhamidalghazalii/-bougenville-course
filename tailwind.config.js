/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Identity Palette
        navyInk: {
          DEFAULT: '#17365D',
          50: '#F0F5FA',
          100: '#DCEBFA',
          200: '#B8D5F5',
          300: '#8FB8EE',
          400: '#548FD8',
          500: '#2A68B8',
          600: '#1F4F91',
          700: '#17365D', // Exact Brand Navy Ink
          800: '#122A48',
          900: '#0C1C30',
        },
        softBlue: {
          DEFAULT: '#DCEBFA',
          50: '#F5FAFF',
          100: '#DCEBFA', // Exact Brand Soft Blue
          200: '#BEDCF8',
          300: '#9AC6F4',
        },
        warmCream: {
          DEFAULT: '#FFF9F0', // Exact Brand Warm Cream
          50: '#FFFDF9',
          100: '#FFF9F0',
          200: '#FEF2DC',
          300: '#FDE4BD',
        },
        softCoral: {
          DEFAULT: '#F3B7A8', // Exact Brand Soft Coral
          50: '#FDF7F5',
          100: '#FBEBE7',
          200: '#F7D4CC',
          300: '#F3B7A8',
          400: '#E88B77',
          500: '#DC644D',
        },
        sageGreen: {
          DEFAULT: '#DDEBDD', // Exact Brand Sage Green
          50: '#F6FAF6',
          100: '#DDEBDD',
          200: '#BED9BE',
          300: '#94BF94',
          400: '#689F68',
          500: '#467F46',
          700: '#2D562D',
        },
        slateGray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Backward compatibility mappings
        brand: {
          50: '#F0F5FA',
          100: '#DCEBFA',
          200: '#B8D5F5',
          300: '#8FB8EE',
          400: '#3D77BE',
          500: '#1F4F91',
          600: '#17365D', // Navy Ink
          700: '#122A48',
          800: '#0D1E34',
          900: '#081321',
        },
        pastelPink: {
          50: '#FDF7F5',
          100: '#FBEBE7',
          200: '#F7D4CC',
          300: '#F3B7A8', // Soft Coral
          400: '#E88B77',
          500: '#DC644D',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FFF9F0', // Warm Cream
          200: '#FBF3E6',
          300: '#F4E8D3',
        },
        slateNavy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#17365D', // Navy Ink
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',  // 4px
        'md': '0.375rem', // 6px
        'lg': '0.5rem',   // 8px
        'xl': '0.75rem',  // 12px
        '2xl': '1rem',    // 16px (sensible, purposeful curves, not oversized bubbles)
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 54, 93, 0.04), 0 1px 2px -1px rgba(23, 54, 93, 0.04)',
        card: '0 1px 4px 0 rgba(23, 54, 93, 0.06), 0 4px 12px 0 rgba(23, 54, 93, 0.03)',
        floating: '0 8px 24px -4px rgba(23, 54, 93, 0.10)',
      }
    },
  },
  plugins: [],
}
