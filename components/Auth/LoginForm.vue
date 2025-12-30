<template>
  <div :class="wrapperClass">
    <div :class="cardClass">
      <h3 class="text-lg font-semibold text-gray-900" v-if="!compact">Sign in to Modeh</h3>
      <h3 class="text-lg font-semibold text-gray-900" v-else>Log in to continue</h3>

      <p class="text-sm text-slate-600 mb-4" v-if="!compact">Quick access for quizees — or <NuxtLink to="/register" class="text-brand-600 underline">create an account</NuxtLink></p>

      <!-- Tab Navigation -->
      <div v-if="!compact" class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          @click="activeTab = 'password'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'password'
              ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Password
        </button>
        <button
          @click="activeTab = 'magic'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'magic'
              ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Magic Link
        </button>
      </div>

      <!-- Password Login Tab -->
      <form v-if="activeTab === 'password'" @submit.prevent="submit" class="space-y-3">
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
          <NuxtLink to="/register" class="text-sm text-brand-600 underline">Don't have an account? Register</NuxtLink>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-75 flex items-center justify-center">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span>{{ isLoading ? 'Logging in...' : 'Log in' }}</span>
          </button>
        </div>
      </form>

      <!-- Magic Link Tab -->
      <form v-else @submit.prevent="sendMagicLink" class="space-y-3">
        <div>
          <label class="block text-sm text-gray-700">Email</label>
          <input v-model="magicEmail" type="email" required autocomplete="email" placeholder="you@example.com" class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:border-brand-500 focus:ring-brand-600" />
        </div>

        <p class="text-sm text-gray-600">We'll send you a secure link to sign in. No password needed.</p>

        <div>
          <button type="submit" :disabled="isMagicLoading || magicLinkSent" class="w-full px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-75 flex items-center justify-center">
            <svg v-if="isMagicLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span>{{ isMagicLoading ? 'Sending...' : (magicLinkSent ? 'Check your email' : 'Send magic link') }}</span>
          </button>
        </div>

        <div v-if="magicLinkSent" class="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          <p class="font-medium">✓ Link sent!</p>
          <p class="mt-1">Check your email for the sign-in link. It expires in 24 hours.</p>
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
const magicEmail = ref('')
const remember = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const isMagicLoading = ref(false)
const isGoogleLoading = ref(false)
const magicLinkSent = ref(false)
const error = ref(null)
const activeTab = ref('password')

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const api = useApi()
const alert = useAppAlert()

const compact = computed(() => props.compact || false)
const wrapperClass = computed(() => compact.value ? 'mx-auto w-full max-w-md' : 'w-full')
const cardClass = computed(() => compact.value ? 'rounded-2xl bg-white p-6 shadow-lg' : 'w-full max-w-md bg-white rounded-lg shadow p-8')

async function ensureCsrfReady() {
  try {
    await api.ensureCsrf?.()
  } catch (e) {
    console.warn('CSRF pre-fetch failed, will retry on submit', e)
  }
}

onMounted(async () => {
  await ensureCsrfReady()
})

async function submit() {
  if (isLoading.value) return
  isLoading.value = true
  error.value = null

  try {
    const res = await signIn('credentials', {
      email: email.value,
      password: password.value,
      redirect: false
    })

    if (res?.error) {
      throw new Error('Invalid email or password')
    }

    // Refresh the auth store/session
    const authStore = useAuthStore()
    await authStore.fetchUser?.()
    const user = authStore.user

    if (props.suppressRedirect) {
      try { emit('success', user) } catch (e) {}
      return
    }

    await redirectAfterAuth(user)
  } catch (e) {
    console.error('Login failed', e)
    const msg = e?.message || 'Login failed. Please check your credentials and try again.'
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
    error.value = msg
  } finally {
    isLoading.value = false
  }
}

async function sendMagicLink() {
  if (isMagicLoading.value) return
  isMagicLoading.value = true
  error.value = null

  try {
    // Use NextAuth's email provider
    await signIn('email', { 
      email: magicEmail.value, 
      redirect: false 
    })
    magicLinkSent.value = true
    // Reset after 5 seconds so user can try again if needed
    setTimeout(() => {
      magicLinkSent.value = false
      magicEmail.value = ''
    }, 5000)
  } catch (err) {
    console.error('Magic link error:', err)
    error.value = err?.message || 'Failed to send magic link. Please try again.'
  } finally {
    isMagicLoading.value = false
  }
}

async function signInGoogle() {
  if (isGoogleLoading.value) return
  isGoogleLoading.value = true
  error.value = null

  try {
    await signIn('google', { redirect: false })
    await new Promise(resolve => setTimeout(resolve, 1000))

    const authStore = useAuthStore()
    await authStore.fetchUser?.()
    const user = authStore.user

    if (user) {
      await redirectAfterAuth(user)
    } else {
      error.value = 'Failed to establish session after Google sign-in'
    }
  } catch (err) {
    console.error('Google sign-in error:', err)
    error.value = err?.message || 'Google sign-in failed. Please try again.'
  } finally {
    isGoogleLoading.value = false
  }
}

async function redirectAfterAuth(user) {
  const nextParam = route.query?.next
  const isLocalPath = typeof nextParam === 'string' && nextParam.startsWith('/') && !nextParam.startsWith('//')

  if (isLocalPath && nextParam !== '/') {
    const role = user?.role
    const shouldNavigate =
      (role === 'quiz-master' && nextParam.startsWith('/quiz-master')) ||
      (role === 'quizee' && nextParam.startsWith('/quizee'))

    if (shouldNavigate) {
      await router.push(nextParam)
      return
    }
  }

  const instStore = useInstitutionsStore()
  if (user?.role === 'quiz-master') {
    await router.push('/quiz-master/dashboard')
  } else if (user?.role === 'quizee') {
    await router.push('/quizee/dashboard')
  } else if (user?.role === 'admin') {
    window.location.href = `${useRuntimeConfig().public.apiBase}/admin`
  } else if (user?.role === 'institution-manager') {
    const instSlug = user?.institution_slug || (user?.institutions?.[0]?.slug) || instStore.institution?.slug || route.query?.institutionSlug
    await router.push({
      path: '/institution-manager/dashboard',
      query: instSlug ? { institutionSlug: String(instSlug) } : {}
    })
  } else {
    await router.push('/grades')
  }
}

defineExpose({ isLoading, error })
</script>

<style scoped>
/* minimal local styles */
</style>
