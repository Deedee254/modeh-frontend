import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useApi from '~/composables/useApi'

// Ensure we only run on client
export default defineNuxtPlugin((nuxtApp) => {
  // Ensure we only run on client
  if (process.client === false) return

  try {
    const auth = useAuth()
    const authStore = useAuthStore()
    const taxonomyStore = useTaxonomyStore()
    const api = useApi()

    // The auth store already watches auth.data and syncs automatically via the watcher
    // This plugin just ensures that initial session load is prioritized
    nuxtApp.hook('app:mounted', async () => {
      try {
        // Initialize CSRF token FIRST before any authenticated requests
        // This ensures the Sanctum cookie is set and XSRF-TOKEN is available
        // CRITICAL: GET requests don't automatically trigger CSRF init, so we do it explicitly
        await api.ensureCsrf()
      } catch (e) {
        // CSRF init may fail if server is unreachable, but we continue anyway
        console.warn('[auth-init] CSRF initialization failed (non-fatal):', e)
      }

      try {
        // Restore the session from JWT/session-token cookie
        // This triggers the auth.data watcher in auth store which syncs to authStore.user
        await auth.getSession()
      } catch (e) {
        // session restore may fail if auth not ready
      }

      // Load taxonomy data (levels, grades, subjects) globally for resolution
      try {
        await taxonomyStore.fetchLevels()
        await taxonomyStore.fetchGrades()
        await taxonomyStore.fetchAllSubjects()
      } catch (e) {
        // Taxonomy load is optional - data will load on-demand in components
      }
    })
  } catch (e) {
    // silently skip if stores not available
  }
})
