import { useAppAlert } from '~/composables/useAppAlert'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  try {
    if (process.client && typeof window !== 'undefined') {
      const originalAlert = window.alert && window.alert.bind(window)
      window.alert = (message) => {
        try {
          // route through the project's alert composable for consistent UI
          useAppAlert().push({ message: String(message), type: 'info' })
        } catch (e) {
          // fallback to the original browser alert if composable fails
          if (typeof originalAlert === 'function') originalAlert(message)
        }
      }
      // keep reference in case other code needs it
      ;(window as any).__originalAlert = originalAlert
    }
  } catch (e) {
    // noop
  }
})
