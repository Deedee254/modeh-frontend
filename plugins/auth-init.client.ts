import { onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Ensure we only run on client
export default defineNuxtPlugin(() => {
  if (process.client === false) return

  try {
    const auth = useAuth()
    const authStore = useAuthStore()

    onMounted(async () => {
      try {
        // If already authenticated according to nuxt-auth, fetch the full user
        if (auth?.status?.value === 'authenticated') {
          await authStore.fetchUser()
          return
        }

        // Otherwise watch for a transition to authenticated and fetch once
        const stop = watch(
          () => auth.status?.value,
          async (v) => {
            if (v === 'authenticated') {
              try { await authStore.fetchUser() } catch (e) { /* best-effort */ }
              stop()
            }
          }
        )
      } catch (e) {
        // non-fatal
        // eslint-disable-next-line no-console
        console.warn('auth-init plugin failed to initialize auth store', e)
      }
    })
  } catch (e) {
    // If useAuth() or stores are not available, fail silently
    // eslint-disable-next-line no-console
    console.warn('auth-init plugin could not run', e)
  }
})
