<template>
  <div :class="compact ? 'mx-auto w-full max-w-md' : 'w-full'">
    <div :class="compact ? 'rounded-2xl bg-white p-6 shadow-lg' : 'w-full max-w-md bg-white rounded-lg shadow p-8'">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ compact ? 'Log in to continue' : 'Sign in to Modeh' }}
      </h3>

      <p v-if="!compact" class="text-sm text-slate-600 mb-4">
        Quick access for quizees — or 
        <NuxtLink to="/register/quizee" class="text-brand-600 underline">create an account</NuxtLink>
      </p>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block text-sm text-gray-700">Email</label>
          <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com" class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:border-brand-500 focus:ring-brand-600" />
        </div>

        <div>
          <label class="block text-sm text-gray-700">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="Your password"
              class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 pr-10 focus:border-brand-500 focus:ring-brand-600"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-600 hover:text-gray-800">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="inline-flex items-center text-sm text-gray-600"><input type="checkbox" v-model="remember" class="mr-2" /> Remember me</label>
          <NuxtLink to="/forgot-password" class="text-sm text-brand-600 underline">Forgot password?</NuxtLink>
        </div>

        <div>
          <NuxtLink to="/register/quizee" class="text-sm text-brand-600 underline">Don't have an account? Register</NuxtLink>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-75 flex items-center justify-center">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span>{{ isLoading ? 'Logging in...' : 'Log in' }}</span>
          </button>
        </div>
      </form>

      <div class="mt-4">
        <div class="relative">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
          <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">Or continue with</span></div>
        </div>

        <div class="mt-4">
          <button
            type="button"
            @click="signInGoogle"
            :disabled="isGoogleLoading"
            class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-75 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>{{ isGoogleLoading ? 'Signing in...' : 'Sign in with Google' }}</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({
  compact: { type: Boolean, default: false },
  suppressRedirect: { type: Boolean, default: false }
})

const emit = defineEmits(['success'])

const email = ref('')
const password = ref('')
// magic link removed - keep only password + oauth
const remember = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const error = ref(null)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const auth = useAuth()
const instStore = useInstitutionsStore()
const alert = useAppAlert()
const { signIn } = useAuth()

async function submit() {
  if (isLoading.value) return
  isLoading.value = true
  error.value = null

  try {
    const result = await signIn('credentials', {
      email: email.value,
      password: password.value,
      redirect: false
    })

    if (!result?.ok) {
      throw new Error(result?.error || 'Invalid email or password')
    }

    // If the auth session payload already contains user data, use it immediately
    // as a provisional user to avoid a blank UI while `/api/me` completes.
    // We still fetch the authoritative `/api/me` afterwards to validate.
    const provisional = auth?.data?.value?.user;
    if (provisional && provisional.id) {
      try { authStore.setUser(provisional) } catch (e) { }
    }

    // Ensure store is synced with authoritative API; run in foreground to guarantee role-based redirects work
    await authStore.fetchUser?.()
    await ensureUserRole(authStore)

    if (props.suppressRedirect) {
      emit('success', authStore.user)
      return
    }

    await redirectAfterAuth(authStore.user)
  } catch (e) {
    const msg = e?.message || 'Login failed. Please try again.'
    alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' })
    error.value = msg
  } finally {
    isLoading.value = false
  }
}

async function signInGoogle() {
  if (isGoogleLoading.value) return
  isGoogleLoading.value = true
  error.value = null
  try {
    // Use signIn with redirect: false to catch errors properly
    // Instead of relying on automatic redirect which can hide OAuth errors
    const result = await signIn('google', { redirect: false })
    
    if (!result?.ok) {
      // If OAuth fails, redirect to error page with error code
      const errorCode = result?.error || 'OAuthSignin'
      console.error('[LoginForm] Google sign-in error:', errorCode)
      router.push({
        path: '/auth/error',
        query: { error: errorCode }
      })
      return
    }
    
    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Force NuxtAuth to sync with server session after Google OAuth
    // Wrap in try-catch to prevent recursion errors from propagating
    const { getSession } = useAuth()
    try {
      await Promise.race([
        getSession({ force: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 3000))
      ])
    } catch (e) {
      // Session fetch may fail due to routing recursion, but we can continue
      // The auth store already has the user data from the response
      console.warn('Session fetch failed (non-fatal):', String(e).split(':')[0])
    }
    
    // Fetch user and sync guest attempts
    await auth.fetchUser?.()
    
    // Sync guest quiz attempts after OAuth login
    try {
      await auth.syncGuestQuizResults?.()
    } catch (e) {
      console.warn('Failed to sync guest quiz results after Google login:', e)
    }
    
    // Check for guest quiz results
    try {
      const guestQuizStore = useGuestQuizStore()
      guestQuizStore.initializeStore()
      const allResults = guestQuizStore.getAllResults()
      
      if (allResults && allResults.length > 0) {
        const mostRecentQuiz = allResults[allResults.length - 1]
        if (mostRecentQuiz?.quiz_slug) {
          await router.push(`/quizee/quiz-results/${mostRecentQuiz.quiz_slug}`)
          return
        }
      }
    } catch (e) {
      console.error('Error checking guest quiz results:', e)
    }
    
    // No guest results - redirect using auth callback logic
    await redirectAfterAuth(auth.user)
  } catch (err) {
    console.error('[LoginForm] Google sign-in error:', err)
    router.push({
      path: '/auth/error',
      query: { error: 'OAuthSignin' }
    })
  } finally {
    isGoogleLoading.value = false
  }
}

async function ensureUserRole(store, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    if (store.user?.role) return
    await store.fetchUser?.()
    if (store.user?.role) return
    await new Promise(r => setTimeout(r, 300))
  }
}

async function redirectAfterAuth(user) {
  const next = route.query?.next
  if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && next !== '/') {
    return router.push(next)
  }

  const role = user?.role
  if (role === 'admin') {
    window.location.href = `${useRuntimeConfig().public.apiBase}/admin`
    return
  }

  const routes = {
    'quiz-master': '/quiz-master/dashboard',
    'quizee': '/quizee/dashboard'
  }

  // Ensure parent users are redirected to the parent dashboard
  routes['parent'] = '/parent/dashboard'

  if (routes[role]) return router.push(routes[role])

  if (role === 'institution-manager') {
    const slug = user?.institution_slug || user?.institutions?.[0]?.slug || instStore.institution?.slug
    return router.push({
      path: '/institution-manager/dashboard',
      query: slug ? { institutionSlug: String(slug) } : {}
    })
  }

  router.push('/')
}

defineExpose({ isLoading, error })
</script>

<style scoped>
/* minimal local styles */
</style>
