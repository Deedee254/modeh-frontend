import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuthStore()
  const api = useApi()

  // Use Nuxt app hook so we run after the app is mounted on the client.
  // This avoids calling Vue lifecycle hooks outside component setup.
  nuxtApp.hook('app:mounted', () => {
    // Run fetchUser on the client so the browser issues the request and cookies are sent.
    try { auth.fetchUser().catch(() => {}) } catch (e) { /* ignore */ }

    // Set up periodic session renewal (every 15 minutes) to prevent session expiration
    if (typeof window !== 'undefined') {
      setInterval(async () => {
        try {
          // Only renew if we have an authenticated user
          if (auth.user) {
            await api.ensureSession()
          }
        } catch (e) {
          // If session renewal fails, the user will be logged out on next API call
          console.warn('Session renewal failed:', e)
        }
      }, 15 * 60 * 1000) // 15 minutes
    }
  })
})
