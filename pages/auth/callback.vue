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
const router = useRouter()
const config = useRuntimeConfig()

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
    // Note: Token is now set via HttpOnly cookie by backend, not in query string
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
    // The session cookie and/or auth_token cookie will authenticate this request
    let user = null
    try {
      const me = await $fetch(config.public.apiBase + '/api/me', { credentials: 'include' })
      const authUser = useState('authUser', () => null)
      authUser.value = me
      user = me
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
    const role = user?.role || useState('authUser').value?.role || null
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
