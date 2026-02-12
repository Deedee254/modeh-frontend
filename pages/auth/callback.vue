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
    // 1. Refresh the session to ensure nuxt-auth picks up the cookies set by the backend
    // Wrap in try-catch to prevent recursion errors from propagating
    const { getSession } = useAuth()
    let session = null
    try {
      session = await Promise.race([
        getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 3000))
      ])
    } catch (e) {
      // Session fetch may fail, fallback to manual fetch
      console.warn('Session fetch failed:', String(e).split(':')[0])
    }
    
    if (!session) {
      // Fallback: Try fetching user manually to see if cookies are there but session isn't synced
      await auth.fetchUser()
    }

    if (!auth.user) {
      error.value = 'Session could not be established.'
      errorDetails.value = 'We could not verify your session. Please try logging in again.'
      return
    }

    // 2. Redirect to dashboard - the global middleware will take over 
    // and handle onboarding/profile-completion redirects automatically.
    const user = auth.user
    let dashboard = '/'
    
    if (user.role === 'quiz-master') dashboard = '/quiz-master/dashboard'
    else if (user.role === 'quizee') dashboard = '/quizee/dashboard'
    else if (user.role === 'parent') dashboard = '/parent/dashboard'
    else if (user.role === 'institution-manager') dashboard = '/institution-manager/dashboard'
    else if (user.role === 'admin') {
      window.location.href = `${config.public.apiBase}/admin`
      return
    }

    return router.replace(dashboard)

  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = 'An unexpected error occurred.'
    errorDetails.value = err?.message || 'Unknown error occurred.'
  }
})
</script>
<style scoped></style>
