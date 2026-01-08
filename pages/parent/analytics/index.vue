<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Overview of your quizees' performance and progress</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Quizees</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalQuizees }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Combined Points</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalPoints }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg Score</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ averageScore }}%</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Subscriptions</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ activeSubscriptions }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Quizee Performance</h2>
      
      <div v-if="quizees.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b dark:border-slate-700">
              <th class="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Quizee</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white">Points</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white">Attempts</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white">Avg Score</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quizee in quizees" :key="quizee.id" class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="quizee.avatar || '/logo/avatar-placeholder.png'" class="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ quizee.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ quizee.email }}</p>
                  </div>
                </div>
              </td>
              <td class="text-center px-4 py-3 text-gray-900 dark:text-white font-medium">{{ quizee.points || 0 }}</td>
              <td class="text-center px-4 py-3 text-gray-900 dark:text-white">{{ quizee.totalAttempts || 0 }}</td>
              <td class="text-center px-4 py-3 text-gray-900 dark:text-white">{{ quizee.averageScore || 0 }}%</td>
              <td class="text-center px-4 py-3">
                <NuxtLink
                  :to="`/parent/quizee/${quizee.id}/progress`"
                  class="text-brand-600 hover:text-brand-700 font-medium text-sm"
                >
                  View
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8">
        <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
        <p class="text-gray-600 dark:text-gray-400">No quizees to analyze yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'

definePageMeta({ layout: 'parent' })

const api = useApi()
const quizees = ref([])

const totalQuizees = computed(() => quizees.value.length)
const totalPoints = computed(() => quizees.value.reduce((sum, s) => sum + (s.points || 0), 0))
const averageScore = computed(() => {
  if (quizees.value.length === 0) return 0
  const totalScore = quizees.value.reduce((sum, s) => sum + (s.averageScore || 0), 0)
  return Math.round(totalScore / quizees.value.length)
})
const activeSubscriptions = computed(() => quizees.value.filter(s => s.hasActiveSubscription).length)

async function loadAnalytics() {
  try {
    const res = await api.get('/api/parent/quizees')
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    if (data && data.quizees) {
      quizees.value = data.quizees
    }
  } catch (e) {
    console.error('Failed to load analytics:', e)
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>
