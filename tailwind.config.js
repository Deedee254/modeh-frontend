// https://nuxt.com/modules/ui
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f3f2',
          100: '#f2e7e6',
          200: '#e5cfd0',
          300: '#d8b7b9',
          400: '#cb9fa2',
          500: '#be878b',
          600: '#891f21',
          700: '#7a1a1c',
          800: '#6b1517',
          900: '#5c1012',
          950: '#8b1e24',
        },
        accent: {
          50: '#fffbf0',
          100: '#fff7e0',
          200: '#ffefcc',
          300: '#ffe7b9',
          400: '#ffdf99',
          500: '#f7b932',
          600: '#f0a920',
          700: '#d48e1a',
          800: '#b87315',
          900: '#9c5d0f',
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
