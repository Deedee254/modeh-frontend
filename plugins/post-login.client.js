import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

// Client-only plugin: process a post-login intent saved to localStorage under 'modeh:postLoginIntent'
export default defineNuxtPlugin((nuxtApp) => {
  // Expose a function on the Nuxt app for other modules to call after login/fetchUser
  nuxtApp.$processPostLoginIntent = async function processPostLoginIntent() {
    if (typeof window === 'undefined') return
    const api = useApi()
    try {
      const raw = localStorage.getItem('modeh:postLoginIntent')
      if (!raw) return
      const intent = JSON.parse(raw)
      // TTL: ignore intents older than 5 minutes
      if (intent.ts && Date.now() - intent.ts > 1000 * 60 * 5) {
        localStorage.removeItem('modeh:postLoginIntent')
        return
      }

      // Known intents supported: subscribe, affiliate
      if (intent.type === 'subscribe' && intent.packageId) {
        try {
          const res = await api.postJson(`/api/packages/${intent.packageId}/subscribe`, {})
          // if session expired or unauthorized, do not clear intent so user can retry after login
          if (api.handleAuthStatus(res)) return
          // success: clear intent and navigate to subscription
          localStorage.removeItem('modeh:postLoginIntent')
          const router = useRouter()
          // use a short timeout so this is executed after login navigation completes
          setTimeout(() => router.push('/quizee/subscription'), 50)
        } catch (err) {
          // keep intent for retry
        }
      } else if (intent.type === 'affiliate') {
        try {
          const router = useRouter()
          // Ensure affiliate code exists for this user. If not, generate it.
          try {
            const affRes = await api.get('/api/affiliates/me')
            if (api.handleAuthStatus && api.handleAuthStatus(affRes)) return
            let hasCode = false
            if (affRes && affRes.ok) {
              const affData = await affRes.json().catch(() => null)
              hasCode = Boolean(affData && (affData.referral_code || affData.referral_code === '')) && !!affData.referral_code
            }
            if (!hasCode) {
              const genRes = await api.postJson('/api/affiliates/generate-code', {})
              if (api.handleAuthStatus && api.handleAuthStatus(genRes)) return
            }
          } catch (e) {
            // non-fatal; continue to redirect
          }

          // determine where to send user: query the centralized auth store for the role
          let role = null
          try {
            const authStore = useAuthStore()
            await authStore.fetchUser?.()
            role = authStore.user?.role || null
          } catch (e) {
            // ignore and default to quizee
          }

          const target = role === 'quiz-master' ? '/quiz-master/affiliate' : '/quizee/affiliate'
          localStorage.removeItem('modeh:postLoginIntent')
          setTimeout(() => router.push(target), 50)
        } catch (err) {
          try { localStorage.removeItem('modeh:postLoginIntent') } catch (e) {}
        }
      } else if (intent.type === 'accept-invitation' && intent.token) {
        try {
          const token = intent.token
          // Query invitation details to get institution id
          const invRes = await api.get(`/api/institutions/invitation/${encodeURIComponent(token)}`)
          if (api.handleAuthStatus && api.handleAuthStatus(invRes)) return
          if (!invRes.ok) {
            // failed to fetch invitation details; clear intent
            localStorage.removeItem('modeh:postLoginIntent')
            return
          }
          const invData = await invRes.json().catch(() => null)
          const institutionId = invData?.invitation?.institution_id
          if (!institutionId) {
            localStorage.removeItem('modeh:postLoginIntent')
            return
          }
          // Accept the invitation (requires authenticated user)
          const acceptRes = await api.postJson(`/api/institutions/${institutionId}/members/accept-invitation/${encodeURIComponent(token)}`, {})
          if (api.handleAuthStatus && api.handleAuthStatus(acceptRes)) return
          if (acceptRes && acceptRes.ok) {
            localStorage.removeItem('modeh:postLoginIntent')
            const router = useRouter()
            setTimeout(() => router.push('/institution-manager/dashboard'), 50)
          } else {
            // clear intent to avoid retry loops
            localStorage.removeItem('modeh:postLoginIntent')
          }
        } catch (err) {
          try { localStorage.removeItem('modeh:postLoginIntent') } catch (e) {}
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
