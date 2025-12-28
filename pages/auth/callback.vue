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

const router = useRouter()
const api = useApi()
const auth = useAuthStore()

const error = ref(null)
const errorDetails = ref(null)

onMounted(async () => {
  if (!process.client) return

  try {
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // Small delay to allow browser to settle cookies after redirect
    await new Promise(r => setTimeout(r, 500))

    // Attempt to fetch user profile using the session established during OAuth callback.
    // We add a cache-busting timestamp to ensure we don't get a stale 401 from a service worker or browser cache.
    const response = await api.get(`/api/me?t=${Date.now()}`)

    if (!response.ok) {
      console.warn(`OAuth callback: fetch /api/me failed with status ${response.status}`)
      error.value = 'Session could not be established.'
      errorDetails.value = `Backend returned HTTP ${response.status} for /api/me. This usually means the session cookie was not accepted or the authentication state was lost.`
      return
    }

    const user = await response.json()
    auth.setUser(user)

    if (!user?.role) {
      return router.replace('/onboarding/new-user')
    }

    const missingFields = user.missing_profile_fields || []
    if (missingFields.length > 0) {
      const stepMap = { institution: 'institution', grade: 'grade', subjects: 'subjects', role: 'new-user' }
      const nextStep = stepMap[missingFields[0]] || 'new-user'
      return router.replace(`/onboarding/${nextStep}`)
    }

    const dashboard = user.role === 'quiz-master' ? '/quiz-master/dashboard' : '/quizee/dashboard'
    return router.replace(dashboard)

  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = 'An unexpected error occurred during login.'
    errorDetails.value = err.message
  }
})
</script>
<style scoped></style>
