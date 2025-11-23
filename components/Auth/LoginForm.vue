<template>
  <div :class="wrapperClass">
    <div :class="cardClass">
      <h3 class="text-lg font-semibold text-gray-900" v-if="!compact">Sign in to Modeh</h3>
      <h3 class="text-lg font-semibold text-gray-900" v-else>Log in to continue</h3>
      <p class="text-sm text-slate-600 mb-4" v-if="!compact">Quick access for quizees — or <NuxtLink to="/register" class="text-indigo-600 underline">create an account</NuxtLink></p>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block text-sm text-gray-700">Email</label>
          <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com" class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500" />
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
              class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-600 hover:text-gray-800">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5"/></svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="inline-flex items-center text-sm text-gray-600"><input type="checkbox" v-model="remember" class="mr-2" /> Remember me</label>
          <NuxtLink to="/register" class="text-sm text-indigo-600 underline">Register</NuxtLink>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-75 flex items-center justify-center">
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
          <button type="button" @click="handleGoogle" :disabled="isLoading" class="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 48 48"><path fill="#fbc02d" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#e53935" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4caf50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1565c0" d="M43.611 20.083 43.595 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({ compact: { type: Boolean, default: false } })

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref(null)

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const api = useApi()
const alert = useAppAlert()

const compact = computed(() => props.compact || false)

const wrapperClass = computed(() => compact.value ? 'mx-auto w-full max-w-md' : 'w-full')
const cardClass = computed(() => compact.value ? 'rounded-2xl bg-white p-6 shadow-lg' : 'w-full max-w-md bg-white rounded-lg shadow p-8')

async function ensureCsrf() {
  try { await api.ensureCsrf?.() } catch (e) { /* ignore */ }
}

onMounted(() => { ensureCsrf() })

async function submit() {
  if (isLoading.value) return
  isLoading.value = true
  error.value = null
  
  try {
  const res = await auth.login(email.value, password.value, remember.value)
    const user = auth.user // Use the store's user state directly

    // Handle `next` param safely and prefer same-role area
    const nextParam = route.query?.next
    const isLocalPath = typeof nextParam === 'string' && nextParam.startsWith('/') && !nextParam.startsWith('//')
    if (isLocalPath) {
      if (nextParam === '/') { 
        await router.push(nextParam)
        return 
      }
      const role = user?.role
      if (role === 'quiz-master' && nextParam.startsWith('/quiz-master')) { 
        await router.push(nextParam)
        return 
      }
      if (role === 'quizee' && nextParam.startsWith('/quizee')) { 
        await router.push(nextParam)
        return 
      }
    }

    const instStore = useInstitutionsStore()
    if (user?.role === 'quiz-master') router.push('/quiz-master/dashboard')
    else if (user?.role === 'quizee') router.push('/quizee/dashboard')
    else if (user?.role === 'admin') window.location.href = `${useRuntimeConfig().public.apiBase}/admin`
      else if (user?.role === 'institution-manager') {
        // Prefer an explicit institution slug from the user payload or store; fall back to route query
        const instSlug = user?.institution_slug || (user?.institutions && user.institutions[0]?.slug) || instStore.institution?.slug || route.query?.institutionSlug
        if (instSlug) {
          await router.push({ path: '/institution-manager/dashboard', query: { institutionSlug: String(instSlug) } })
        } else {
          await router.push('/institution-manager/dashboard')
        }
    } else router.push('/grades')
  } catch (e) {
    console.error('Login failed', e)
    const msg = e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials and try again.'
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
    error.value = msg
  } finally {
    isLoading.value = false
  }
}

function handleGoogle() {
  const cfg = useRuntimeConfig()
  window.location.href = `${cfg.public.apiBase}/api/auth/google/redirect`
}

// expose some refs for parent usage if needed
// use defineExpose in <script setup> instead of ES module exports
defineExpose({ isLoading, error })
</script>

<style scoped>
/* minimal local styles kept to match project */
</style>
