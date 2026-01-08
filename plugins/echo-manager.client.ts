import { useNotificationsStore } from '~/stores/notifications'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  if (process.server) return

  const notificationsStore = useNotificationsStore()
  const authStore = useAuthStore()

  // Global Echo listener management
  let isInitialized = false

  function initializeEchoListeners() {
    if (isInitialized) return
    isInitialized = true

    // Attach notification listeners when user is authenticated
    if (authStore.user?.id) {
      notificationsStore.attachEchoListeners()
    }
  }

  function cleanupEchoListeners() {
    if (!isInitialized) return
    isInitialized = false

    notificationsStore.detachEchoListeners()
  }

  // Watch for auth changes
  watch(() => authStore.user?.id, (userId, oldUserId) => {
    if (userId && userId !== oldUserId) {
      // User logged in or changed - attach listeners
      initializeEchoListeners()
    } else if (!userId && oldUserId) {
      // User logged out - cleanup listeners
      cleanupEchoListeners()
    }
  }, { immediate: true })

  // Handle page visibility changes (tab focus/blur)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab became hidden - could pause non-critical listeners
      } else {
        // Tab became visible - refresh session if needed
        if (authStore.user?.id) {
          // Could refresh session or re-attach listeners if needed
        }
      }
    })
  }

  // Cleanup on app unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      cleanupEchoListeners()
    })
  }

  return {
    provide: {
      echoManager: {
        initializeEchoListeners,
        cleanupEchoListeners
      }
    }
  }
})