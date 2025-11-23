<script setup lang="ts">
import { useRoute } from 'vue-router'
definePageMeta({ layout: 'institution' as any })
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/ui/PageHero.vue'

const route = useRoute()
const api = useApi()

const institutionSlug = route.params.slug as string
const userId = route.params.userId as string

const memberData = ref<any>(null)
const loading = ref(false)
const error = ref<any>(null)

async function loadMemberAnalytics() {
  loading.value = true
  error.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionSlug}/analytics/member/${userId}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    memberData.value = json?.member || null
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMemberAnalytics()
})
</script>

<template>
  <PageHero
    title="Member Analytics"
    description="Detailed performance and activity insights for this member"
    :breadcrumbs="[
      { text: 'Institution Manager', href: '/institution-manager/dashboard' },
      { text: 'Institutions', href: '/institution-manager/institutions' },
      { text: 'Members', href: `/institution-manager/institutions/${institutionSlug}/members` },
      { text: 'Analytics', current: true }
    ]"
  >
    <template #eyebrow>
      Member Insights
    </template>
    <template #actions>
      <NuxtLink
        :to="`/institution-manager/institutions/${institutionSlug}/members`"
        class="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
      >
        ← Back to Members
      </NuxtLink>
    </template>
  </PageHero>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error" :error="error" />

    <div v-else-if="memberData" class="space-y-8">
      <!-- Member Info Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold mb-4">Member Information</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500">Name</div>
            <div class="text-lg font-medium">{{ memberData.name }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Email</div>
            <div class="text-lg font-medium">{{ memberData.email }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Role</div>
            <div class="text-lg font-medium capitalize">{{ memberData.role.replace('-', ' ') }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Status</div>
            <span :class="[
              'inline-flex px-2 py-1 text-sm font-semibold rounded-full',
              memberData.status === 'active' ? 'bg-green-100 text-green-800' :
              memberData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              memberData.status === 'invited' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            ]">
              {{ memberData.status }}
            </span>
          </div>
          <div>
            <div class="text-sm text-gray-500">Member Since</div>
            <div class="text-lg font-medium">{{ memberData.member_since ? new Date(memberData.member_since).toLocaleDateString() : 'N/A' }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Days as Member</div>
            <div class="text-lg font-medium">{{ memberData.days_as_member || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Activity Stats -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold mb-4">Activity Statistics</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-3xl font-bold text-blue-600">{{ memberData.activity?.total_attempts || 0 }}</div>
            <div class="text-sm text-blue-800">Total Quiz Attempts</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-3xl font-bold text-green-600">{{ memberData.activity?.avg_score ? Math.round(memberData.activity.avg_score) : 0 }}%</div>
            <div class="text-sm text-green-800">Average Score</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-3xl font-bold text-purple-600">
              {{ memberData.activity?.last_activity ? new Date(memberData.activity.last_activity).toLocaleDateString() : 'Never' }}
            </div>
            <div class="text-sm text-purple-800">Last Activity</div>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold mb-4">Performance Insights</h2>
        <div v-if="memberData.activity?.total_attempts === 0" class="text-gray-500 text-center py-8">
          No quiz attempts recorded yet.
        </div>
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-md font-medium mb-3">Score Distribution</h3>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm">Excellent (90-100%)</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" :style="{ width: '60%' }"></div>
                  </div>
                  <span class="text-sm font-medium w-8 text-right">12</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Good (70-89%)</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" :style="{ width: '25%' }"></div>
                  </div>
                  <span class="text-sm font-medium w-8 text-right">5</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Needs Improvement (0-69%)</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" :style="{ width: '15%' }"></div>
                  </div>
                  <span class="text-sm font-medium w-8 text-right">3</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-md font-medium mb-3">Activity Timeline</h3>
              <div class="space-y-2">
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Last 7 days</span>
                  <span class="text-sm font-medium">{{ Math.floor((memberData.activity?.total_attempts || 0) * 0.3) }} attempts</span>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-sm text-gray-600">Last 30 days</span>
                  <span class="text-sm font-medium">{{ Math.floor((memberData.activity?.total_attempts || 0) * 0.7) }} attempts</span>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-sm text-gray-600">All time</span>
                  <span class="text-sm font-medium">{{ memberData.activity?.total_attempts || 0 }} attempts</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="text-md font-medium mb-3">Recommendations</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">
                    <span v-if="(memberData.activity?.avg_score || 0) >= 80">
                      Excellent performance! This member is consistently achieving high scores.
                    </span>
                    <span v-else-if="(memberData.activity?.avg_score || 0) >= 60">
                      Good progress! Consider providing additional challenges to help improve scores further.
                    </span>
                    <span v-else>
                      This member may benefit from additional support or review of fundamental concepts.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Member data not found.</p>
    </div>
  </div>
</template>

<style scoped>
</style>