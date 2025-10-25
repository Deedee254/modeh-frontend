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

onMounted(async () => {
  try {
    // Read query params from the browser location
    const params = parseQuery(window.location.search)
    const token = params.token
    const requires = params.requires_profile_completion === '1' || params.requires_profile_completion === 'true'
    const nextStep = params.next_step || null

    if (!token) {
      // nothing to do, go to home
      return router.replace('/')
    }

    // Persist token in cookie for SSR and subsequent requests
    useCookie('auth_token').value = token
    // Also store token in localStorage so client-side logic that checks 'token' works
    if (process.client) {
      try { localStorage.setItem('token', token) } catch (e) {}
    }

    // Set a default auth header for fetch/axios (we'll use $fetch which will pick up cookie)

    // Fetch current user (api/me) to hydrate app state
    try {
      const me = await $fetch(config.public.apiBase + '/api/me', { credentials: 'include' })
      const authUser = useState('authUser', () => null)
      authUser.value = me
    } catch (err) {
      // ignore - user may be created server-side but me may require cookies; still continue
      console.warn('Failed to fetch /api/me after social login', err)
    }

    // If onboarding is required, send user to new-user role selection first
    if (requires) {
      return router.replace('/onboarding/new-user')
    }

    // Otherwise go to dashboard depending on role
    const userState = useState('authUser')
    const role = userState?.value?.role || null
    if (role === 'quiz-master') return router.replace('/quiz-master/dashboard')
    return router.replace('/quizee/dashboard')

  } catch (e) {
    console.error(e)
    router.replace('/')
  }
})
</script>

<style scoped>
</style>
