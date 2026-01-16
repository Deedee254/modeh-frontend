<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { resolveAssetUrl } from '~/composables/useAssets'

definePageMeta({ layout: 'institution' as any })

const route = useRoute()
const api = useApi()

const institutionSlug = computed(() => route.params.slug)
const quizeeId = computed(() => {
  const slug = route.params.quizeeSlug as string
  return slug
})

// State
const loading = ref(false)
const error = ref<string | null>(null)
const quizee = ref<any>(null)
const stats = ref<any>(null)
const recentAttempts = ref<any[]>([])
const badges = ref<any[]>([])
const dailyChallenges = ref<any[]>([])
const battles = ref<any[]>([])
const topicStrength = ref<any[]>([])
const quizStats = ref<any>(null)
const followedQuizMasters = ref<any[]>([])
const likedQuizzes = ref<any[]>([])

// Fetch quizee profile from institution members endpoint
async function fetchQuizeeProfile() {
  if (!quizeeId.value || !institutionSlug.value) return
  
  loading.value = true
  error.value = null
  try {
    // First, fetch member details from institution members with role filter
    const membersRes = await api.get(`/api/institutions/${institutionSlug.value}/members?role=quizee&per_page=100`)
    if (api.handleAuthStatus(membersRes)) return
    
    const membersData = await api.parseResponse(membersRes)
    const members = membersData?.members || membersData?.data || []
    
    // Find the member by matching the slug with their name
    const nameSlug = quizeeId.value.toLowerCase()
    const member = members.find((m: any) => {
      const memberSlug = m.name ? m.name.toLowerCase().replace(/\s+/g, '-') : ''
      return memberSlug === nameSlug
    })
    
    if (!member) {
      error.value = 'Quizee not found in institution'
      return
    }
    
    // Load the member with full details
    quizee.value = member
    
    // Fetch member analytics for detailed stats
    try {
      const analyticsRes = await api.get(`/api/institutions/${institutionSlug.value}/analytics/member/${member.id}`)
      if (analyticsRes.ok) {
        const analyticsData = await api.parseResponse(analyticsRes)
        if (analyticsData) {
          // Merge analytics data
          stats.value = {
            grade: analyticsData.grade || member.quizee_profile?.grade,
            level: analyticsData.level || member.quizee_profile?.level,
            subjects: analyticsData.subjects || member.quizee_profile?.subject_models || [],
            bio: analyticsData.bio || member.quizee_profile?.bio || member.bio,
            headline: analyticsData.headline || member.quizee_profile?.headline || member.headline,
            verified: analyticsData.verified || member.is_verified || false,
            createdAt: analyticsData.created_at || member.created_at,
            points: analyticsData.points || member.quizee_profile?.points || 0,
            currentStreak: analyticsData.current_streak || member.quizee_profile?.current_streak || 0,
            longestStreak: analyticsData.longest_streak || member.quizee_profile?.longest_streak || 0,
            quizzesTaken: analyticsData.quizzes_taken || member.quizee_profile?.quizzes_taken || 0
          }
        }
      }
    } catch (analyticsError) {
      console.warn('Could not fetch analytics, using member data:', analyticsError)
      // Fallback to member data
      if (member.quizee_profile) {
        stats.value = {
          grade: member.quizee_profile.grade,
          level: member.quizee_profile.level,
          subjects: member.quizee_profile.subject_models || [],
          bio: member.quizee_profile.bio,
          headline: member.quizee_profile.headline,
          verified: member.is_verified,
          createdAt: member.created_at,
          points: member.quizee_profile.points,
          currentStreak: member.quizee_profile.current_streak,
          longestStreak: member.quizee_profile.longest_streak,
          quizzesTaken: member.quizee_profile.quizzes_taken
        }
      }
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load quizee profile'
    console.error('Error fetching quizee profile:', e)
  } finally {
    loading.value = false
  }
}

// Fetch user quiz stats (requires authenticated context)
async function fetchQuizStats() {
  try {
    const res = await api.get(`/api/user/quiz-stats`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    if (data?.ok && data) {
      quizStats.value = data
      topicStrength.value = data.topic_strength || []
    }
  } catch (e: any) {
    console.warn('Could not fetch quiz stats:', e)
  }
}

// Fetch daily challenges
async function fetchDailyChallenges() {
  try {
    const res = await api.get(`/api/user/daily-challenges`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    dailyChallenges.value = (data?.data || []).slice(0, 15)
  } catch (e: any) {
    console.warn('Could not fetch daily challenges:', e)
  }
}

// Fetch user battles
async function fetchBattles() {
  try {
    const res = await api.get(`/api/me/battles`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    battles.value = Array.isArray(data) ? data.slice(0, 10) : (data?.data || []).slice(0, 10)
  } catch (e: any) {
    console.warn('Could not fetch battles:', e)
  }
}

// Fetch followed quiz masters
async function fetchFollowedQuizMasters() {
  try {
    const res = await api.get(`/api/user/following?per_page=8`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    followedQuizMasters.value = (data?.data || data || []).slice(0, 8)
  } catch (e: any) {
    console.warn('Could not fetch followed quiz masters:', e)
  }
}

// Fetch liked quizzes
async function fetchLikedQuizzes() {
  try {
    const res = await api.get(`/api/user/liked-quizzes?per_page=12`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    likedQuizzes.value = (data?.data || data || []).slice(0, 12)
  } catch (e: any) {
    console.warn('Could not fetch liked quizzes:', e)
  }
}

// Fetch user badges
async function fetchBadges(userId?: number) {
  if (!userId) return
  
  try {
    // Fetch user badges from the authenticated endpoint
    const res = await api.get(`/api/users/${userId}/badges?per_page=20`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    badges.value = (data?.data || data || []).slice(0, 12)
  } catch (e: any) {
    console.warn('Could not fetch badges:', e)
  }
}

// Computed properties
const displayName = computed(() => quizee.value?.name || 'Quizee')
const displayAvatar = computed(() => resolveAssetUrl(quizee.value?.avatar_url || quizee.value?.avatar || quizee.value?.image || quizee.value?.avatarUrl || quizee.value?.photo) || '/logo/avatar-placeholder.png')
const displayHeadline = computed(() => quizee.value?.headline || stats.value?.headline || 'An active learner')
const displayGrade = computed(() => quizee.value?.quizee_profile?.grade?.name || stats.value?.grade?.name || '—')
const displayLevel = computed(() => quizee.value?.quizee_profile?.level?.name || stats.value?.level?.name || '—')
const displaySubjects = computed(() => {
  const subjects = quizee.value?.quizee_profile?.subject_models || stats.value?.subjects || []
  return Array.isArray(subjects) ? subjects : []
})

const attemptStats = computed(() => {
  if (!recentAttempts.value.length) return { total: 0, avgScore: 0, correct: 0, incorrect: 0 }
  
  const total = recentAttempts.value.length
  const avgScore = Math.round(
    recentAttempts.value.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / total
  )
  const correct = recentAttempts.value.reduce((sum: number, a: any) => sum + (a.correct || 0), 0)
  const incorrect = recentAttempts.value.reduce((sum: number, a: any) => sum + (a.incorrect || 0), 0)
  
  return { total, avgScore, correct, incorrect }
})

const performanceColor = computed(() => {
  const score = attemptStats.value.avgScore
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'blue'
  if (score >= 40) return 'amber'
  return 'red'
})

// Load data on mount
onMounted(async () => {
  if (quizeeId.value) {
    // First fetch the profile to get the member ID
    await fetchQuizeeProfile()
    
    // Then fetch all other data in parallel
    await Promise.all([
      fetchQuizStats(),
      fetchDailyChallenges(),
      fetchBattles(),
      fetchBadges(quizee.value?.id), // Pass the member ID for badges
      fetchFollowedQuizMasters(),
      fetchLikedQuizzes()
    ])
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <div class="text-red-600 dark:text-red-400 font-semibold">{{ error }}</div>
        <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quizees`" class="mt-4 inline-block text-sm text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to quizees
        </NuxtLink>
      </div>

      <!-- Profile Content -->
      <div v-else-if="quizee" class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-900"></div>
          <div class="px-6 pb-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
              <!-- Avatar -->
              <div v-if="displayAvatar" class="w-32 h-32 rounded-xl border-4 border-white dark:border-slate-800 overflow-hidden shadow-lg">
                <img :src="displayAvatar" :alt="displayName" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-32 h-32 rounded-xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                <span class="text-4xl font-black text-white">{{ displayName.charAt(0).toUpperCase() }}</span>
              </div>

              <!-- Info & Actions -->
              <div class="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full sm:w-auto">
                <div>
                  <h1 class="text-3xl font-black text-gray-900 dark:text-white">{{ displayName }}</h1>
                  <p class="text-base text-gray-600 dark:text-gray-400 mt-1">{{ displayHeadline }}</p>
                  <div class="flex items-center gap-2 mt-3">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Quizee
                    </span>
                    <span v-if="stats?.verified" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>
                      Verified
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-2">
                  <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quizees`" class="px-6 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 text-center">
                    ← Back
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Grade</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displayGrade }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Level</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displayLevel }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Subjects</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displaySubjects.length || 0 }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Member Since</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {{ stats?.createdAt ? new Date(stats.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Current Streak -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border-l-4 border-orange-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current Streak</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-2">{{ stats?.currentStreak || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">days in a row</p>
              </div>
              <div class="text-4xl">🔥</div>
            </div>
          </div>

          <!-- Longest Streak -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Longest Streak</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-2">{{ stats?.longestStreak || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">personal best</p>
              </div>
              <div class="text-4xl">⭐</div>
            </div>
          </div>

          <!-- Total Points -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Points</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-2">{{ stats?.points || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">earned</p>
              </div>
              <div class="text-4xl">💎</div>
            </div>
          </div>

          <!-- Badges Earned -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border-l-4 border-pink-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Badges</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-2">{{ badges.length }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">achievements</p>
              </div>
              <div class="text-4xl">🏆</div>
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        <div v-if="stats?.bio || quizee.bio" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ stats?.bio || quizee.bio || 'No bio added yet.' }}</p>
        </div>

        <!-- Subjects Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Subjects</h2>
          <div v-if="displaySubjects.length > 0" class="flex flex-wrap gap-2">
            <span v-for="subject in displaySubjects" :key="subject.id" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span class="font-medium text-emerald-900 dark:text-emerald-200">{{ subject.name }}</span>
            </span>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            📚 No learning subjects added yet
          </div>
        </div>

        <!-- Attempt Statistics -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Performance</h2>
          <div v-if="recentAttempts.length > 0" class="space-y-4">
            <!-- Stats Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Quizzes Taken</p>
                <p class="text-2xl font-black text-blue-900 dark:text-blue-200 mt-2">{{ attemptStats.total }}</p>
              </div>
              <div :class="[
                'p-4 rounded-lg border',
                {
                  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800': performanceColor === 'emerald',
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': performanceColor === 'blue',
                  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800': performanceColor === 'amber',
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': performanceColor === 'red'
                }
              ]">
                <p :class="[
                  'text-xs font-semibold uppercase tracking-wide',
                  {
                    'text-emerald-600 dark:text-emerald-400': performanceColor === 'emerald',
                    'text-blue-600 dark:text-blue-400': performanceColor === 'blue',
                    'text-amber-600 dark:text-amber-400': performanceColor === 'amber',
                    'text-red-600 dark:text-red-400': performanceColor === 'red'
                  }
                ]">Avg Score</p>
                <p :class="[
                  'text-2xl font-black mt-2',
                  {
                    'text-emerald-900 dark:text-emerald-200': performanceColor === 'emerald',
                    'text-blue-900 dark:text-blue-200': performanceColor === 'blue',
                    'text-amber-900 dark:text-amber-200': performanceColor === 'amber',
                    'text-red-900 dark:text-red-200': performanceColor === 'red'
                  }
                ]">{{ attemptStats.avgScore }}%</p>
              </div>
              <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Correct</p>
                <p class="text-2xl font-black text-green-900 dark:text-green-200 mt-2">{{ attemptStats.correct }}</p>
              </div>
              <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Incorrect</p>
                <p class="text-2xl font-black text-red-900 dark:text-red-200 mt-2">{{ attemptStats.incorrect }}</p>
              </div>
            </div>

            <!-- Recent Attempts List -->
            <div class="border-t dark:border-slate-700 pt-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Recent Attempts</h3>
              <div class="space-y-3">
                <div v-for="(attempt, idx) in recentAttempts.slice(0, 8)" :key="attempt.id || idx" class="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900 dark:text-white">{{ attempt.quiz?.title || `Quiz #${attempt.id}` }}</span>
                        <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="[
                          attempt.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          attempt.score >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          attempt.score >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        ]">
                          {{ attempt.score || 0 }}%
                        </span>
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">
                        {{ attempt.correct || 0 }} correct • {{ attempt.incorrect || 0 }} incorrect
                        <span v-if="attempt.created_at" class="ml-2 opacity-75">
                          {{ new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-black text-gray-900 dark:text-white">{{ attempt.score || 0 }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400">No quiz attempts yet</p>
          </div>
        </div>

        <!-- Topic Strength Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📊 Topic Strength</span>
          </h2>
          <div v-if="topicStrength.length > 0" class="space-y-4">
            <div v-for="(topic, idx) in topicStrength" :key="idx" class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-900 dark:text-white">{{ topic.name }}</span>
                <span :class="[
                  'text-sm font-semibold',
                  {
                    'text-emerald-600 dark:text-emerald-400': topic.accuracy >= 80,
                    'text-blue-600 dark:text-blue-400': topic.accuracy >= 60 && topic.accuracy < 80,
                    'text-amber-600 dark:text-amber-400': topic.accuracy >= 40 && topic.accuracy < 60,
                    'text-red-600 dark:text-red-400': topic.accuracy < 40
                  }
                ]">{{ topic.accuracy }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div :style="{ width: topic.accuracy + '%' }" :class="[
                  'h-full transition-all duration-300 rounded-full',
                  {
                    'bg-emerald-500': topic.accuracy >= 80,
                    'bg-blue-500': topic.accuracy >= 60 && topic.accuracy < 80,
                    'bg-amber-500': topic.accuracy >= 40 && topic.accuracy < 60,
                    'bg-red-500': topic.accuracy < 40
                  }
                ]"></div>
              </div>
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ topic.total_questions }} questions</span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            📊 No topic data available yet
          </div>
        </div>

        <!-- Daily Challenges Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚡ Daily Challenges</span>
          </h2>
          <div v-if="dailyChallenges.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="(challenge, idx) in dailyChallenges.slice(0, 12)" :key="challenge.id || idx" class="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  {{ new Date(challenge.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </span>
                <span :class="[
                  'text-xs font-bold px-2 py-1 rounded',
                  {
                    'bg-emerald-500 text-white': challenge.score === 5,
                    'bg-blue-500 text-white': challenge.score === 4 || challenge.score === 3,
                    'bg-amber-500 text-white': challenge.score === 2,
                    'bg-red-500 text-white': challenge.score <= 1
                  }
                ]">
                  {{ challenge.score }}/5
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">Daily Challenge</p>
              <p v-if="challenge.completed_at" class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {{ new Date(challenge.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            ⚡ No daily challenges completed yet
          </div>
        </div>

        <!-- Followed Quiz Masters Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>👨‍🏫 Followed Quiz Masters</span>
          </h2>
          <div v-if="followedQuizMasters.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(master, idx) in followedQuizMasters" :key="master.id || idx" class="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
              <div class="flex items-center gap-3 mb-2">
                <div v-if="master.avatar_url || master.avatar" class="w-10 h-10 rounded-full overflow-hidden">
                  <img :src="master.avatar_url || master.avatar" :alt="master.name" class="w-full h-full object-cover">
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {{ master.name?.charAt(0)?.toUpperCase() || 'Q' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ master.name }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 truncate">Quiz Master</p>
                </div>
              </div>
              <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quiz-masters/${master.name?.toLowerCase().replace(/\\s+/g, '-')}/details`" class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                View Profile →
              </NuxtLink>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            👨‍🏫 No followed quiz masters yet
          </div>
        </div>

        <!-- Liked Quizzes Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>❤️ Liked Quizzes</span>
          </h2>
          <div v-if="likedQuizzes.length > 0" class="space-y-3">
            <div v-for="(quiz, idx) in likedQuizzes.slice(0, 10)" :key="quiz.id || idx" class="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ quiz.title }}</h3>
                    <span v-if="quiz.questions_count" class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {{ quiz.questions_count }} Q
                    </span>
                  </div>
                  <p v-if="quiz.created_by_name" class="text-xs text-gray-600 dark:text-gray-400">by {{ quiz.created_by_name }}</p>
                </div>
                <div v-if="quiz.likes_count" class="text-right whitespace-nowrap">
                  <span class="text-sm font-bold text-pink-600 dark:text-pink-400">❤️ {{ quiz.likes_count }}</span>
                </div>
              </div>
              <p v-if="quiz.description" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{{ quiz.description }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            ❤️ No liked quizzes yet
          </div>
        </div>

        <!-- Battles Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚔️ Battles</span>
          </h2>
          <div v-if="battles.length > 0" class="space-y-4">
            <div v-for="(battle, idx) in battles.slice(0, 10)" :key="battle.id || idx" class="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between gap-4 mb-3">
                <!-- Initiator -->
                <div class="flex items-center gap-2 flex-1">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {{ battle.initiator?.first_name?.charAt(0)?.toUpperCase() || 'A' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ battle.initiator?.first_name || 'Player 1' }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Initiator</p>
                  </div>
                </div>

                <!-- Score & Status -->
                <div class="text-center px-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg font-black text-gray-900 dark:text-white">{{ battle.initiator_score || 0 }}</span>
                    <span class="text-gray-400">-</span>
                    <span class="text-lg font-black text-gray-900 dark:text-white">{{ battle.opponent_score || 0 }}</span>
                  </div>
                  <span :class="[
                    'text-xs font-semibold px-2 py-1 rounded-full',
                    {
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300': battle.status === 'completed',
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': battle.status === 'in_progress',
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': battle.status === 'pending'
                    }
                  ]">
                    {{ battle.status === 'in_progress' ? 'In Progress' : battle.status === 'completed' ? 'Completed' : 'Pending' }}
                  </span>
                </div>

                <!-- Opponent -->
                <div class="flex items-center gap-2 flex-1 justify-end">
                  <div class="flex-1 min-w-0 text-right">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ battle.opponent?.first_name || 'Player 2' }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Opponent</p>
                  </div>
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {{ battle.opponent?.first_name?.charAt(0)?.toUpperCase() || 'B' }}
                  </div>
                </div>
              </div>

              <!-- Battle Date -->
              <div v-if="battle.completed_at" class="text-xs text-gray-600 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-slate-600">
                {{ new Date(battle.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            ⚔️ No battles yet
          </div>
        </div>

        <!-- Badges Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements & Badges</h2>
          <div v-if="badges.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="(badge, idx) in badges" :key="badge.id || idx" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:shadow-md transition-all group">
              <div v-if="badge.icon" class="text-4xl">{{ badge.icon }}</div>
              <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span class="text-2xl">🏅</span>
              </div>
              <div class="text-center">
                <p class="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:break-words">{{ badge.title || badge.name || `Badge #${idx}` }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ badge.description || 'Achievement' }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            🏅 No badges earned yet
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold">Quizee not found</p>
        <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quizees`" class="mt-4 inline-block text-sm text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to quizees
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
