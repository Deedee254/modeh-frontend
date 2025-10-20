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
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
