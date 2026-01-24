<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumbs -->
      <nav class="mb-4 text-sm" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-gray-600">
          <li>
            <NuxtLink to="/quizee/dashboard" class="hover:text-brand-600">Dashboard</NuxtLink>
          </li>
          <li>
            <svg class="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li class="font-medium text-gray-900">Assessments</li>
        </ol>
      </nav>
      <!-- Alert if grade is missing -->
      <div v-if="!userGradeName" class="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-amber-900">Add Your Grade</h3>
            <p class="text-sm text-amber-800 mt-1">Please add your grade to your profile to get personalized quizzes matched to your level.</p>
            <NuxtLink to="/quizee/profile" class="inline-block mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline">
              Update Profile →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Page Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        Quizzes for {{ userGradeName || 'Your Grade' }}
      </h1>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pb-16">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 sm:justify-between">
          <!-- Sort Selector (replaces search) -->
          <div class="w-full flex-1">
            <label class="sr-only">Sort</label>
            <!-- Pill-style sort buttons: grid on small (stack 1/2/3 columns), show as single-line flex on lg+ with horizontal scroll if needed -->
            <div class="flex flex-wrap gap-2 lg:flex-nowrap lg:overflow-x-auto">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                @click="sortBy = opt.value"
                :aria-pressed="sortBy === opt.value"
                class="w-full sm:w-1/2 md:w-1/3 lg:w-auto px-3 py-2 text-sm rounded-full border transition text-center"
                :class="sortBy === opt.value ? 'bg-brand-600 text-white border-transparent' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Per Page Selector (aligned to right on larger screens) -->
          <div class="mt-0 sm:mt-0 sm:ml-4">
            <select v-model.number="perPage" class="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent transition dark:focus:ring-brand-600">
              <option value="5">5 per page</option>
              <option value="12">12 per page</option>
              <option value="20">20 per page</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <UiSkeleton v-for="i in 1" :key="i" class="h-32 rounded-lg" />
      </div>

      <!-- Results -->
      <div v-else>
        <div v-if="!paginator?.data || paginator.data.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <QuizCard
            v-for="qitem in paginatedQuizzes"
            :key="qitem.id"
            :quiz="qitem"
            :to="`/quizee/quizzes/${qitem.slug}`"
            :startLink="`/quizee/quizzes/${qitem.slug}`"
            :takeLink="`/quizee/quizzes/take/${qitem.slug}`"
            :title="qitem.title"
            :topic="qitem.topic?.name"
            :cover="qitem.cover_image || ''"
            :description="qitem.description"
            :marks="qitem.questions_count"
            :difficulty="qitem.difficulty"
            :created-by="qitem['quiz-master'] || qitem.user || (qitem.user_id ? { id: qitem.user_id } : null)"
            :palette="pickPaletteClass(qitem.topic_id)"
            :quiz-id="qitem.id"
            :liked="qitem.liked"
            :likes="qitem.likes_count"
            :attempted="qitem.attempted"
            :attempt-score="qitem.attempt_score"
            :attempt-correct="qitem.attempt_correct"
            :attempt-incorrect="qitem.attempt_incorrect"
            :attempts-count="qitem.attempts_count"
            @like="onQuizLike(qitem, $event)"
          />
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-3 py-2 rounded-lg font-medium transition',
                page === currentPage
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'quizee',
  title: 'Quizzes — Modeh',
  meta: [
    { name: 'description', content: 'Access assessments designed to measure and improve your curriculum skills. Browse by topic, difficulty, and duration.' },
    { property: 'og:title', content: 'Quizzes — Modeh' },
    { property: 'og:description', content: 'Access assessments designed to measure and improve your curriculum skills. Browse by topic, difficulty, and duration.' }
  ]
})
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useQuizzes from '~/composables/useQuizzes'
import { useAuthStore } from '~/stores/auth'

const alert = useAppAlert()
const auth = useAuthStore()
const route = useRoute()

function pickPaletteClass(id) {
  const palettes = [
    'bg-gradient-to-br from-brand-600/30 via-brand-600/20 to-brand-950/10 text-brand-600',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-brand-600/20 via-brand-600/15 to-brand-950/10 text-brand-600'
  ]
  return palettes[(id || 0) % palettes.length]
}

// removed search query in favor of sort-based browsing
const sortBy = ref('newest')

// Human-readable label for the current sort (used in mobile summary)
const humanSortLabel = computed(() => {
  switch (sortBy.value) {
    case 'popular': return 'Most popular'
    case 'most_liked': return 'Most liked'
    case 'attempted': return 'Most attempted'
    case 'shortest': return 'Shortest'
    default: return 'Newest'
  }
})

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most popular', value: 'popular' },
  { label: 'Most liked', value: 'most_liked' },
  { label: 'Most attempted', value: 'attempted' },
  { label: 'Shortest', value: 'shortest' }
]
const perPage = ref(12)
const currentPage = ref(1)

