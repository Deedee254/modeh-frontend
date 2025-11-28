<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/institution/PageHero.vue'

definePageMeta({ layout: 'institution' as any })

const route = useRoute()
const router = useRouter()
const api = useApi()
const alert = useAppAlert()

// prefer explicit route param slug, otherwise accept query param institutionSlug
const institutionId = ref((route.params.slug || route.query.institutionSlug) as string | null)
const loading = ref(false)
const subscription = ref(null as any)
const assignments = ref([] as any[])
const availableSeats = ref<number|null>(null)
const revoking = ref(false)
const revokingUserId = ref<number | null>(null)
const showConfirmModal = ref(false)
const userToRevoke = ref(null as any)

const usedSeats = computed(() => assignments.value.length)
const totalSeats = computed(() => {
  if (availableSeats.value === null) return 'Unlimited'
  return (usedSeats.value + availableSeats.value)
})

async function loadAssignments() {
  if (!institutionId.value) return
  loading.value = true
  try {
    const resp = await api.get(`/api/institutions/${institutionId.value}/subscription`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    subscription.value = json?.subscription || null
    availableSeats.value = json?.available_seats ?? null
    assignments.value = json?.assignments || []
  } catch (e: any) {
    alert.push({ type: 'error', message: 'Failed to load assignments: ' + (e?.message || e) })
  }
  loading.value = false
}

function confirmRevoke(assignment: any) {
  userToRevoke.value = assignment
  showConfirmModal.value = true
}

async function revoke() {
  if (!institutionId.value || !userToRevoke.value) return
  
  revoking.value = true
  revokingUserId.value = userToRevoke.value.user_id
  try {
    const resp = await api.postJson(`/api/institutions/${institutionId.value}/assignment/revoke`, { 
      user_id: userToRevoke.value.user_id 
    })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      alert.push({ type: 'success', message: 'Seat assignment revoked successfully' })
      showConfirmModal.value = false
      userToRevoke.value = null
      await loadAssignments()
    } else {
      alert.push({ type: 'error', message: json?.message || 'Failed to revoke assignment' })
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: 'Failed to revoke: ' + (e?.message || e) })
  } finally {
    revoking.value = false
    revokingUserId.value = null
  }
}

onMounted(() => {
  if (!institutionId.value && (route.query.institutionSlug || route.params.slug)) {
    institutionId.value = (route.params.slug || route.query.institutionSlug) as string
  }
  loadAssignments()
})

// react to route changes (slug or query) and reload
watch(() => route.params.slug, (newSlug) => {
  const s = newSlug || route.query.institutionSlug || null
  institutionId.value = s as string | null
  loadAssignments()
})

watch(() => route.query.institutionSlug, (q) => {
  const s = q || route.params.slug || null
  institutionId.value = s as string | null
  loadAssignments()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Page Hero -->
    <PageHero
      title="Assigned Seats Management"
      description="Manage and monitor seat assignments for your institution members"
      theme="green"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <LoadingSpinner v-if="loading" />

    <div v-else class="space-y-8">
      <!-- Subscription & Seats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Active Subscription Card -->
        <div class="bg-white dark:bg-slate-800 border border-green-200 dark:border-green-900/30 rounded-lg p-6 hover:border-green-300 dark:hover:border-green-800/50 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active Subscription</h3>
            <svg v-if="subscription" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div v-if="subscription" class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ subscription.package?.title || `Package #${subscription.package_id}` }}
          </div>
          <div v-else class="text-2xl font-bold text-gray-900 dark:text-white">No Active Subscription</div>
          <p v-if="subscription" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ID: <span class="font-mono text-xs">{{ subscription.id }}</span>
          </p>
        </div>

        <!-- Available Seats Card -->
        <div class="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-6 hover:border-emerald-300 dark:hover:border-emerald-800/50 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Seat Allocation</h3>
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 10a9 9 0 01-9 9m9-9a9 9 0 019 9m-9-9a9 9 0 00-9 9m9-9a3 3 0 11-6 0 3 3 0 016 0zM12 14a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            <span class="text-emerald-600 dark:text-emerald-400">{{ usedSeats }}</span>
            <span class="text-gray-400 mx-1">/</span>
            <span>{{ totalSeats }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ availableSeats === null ? 'Unlimited seats available' : `${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available` }}
          </p>
        </div>
      </div>

      <!-- Assignments List -->
      <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Assigned Members
            <span v-if="assignments.length > 0" class="ml-2 text-sm font-normal text-gray-500">{{ assignments.length }}</span>
          </h2>
        </div>

        <div v-if="assignments.length === 0" class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Members will appear here once they are assigned seats</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-slate-700">
          <div v-for="assignment in assignments" :key="assignment.id" class="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {{ (assignment.user_name || assignment.user_email || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ assignment.user_name || `User #${assignment.user_id}` }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ assignment.user_email }}</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">Assigned:</span>
                  <span class="ml-2">{{ new Date(assignment.assigned_at).toLocaleDateString() }}</span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">By:</span>
                  <span class="ml-2">{{ assignment.assigned_by || 'System' }}</span>
                </div>
                <button
                  @click="confirmRevoke(assignment)"
                  class="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto text-center"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revoke Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showConfirmModal = false"></div>

      <!-- Modal -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 sm:p-8">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0H9m3 0h3m-6-8a9 9 0 11-6 3m0 0a6 6 0 003 9l3-3m-3 3H9"/>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center">Revoke Seat Assignment?</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              This will remove the seat assignment for <strong>{{ userToRevoke?.user_name || userToRevoke?.user_email }}</strong> and free up the seat.
            </p>

            <div class="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                @click="showConfirmModal = false"
                :disabled="revoking"
                class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                @click="revoke"
                :disabled="revoking"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {{ revoking ? 'Revoking...' : 'Revoke Assignment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
