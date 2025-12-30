<script setup lang="ts">
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()

const errorCode = (route.query.error as string) || ''

const errorMessages: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: 'Access denied',
    description: 'You are not allowed to sign in with this account.'
  },
  Configuration: {
    title: 'Configuration error',
    description: 'There is a configuration issue with the authentication provider.'
  },
  Verification: {
    title: 'Verification required',
    description: 'We could not verify your email address. Try again or contact support.'
  },
  OAuthAccountNotLinked: {
    title: 'Account not linked',
    description: 'An account with the same email already exists. Please sign in with the original provider.'
  },
  SessionRequired: {
    title: 'Session required',
    description: 'You must be signed in to view that page.'
  }
}

const fallback = { title: 'Authentication error', description: 'An unexpected error occurred during authentication. Please try again.' }
const { title, description } = errorMessages[errorCode] ?? fallback

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-lg w-full bg-white rounded-lg shadow p-8">
      <h1 class="text-2xl font-semibold mb-4">{{ title }}</h1>
      <p class="text-gray-600 mb-6">{{ description }}</p>

      <div class="flex gap-3">
        <button @click="goToLogin" class="px-4 py-2 bg-primary text-white rounded">Go to login</button>
        <a href="/" class="px-4 py-2 border rounded text-gray-700">Return home</a>
      </div>

      <div v-if="errorCode" class="mt-6 text-xs text-gray-400">
        Debug code: <code>{{ errorCode }}</code>
      </div>
    </div>
  </div>
</template>
