<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <!-- Loading State -->
      <div v-if="loadingInvitation" class="text-center">
        <LoadingSpinner />
        <p class="mt-4 text-gray-600">Loading invitation details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="invitationError" class="text-center">
        <div class="mb-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Invitation Error</h2>
        <p class="text-gray-600 mb-6">{{ invitationError }}</p>
        <NuxtLink to="/" class="inline-block px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
          Back to Home
        </NuxtLink>
      </div>

      <!-- Valid Invitation State -->
      <div v-else-if="invitation">
        <div class="mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 text-center">You're Invited!</h1>
        </div>

        <div class="mb-6 p-4 bg-brand-50 rounded-lg">
          <p class="text-gray-700">
            <strong>{{ invitation.institution_name }}</strong> has invited you to join as a
            <strong class="text-brand-600">{{ invitation.role }}</strong>
          </p>
        </div>

        <!-- Not Signed In -->
        <div v-if="!auth?.user" class="space-y-4 mb-6">
          <p class="text-sm text-gray-600">
            You need to be signed in to accept this invitation.
          </p>
          <NuxtLink
            :to="{ path: '/login', query: { redirect: route.fullPath } }"
            class="block w-full text-center bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 font-medium"
          >
            Sign In
          </NuxtLink>
          <div class="text-center text-sm">
            <p class="text-gray-600">Don't have an account?</p>
            <NuxtLink to="/register/quizee" class="text-brand-600 hover:text-brand-800 font-medium">
              Create one now
            </NuxtLink>
          </div>
        </div>

        <!-- Signed In -->
        <div v-else class="space-y-4">
          <div class="p-3 bg-brand-50 border border-brand-100 rounded-lg">
            <p class="text-sm text-brand-800">
              Signing in as <strong>{{ auth.user.name }}</strong> ({{ auth.user.email }})
            </p>
          </div>

          <button
            @click="acceptInvitation"
            :disabled="accepting"
            class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            <span v-if="accepting">Accepting Invitation...</span>
            <span v-else>Accept Invitation</span>
          </button>

          <button
            @click="signoutAndSwitch"
            class="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm"
          >
            Sign in as Different User
          </button>
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p class="text-xs text-gray-500">
            <strong>Invitation expires:</strong> {{ formatDate(invitation.expires_at) }}
          </p>
          <p v-if="daysLeft" class="text-xs text-gray-500 mt-1">
            <strong>Time remaining:</strong> {{ daysLeft }} day{{ daysLeft !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()

const token = route.params.token as string

const loadingInvitation = ref(true)
const accepting = ref(false)
const invitationError = ref(null as string | null)
const invitation = ref(null as any)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const daysLeft = computed(() => {
  if (!invitation.value?.expires_at) return null
  const now = new Date()
  const expires = new Date(invitation.value.expires_at)
  const diff = expires.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
})

async function loadInvitation() {
  try {
    loadingInvitation.value = true
    invitationError.value = null

    const res = await api.get(`/api/institutions/invitation/${token}`)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Invalid or expired invitation')
    }

    const data = await res.json()
    invitation.value = data.invitation
  } catch (e: any) {
    invitationError.value = e.message || 'Failed to load invitation'
  } finally {
    loadingInvitation.value = false
  }
}

async function acceptInvitation() {
  if (!auth?.user || !invitation.value) return

  accepting.value = true
  try {
    const res = await api.postJson(
      `/api/institutions/${invitation.value.institution_slug}/members/accept-invitation/${token}`,
      {}
    )

    if (!res.ok) {
      const error = await res.json()
      invitationError.value = error.message || 'Failed to accept invitation'
      return
    }

    // Redirect to institution dashboard
    await router.push({
      path: '/institution-manager/dashboard',
      query: { institutionSlug: invitation.value.institution_slug }
    })
  } catch (e: any) {
    invitationError.value = e.message || 'Failed to accept invitation'
  } finally {
    accepting.value = false
  }
}

async function signoutAndSwitch() {
  await auth.logout()
  await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

definePageMeta({
  layout: 'default'
})

onMounted(() => loadInvitation())
</script>