// Computed paginated quizzes
const paginatedQuizzes = computed(() => {
  const quizzes = paginator.value?.data || []
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return quizzes.slice(start, end)
})

// Total pages computed property
const totalPages = computed(() => {
  const total = paginator.value?.total || 0
  return Math.ceil(total / perPage.value)
})

// Visible page numbers for pagination
const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const maxVisible = 5
  const pages = []
  
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) pages.push(i)
  }
  
  return pages
})

// Get user's level and grade from profile
const userProfile = computed(() => {
  const u = auth.user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})
const userLevelId = computed(() => userProfile.value?.profile?.level?.id || userProfile.value?.level_id)
const userGradeId = computed(() => userProfile.value?.profile?.grade?.id || userProfile.value?.grade_id)
const userLevelName = computed(() => userProfile.value?.profile?.level?.name || null)

// Grade name: try to get from the grade object if it's fully loaded, otherwise null
const userGradeName = computed(() => {
  const profile = userProfile.value?.profile || userProfile.value
  // Check if grade is a full object with a name property
  if (profile?.grade && typeof profile.grade === 'object' && profile.grade.name) {
    return profile.grade.name
  }
  // Otherwise return null - we only show the grade name if we have it
  return null
})

// composable that encapsulates fetching and normalization
const { paginator, loading, normalizedQuizzes, fetchItems } = useQuizzes()

// keep local params reactive and trigger composable fetches
// Also watch user's level/grade so filters reapply if the auth/profile changes
watch([sortBy, userLevelId, userGradeId], () => {
  // on filter change, call fetchItems with current params, including level/grade filter
  const params = {
    sort: sortBy.value,
    per_page: perPage.value,
    page: currentPage.value
  }
  
  // ensure we merge user's attempts into the listing so attempted badges show
  fetchItems({ ...params, mergeAttempts: true })
})

// Separate watcher for perPage to reset page and fetch when per-page changes
watch(perPage, async () => {
  currentPage.value = 1 // Reset to first page when per-page changes

  // Fetch immediately with the new per-page and reset page
  const params = {
    sort: sortBy.value,
    per_page: perPage.value,
    page: 1
  }

  await fetchItems({ ...params, mergeAttempts: true })
})

// Separate watcher for page changes
watch(currentPage, async () => {
  const params = {
    sort: sortBy.value,
    per_page: perPage.value,
    page: currentPage.value
  }

  // ensure we merge user's attempts into the listing so attempted badges show
  await fetchItems({ ...params, mergeAttempts: true })
})

onMounted(async () => { 
  const params = {
    sort: sortBy.value,
    per_page: perPage.value,
    page: currentPage.value
  }
  
  await fetchItems({ ...params, mergeAttempts: true }) 
})

// Also refetch when the auth store user object changes (covers cases where
// the profile is updated after submitting a quiz and the page isn't remounted).
watch(() => auth.user, () => {
  const params = {
    sort: sortBy.value,
    per_page: perPage.value,
    page: currentPage.value
  }
  fetchItems({ ...params, mergeAttempts: true })
})

// Watch for route changes to refetch when navigating to this page
// This ensures fresh data (including user level/grade) loads when navigating from quiz results
watch(() => route.path, async (newPath) => {
  // Only refetch if we're on this page
  if (newPath === '/quizee/quizzes') {
    // Refresh user profile to get latest level/grade
    try {
      await auth.fetchUser()
    } catch (e) {
      // Continue even if user fetch fails
    }
    
    // Give Vue time to update computed properties (userLevelId, userGradeId) 
    // after auth.fetchUser() updates auth.user
    await nextTick()
    
    // Refetch quizzes with current filters (BOTH level_id and grade_id)
    const params = {
      sort: sortBy.value,
      per_page: perPage.value,
      page: currentPage.value
    }
    await fetchItems({ ...params, mergeAttempts: true })
  }
})

// fetchItems & fetchTopics provided by composable

function onQuizLike(item, payload) {
  try {
    if (!item) return
    if (payload && payload.liked === true) {
      item.likes_count = (item.likes_count || item.likes || 0) + 1
      item.liked = true
    } else if (payload && payload.liked === false) {
      item.likes_count = Math.max(0, (item.likes_count || item.likes || 0) - 1)
      item.liked = false
    }
  } catch (e) {}
}
</script>

<style scoped></style>