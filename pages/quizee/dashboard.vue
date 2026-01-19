<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Hero Section - Full Bleed -->
    <div class="w-full bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white overflow-hidden relative">
      <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="relative z-10 flex items-center gap-8">
          <ClientOnly>
            <div class="flex-1">
              <div class="text-sm font-medium opacity-90 uppercase tracking-wider">Welcome back</div>
              <h1 class="mt-2 text-4xl md:text-5xl font-black tracking-tight">{{ auth.user?.name || 'Quizee' }}, continue your learning</h1>
            <p class="mt-3 text-base opacity-95 leading-relaxed max-w-md">Quick access to quizzes, challenges and your progress. Keep your streak going and unlock your potential!</p>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink to="/quizee/quizzes" class="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-slate-900 font-semibold rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                Browse Quizzes
              </NuxtLink>
              <NuxtLink to="/quizee/battles" class="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all duration-200 border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Start a Battle
              </NuxtLink>
              <NuxtLink to="/quizee/subscription" class="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all duration-200 border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Subscription
              </NuxtLink>
            </div>
            </div>
          </ClientOnly>
          <!-- Metrics Cards Grid (2x2) -->
          <ClientOnly>
            <div class="hidden lg:grid lg:grid-cols-2 gap-4 flex-shrink-0 w-80">
              <!-- Points Card (Amber) -->
              <div class="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Points</span>
                  <div class="w-7 h-7 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </div>
                </div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">{{ rewards.points || 0 }}</div>
                <div :class="['mt-1 text-xs font-semibold', pointsToday > 0 ? 'text-amber-600 dark:text-amber-400' : 'invisible']">+{{ pointsToday }} today</div>
              </div>
              <!-- Rank Card (Green) -->
              <div class="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Global Rank</span>
                  <div class="w-7 h-7 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"></path></svg>
                  </div>
                </div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">#{{ auth.user?.rank?.global_rank || '-' }}</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ auth.user?.rank?.rank_points || 0 }} pts</div>
              </div>
              <!-- Achievements Card (Burgundy) -->
              <div class="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Achievements</span>
                  <div class="w-7 h-7 rounded bg-burgundy-100 dark:bg-burgundy-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-burgundy-600 dark:text-burgundy-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  </div>
                </div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">{{ achievements || 0 }}</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">Earned</div>
              </div>
              <!-- Streak Card (Red) -->
              <div class="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Streak</span>
                  <div class="w-7 h-7 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  </div>
                </div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">{{ streakDays }}</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">Days</div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main column (wider - 2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Performance Stats -->
          <QuizeePerformanceStats 
            :loading="metricsLoading"
            :avgQuizTime="avgQuizTime"
            :fastestQuizTime="fastestQuizTime"
            :avgQuestionTime="avgQuestionTime"
          />

          <!-- Topic Strength -->
          <QuizeeTopicStrength :topicStrength="topicStrength" />

          <!-- Topic Progress -->
          <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div class="flex-1 font-semibold text-lg">Topic Progress</div>
                <NuxtLink to="/quizee/topics" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">View all →</NuxtLink>
              </div>
            </template>
            <div class="p-6">
              <QuizeeTopicProgress :loading="metricsLoading" :topics="topicProgressList" />
            </div>
          </UiCard>

          <!-- Recommended quizzes -->
          <ClientOnly>
            <QuizeeRecommendedQuizzes 
              :loading="recQuizzesLoading"
              :quizzes="recQuizzes"
              :displayGrade="displayGrade"
            />
          </ClientOnly>
        </div>

        <!-- Sidebar (1 column on large screens, stacks on mobile) -->
        <aside class="lg:col-span-1 space-y-6">
          <!-- Recent Attempts Card -->
          <ClientOnly>
            <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div class="flex-1 font-semibold text-lg">Recent Attempts</div>
                  <NuxtLink to="/quizee/attempts" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">View all →</NuxtLink>
                </div>
              </template>
              <div class="p-6">
                <div v-if="recentAttempts.length" class="space-y-4">
                  <div v-for="a in recentAttempts.slice(0, 5)" :key="a.id" class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group">
                    <!-- Circular Progress -->
                    <div class="relative w-14 h-14 flex-shrink-0">
                      <svg class="w-14 h-14 -rotate-90 transform" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-200 dark:text-gray-600"></circle>
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-500 transition-all duration-500" :style="{ strokeDasharray: `${(a.score / 100) * 150.8} 150.8` }"></circle>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-xs font-bold text-gray-900 dark:text-white">{{ a.score }}%</span>
                      </div>
                    </div>
                    
                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ a.quiz_title || 'Quiz #' + a.quiz_id }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Recently attempted</p>
                    </div>
                    
                    <!-- View link -->
                    <NuxtLink :to="`/quizee/quizzes/result/${a.id}`" class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg class="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </NuxtLink>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p class="text-sm text-gray-500 dark:text-gray-400">No attempts yet</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a quiz to track your progress</p>
                </div>
              </div>
            </UiCard>
          </ClientOnly>

          <!-- Recent Badges Card -->
          <ClientOnly>
            <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  </div>
                  <div class="flex-1 font-semibold text-lg">Recent Badges</div>
                  <NuxtLink to="/quizee/badges" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">All →</NuxtLink>
                </div>
              </template>
              <div class="p-6">
                <div v-if="recentBadges.length" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <div v-for="b in recentBadges" :key="b.id" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800/50 hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div class="text-3xl transform group-hover:scale-110 transition-transform duration-200">{{ b.icon || '🏆' }}</div>
                    <p class="text-xs font-bold text-gray-900 dark:text-white text-center line-clamp-2 leading-tight">{{ b.title }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"></path></svg>
                  <p class="text-sm text-gray-500 dark:text-gray-400">No badges earned yet</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete quizzes to unlock badges</p>
                </div>
              </div>
            </UiCard>
          </ClientOnly>

          <!-- Package Card -->
          <ClientOnly>
            <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-burgundy-50 to-burgundy-100 dark:from-burgundy-900/20 dark:to-burgundy-800/20 border border-burgundy-200 dark:border-burgundy-800">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-burgundy-100 to-burgundy-50 dark:from-burgundy-900/30 dark:to-burgundy-800/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-burgundy-600 dark:text-burgundy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-burgundy-900 dark:text-burgundy-100">{{ currentPackage?.title || 'Free Plan' }}</div>
                    <p class="text-xs text-burgundy-700 dark:text-burgundy-300">{{ currentPackageStatus }}</p>
                  </div>
                </div>
              </template>
              <div class="p-4">
                <p v-if="currentPackage" class="text-sm text-burgundy-800 dark:text-burgundy-200 mb-4">{{ currentPackage.short_description || currentPackage.description }}</p>
                <p v-else class="text-sm text-burgundy-800 dark:text-burgundy-200 mb-4">Upgrade to unlock premium features and access more quizzes.</p>
                <NuxtLink to="/quizee/subscription" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                  <span>{{ currentPackage ? 'Manage Plan' : 'Upgrade Now' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </NuxtLink>
              </div>
            </UiCard>
          </ClientOnly>

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
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import QuizeeMetricsGrid from '~/components/quizee/QuizeeMetricsGrid.vue'
import QuizeePerformanceStats from '~/components/quizee/QuizeePerformanceStats.vue'
import QuizeeTopicStrength from '~/components/quizee/QuizeeTopicStrength.vue'
import QuizeeTopicProgress from '~/components/quizee/QuizeeTopicProgress.vue'
import QuizeeRecommendedQuizzes from '~/components/quizee/QuizeeRecommendedQuizzes.vue'
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useMetricsDebug } from '~/composables/useTaxonomyHydration'
import useApi from '~/composables/useApi'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

const auth = useAuthStore()
const grade = auth.user?.grade ?? 8

// Loading states
const metricsLoading = ref(true)
const recQuizzesLoading = ref(true)

// Display grade for recommendations section
const displayGrade = computed(() => {
  const gradeValue = auth.user?.quizeeProfile?.grade || auth.user?.grade || 8
  // Handle both numeric grades (e.g., 8) and grade objects with name (e.g., { name: 'Form 4', ... })
  if (typeof gradeValue === 'object' && gradeValue?.name) {
    return gradeValue.name
  }
  return gradeValue
})
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

// Recommended quizzes for quizee (use ClientOnly to avoid hydration mismatches)
const recQuizzes = ref([])

// Fetch recommendations only on client side
async function fetchRecommendations() {
  try {
    // prefer explicit grade param to ensure backend filters recommendations to user's grade
    let forGrade = (auth.user && auth.user.quizeeProfile && auth.user.quizeeProfile.grade_id) ? auth.user.quizeeProfile.grade_id : (auth.user && auth.user.grade ? auth.user.grade : null)
    
    // Handle object grade (extract id or name) - fixes bug where [object Object] was sent to API
    if (forGrade && typeof forGrade === 'object') {
      forGrade = forGrade.id || forGrade.name || null
    }

    const url = forGrade ? `/api/recommendations/quizzes?per_page=5&for_grade=${encodeURIComponent(forGrade)}` : '/api/recommendations/quizzes?per_page=5'
    const res = await api.get(url)
    if (api.handleAuthStatus(res)) {
      recQuizzes.value = []
    } else if (res && res.ok) {
      const j = await res.json().catch(() => null)
      // Handle various response formats
      if (j?.quizzes?.data && Array.isArray(j.quizzes.data)) {
        recQuizzes.value = j.quizzes.data
      } else if (Array.isArray(j?.quizzes)) {
        recQuizzes.value = j.quizzes
      } else if (Array.isArray(j)) {
        recQuizzes.value = j
      } else {
        recQuizzes.value = []
      }
    } else {
      recQuizzes.value = []
    }
  } catch (e) {
    console.error('Failed to fetch recommendations:', e)
    recQuizzes.value = []
  } finally {
    recQuizzesLoading.value = false
  }
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
const topicStrength = ref([])
const topicProgressList = ref([])
const achievements = ref(0)
const currentPackage = ref(null)
const currentPackageStatus = computed(() => {
  if (currentPackage.value) {
    return currentPackage.value.status === 'active' ? 'Active Subscription' : 'Upgrade Available'
  }
  return 'Free Plan'
})

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
      achievements.value = data.achievements_count || 0
      // Populate topic progress with top 5 topics
      if (data.topic_strength && Array.isArray(data.topic_strength)) {
        topicProgressList.value = data.topic_strength.slice(0, 5)
      }
      topicStrength.value = data.topic_strength || []
    }
  } catch (e) {
    console.error('Failed to fetch quiz stats:', e)
  } finally {
    metricsLoading.value = false
  }
}

async function fetchCurrentSubscription() {
  try {
    const resp = await api.get('/api/subscriptions/mine')
    if (resp && resp.ok) {
      const data = await resp.json().catch(() => null)
      if (data?.subscription && data.subscription.package) {
        currentPackage.value = data.subscription.package
      }
    }
  } catch (e) {
    console.error('Failed to fetch subscription:', e)
  }
}

onMounted(async () => {
  // ensure subjects for this user's grade are loaded
  await store.fetchSubjectsByGrade(grade)
  await fetchStats()
  await fetchRecommendations()
  await fetchCurrentSubscription()
})
</script>
