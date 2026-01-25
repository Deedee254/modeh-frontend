<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
definePageMeta({ layout: 'institution' })
import { ref } from 'vue';
import { useApi } from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/ui/PageHero.vue'

const api = useApi()
const route = useRoute();
const router = useRouter();
const institutionId = ref(route.query.institutionSlug || null);

const institution = ref(null as any)
const loading = ref(false)
const error = ref(null as any)
const quizeesCount = ref<number | null>(null)
const quizMastersCount = ref<number | null>(null)

async function load() {
  if (!institutionId.value) return
  loading.value = true
  error.value = null
  try {
    const resp = await api.get(`/api/institutions/${institutionId.value}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    institution.value = json
    // fetch simple analytics: counts for quizees and quiz-masters
    try {
      const q1 = await api.get(`/api/institutions/${institutionId.value}/members?role=quizee&per_page=1`)
      const j1 = await api.parseResponse(q1)
      quizeesCount.value = j1?.meta?.total ?? null
    } catch (e) { quizeesCount.value = null }
    try {
      const q2 = await api.get(`/api/institutions/${institutionId.value}/members?role=quiz-master&per_page=1`)
      const j2 = await api.parseResponse(q2)
      quizMastersCount.value = j2?.meta?.total ?? null
    } catch (e) { quizMastersCount.value = null }
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function goto(path: string) {
  const slug = institutionId.value
  if (slug) {
    if (path === '/institution-manager/quizees') {
      router.push({ path: `/institution-manager/institutions/${slug}/quizees` })
      return
    }
    if (path === '/institution-manager/quiz-masters') {
      router.push({ path: `/institution-manager/institutions/${slug}/quiz-masters` })
      return
    }
    if (path === '/institution-manager/subscriptions') {
      router.push({ path: '/institution-manager/subscriptions', query: { institutionSlug: slug } })
      return
    }
    // default: push path with slug as query
    router.push({ path, query: { institutionSlug: slug } })
    return
  }
  router.push({ path })
}

if (institutionId.value) await load()
</script>

<template>
  <PageHero
    title="Institution Dashboard"
    description="Manage your institution, view analytics, and oversee members"
    :breadcrumbs="[
      { text: 'Institution Manager', href: '/institution-manager/dashboard' },
      { text: 'Dashboard', current: true }
    ]"
  >
    <template #eyebrow>
      Institution Management
    </template>
  </PageHero>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div v-if="!institutionId" class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <p class="text-sm text-amber-900 dark:text-amber-100">No institution selected. Add ?institutionSlug=SLUG to the URL or switch your active institution in the UI.</p>
    </div>

    <div v-else>
      <LoadingSpinner v-if="loading" />
      <ErrorAlert v-else-if="error">Failed to load institution: {{ error.message || error }}</ErrorAlert>
      <div v-else class="space-y-8">
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ institution?.name }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ institution?.email }}</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/30 dark:to-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-lg p-4">
                <div class="text-xs font-medium text-brand-900 dark:text-brand-300 uppercase tracking-wide">Quizees</div>
                <div class="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-2">{{ quizeesCount ?? '—' }}</div>
              </div>
              <div class="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/30 dark:to-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
                <div class="text-xs font-medium text-brand-900 dark:text-brand-300 uppercase tracking-wide">Quiz Masters</div>
                <div class="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-2">{{ quizMastersCount ?? '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              @click="goto('/institution-manager/subscriptions')"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200 text-left"
            >
              <div class="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">Subscriptions</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Manage billing and plans</div>
            </button>
            <button
              @click="goto('/institution-manager/quizees')"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-left"
            >
              <div class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Quizees</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">View and manage quizees</div>
            </button>
            <button
              @click="goto('/institution-manager/quiz-masters')"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left"
            >
              <div class="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Quiz Masters</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Manage instructors</div>
            </button>
            <button
              @click="goto('/institution-manager/invite')"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 text-left"
            >
              <div class="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Invite Users</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Send invitations</div>
            </button>
            <button
              @click="goto('/institution-manager/invite-history')"
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 text-left"
            >
              <div class="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-1">Invite History</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">View accepted invites</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
