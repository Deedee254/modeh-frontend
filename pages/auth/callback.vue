<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-lg w-full bg-white p-6 rounded shadow text-center">
      <h1 class="text-lg font-semibold mb-2">Signing you in…</h1>
      <p class="text-sm text-gray-600">Finishing authentication and redirecting you to the right place.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const config = useRuntimeConfig()
const api = useApi()
const auth = useAuthStore()

function parseQuery(qs) {
  const params = {}
  const search = qs.startsWith('?') ? qs.slice(1) : qs
  for (const part of search.split('&')) {
    if (!part) continue
    const [k, v] = part.split('=')
    params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  }
  return params
}

// Valid onboarding steps for validation
const VALID_STEPS = ['institution', 'role', 'grade', 'subjects', 'complete', 'new-user']

onMounted(async () => {
  try {
    // Read query params from the browser location
    // Note: Authentication is handled via session cookie set by backend Auth::login()
    const params = parseQuery(window.location.search)
    const requires = params.requires_profile_completion === '1' || params.requires_profile_completion === 'true'
    let nextStep = params.next_step || null

    // Validate and sanitize nextStep
    if (nextStep && !VALID_STEPS.includes(nextStep)) {
      console.warn(`Invalid next_step '${nextStep}' received in OAuth callback, defaulting to new-user`)
      nextStep = 'new-user'
    }

    // Clean the URL to remove query params from the address bar
    if (process.client) {
      try { 
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.warn('Failed to clean URL:', err)
      }
    }

    // Fetch current user (api/me) to hydrate app state
    // The session cookie set by Auth::login() on the backend will be sent automatically
    // via credentials: 'include' - no need for Bearer token
    let user = null
    try {
      // Use the API composable to fetch user, which handles CSRF and session properly
      const response = await api.get('/api/me')

      // Check for auth-related errors (401, 419)
      if (response.status === 401 || response.status === 419) {
        console.warn('Session expired or unauthorized during callback')
        return router.replace('/login')
      }

      // Check for other errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch user`)
      }

      // Parse the user data
      user = await response.json()
      
      // CRITICAL: Set the user in the auth store so the entire app knows they're logged in
      if (user) {
        auth.setUser(user)
      }
    } catch (err) {
      console.warn('Failed to fetch /api/me after social login:', err)
      // Continue - user may be created server-side but /me may require cookies
    }

    // If onboarding is required, send user to the specific step needed
    // If the OAuth callback explicitly requested onboarding, respect it first
    if (requires) {
      // Use the validated next_step to go to the correct onboarding page
      return router.replace(`/onboarding/${nextStep || 'new-user'}`)
    }

    // If we couldn't fetch a user role (common when a social login just created
    // a new user server-side), redirect social-created users to the onboarding
    // flow so they can choose their role and complete profile. We only do this
    // when a user object exists but has no role set.
    if (user && (!user.role || user.role === null)) {
      return router.replace(`/onboarding/${nextStep || 'new-user'}`)
    }

    // Otherwise go to dashboard depending on role
    const role = user?.role || auth.user?.role || null
    if (role === 'quiz-master') {
      return router.replace('/quiz-master/dashboard')
    }
    return router.replace('/quizee/dashboard')

  } catch (e) {
    console.error('Fatal error in OAuth callback:', e)
    return router.replace('/')
  }
})
</script>
<style scoped></style>
