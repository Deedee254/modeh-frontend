<template>
  <div>
    <PageHero
      title="Our quiz-masters"
      description="Meet our experienced educators and content creators who design curriculum-aligned assessments and learning resources."
      :showSearch="false"
      :flush="true"
    >
      <template #eyebrow>
        Content creators
      </template>

      <template #actions>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex-1 max-w-2xl">
              <!-- Placeholder for alignment -->
            </div>
            <div class="flex items-center gap-3">
              <NuxtLink
                to="/register?role=quiz-master"
                class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Become a quiz-master
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Expert educators</p>
          <p class="mt-1 text-2xl font-semibold text-white">Discover inspiring content creators</p>
          <p class="mt-2 text-sm text-white/70">Browse profiles and follow quiz-masters who inspire you.</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </template>
    </PageHero>

    <!-- Sticky Filters at Top -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 -mx-4 px-4 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <FiltersSidebar
          :grade-options="store.grades"
          :subject-options="store.subjects"
          :grade="gradeFilter"
          :subject="subjectFilter"
          storageKey="filters:quiz-masters"
          @update:grade="val => gradeFilter = val"
          @update:subject="val => subjectFilter = val"
        />
      </div>

      <main>

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-masters...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quiz-masters. Please try again later.
      </div>
      <div v-else-if="quizMasters.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="quizMaster in quizMasters" :key="quizMaster.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="quizMaster.avatar_url || quizMaster.avatar || quizMaster.photo || quizMaster.profile_image" :src="resolveAssetUrl(quizMaster.avatar_url || quizMaster.avatar || quizMaster.photo || quizMaster.profile_image) || (quizMaster.avatar_url || quizMaster.avatar || quizMaster.photo || quizMaster.profile_image)" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-brand-600/10 text-brand-600 grid place-items-center font-bold text-3xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800 dark:text-white">{{ quizMaster.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ quizMaster.headline || 'Experienced quiz-master' }}</p>
            <p v-if="quizMaster.institution" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {{ quizMaster.institution }}
            </p>
            <p v-if="quizMaster.subjects && quizMaster.subjects.length" class="mt-2 flex flex-wrap justify-center gap-1">
              <span v-for="subject in quizMaster.subjects.slice(0, 2)" :key="subject.id" class="bg-brand-600/10 text-brand-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {{ subject.name }}
              </span>
              <span v-if="quizMaster.subjects.length > 2" class="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                +{{ quizMaster.subjects.length - 2 }}
              </span>
            </p>
            <div class="mt-4">
              <div class="flex items-center gap-3 justify-center">
                <NuxtLink :to="`/quiz-masters/${quizMaster.slug}`" class="text-brand-600 font-medium text-sm hover:underline">
                  View Profile
                </NuxtLink>
                <button @click="() => toggleFollow(quizMaster)" :disabled="followLoading[quizMaster.id]" class="px-3 py-1 text-sm rounded-md border" :class="following[quizMaster.id] ? 'bg-brand-600/10 text-brand-600 dark:bg-brand-600/20' : 'text-gray-700 dark:text-gray-300'">
                  <span v-if="following[quizMaster.id]">Following</span>
                  <span v-else>Follow</span>
                </button>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500">
        No quiz-masters found.
      </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import { ref, computed, watch, onMounted, watchEffect } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades and subjects
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true
})

// --- Filtering ---
const gradeFilter = ref('')
const subjectFilter = ref('')

const filterParams = computed(() => {
  const params = {}
  if (gradeFilter.value) params.grade_id = gradeFilter.value
  if (subjectFilter.value) params.subject_id = subjectFilter.value
  return params
})

// --- Data Fetching ---
const { data: quizMastersData, pending, error } = await useAsyncData(
  'quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters', { params: filterParams.value }),
  { watch: [filterParams] }
)

const quizMasters = computed(() => {
  if (!quizMastersData.value) return []
  // Handle paginated response
  return quizMastersData.value.data || []
})

// --- Follow Logic ---
const following = ref({})
const followLoading = ref({})
const auth = useAuthStore()
const router = useRouter()
const api = useApi()
const alert = useAppAlert()

async function toggleFollow(quizMaster) {
  if (!auth.user) return router.push('/login')
  const id = quizMaster.id
  const current = !!following.value[id]
  // optimistic
  following.value = { ...following.value, [id]: !current }
  followLoading.value = { ...followLoading.value, [id]: true }
  try {
    let res
    if (!current) {
      res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    } else {
      res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    }
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      // rollback
      following.value = { ...following.value, [id]: current }
      console.error('Follow toggle failed', await res.text())
      alert.push({ message: 'Failed to follow/unfollow. Please try again.', type: 'error' })
    }
  } catch (err) {
    // rollback
    following.value = { ...following.value, [id]: current }
    console.error('Follow toggle failed', err)
  } finally {
    followLoading.value = { ...followLoading.value, [id]: false }
  }
}

// initialize following map from API payload when available (if backend provides is_following)
watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => {
    map[q.id] = !!(q.is_following || q.is_following_by_current_user || q.isFollowing || q.is_following === true)
  })
  following.value = map
})

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})

import { resolveAssetUrl } from '~/composables/useAssets'

useHead({
  title: 'Our quiz-masters',
  meta: [
    { name: 'description', content: 'Browse our list of expert quiz-masters.' }
  ]
})
</script>