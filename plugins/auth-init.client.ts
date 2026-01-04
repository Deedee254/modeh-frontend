import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Ensure we only run on client
export default defineNuxtPlugin((nuxtApp) => {
  // Ensure we only run on client
  if (process.client === false) return

  try {
    const auth = useAuth()
    const authStore = useAuthStore()

    // Use Nuxt's app mounted hook to sync session state
    nuxtApp.hook('app:mounted', async () => {
      try {
        // First, restore the session from Nuxt-Auth JWT cookie
        console.log('[auth-init] Restoring session from JWT cookie...')
        const session = await auth.getSession()
        console.log('[auth-init] Session restored:', { 
          authenticated: !!session, 
          email: session?.user?.email, 
          hasToken: !!(session?.user as any)?.apiToken 
        })

        // Sync the Nuxt-Auth session to the auth store
        // This updates the store's `user` and `role` based on the restored session
        if (session?.user) {
          const normalizedUser = {
            id: (session.user as any).id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
            image: session.user.image,
            role: (session.user as any).role,
            apiToken: (session.user as any).apiToken
          }
          console.log('[auth-init] Syncing user to store:', { email: normalizedUser.email, role: normalizedUser.role })
          authStore.user = normalizedUser as any
          authStore.role = normalizedUser.role
        }
      } catch (e) {
        // non-fatal
        console.warn('[auth-init] plugin failed to initialize auth store', e)
      }
    })
  } catch (e) {
    // If useAuth() or stores are not available, fail silently
    console.warn('[auth-init] plugin could not run', e)
  }
})
