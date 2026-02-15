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
    const pwaSession = usePwaSession()

    // The auth store already watches auth.data and syncs automatically via the watcher
    // This plugin just ensures that initial session load is prioritized
    nuxtApp.hook('app:mounted', async () => {
        try {
          // STEP 1: Try to restore PWA session from storage (IndexedDB/localStorage)
          // Dynamically import the PWA session composable so the heavy IndexedDB
          // logic stays in a separate chunk and is loaded only on demand.
          const { usePwaSession } = await import('~/composables/usePwaSession')
          const pwaSession = usePwaSession()
          const sessionRestored = await pwaSession.initializeSession()
          if (sessionRestored) {
            console.log('[auth-init] PWA session restored from persistent storage')
          }
        } catch (e) {
          console.warn('[auth-init] PWA session restoration failed (non-fatal):', e)
        }

      try {
        // Initialize CSRF token FIRST before any authenticated requests
        // This ensures the Sanctum cookie is set and XSRF-TOKEN is available
        // CRITICAL: GET requests don't automatically trigger CSRF init, so we do it explicitly
        await api.ensureCsrf()
      } catch (e) {
        // CSRF init may fail if server is unreachable, but we continue anyway
        console.warn('[auth-init] CSRF initialization failed (non-fatal):', e)
      }

      // NOTE: Disabled getSession() call to prevent Vue Router recursion issues
      // The auth middleware will fetch session data when needed via router navigation
      // and the auth store already watches auth.data for changes automatically

      // Load taxonomy data (levels, grades, subjects) globally for resolution
      try {
        await taxonomyStore.fetchLevels()
        await taxonomyStore.fetchGrades()
        await taxonomyStore.fetchAllSubjects()
      } catch (e) {
        // Taxonomy load is optional - data will load on-demand in components
      }

        // STEP 2: Watch for user changes and persist to PWA storage
      // This ensures that when user logs in or their profile updates,
      // the session is saved for offline-first support
      watch(
        () => authStore.user,
        async (newUser) => {
          if (newUser) {
            // User logged in or profile updated - persist to storage
            try {
              const { usePwaSession } = await import('~/composables/usePwaSession')
              const pwaSession = usePwaSession()
              await pwaSession.persistSession()
            } catch (e) {
              console.warn('[auth-init] Failed to persist PWA session (non-fatal):', e)
            }
          }
        },
        { deep: true }
      )
    })
  } catch (e) {
    // silently skip if stores not available
  }
})
