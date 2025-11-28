<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Hero card -->
          <div class="rounded-lg bg-gradient-to-r from-brand-600 to-brand-950 text-white p-6 shadow-lg overflow-hidden">
            <div class="flex items-center gap-6">
              <div class="flex-1">
                <div class="text-sm opacity-90">Welcome back</div>
                <h1 class="text-3xl font-extrabold tracking-tight">Continue your learning</h1>
                <p class="mt-2 text-sm opacity-90">Quick access to quizzes, challenges and your progress. Keep your streak going!</p>

                <div class="mt-4 flex flex-wrap gap-3">
                  <NuxtLink to="/quizee/quizzes" class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm">Browse Quizzes</NuxtLink>
                  <NuxtLink to="/quizee/battles" class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm border border-white/10">Start a Battle</NuxtLink>
                  <NuxtLink to="/quizee/subscription" class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm border border-white/10">Subscription</NuxtLink>
                </div>
              </div>
              <div class="hidden md:block w-48">
                <img :src="imgUrl || challengeIllustration" alt="Daily challenge" class="w-full h-auto" loading="lazy" />
              </div>
            </div>
            </div>
          
          <!-- Metrics grid (client-only to avoid SSR/client hydration mismatches for auth-protected data) -->
          <ClientOnly>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Average Score</div>
              <div class="mt-2 text-2xl font-bold">{{ avgScore }}%</div>
              <div class="text-xs text-gray-400 mt-1">{{ totalAttempts }} Quizzes</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Total Time</div>
              <div class="mt-2 text-2xl font-bold">{{ formatTime(totalQuizTime) }}</div>
              <div class="text-xs text-gray-400 mt-1">All Quizzes</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Points</div>
              <div class="mt-2 text-2xl font-bold">{{ rewards.points || 0 }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ pointsToday }} today</div>
            </UiCard>

            <UiCard class="p-4 text-center">
              <div class="text-sm text-gray-500">Streak</div>
              <div class="mt-2 text-2xl font-bold">{{ topStreak }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ streakDays }} days</div>
            </UiCard>
          </div>
          </ClientOnly>
          
          <!-- Performance Stats -->
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-medium">Performance Overview</div>
              </div>
            </template>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
              <div>
                <div class="text-sm text-gray-500">Average Time per Quiz</div>
                <div class="mt-1 text-xl font-semibold">{{ formatTime(avgQuizTime) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Fastest Quiz</div>
                <div class="mt-1 text-xl font-semibold">{{ formatTime(fastestQuizTime) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Question Response Time</div>
                <div class="mt-1 text-xl font-semibold">{{ formatTime(avgQuestionTime) }}</div>
              </div>
            </div>
          </UiCard>

          <!-- Recommended quizzes -->
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold">Recommended for you</div>
                <!-- Removed Browse all link -->
              </div>
            </template>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="!recQuizzes.length" class="text-sm text-gray-500">No recommendations yet — try browsing quizzes.</div>
              <div v-if="!recQuizzes.length" class="text-sm text-gray-500">No recommendations yet — try browsing quizzes.</div>
              <div v-for="q in recQuizzes" :key="q.id" v-else class="p-4 border rounded-md bg-white/50 dark:bg-slate-800">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium">{{ q.title || q.name || 'Untitled Quiz' }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ q.description || '' }}</div>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <NuxtLink :to="`/quizee/quizzes/${q.id}`" class="inline-flex items-center px-3 py-1.5 bg-brand-600 text-white text-sm rounded">Take</NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>

          <ClientOnly>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="font-medium">Recent Attempts</div>
                  <NuxtLink to="/quizee/attempts" class="text-sm text-brand-600">See all</NuxtLink>
                </div>
              </template>
              <div class="mt-2 text-sm text-gray-600">
                <ul class="space-y-3">
                  <li v-for="a in recentAttempts" :key="a.id" class="flex items-center justify-between">
                    <div class="truncate">{{ a.quiz_title || 'Quiz #' + a.quiz_id }} <span class="text-xs text-gray-400">• {{ a.score }}%</span></div>
                    <NuxtLink :to="`/quizee/quizzes/result/${a.id}`" class="text-xs text-brand-600">View</NuxtLink>
                  </li>
                  <li v-if="!recentAttempts.length" class="text-xs text-gray-500">No attempts yet</li>
                </ul>
              </div>
            </UiCard>

            <UiCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="font-medium">Recent Badges</div>
                  <NuxtLink to="/quizee/badges" class="text-sm text-brand-600">All badges</NuxtLink>
                </div>
              </template>
              <div class="mt-2 text-sm text-gray-600">
                <div class="flex gap-2 flex-wrap">
                  <div v-for="b in recentBadges" :key="b.id" class="p-2 bg-brand-50 rounded text-xs">{{ b.title }}</div>
                  <div v-if="!recentBadges.length" class="text-xs text-gray-500">No badges yet</div>
                </div>
              </div>
            </UiCard>
          </div>
          </ClientOnly>
        </div>

        <!-- Sidebar widgets -->
        <aside class="space-y-4">
          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-medium">Account</div>
                <NuxtLink to="/settings" class="text-sm text-brand-600">Settings</NuxtLink>
              </div>
            </template>
            <div class="mt-3 text-sm text-gray-600">Manage profile and security settings.</div>
          </UiCard>

          <UiCard>
            <template #header>
              <div class="font-medium">Quizzes</div>
            </template>
            <template #footer>
              <NuxtLink to="/quizee/quizzes" class="text-sm text-brand-600">My quizzes</NuxtLink>
            </template>
          </UiCard>

          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-medium">Subscription</div>
                <NuxtLink to="/quizee/subscription" class="text-sm text-brand-600">Manage</NuxtLink>
              </div>
            </template>
            <div class="mt-3 text-sm text-gray-600">View and manage your subscription packages.</div>
          </UiCard>
        </aside>
      </div>
    </div>

    <ClientOnly>
      <ChatBubble />
    </ClientOnly>
  </div>
</template>

<script setup>
// set page layout meta for quizee — dashboard is user-specific and should not be indexed
definePageMeta({ layout: 'quizee', title: 'Dashboard — Modeh', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Your learning dashboard — quick access to quizzes, challenges, and progress tracking.' } ] })
import ChatBubble from '~/components/ChatBubble.vue'
import RuntimeImg from '~/components/RuntimeImg.vue'
import UiHorizontalCard from '~/components/ui/UiHorizontalCard.vue'
import SettingsTabs from '~/components/SettingsTabs.vue'
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useMetricsDebug } from '~/composables/useTaxonomyHydration'
import useApi from '~/composables/useApi'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

const auth = useAuthStore()
const grade = auth.user?.grade ?? 8
const api = useApi()
// fetch quiz masters via centralized api helper
let quizMastersData = { value: null }
try {
  const res = await api.get(`/api/quiz-masters?grade=${grade}`)
  if (api.handleAuthStatus(res)) {
    quizMastersData = { value: null }
  } else if (res && res.ok) {
    const j = await res.json().catch(() => null)
    quizMastersData = { value: j }
  } else {
    quizMastersData = { value: null }
  }
} catch (e) {
  quizMastersData = { value: null }
}
// Fetch subjects for the user's grade from store
await store.fetchSubjectsByGrade(grade)

// fetch rewards via centralized api helper
let rewardsData = { value: null }
try {
  const res = await api.get('/api/rewards/my')
  if (api.handleAuthStatus(res)) {
    rewardsData = { value: null }
  } else if (res && res.ok) {
    const j = await res.json().catch(() => null)
    rewardsData = { value: j }
  } else {
    rewardsData = { value: null }
  }
} catch (e) {
  rewardsData = { value: null }
}

// normalize paginated or direct shapes for subjects and quiz-masters
// store.subjects is a reactive array; create a computed wrapper
const subjectsArr = computed(() => Array.isArray(store.subjects) ? store.subjects : [])

const quizMasters = (() => {
  if (quizMastersData?.value?.['quiz-masters']?.data && Array.isArray(quizMastersData.value['quiz-masters'].data)) return quizMastersData.value['quiz-masters'].data
  if (Array.isArray(quizMastersData?.value?.['quiz-masters'])) return quizMastersData.value['quiz-masters']
  if (Array.isArray(quizMastersData?.value)) return quizMastersData.value
  return []
})()

// Filters state
const query = ref('')
const selectedSubject = ref(null)
const difficulty = ref(null)
const difficultyOptions = [
  { label: 'Any', value: null },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' }
]
const subjectOptions = computed(() => [{ label: 'All Subjects', value: null }, ...subjectsArr.value.map(s => ({ label: s.name, value: s.id }))])
const filteredSubjects = computed(() => {
  let list = [...subjectsArr.value]
  if (selectedSubject.value) list = list.filter(s => s.id === selectedSubject.value)
  if (query.value) list = list.filter(s => s.name.toLowerCase().includes(query.value.toLowerCase()))
  return list
})

// inline fallbacks
const avatarSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23e5e7eb' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='24'>?</text></svg>"

// runtime illustration handling: keep a data-uri fallback for SSR and client to avoid hydration mismatches
const imgUrl = ref(null)
const imgError = ref(false)

const challengeIllustration = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><rect fill='%23eef2ff' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23638' font-size='18'>Daily Challenge</text></svg>"

const rewards = rewardsData?.value || { points: 0, vouchers: [], nextThreshold: 500 }

// recent attempts and badges (safe fetches; backend endpoints may vary)
  let recentAttempts = []
let recentBadges = []
  try {
    const res = await api.get('/api/quiz-attempts?per_page=5')
    let attemptsData = { value: null }
    if (api.handleAuthStatus(res)) {
      attemptsData = { value: null }
    } else if (res && res.ok) {
      const j = await res.json().catch(() => null)
      attemptsData = { value: j }
    } else {
      attemptsData = { value: null }
    }
    // attemptsData may be: { ok:true, data: { data: [items], ... } } or direct array
    if (attemptsData?.value?.data?.data && Array.isArray(attemptsData.value.data.data)) {
      recentAttempts = attemptsData.value.data.data
    } else if (attemptsData?.value?.data && Array.isArray(attemptsData.value.data)) {
      recentAttempts = attemptsData.value.data
    } else if (Array.isArray(attemptsData?.value)) {
      recentAttempts = attemptsData.value
    } else {
      recentAttempts = []
    }
  } catch (e) {
    recentAttempts = []
  }

  try {
    const res = await api.get('/api/user/badges?per_page=6')
    if (api.handleAuthStatus(res)) {
      recentBadges = []
    } else if (res && res.ok) {
      const j = await res.json().catch(() => null)
      if (j?.badges && Array.isArray(j.badges)) recentBadges = j.badges
      else if (Array.isArray(j)) recentBadges = j
      else recentBadges = []
    } else {
      recentBadges = []
    }
  } catch (e) {
    recentBadges = []
  }

// Recommended quizzes for quizee (public API call, fallback to empty)
let recQuizzes = []
  try {
    const res = await api.get('/api/recommendations/quizzes?per_page=5')
    let recData = { value: null }
    if (api.handleAuthStatus(res)) {
      recData = { value: null }
    } else if (res && res.ok) {
      const j = await res.json().catch(() => null)
      recData = { value: j }
    } else {
      recData = { value: null }
    }
    // recData may be { quizzes: paginator } or direct array
    if (recData?.value?.quizzes?.data && Array.isArray(recData.value.quizzes.data)) recQuizzes = recData.value.quizzes.data
    else if (Array.isArray(recData?.value?.quizzes)) recQuizzes = recData.value.quizzes
    else if (Array.isArray(recData?.value)) recQuizzes = recData.value
    else recQuizzes = []
  } catch (e) {
    // keep recQuizzes as empty array on errors
    recQuizzes = []
  }

// Small progress calculations (client-side fallbacks)
const completedSubjects = computed(() => subjectsArr.value.filter(s => (s.progress || 0) >= 80).length)
const avgAccuracy = computed(() => Math.round((subjectsArr.value.reduce((acc, x) => acc + (x.accuracy || 0), 0) / Math.max(subjectsArr.value.length, 1)) || 0))
// Stats calculations
const topStreak = computed(() => subjectsArr.value.length ? Math.max(...subjectsArr.value.map(s => s.streak || 0), 0) : 0)
const streakDays = ref(0)

// Time formatting helper
function formatTime(seconds) {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Stats from attempts
const totalAttempts = ref(0)
const avgScore = ref(0)
const totalQuizTime = ref(0)
const avgQuizTime = ref(0)
const fastestQuizTime = ref(0)
const avgQuestionTime = ref(0)
const pointsToday = ref(0)

async function fetchStats() {
  try {
    const resp = await api.get('/api/user/quiz-stats')
    if (!resp.ok) throw new Error('Failed to fetch quiz stats')
    const data = await resp.json()
    if (data) {
      totalAttempts.value = data.total_attempts || 0
      avgScore.value = Math.round(data.average_score || 0)
      totalQuizTime.value = data.total_time_seconds || 0
      avgQuizTime.value = data.avg_quiz_time || 0
      fastestQuizTime.value = data.fastest_quiz_time || 0
      avgQuestionTime.value = data.avg_question_time || 0
      pointsToday.value = data.points_today || 0
      streakDays.value = data.current_streak || 0
    }
  } catch (e) {
    console.error('Failed to fetch quiz stats:', e)
  }
}

onMounted(async () => {
  // ensure subjects for this user's grade are loaded
  await store.fetchSubjectsByGrade(grade)
  await fetchStats()
})
</script>
