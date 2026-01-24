<template>
  <div>
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Quiz Masters</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Expert Quiz Masters</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Discover top educators and subject experts creating engaging quizzes that help people test knowledge across all subjects and expand their minds.</p>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <main>

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-masters...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quiz-masters. Please try again later.
      </div>
      <div v-else-if="quizMasters.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuizMasterCard 
          v-for="quizMaster in quizMasters" 
          :key="quizMaster.id"
          :quiz-master="quizMaster"
          :is-following="following[quizMaster.id]"
          :loading="followLoading[quizMaster.id]"
          @follow="() => toggleFollow(quizMaster)"
        />
      </div>
      <div v-else class="text-center text-gray-500">
        No quiz-masters found.
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="mt-10 flex items-center justify-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 rounded-md font-medium transition',
              currentPage === page
                ? 'bg-brand-600 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="currentPage = Math.min(pagination.last_page, currentPage + 1)"
          :disabled="currentPage === pagination.last_page"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import { ref, computed, watch, onMounted, watchEffect } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useMetricsDebug } from '~/composables/useTaxonomyHydration'

const config = useRuntimeConfig()
const { print: printMetrics } = useMetricsDebug()

// --- Pagination ---
const currentPage = ref(1)
const itemsPerPage = 12

const filterParams = computed(() => {
  return {
    page: currentPage.value,
    per_page: itemsPerPage
  }
})

// --- Data Fetching ---
const { data: quizMastersData, pending, error, refresh } = await useAsyncData(
  'quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters', { params: filterParams.value }),
  { watch: [filterParams] }
)

const quizMasters = computed(() => {
  if (!quizMastersData.value) return []
  // Handle paginated response
  return quizMastersData.value.data || []
})

const pagination = computed(() => {
  if (!quizMastersData.value) return null
  return {
    total: quizMastersData.value.total || 0,
    per_page: quizMastersData.value.per_page || itemsPerPage,
    current_page: quizMastersData.value.current_page || currentPage.value,
    last_page: quizMastersData.value.last_page || 1
  }
})

const visiblePages = computed(() => {
  if (!pagination.value) return []
  const maxVisible = 5
  const total = pagination.value.last_page
  const current = pagination.value.current_page

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
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
      following.value = { ...following.value, [id]: current }
      alert.push({ message: 'Failed to follow/unfollow. Please try again.', type: 'error' })
    }
  } catch (err) {
    following.value = { ...following.value, [id]: current }
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

useHead({
  title: 'Expert Quiz Masters Who Boost Student Success | Modeh',
  meta: [
    { name: 'description', content: 'Discover top educators and subject experts creating engaging quizzes that help people test knowledge across all subjects and expand their minds. Follow quiz masters with proven expertise.' },
    { name: 'keywords', content: 'quiz masters, expert educators, online tutors, educational content creators, academic experts, quiz creators, top teachers' },
    { property: 'og:title', content: 'Expert Quiz Masters Who Boost Student Success | Modeh' },
    { property: 'og:description', content: 'Discover top educators and subject experts creating engaging quizzes that help people test knowledge across all subjects and expand their minds. Follow quiz masters with proven expertise.' }
  ]
})
</script>