<template>
  <div class="max-w-md mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-4">Welcome — choose your role</h1>
    <client-only>
      <p v-if="email" class="text-sm text-gray-600 mb-2">Signed in as {{ email }}</p>
    </client-only>
    <p class="mb-6">Select whether you're a Quizee or a Quiz Master. This is required to continue.</p>

    <form @submit.prevent="submit" class="bg-white p-6 rounded-lg shadow-sm">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">I am a</label>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="role" value="quizee" />
            <span>Quizee</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="role" value="quiz-master" />
            <span>Quiz Master</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="role" value="parent" />
            <span>Parent</span>
          </label>
        </div>
      </div>

      <!-- Password removed: role selection is sufficient for onboarding -->

      <div class="mt-6">
        <button :disabled="!role || submitting" class="w-full px-4 py-2 bg-brand-600 text-white rounded flex items-center justify-center gap-2">
          <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span>{{ submitting ? 'Continuing…' : 'Continue' }}</span>
        </button>
      </div>

      <p v-if="message" class="mt-4 text-sm text-green-700">{{ message }}</p>
      <p v-if="error" class="mt-4 text-sm text-red-700">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
const router = useRouter()
// Set default role to 'quizee'
const role = ref('quizee')
const submitting = ref(false)
const message = ref('')
const error = ref('')
const authStore = useAuthStore()
const email = computed(() => authStore.user?.email || '')

async function submit() {
  message.value = ''
  error.value = ''
  if (!role.value) {
    error.value = 'Please select a role to continue.'
    return
  }
  submitting.value = true
  try {
    const api = useApi()
    const { data, getSession } = useAuth()

    // Ensure session is fresh
    const session = await getSession()
    console.log('[new-user] Current session:', { email: session?.user?.email, hasToken: !!session?.user?.apiToken })

    // Require a valid session (either session cookie or JWT session)
    if (!session || !session.user) {
      error.value = 'Authentication error. Please try logging in again.'
      submitting.value = false
      return
    }

    const stepName = role.value === 'quiz-master' ? 'role_quiz-master' : (role.value === 'parent' ? 'role_parent' : 'role_quizee')
    // Ensure CSRF cookie is initialized before POSTing — the backend validates XSRF
    // for stateful API calls even when an API token may be present.
    try {
      await api.ensureCsrf()
    } catch (e) {
      // ignore — the subsequent POST will surface any network/CORS error
    }

    const resp = await api.postJson('/api/onboarding/step', {
      step: stepName,
      // Only send the role; password is not used in this flow
      data: { role: role.value }
    })
    if (!resp.ok) {
      let body = null
      try { body = await resp.json() } catch (e) { /* ignore non-json */ }
      const serverMsg = body && (body.errors || body.message) ? JSON.stringify(body.errors || body.message) : ''
      throw new Error(`Failed to save role (status ${resp.status}) ${serverMsg}`)
    }

    // Refresh user state to pick up new role
    await authStore.fetchUser()
    
    // Attempt to update the session if the provider supports it (to sync JWT with backend)
    const { update } = useAuth()
    if (typeof update === 'function') {
      try { await update() } catch (e) { console.debug('Session update not supported or failed', e) }
    }

    message.value = `Success! Welcome ${session?.user?.name || 'to Modeh'}.`
    // If the user chose Parent, send them straight to the parent dashboard (minimal onboarding)
    if (role.value === 'parent') {
      setTimeout(() => router.replace('/parent/dashboard'), 800)
    } else {
      // After role is set, go to the main onboarding page which will continue with institution/education details
      setTimeout(() => router.replace('/onboarding'), 800)
    }
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to save role'
  } finally {
    submitting.value = false
  }
}
// No password input required on this page — role selection is sufficient.
</script>

<style scoped>
</style>
