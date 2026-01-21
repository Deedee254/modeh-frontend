// NOTE: axios plugin retained as a no-op compatibility shim.
// The app now uses Nuxt's built-in $fetch and the Pinia auth store for requests.
// This file intentionally does nothing to avoid unexpected global axios behavior.

export default defineNuxtPlugin(() => {
  // axios compatibility shim - no-op
})