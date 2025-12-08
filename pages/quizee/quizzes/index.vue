<template>
  <div class="bg-gray-50 min-h-screen">
    <PageHero
      title="Available Assessments"
      description="Access assessments designed to measure and improve your curriculum skills. Browse by topic, difficulty, and duration to select an appropriate exercise."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Quizzes', current: true }]"
      padding="py-8 sm:py-12"
    >
      <template #actions>
        <!-- Show user's current level instead of buttons -->
        <div class="flex flex-col gap-3 items-start">
          <p class="text-sm text-white/80">Quizzes for:</p>
          <div class="flex flex-wrap gap-3">
            <div v-if="userLevelName" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
              <span class="text-xs uppercase tracking-wide text-white/70">Level</span>
              <span class="text-sm font-semibold text-white">{{ userLevelName }}</span>
            </div>
            <div v-if="userGradeName" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
              <span class="text-xs uppercase tracking-wide text-white/70">Grade</span>
              <span class="text-sm font-semibold text-white">{{ userGradeName }}</span>
            </div>
          </div>
        </div>
      </template>
    </PageHero>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <!-- Search Input -->
          <div class="flex-1 relative group">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-600 transition" />
            <input v-model="q" @keyup.enter="fetchItems" placeholder="Search assessments..." class="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-600 focus:border-transparent transition dark:focus:ring-brand-600" />
          </div>

          <!-- Per Page Selector -->
          <select v-model.number="perPage" class="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent transition dark:focus:ring-brand-600">
            <option value="5">5 per page</option>
            <option value="12">12 per page</option>
            <option value="20">20 per page</option>
          </select>

          <!-- Topic Filter -->
          <select v-model.number="topicId" class="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent transition dark:focus:ring-brand-600">
            <option :value="0">All topics</option>
            <option v-for="t in (topics || [])" :key="t?.id ?? t" :value="t?.id">{{ t?.name }}</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <UiSkeleton v-for="i in 3" :key="i" class="h-32 rounded-lg" />
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
            v-for="qitem in (paginator?.data || [])"
            :key="qitem.id"
            :to="`/quizee/quizzes/${qitem.id}`"
            :startLink="`/quizee/quizzes/${qitem.id}`"
            :takeLink="`/quizee/quizzes/take/${qitem.id}`"
            :title="qitem.title"
            :topic="qitem.topic?.name"
            :cover="qitem.cover_image || ''"
            :description="qitem.description"
            :marks="qitem.questions_count"
            :difficulty="qitem.difficulty"
            :created-by="qitem['quiz-master'] || qitem.user || (qitem.user_id ? { id: qitem.user_id } : null)"
            :palette="pickPaletteClass(qitem.topic_id)"
            :quiz-id="qitem.id"
            :liked="qitem.liked || false"
            :likes="qitem.likes_count || 0"
            :attempted="qitem.attempted || false"
            :attempt-score="qitem.attempt_score ?? null"
            :attempt-correct="qitem.attempt_correct ?? null"
            :attempt-incorrect="qitem.attempt_incorrect ?? null"
            @like="onQuizLike(qitem, $event)"
          />
        </div>

        <!-- Pagination -->
        <div class="mt-8" v-if="paginator?.data?.length > 0">
          <Pagination :paginator="paginator" @change-page="onPageChange" />
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
import { ref, computed, onMounted, watch } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import Pagination from '~/components/Pagination.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useQuizzes from '~/composables/useQuizzes'
import { useAuthStore } from '~/stores/auth'

const alert = useAppAlert()
const auth = useAuthStore()

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

const q = ref('')
const perPage = ref(12)
const page = ref(1)
const topicId = ref(0)

// Get user's level and grade from profile
const userProfile = computed(() => {
  const u = auth.user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})
const userLevelId = computed(() => userProfile.value?.quizeeProfile?.level?.id || userProfile.value?.level_id)
const userGradeId = computed(() => userProfile.value?.quizeeProfile?.grade?.id || userProfile.value?.grade_id)
const userLevelName = computed(() => userProfile.value?.quizeeProfile?.level?.name || null)
const userGradeName = computed(() => userProfile.value?.quizeeProfile?.grade?.name || null)

// composable that encapsulates fetching and normalization
const { paginator, topics, loading, normalizedQuizzes, fetchItems, fetchTopics } = useQuizzes()

// keep local params reactive and trigger composable fetches
watch([q, perPage, page, topicId], () => {
  // on filter change, call fetchItems with current params, including level/grade filter
  const params = { 
    q: q.value, 
    per_page: perPage.value, 
    page: page.value, 
    topic_id: topicId.value 
  }
  
  // Add level or grade filter if available
  if (userLevelId.value) {
    params.level_id = userLevelId.value
  } else if (userGradeId.value) {
    params.grade_id = userGradeId.value
  }
  
  // ensure we merge user's attempts into the listing so attempted badges show
  fetchItems({ ...params, mergeAttempts: true })
})

onMounted(async () => { 
  const params = { 
    q: q.value, 
    per_page: perPage.value, 
    page: page.value, 
    topic_id: topicId.value 
  }
  
  // Add level or grade filter if available
  if (userLevelId.value) {
    params.level_id = userLevelId.value
  } else if (userGradeId.value) {
    params.grade_id = userGradeId.value
  }
  
  await Promise.all([fetchItems({ ...params, mergeAttempts: true }), fetchTopics()]) 
})

// fetchItems & fetchTopics provided by composable

function onPageChange(p) { page.value = p }

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