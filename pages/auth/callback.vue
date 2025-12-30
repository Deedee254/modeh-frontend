<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div v-if="error" class="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg text-center border border-red-100">
      <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
      </div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      
      <div v-if="errorDetails" class="mb-6 p-3 bg-gray-50 rounded text-left text-xs font-mono text-gray-500 overflow-auto max-h-32">
        {{ errorDetails }}
      </div>

      <div class="flex flex-col gap-3">
        <UButton color="primary" block to="/login">
          Try Again
        </UButton>
        <UButton color="gray" variant="ghost" block to="/">
          Go to Homepage
        </UButton>
      </div>
    </div>

    <div v-else class="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg text-center">
      <div class="mb-4 flex justify-center">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary-600 animate-spin" />
      </div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">Signing you in…</h1>
      <p class="text-gray-600">Finishing authentication and redirecting you to the right place.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useRuntimeConfig } from '#imports'

const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const config = useRuntimeConfig()

const error = ref(null)
const errorDetails = ref(null)

onMounted(async () => {
  if (!process.client) return

  try {
    // Clean up URL params immediately for a cleaner UX
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // 1. Ensure CSRF token is available
    // In social auth, the backend redirect has already set session and CSRF cookies.
    // useApi.ensureCsrf() will now detect these and skip the fetch, making this instant.
    try {
      await api.ensureCsrf()
    } catch (e) {
      console.warn('Callback: CSRF initialization failed, continuing anyway...', e)
    }

    // 2. Attempt to fetch user profile with a retry mechanism.
    // The session cookie should be set by now, but we retry in case of timing issues.
    let userResponse = null
    const maxAttempts = 3
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await api.get(`/api/me?t=${Date.now()}`)
        if (response.ok) {
          userResponse = response
          break
        }
        console.warn(`OAuth callback: /api/me attempt ${attempt} failed with status ${response.status}`)
        if (attempt < maxAttempts) {
          // Wait progressively longer between retries
          await new Promise(r => setTimeout(r, attempt * 500))
        }
      } catch (e) {
        console.error(`OAuth callback: /api/me attempt ${attempt} threw:`, e)
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, attempt * 500))
        }
      }
    }

    if (!userResponse || !userResponse.ok) {
      error.value = 'Session could not be established.'
      errorDetails.value = `Authentication was successful on the provider, but the secure session could not be established with our server (${userResponse?.status || 'Unknown'} after ${maxAttempts} attempts). This usually means the browser blocked the session cookie or there was a server error. Please try logging in again.`
      return
    }

    const json = await userResponse.json()
    const user = json?.user || json?.data || json
    
    if (!user || !user.id) {
      error.value = 'User data could not be retrieved.'
      errorDetails.value = 'The authentication was successful, but we could not retrieve your user information. Please try logging in again.'
      return
    }

    auth.setUser(user)

    // 4. Routing logic based on profile completeness
    // New users (no role) go to role selection page
    if (!user?.role) {
      return router.replace('/onboarding/new-user')
    }

    // Existing users with missing profile fields go to main onboarding page
    // The onboarding page will determine which step to show based on user state
    const missingFields = user.missing_profile_fields || []
    if (missingFields.length > 0) {
      return router.replace('/onboarding')
    }

    // Complete users go to their dashboard
    // Handle all role types properly
    let dashboard = '/quizee/dashboard'
    if (user.role === 'quiz-master') {
      dashboard = '/quiz-master/dashboard'
    } else if (user.role === 'admin') {
      const config = useRuntimeConfig()
      window.location.href = `${config.public.apiBase}/admin`
      return
    } else if (user.role === 'institution-manager') {
      dashboard = '/institution-manager/dashboard'
    }
    
    return router.replace(dashboard)

  } catch (err) {
    console.error('OAuth callback fatal error:', err)
    error.value = 'An unexpected error occurred during login.'
    errorDetails.value = err?.message || 'Unknown error occurred. Please try logging in again.'
  }
})
</script>
<style scoped></style>
