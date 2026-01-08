<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import PageHero from '~/components/institution/PageHero.vue'

definePageMeta({ layout: 'institution' as any })

const route = useRoute()
const router = useRouter()
const api = useApi()

const slug = (route.params.slug || route.query.institutionSlug) as string
const institution = ref(null as any)
const members = ref([] as any[])
const quizzesCount = ref<number | null>(null)
const quizeesCount = ref<number | null>(null)
const quizMastersCount = ref<number | null>(null)
const membersCount = ref<number | null>(null)
const loading = ref(false)
const error = ref(null as any)

async function loadData() {
  if (!slug) return
  loading.value = true
  error.value = null
  try {
    // Fetch institution
    const instResp = await api.get(`/api/institutions/${slug}`)
    if (api.handleAuthStatus(instResp)) return
    institution.value = await api.parseResponse(instResp)

    // Fetch members summary
    const membersResp = await api.get(`/api/institutions/${slug}/members?per_page=1`)
    if (api.handleAuthStatus(membersResp)) return
    const membersData = await api.parseResponse(membersResp)
    membersCount.value = membersData?.meta?.total ?? 0

    // Fetch quizees count
    try {
      const quizeesResp = await api.get(`/api/institutions/${slug}/members?role=quizee&per_page=1`)
      const quizeesData = await api.parseResponse(quizeesResp)
      quizeesCount.value = quizeesData?.meta?.total ?? 0
    } catch (e) {
      quizeesCount.value = 0
    }

    // Fetch quiz-masters count
    try {
      const qmResp = await api.get(`/api/institutions/${slug}/members?role=quiz-master&per_page=1`)
      const qmData = await api.parseResponse(qmResp)
      quizMastersCount.value = qmData?.meta?.total ?? 0
    } catch (e) {
      quizMastersCount.value = 0
    }

    // Fetch quizzes count
    try {
      const quizzesResp = await api.get(`/api/institutions/${slug}/quizzes?per_page=1`)
      const quizzesData = await api.parseResponse(quizzesResp)
      quizzesCount.value = quizzesData?.meta?.total ?? 0
    } catch (e) {
      quizzesCount.value = 0
    }
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

const navigationItems = computed(() => [
  {
    label: 'Members',
    description: 'Manage team members',
    icon: '👥',
    colorBadge: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
    href: `/institution-manager/institutions/${slug}/members`,
    badge: membersCount.value
  },
  {
    label: 'Quizees',
    description: 'View and manage quizees',
    icon: '📚',
    colorBadge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    href: `/institution-manager/institutions/${slug}/quizees`,
    badge: quizeesCount.value
  },
  {
    label: 'Quiz Masters',
    description: 'Manage instructors',
    icon: '👨‍🏫',
    colorBadge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    href: `/institution-manager/institutions/${slug}/quiz-masters`,
    badge: quizMastersCount.value
  },
  {
    label: 'Analytics',
    description: 'View performance data',
    icon: '📊',
    colorBadge: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
    href: `/institution-manager/institutions/${slug}/analytics`,
    badge: null
  },
  {
    label: 'Assigned Seats',
    description: 'Manage subscription seats',
    icon: '💺',
    colorBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    href: `/institution-manager/institutions/${slug}/assigned-seats`,
    badge: null
  },
  {
    label: 'Settings',
    description: 'Configure institution',
    icon: '⚙️',
    colorBadge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    href: `/institution-manager/institutions/${slug}/settings`,
    badge: null
  }
])

onMounted(loadData)
</script>

<template>
  <div v-if="!slug" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
      <p class="text-sm text-amber-900 dark:text-amber-100">No institution selected. Please navigate from the institution list.</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Page Hero -->
    <PageHero
      :title="institution?.name || 'Institution'"
      :description="institution?.email"
      theme="green"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error">Failed to load institution: {{ error.message || error }}</ErrorAlert>

      <div v-else class="space-y-8">
        <!-- Key Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Members</div>
          <div class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{{ membersCount ?? '—' }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quizees</div>
          <div class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{{ quizeesCount ?? '—' }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quiz Masters</div>
          <div class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{{ quizMastersCount ?? '—' }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quizzes</div>
          <div class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{{ quizzesCount ?? '—' }}</div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Management</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.label"
            :to="item.href"
            class="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="text-2xl">{{ item.icon }}</div>
              <div v-if="item.badge !== null" class="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold" :class="item.colorBadge">
                {{ item.badge }}
              </div>
            </div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.label }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ item.description }}</div>
          </NuxtLink>
        </div>
      </div>

      <!-- Additional Actions -->
      <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Actions</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink
            to="/institution-manager/subscriptions"
            :query="{ institutionSlug: slug }"
            class="inline-flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors duration-200 w-full sm:w-auto"
          >
            💳 Manage Subscriptions
          </NuxtLink>
          <button
            @click="() => router.push({ path: `/institution-manager/institutions/${slug}/members`, query: { action: 'invite' } })"
            class="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 w-full sm:w-auto"
          >
            ➕ Invite Members
          </button>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
