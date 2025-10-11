import { useRouter } from 'vue-router'

// Client-only plugin: process a post-login intent saved to localStorage under 'modeh:postLoginIntent'
export default defineNuxtPlugin((nuxtApp) => {
  // Expose a function on the Nuxt app for other modules to call after login/fetchUser
  nuxtApp.$processPostLoginIntent = async function processPostLoginIntent() {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('modeh:postLoginIntent')
      if (!raw) return
      const intent = JSON.parse(raw)
      // TTL: ignore intents older than 5 minutes
      if (intent.ts && Date.now() - intent.ts > 1000 * 60 * 5) {
        localStorage.removeItem('modeh:postLoginIntent')
        return
      }

      // Only known intent supported for now: subscribe
      if (intent.type === 'subscribe' && intent.packageId) {
        try {
          // Use global $fetch (Nuxt) so credentials and baseURL are applied
          await $fetch(`/api/packages/${intent.packageId}/subscribe`, { method: 'POST', credentials: 'include' })
          localStorage.removeItem('modeh:postLoginIntent')
          // navigate to My Subscription detail
          const router = useRouter()
          // use a short timeout so this is executed after login navigation completes
          setTimeout(() => router.push('/quizee/subscription'), 50)
        } catch (err) {
          // keep intent so the user can retry; log for debugging
          console.error('Post-login subscribe failed', err)
        }
      } else {
        // Unknown intent — clear it
        localStorage.removeItem('modeh:postLoginIntent')
      }
    } catch (e) {
      // ignore malformed intent
      try { localStorage.removeItem('modeh:postLoginIntent') } catch (er) {}
    }
  }
})
