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
        
        // Check if session is valid: must have user object with email AND apiToken
        const hasValidSession = session?.user && 
                                 (session.user as any).email && 
                                 (session.user as any).apiToken
        
        console.log('[auth-init] Session restored:', { 
          authenticated: hasValidSession, 
          email: session?.user?.email, 
          hasToken: !!(session?.user as any)?.apiToken,
          rawSession: session ? 'exists' : 'null'
        })

        // Only sync to store if session is complete and valid
        if (hasValidSession && session?.user) {
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
        } else if (session?.user && !(session.user as any).apiToken) {
          // Session exists but token is missing - likely expired
          console.warn('[auth-init] Session found but token is missing (likely expired). Clearing session...')
          // Call signOut to clear the invalid session
          await auth.signOut({ redirect: false })
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
