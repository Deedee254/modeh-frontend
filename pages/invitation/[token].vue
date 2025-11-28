<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const appAlert = useAppAlert()

const token = ref(route.params.token as string)
const loading = ref(true)
const processing = ref(false)
const error = ref<string | null>(null)
const invitationData = ref<any>(null)

const { $auth } = useNuxtApp()
const user = computed(() => ($auth as any)?.user)

async function loadInvitation() {
  try {
    loading.value = true
    error.value = null

    const resp = await api.get(`/api/institutions/invitation/${token.value}`)
    if (resp.status === 404) {
      error.value = 'Invitation not found. It may have expired.'
      return
    }
    if (resp.status === 400) {
      error.value = 'This invitation is no longer valid.'
      return
    }
    if (!resp.ok) {
      error.value = 'Failed to load invitation details.'
      return
    }

    const json = await api.parseResponse(resp)
    invitationData.value = json?.data
  } catch (e: any) {
    error.value = 'An error occurred while loading your invitation.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function acceptInvitation() {
  if (!invitationData.value) return

  if (!user.value) {
    router.push(`/auth/login?redirect=/invitation/${token.value}`)
    return
  }

  try {
    processing.value = true
    error.value = null

    const resp = await api.postJson(
      `/api/institutions/${invitationData.value.institution.id}/members/accept-invitation/${token.value}`,
      {}
    )

    if (!resp.ok) {
      const json = await api.parseResponse(resp)
      error.value = json?.message || 'Failed to accept invitation'
      return
    }

    appAlert.push({
      type: 'success',
      title: 'Invitation Accepted',
      message: `You have successfully joined ${invitationData.value.institution.name}!`
    })

    router.push('/institution-manager/dashboard')
  } catch (e: any) {
    error.value = 'An error occurred while accepting your invitation.'
    console.error(e)
  } finally {
    processing.value = false
  }
}

function declineInvitation() {
  router.push('/')
}

onMounted(() => {
  loadInvitation()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-lg p-8 text-center">
        <LoadingSpinner />
        <p class="mt-4 text-gray-600">Loading invitation details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="mb-4">
          <svg
            class="w-12 h-12 text-red-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Invitation Error</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <ErrorAlert :message="error" />
        <NuxtLink
          to="/"
          class="mt-6 inline-block bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
        >
          Back to Home
        </NuxtLink>
      </div>

      <!-- Invitation Details -->
      <div v-else-if="invitationData" class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div
            v-if="invitationData.institution?.logo_url"
            class="mb-4 flex justify-center"
          >
            <img
              :src="invitationData.institution.logo_url"
              :alt="invitationData.institution.name"
              class="h-16 w-16 rounded-lg object-cover"
            />
          </div>
          <div v-else class="mb-4 flex justify-center">
            <div
              class="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ invitationData.institution?.name }}
          </h2>
          <p class="mt-2 text-gray-600">
            You have been invited to join this institution
          </p>
        </div>

        <!-- Invitation Details Cards -->
        <div class="space-y-3 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-medium text-gray-600">Subscription Tier</p>
            <p class="mt-1 text-lg font-semibold capitalize text-gray-900">
              {{ invitationData.subscription_tier }}
            </p>
          </div>

          <div v-if="invitationData.invited_email" class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-medium text-gray-600">Invitation Sent To</p>
            <p class="mt-1 text-lg font-semibold text-gray-900">
              {{ invitationData.invited_email }}
            </p>
          </div>

          <div v-if="invitationData.expires_at" class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm font-medium text-gray-600">Expires</p>
            <p class="mt-1 text-lg font-semibold text-gray-900">
              {{ new Date(invitationData.expires_at).toLocaleDateString() }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="user" class="space-y-3">
          <button
            :disabled="processing"
            @click="acceptInvitation"
            class="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            <span v-if="!processing">Accept Invitation</span>
            <span v-else class="flex items-center justify-center gap-2">
              <LoadingSpinner :size="16" />
              Processing...
            </span>
          </button>
          <button
            :disabled="processing"
            @click="declineInvitation"
            class="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            Decline
          </button>
        </div>

        <!-- Login Prompt -->
        <div v-else class="space-y-3">
          <p class="text-center text-gray-600 text-sm">
            Please log in to accept this invitation
          </p>
          <NuxtLink
            :to="`/auth/login?redirect=/invitation/${token}`"
            class="block w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 text-center font-medium transition"
          >
            Log In
          </NuxtLink>
          <p class="text-center text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/auth/register" class="text-brand-600 hover:underline">
              Sign up
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
