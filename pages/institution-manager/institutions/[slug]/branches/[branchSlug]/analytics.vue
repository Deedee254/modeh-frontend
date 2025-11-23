<script setup lang="ts">
import { useRoute } from 'vue-router'
definePageMeta({ layout: 'institution' as any })
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import PageHero from '~/components/institution/PageHero.vue'

const route = useRoute()
const api = useApi()

const institutionSlug = route.params.slug as string
const branchSlug = route.params.branchSlug as string
const overview = ref(null as any)
const activityData = ref(null as any)
const performanceData = ref(null as any)
const loadingOverview = ref(false)
const loadingActivity = ref(false)
const loadingPerformance = ref(false)
const overviewError = ref(null as any)
const activityError = ref(null as any)
const performanceError = ref(null as any)
const activityDays = ref(7)

async function loadOverview() {
  loadingOverview.value = true
  overviewError.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/analytics/overview`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    overview.value = json
  } catch (e: any) {
    overviewError.value = e
  } finally {
    loadingOverview.value = false
  }
}

async function loadActivity(days: number = 7) {
  loadingActivity.value = true
  activityError.value = null
  activityDays.value = days
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/analytics/activity?days=${days}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    activityData.value = json
  } catch (e: any) {
    activityError.value = e
  } finally {
    loadingActivity.value = false
  }
}

async function loadPerformance() {
  loadingPerformance.value = true
  performanceError.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/analytics/performance`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    performanceData.value = json
  } catch (e: any) {
    performanceError.value = e
  } finally {
    loadingPerformance.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadActivity()
  loadPerformance()
})
</script>

<template>
  <div>
    <PageHero
      title="Branch Analytics"
      description="Comprehensive insights into your branch's performance and member activity"
      theme="green"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Overview Cards -->
      <div v-if="loadingOverview" class="text-gray-500 mb-6">
        <LoadingSpinner />
      </div>
      <div v-else-if="overviewError" class="p-4 bg-red-50 border border-red-200 rounded mb-6">
        <p class="text-sm text-red-600">Failed to load overview: {{ overviewError.message || overviewError }}</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500">Total Members</div>
          <div class="text-2xl font-bold text-slate-900">{{ overview?.members?.total || 0 }}</div>
          <div class="text-xs text-slate-400 mt-1">
            {{ overview?.members?.quizees || 0 }} quizees, {{ overview?.members?.quiz_masters || 0 }} quiz masters
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500">Active Today</div>
          <div class="text-2xl font-bold text-green-600">{{ overview?.members?.active_today || 0 }}</div>
          <div class="text-xs text-slate-400 mt-1">Members active today</div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500">Active This Week</div>
          <div class="text-2xl font-bold text-blue-600">{{ overview?.members?.active_this_week || 0 }}</div>
          <div class="text-xs text-slate-400 mt-1">Members active this week</div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500">Total Quiz Attempts</div>
          <div class="text-2xl font-bold text-purple-600">{{ overview?.quizzes?.total_attempts || 0 }}</div>
          <div class="text-xs text-slate-400 mt-1">Avg score: {{ overview?.quizzes?.avg_score || 0 }}%</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Activity Trends -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-semibold mb-4">Activity Trends</h2>
          <div v-if="loadingActivity" class="text-gray-500">
            <LoadingSpinner />
          </div>
          <div v-else-if="activityError" class="p-4 bg-red-50 border border-red-200 rounded">
            <p class="text-sm text-red-600">Failed to load activity: {{ activityError.message || activityError }}</p>
          </div>
          <div v-else-if="!activityData?.activity_by_date?.length" class="text-gray-500 text-sm">
            No activity data available.
          </div>
          <div v-else>
            <div class="space-y-2">
              <div v-for="day in activityData.activity_by_date.slice(-14)" :key="day.date" class="flex justify-between items-center py-1">
                <span class="text-sm text-gray-600">{{ new Date(day.date).toLocaleDateString() }}</span>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-blue-600">{{ day.attempts }} attempts</span>
                  <span class="text-sm text-green-600">{{ Math.round(day.avg_score || 0) }}% avg</span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t">
              <button
                @click="loadActivity(activityDays === 30 ? 7 : 30)"
                class="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Show {{ activityDays === 30 ? '7' : '30' }} days
              </button>
            </div>
          </div>
        </div>

        <!-- Performance Distribution -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 class="text-lg font-semibold mb-4">Score Distribution</h2>
          <div v-if="loadingPerformance" class="text-gray-500">
            <LoadingSpinner />
          </div>
          <div v-else-if="performanceError" class="p-4 bg-red-50 border border-red-200 rounded">
            <p class="text-sm text-red-600">Failed to load performance: {{ performanceError.message || performanceError }}</p>
          </div>
          <div v-else>
            <div class="space-y-3">
              <div v-for="range in performanceData?.score_distribution || []" :key="range.range" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ range.range }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-indigo-600 h-2 rounded-full"
                      :style="{ width: `${Math.min((range.count / Math.max(...(performanceData?.score_distribution?.map((r: any) => r.count) || [1]))) * 100, 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 w-8 text-right">{{ range.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold mb-4">Top Performers</h2>
        <div v-if="loadingPerformance" class="text-gray-500">
          <LoadingSpinner />
        </div>
        <div v-else-if="performanceError" class="p-4 bg-red-50 border border-red-200 rounded">
          <p class="text-sm text-red-600">Failed to load performers: {{ performanceError.message || performanceError }}</p>
        </div>
        <div v-else-if="!performanceData?.top_performers?.length" class="text-gray-500 text-sm">
          No performance data available.
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(performer, index) in performanceData.top_performers.slice(0, 10)" :key="performer.user_id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{{ index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ performer.name }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {{ Math.round(performer.avg_score) }}%
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ performer.attempts }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
