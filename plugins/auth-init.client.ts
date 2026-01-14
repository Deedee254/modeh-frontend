import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Ensure we only run on client
export default defineNuxtPlugin((nuxtApp) => {
  // Ensure we only run on client
  if (process.client === false) return

  try {
    const auth = useAuth()
    const authStore = useAuthStore()

    // The auth store already watches auth.data and syncs automatically via the watcher
    // This plugin just ensures that initial session load is prioritized
    nuxtApp.hook('app:mounted', async () => {
      try {
        // Restore the session from JWT/session-token cookie
        // This triggers the auth.data watcher in auth store which syncs to authStore.user
        await auth.getSession()
      } catch (e) {
        // Non-fatal - auth might not be ready yet
        console.debug('[auth-init] Session restore error (non-fatal):', e)
      }
    })
  } catch (e) {
    // If useAuth() or stores are not available, fail silently
    console.debug('[auth-init] Plugin initialization skipped:', e)
  }
})
