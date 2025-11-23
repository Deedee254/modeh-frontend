<template>
  <div class="space-y-6">
    <!-- Hero Section -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <div v-else-if="branch" class="space-y-6">
      <!-- Branch Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">{{ branch.name }}</h1>
            <p class="text-indigo-100 mt-1">{{ branch.email }}</p>
            <p class="text-sm text-indigo-200 mt-2">Branch ID: {{ branch.slug }}</p>
          </div>
          <div class="flex gap-3">
            <NuxtLink
              :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/settings`"
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Settings
            </NuxtLink>
            <NuxtLink
              :to="`/institution-manager/institutions/${parentSlug}/analytics`"
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Parent Analytics
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <UiGrid cols="4">
        <StatCard
          label="Total Members"
          :value="branch.stats?.total_members || 0"
          icon="heroicons:user-group"
          description="Active branch members"
        />
        <StatCard
          label="Active Quizzes"
          :value="branch.stats?.active_quizzes || 0"
          icon="heroicons:document-text"
          description="Currently available"
        />
        <StatCard
          label="Total Attempts"
          :value="branch.stats?.total_attempts || 0"
          icon="heroicons:chart-bar"
          description="Quiz completion attempts"
        />
        <StatCard
          label="Avg. Performance"
          :value="`${branch.stats?.avg_score || 0}%`"
          icon="heroicons:academic-cap"
          description="Average quiz scores"
        />
      </UiGrid>

      <!-- Quick Actions -->
      <UiCard variant="elevated">
        <template #header>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/members`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:user-group" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Members</span>
          </NuxtLink>

          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/quizzes`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:document-text" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Quizzes</span>
          </NuxtLink>

          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/analytics`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:chart-bar" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Analytics</span>
          </NuxtLink>

          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/reports`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:document-chart-bar" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Reports</span>
          </NuxtLink>

          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/settings`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Settings</span>
          </NuxtLink>

          <NuxtLink
            :to="`/institution-manager/institutions/${parentSlug}/branches/${branchSlug}/notifications`"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 transition-colors group"
          >
            <Icon name="heroicons:bell" class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Notifications</span>
          </NuxtLink>
        </div>
      </UiCard>

      <!-- Recent Activity & Additional Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <UiCard variant="elevated">
          <template #header>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
          </template>

          <div v-if="branch.recent_activity?.length" class="space-y-3">
            <div
              v-for="activity in branch.recent_activity.slice(0, 5)"
              :key="activity.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ activity.description }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
            <Icon name="heroicons:clock" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        </UiCard>

        <!-- Branch Status -->
        <UiCard variant="elevated">
          <template #header>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Branch Status</h3>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Status</span>
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
              <span class="text-sm text-slate-900 dark:text-slate-100">{{ formatDate(branch.updated_at) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Created</span>
              <span class="text-sm text-slate-900 dark:text-slate-100">{{ formatDate(branch.created_at) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Timezone</span>
              <span class="text-sm text-slate-900 dark:text-slate-100">{{ branch.timezone || 'UTC' }}</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
      <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Branch Not Found</h3>
      <p class="text-slate-500 dark:text-slate-400">The requested branch could not be loaded.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'institution' })
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { format } from 'date-fns'

const route = useRoute()
const parentSlug = route.params.slug || route.query.institutionSlug || null
// use a distinct param name for the branch to avoid duplicate "slug" params warning
const branchSlug = route.params['branchSlug'] || null
const api = useApi()
const loading = ref(false)
const branch = ref(null)

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

async function load() {
  if (!parentSlug || !branchSlug) return
  loading.value = true
  try {
    const resp = await api.get(`/api/institutions/${branchSlug}`)
    const json = await api.parseResponse(resp)
    branch.value = json || null
  } catch (e) { branch.value = null }
  finally { loading.value = false }
}

await load()
</script>

