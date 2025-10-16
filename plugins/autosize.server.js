import { defineNuxtPlugin } from '#app'

// Register a minimal directive server-side so SSR can resolve v-autosize
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('autosize', {
    // Server renderer expects getSSRProps to exist; return empty props
    getSSRProps() {
      return {}
    }
  })
})
