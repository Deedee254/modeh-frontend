<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in with magic link</h2>
      <p class="text-gray-600 text-sm mb-6">Enter your email and we'll send you a secure sign-in link. No password needed.</p>

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
          <span>{{ isLoading ? 'Sending...' : 'Send magic link' }}</span>
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
        {{ error }}
      </div>

      <div v-if="submitted" class="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Check your email</p>
            <p class="mt-1 text-sm">We've sent a secure sign-in link to <strong>{{ email }}</strong>. Click the link in the email to sign in. It expires in 24 hours.</p>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center space-y-3">
        <div class="text-sm">
          <span class="text-gray-600">Remember your password? </span>
          <NuxtLink to="/login" class="text-brand-600 hover:underline font-medium">Sign in here</NuxtLink>
        </div>
        <div class="text-sm">
          <span class="text-gray-600">Don't have an account? </span>
          <NuxtLink to="/register" class="text-brand-600 hover:underline font-medium">Create one</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

const email = ref('')
const isLoading = ref(false)
const error = ref(null)
const submitted = ref(false)

const alert = useAppAlert()
// Auth helper (signIn) provided by nuxt-auth / sidebase auto-import
const { signIn } = useAuth()

async function submit() {
  if (isLoading.value || submitted.value) return
  isLoading.value = true
  error.value = null

  try {
    // Use NextAuth's email provider for magic link
    await signIn('email', { 
      email: email.value, 
      redirect: false 
    })
    submitted.value = true
  } catch (e) {
    console.error('Magic link request failed', e)
    const msg = e?.message || 'Failed to send magic link. Please try again.'
    error.value = msg
    try { alert.push({ message: msg, type: 'error', icon: 'heroicons:exclamation-circle' }) } catch (err) {}
  } finally {
    isLoading.value = false
  }
}
</script>
