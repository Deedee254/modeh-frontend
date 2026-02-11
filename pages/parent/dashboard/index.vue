<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {{ user.name }}!</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage your quizees' learning journey</p>
    </div>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-if="error" :message="error" @dismiss="error = null" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizees</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ dashboardData.quizees_count || 0 }}</p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon name="heroicons:user-group" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invites</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ dashboardData.pending_invitations_count || 0 }}</p>
            </div>
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Icon name="heroicons:envelope" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ activeSubscriptionsCount }}</p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Icon name="heroicons:credit-card" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ totalPoints }}</p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Icon name="heroicons:star" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Your Quizees</h2>
            <button
              @click="showInviteModal = true"
              class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              + Invite Quizee
            </button>
          </div>

          <div v-if="dashboardData.quizees && dashboardData.quizees.length > 0" class="space-y-4">
            <div v-for="quizee in dashboardData.quizees" :key="quizee.id" class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer" @click="viewQuizee(quizee.id)">
              <img :src="resolveAvatar(quizee.avatar, quizee.name)" class="w-12 h-12 rounded-full object-cover" />
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ quizee.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ quizee.email }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900 dark:text-white">{{ quizee.points || 0 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Points</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <Icon name="heroicons:user-group" class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p class="text-gray-600 dark:text-gray-400 mb-4">No quizees added yet</p>
            <button
              @click="showInviteModal = true"
              class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              Invite Your First Quizee
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <NuxtLink
              to="/parent/quizees"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon name="heroicons:user-group" class="w-5 h-5 text-brand-600" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">View All Quizees</span>
            </NuxtLink>
            <NuxtLink
              to="/parent/analytics"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-brand-600" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
            </NuxtLink>
            <NuxtLink
              to="/parent/subscriptions"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon name="heroicons:credit-card" class="w-5 h-5 text-brand-600" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">Manage Subscriptions</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <InviteQuizeeModal v-if="showInviteModal" @close="showInviteModal = false" @invited="onQuizeeInvited" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAnalytics } from '~/composables/useAnalytics'
import { resolveAvatar } from '~/composables/useAssets'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import InviteQuizeeModal from '~/components/parent/InviteQuizeeModal.vue'

definePageMeta({ layout: 'parent' })

const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const { trackEngagement } = useAnalytics()
const pageStartTime = ref(Date.now())

const user = computed(() => auth.user || {})
const loading = ref(false)
const error = ref(null)
const showInviteModal = ref(false)

const dashboardData = ref({
  quizees_count: 0,
  pending_invitations_count: 0,
  quizees: [],
  pending_invitations: [],
})

const activeSubscriptionsCount = computed(() => {
  return dashboardData.value.quizees?.filter(s => s.hasActiveSubscription).length || 0
})

const totalPoints = computed(() => {
  return dashboardData.value.quizees?.reduce((sum, s) => sum + (s.points || 0), 0) || 0
})

async function loadDashboard() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/api/parent/dashboard')
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    if (data) {
      dashboardData.value = data
    }
  } catch (e) {
    console.error('Failed to load dashboard:', e)
    error.value = e?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

function viewQuizee(quizeeId) {
  router.push(`/parent/quizee/${quizeeId}/progress`)
}

function onQuizeeInvited() {
  loadDashboard()
  showInviteModal.value = false
}

onMounted(() => {
  pageStartTime.value = Date.now()
  loadDashboard()
})

onBeforeUnmount(() => {
  if (pageStartTime.value) {
    const timeSpent = Math.round((Date.now() - pageStartTime.value) / 1000)
    trackEngagement('dashboard', 'parent', timeSpent)
  }
})
</script>
