<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Quiz Masters</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Find Your Quiz Masters</h1>
      <p class="text-gray-600 mb-6">Connect with expert quiz masters in your grade and institution who create engaging quizzes and guide your learning journey.</p>
    </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <!-- Main Content -->
          <main>
            <!-- Loading State -->
            <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard v-for="i in 1" :key="i" />
            </div>

            <!-- Empty State -->
            <div v-else-if="!quizMasters || quizMasters.length === 0" class="py-12 text-center">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-slate-900 dark:text-white">No quiz masters found</h3>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Try adjusting your filters</p>
            </div>

            <!-- Quiz Masters Grid with Animations -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
              <QuizMasterCard
                v-for="(quizMaster, index) in quizMasters"
                :key="quizMaster.id"
                :quiz-master="quizMaster"
                :is-following="following[quizMaster.id]"
                :loading="loadingFollow[quizMaster.id]"
                @follow="toggleFollow(quizMaster)"
                :style="{ animationDelay: `${index * 50}ms` }"
                class="animate-slide-up"
              />
            </div>

            <!-- Pagination -->
            <div v-if="paginator && paginator.last_page > 1" class="mt-10">
              <UPagination
                v-model="currentPage"
                :total="paginator.total"
                :per-page="paginator.per_page"
                :max-links="5"
                class="justify-center"
                @change="onPageChange"
              />
            </div>
          </main>
      </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect, onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import UPagination from '~/components/ui/UPagination.vue'
import QuizMasterCard from '~/components/QuizMasterCard.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

definePageMeta({ layout: 'quizee' })

useHead({
  title: 'Browse Quiz Masters',
  meta: [
    { name: 'description', content: 'Find and follow expert quiz masters in your grade and institution.' }
  ]
})

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades and subjects
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true
})

const currentPage = ref(1)

const filterParams = computed(() => {
  return { page: currentPage.value }
})

// Fetch quiz masters with pagination
const { data: response, pending, refresh } = await useAsyncData(
  'quizee-quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters', { params: filterParams.value }),
  { watch: [filterParams] }
)

async function onPageChange(page) {
  currentPage.value = page
}

const quizMasters = computed(() => {
  if (response.value?.data && Array.isArray(response.value.data)) {
    return response.value.data.filter(Boolean).map(qm => ({ ...qm, institution: qm.institution || 'Independent Educator' }))
  }
  return []
})

const paginator = computed(() => {
  if (!response.value) return null
  const { current_page, last_page, total, per_page, links } = response.value
  return { current_page, last_page, total, per_page, links }
})

// --- Follow Logic ---
const auth = useAuthStore()
const router = useRouter()
const following = ref({})
const loadingFollow = ref({})
const api = useApi()
const alert = useAppAlert()

async function toggleFollow(qm) {
  if (!auth.user) return router.push('/login')
  const id = qm.id
  const cur = !!following.value[id]
  following.value = { ...following.value, [id]: !cur }
  loadingFollow.value = { ...loadingFollow.value, [id]: true }
  try {
    let res
    if (!cur) res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    else res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      following.value = { ...following.value, [id]: cur }
      alert.push({ message: 'Failed to follow/unfollow. Try again.', type: 'error' })
    }
  } catch (err) {
    following.value = { ...following.value, [id]: cur }
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = { ...loadingFollow.value, [id]: false }
  }
}

// Initialize following state from API response (runs when data loads)
watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => { 
    // Check for is_following field which our backend now returns
    map[q.id] = !!(q.is_following || q.isFollowing || q.is_following_by_current_user) 
  })
  following.value = map
})

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
