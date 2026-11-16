/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#791E32',
          primary: '#791E32',
          deep: '#4C1423',
          dark: '#3A0E1B',
          light: '#962B43',
          hover: '#641728',
        },
        medical: {
          red: '#B83A45',
          dark: '#932832',
          light: '#D9535F',
        },
        blush: {
          DEFAULT: '#F4D9D9',
          light: '#FDF2F2',
          soft: '#FAECEC',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          warm: '#FFF8F0',
          light: '#FFFCF7',
        },
        beige: {
          DEFAULT: '#F1E7DC',
          pale: '#F1E7DC',
          subtle: '#E8DDD0',
        },
        text: {
          dark: '#281D20',
          muted: '#766A69',
          light: '#9E9291',
        },
        status: {
          success: '#397A55',
          warning: '#D97706',
          error: '#B83A45',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(40, 29, 32, 0.05), 0 1px 4px -1px rgba(40, 29, 32, 0.03)',
        'soft': '0 4px 20px -2px rgba(76, 20, 35, 0.06), 0 2px 8px -1px rgba(76, 20, 35, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(76, 20, 35, 0.08), 0 4px 12px -2px rgba(76, 20, 35, 0.04)',
        'burgundy-glow': '0 4px 20px -2px rgba(121, 30, 50, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

