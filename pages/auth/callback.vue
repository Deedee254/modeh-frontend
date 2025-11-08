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
    const params = parseQuery(window.location.search)
    const token = params.token
    const requires = params.requires_profile_completion === '1' || params.requires_profile_completion === 'true'
    let nextStep = params.next_step || null

    // Validate token
    if (!token || typeof token !== 'string') {
      console.error('Invalid or missing token in OAuth callback')
      return router.replace('/')
    }

    // Validate and sanitize nextStep
    if (nextStep && !VALID_STEPS.includes(nextStep)) {
      console.warn(`Invalid next_step '${nextStep}' received in OAuth callback, defaulting to new-user`)
      nextStep = 'new-user'
    }

    try {
      // Persist token in cookie for SSR and subsequent requests
      useCookie('auth_token').value = token
      
      // Also store token in localStorage so client-side logic that checks 'token' works
      if (process.client) {
        try { 
          localStorage.setItem('token', token)
          // Clean the URL to remove the token and other params from the address bar
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.warn('Failed to store token in localStorage:', err)
        }
      }
    } catch (err) {
      console.warn('Failed to store auth token:', err)
      return router.replace('/')
    }

    // Fetch current user (api/me) to hydrate app state
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
    if (requires) {
      // Use the validated next_step to go to the correct onboarding page
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
