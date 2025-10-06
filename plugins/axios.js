// NOTE: axios plugin retained as a no-op compatibility shim.
// The app now uses Nuxt's built-in $fetch and the Pinia auth store for requests.
// This file intentionally does nothing to avoid unexpected global axios behavior.

export default defineNuxtPlugin(() => {
  if (process.client) {
    // eslint-disable-next-line no-console
    console.info('[plugins/axios.js] shim active: use $fetch or the auth store instead of $axios')
  }
})