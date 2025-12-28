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
    // Clean up URL params immediately for a cleaner UX
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // 1. First, ensure we have a fresh CSRF state.
    // The OAuth redirect back to the app might need a brief bridge to register cookies properly.
    try {
      await api.ensureCsrf()
    } catch (e) {
      console.warn('Callback: CSRF initialization failed, continuing anyway...', e)
    }

    // 2. Attempt to fetch user profile with a retry mechanism.
    // Sometimes the browser takes an extra moment to fully settle cookies from the redirect.
    let userResponse = null
    const maxAttempts = 2
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await api.get(`/api/me?t=${Date.now()}`)
        if (response.ok) {
          userResponse = response
          break
        }
        console.warn(`OAuth callback: /api/me attempt ${attempt} failed with status ${response.status}`)
        if (attempt < maxAttempts) {
          // Wait a bit longer before retrying
          await new Promise(r => setTimeout(r, 800))
        }
      } catch (e) {
        console.error(`OAuth callback: /api/me attempt ${attempt} threw:`, e)
      }
    }

    if (!userResponse) {
      error.value = 'Session could not be established.'
      errorDetails.value = `Authentication was successful on the provider, but the secure session could not be established with our server (401 Unauthorized after ${maxAttempts} attempts). This usually means the browser blocked the session cookie.`
      return
    }

    const user = await userResponse.json()
    auth.setUser(user)

    // 3. Routing logic based on profile completeness
    if (!user?.role) {
      return router.replace('/onboarding/new-user')
    }

    const missingFields = user.missing_profile_fields || []
    if (missingFields.length > 0) {
      const stepMap = { 
        institution: 'institution', 
        grade: 'grade', 
        subjects: 'subjects', 
        role: 'new-user' 
      }
      const nextStep = stepMap[missingFields[0]] || 'new-user'
      return router.replace(`/onboarding/${nextStep}`)
    }

    const dashboard = user.role === 'quiz-master' ? '/quiz-master/dashboard' : '/quizee/dashboard'
    return router.replace(dashboard)

  } catch (err) {
    console.error('OAuth callback fatal error:', err)
    error.value = 'An unexpected error occurred during login.'
    errorDetails.value = err.message
  }
})
</script>
<style scoped></style>
