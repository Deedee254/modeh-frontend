<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
      <p class="text-gray-600 text-sm mb-6">Enter your email address and we'll send you a link to reset your password.</p>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading || submitted"
          class="w-full px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-75 flex items-center justify-center font-medium"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>{{ isLoading ? 'Sending...' : 'Send reset link' }}</span>
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
        {{ error }}
      </div>

      <div v-if="submitted" class="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
        <p class="font-medium">Check your email</p>
        <p class="mt-1">We've sent a password reset link to {{ email }}. It will expire in 1 hour.</p>
      </div>

      <div class="mt-6 text-center">
        <NuxtLink to="/login" class="text-sm text-brand-600 hover:underline">Back to login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const email = ref('')
const isLoading = ref(false)
const error = ref(null)
const submitted = ref(false)

const api = useApi()
const alert = useAppAlert()

async function submit() {
  if (isLoading.value || submitted.value) return
  isLoading.value = true
  error.value = null

  try {
    await api.post('/api/auth/forgot-password', { email: email.value })
    submitted.value = true
  } catch (e) {
    console.error('Forgot password request failed', e)
    const msg = e?.response?.data?.message || e?.message || 'Failed to send reset link. Please try again.'
    error.value = msg
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
  } finally {
    isLoading.value = false
  }
}
</script>
