/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#faf6f1',
          100: '#f3ebe0',
          200: '#e6d4bc',
          300: '#d5b794',
          400: '#c49a6c',
          500: '#b8844f',
          600: '#a96f43',
          700: '#8c5839',
          800: '#724833',
          900: '#5e3c2c',
          950: '#331f16',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#fbf3e7',
          300: '#f7e9d4',
          400: '#f1dab8',
          500: '#e9c89a',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
