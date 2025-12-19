<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Create a new password</h2>
      <p class="text-gray-600 text-sm mb-6">Enter your new password below.</p>

      <div v-if="!validToken" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
        {{ error || 'Invalid reset link' }}
      </div>

      <form v-else @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Enter new password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div class="relative">
            <input
              v-model="passwordConfirm"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Confirm password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !password || !passwordConfirm"
          class="w-full px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-75 flex items-center justify-center font-medium"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>{{ isLoading ? 'Resetting...' : 'Reset password' }}</span>
        </button>
      </form>

      <div v-if="error && validToken" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <NuxtLink to="/login" class="text-sm text-brand-600 hover:underline">Back to login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const api = useApi()
const alert = useAppAlert()

const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref(null)

const token = computed(() => route.params.token)
const email = computed(() => route.query.email as string)
const validToken = computed(() => !!token.value && !!email.value)

onMounted(() => {
  if (!token.value) {
    error.value = 'Missing reset token'
  }
  if (!email.value) {
    error.value = 'Missing email address'
  }
})

async function submit() {
  if (isLoading.value) return

  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await api.post('/api/auth/reset-password', {
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirm.value
    })
    alert.push({ message: 'Password reset successfully!', type: 'success', icon: 'heroicons:check-circle' })
    await router.push('/login')
  } catch (e) {
    console.error('Password reset failed', e)
    const msg = e?.response?.data?.message || e?.message || 'Failed to reset password. The link may have expired.'
    error.value = msg
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
  } finally {
    isLoading.value = false
  }
}
</script>
