<script setup lang="ts">
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()

const errorCode = (route.query.error as string) || ''
const errorDescription = (route.query.error_description as string) || ''

const errorMessages: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: 'OAuth Sign-in Error',
    description: 'Failed to sign in with the OAuth provider. This usually means the callback URL is misconfigured. Check that the redirect URI in your OAuth provider (Google Cloud Console) matches your application domain and the GOOGLE_OAUTH_REDIRECT_URI in your backend .env file.'
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'An error occurred while processing the OAuth callback. The provider may have rejected the request or there may be a network issue.'
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create an account with the provided OAuth credentials. This may happen if the email is already in use.'
  },
  OAuthAccountNotLinked: {
    title: 'Account not linked',
    description: 'An account with the same email already exists. Please sign in with the original provider.'
  },
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

// Debug info for developers
const showDebugInfo = process.env.NODE_ENV === 'development'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-lg w-full bg-white rounded-lg shadow p-8 border border-red-200">
      <div class="mb-4 flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0-6a4 4 0 110 8 4 4 0 010-8zm0-10a6 6 0 110 12 6 6 0 010-12z" />
          </svg>
        </div>
        <div class="ml-4">
          <h1 class="text-2xl font-semibold text-red-600">{{ title }}</h1>
          <p class="text-gray-600 mt-2 text-sm">{{ description }}</p>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button @click="goToLogin" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Back to Login
        </button>
        <a href="/" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition">
          Return Home
        </a>
      </div>

      <!-- Debug Info (visible in development) -->
      <div v-if="showDebugInfo || errorCode === 'OAuthSignin'" class="mt-8 p-4 bg-gray-100 rounded border border-gray-300">
        <h3 class="text-sm font-semibold text-gray-900 mb-2">Debug Information:</h3>
        <div class="space-y-2 text-xs font-mono">
          <div>
            <span class="text-gray-600">Error Code:</span>
            <code class="text-red-600 ml-2">{{ errorCode || 'unknown' }}</code>
          </div>
          <div v-if="errorDescription">
            <span class="text-gray-600">Error Description:</span>
            <code class="text-red-600 ml-2">{{ errorDescription }}</code>
          </div>
          <div class="text-gray-600 mt-4">
            <strong>Troubleshooting Steps:</strong>
            <ol class="list-decimal list-inside mt-2 space-y-1">
              <li>Verify the callback URL in Google Cloud Console matches exactly</li>
              <li>Check GOOGLE_OAUTH_REDIRECT_URI in backend .env</li>
              <li>Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct</li>
              <li>Clear browser cookies and try again</li>
              <li>Check browser console for additional errors (F12 → Console tab)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
