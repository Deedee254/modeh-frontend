<template>
  <div class="w-full">
    <div class="mb-8">
      <NuxtLink to="/parent/quizees" class="text-sm text-brand-600 hover:text-brand-700 font-medium mb-4 flex items-center gap-1">
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
        Back to Quizees
      </NuxtLink>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ quizeeName }}'s Progress</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Track learning metrics and performance</p>
    </div>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-if="error" :message="error" @dismiss="error = null" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Points</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.total_points || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Streak</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.current_streak || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Longest Streak</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.longest_streak || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg Score</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.average_score || 0 }}%</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Quiz Attempts</h2>

          <div v-if="analytics.recent_attempts && analytics.recent_attempts.length > 0" class="space-y-4">
            <div v-for="attempt in analytics.recent_attempts" :key="attempt.id" class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ attempt.quiz?.title || 'Quiz' }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(attempt.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ attempt.score || 0 }}%</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ attempt.total_questions || 0 }} questions</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <Icon name="heroicons:clipboard-document" class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p class="text-gray-600 dark:text-gray-400">No quiz attempts yet</p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Attempts</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ analytics.total_attempts || 0 }}</p>
            </div>
            <div class="pt-4 border-t dark:border-slate-700">
              <NuxtLink
                :to="`/parent/quizee/${quizeeId}/subscription`"
                class="block px-4 py-2.5 text-center bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 font-medium transition-colors"
              >
                Manage Subscription
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'

definePageMeta({ layout: 'parent' })

const route = useRoute()
const router = useRouter()
const api = useApi()

const loading = ref(false)
const error = ref(null)
const quizeeId = computed(() => route.params.id)
const quizeeName = ref('Quizee')

const analytics = ref({
  quizee_id: null,
  quizee_name: '',
  total_points: 0,
  current_streak: 0,
  longest_streak: 0,
  total_attempts: 0,
  average_score: 0,
  recent_attempts: [],
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadAnalytics() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/api/parent/quizee/${quizeeId.value}/analytics`)
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    if (data) {
      analytics.value = data
      quizeeName.value = data.quizee_name || 'Quizee'
    }
  } catch (e) {
    console.error('Failed to load analytics:', e)
    error.value = e?.message || 'Failed to load quizee analytics'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>
