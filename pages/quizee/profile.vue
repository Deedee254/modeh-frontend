<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
      <!-- Profile Header Hero -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <!-- Cover area with text content -->
        <div class="h-40 bg-gradient-to-r from-brand-600 to-brand-700 relative">
          <!-- Name and basic info positioned on cover -->
          <div class="absolute inset-0 px-6 sm:px-8 pt-6 flex flex-col justify-start text-white">
            <div>
              <h1 class="text-3xl sm:text-4xl font-bold">{{ user?.name || 'Quizee' }}</h1>
              <p class="text-brand-100 mt-1">@{{ user?.username || 'user' }}</p>
            </div>
            <!-- Quick stats on cover -->
            <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-brand-100">
              <div v-if="profile?.institution" class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m-2.5 0H3m14 0v-6m0 0V9m0 6v6m-9-13h9" />
                </svg>
                <span class="flex items-center gap-1">
                  {{ profile?.institution }}
                  <svg v-if="user?.institution_verified" class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
              <div v-if="gradeLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001M12 6.253c5.5 0 10 4.745 10 10.748" />
                </svg>
                Grade {{ gradeLabel }}
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Info Below Cover -->
        <div class="px-6 sm:px-8 py-6">
          <!-- Avatar and action section -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:gap-6 mb-6">
            <!-- Avatar -->
            <div class="relative mb-4 sm:mb-0">
              <img
                :src="userAvatar"
                :alt="user?.name"
                class="w-32 h-32 rounded-2xl border-4 border-brand-50 bg-slate-100 object-cover shadow-lg"
              />
              <div v-if="user?.verified" class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-md">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Info and buttons -->
            <div class="flex-1">
              <!-- Contact and additional info -->
              <div class="space-y-2 mb-4">
                <p v-if="profile?.bio" class="text-slate-700 text-sm leading-relaxed">{{ profile?.bio }}</p>
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div v-if="user?.phone" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{{ user?.phone }}</span>
                  </div>
                  <div v-if="user?.email" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="truncate">{{ user?.email }}</span>
                  </div>
                  <div v-if="user?.created_at" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {{ formatDate(user?.created_at) }}
                  </div>
                </div>
              </div>

              <!-- Edit button -->
              <NuxtLink
                to="/quizee/settings"
                class="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats and Tabs -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-4 sm:space-y-6">
          <!-- Performance Stats Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Average Score</p>
                  <p class="text-2xl sm:text-3xl font-bold text-brand-600 mt-2">{{ avgScore }}%</p>
                </div>
                <div class="text-4xl text-brand-100">📊</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Quizzes Completed</p>
                  <p class="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{{ totalAttempts }}</p>
                </div>
                <div class="text-4xl text-emerald-100">✅</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Points Earned</p>
                  <p class="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{{ pointsDisplay }}</p>
                </div>
                <div class="text-4xl text-amber-100">⭐</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Current Streak</p>
                  <p class="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">{{ currentStreak }}</p>
                </div>
                <div class="text-4xl text-orange-100">🔥</div>
              </div>
            </div>
          </div>

          <!-- Activity/Recent Quizzes -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div v-if="attemptsLoading" class="text-center py-8 text-slate-500">
              Loading recent activity...
            </div>
            <div v-else-if="attempts.length === 0" class="text-center py-8 text-slate-500">
              <p>No quiz attempts yet. Start taking quizzes!</p>
              <NuxtLink to="/quizee/quizzes" class="text-brand-600 hover:underline mt-2 inline-block">
                Browse Quizzes →
              </NuxtLink>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(attempt, idx) in attempts.slice(0, 5)" :key="attempt.id" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition">
                <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
                  {{ attempt.score }}%
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 truncate">{{ attempt.quiz_title || 'Quiz #' + attempt.quiz_id }}</p>
                  <p class="text-sm text-slate-600">{{ formatActivityDate(attempt.created_at) }}</p>
                </div>
                <div v-if="attempt.points_earned" class="text-right flex-shrink-0">
                  <p class="font-semibold text-amber-600">+{{ attempt.points_earned }}</p>
                  <p class="text-xs text-slate-500">points</p>
                </div>
              </div>
              <NuxtLink to="/quizee/attempts" class="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium pt-2">
                View All Activity →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-4 sm:space-y-6">
          <!-- Info Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Learning Info</h3>
            <div class="space-y-4 text-sm">
              <div>
                <label class="block font-medium text-slate-700">Grade Level</label>
                <p class="text-slate-600 mt-1">{{ gradeLabel || '—' }}</p>
              </div>
              <div>
                <label class="block font-medium text-slate-700">Education Level</label>
                <p class="text-slate-600 mt-1">{{ levelLabel || '—' }}</p>
              </div>
              <div v-if="subjectLabels.length > 0">
                <label class="block font-medium text-slate-700 mb-2">Subjects</label>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="subject in subjectLabels"
                    :key="subject"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
                  >
                    {{ subject }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Badges/Achievements -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🏆</span> Achievements
            </h3>
            <div v-if="recentBadges.length === 0" class="text-sm text-slate-500 text-center py-4">
              No achievements yet
            </div>
            <div v-else class="space-y-2">
              <div v-for="badge in recentBadges.slice(0, 3)" :key="badge.id" class="text-xs">
                <p class="font-medium text-slate-900">{{ badge.title }}</p>
                <p class="text-slate-600">{{ badge.description }}</p>
              </div>
              <NuxtLink v-if="recentBadges.length > 3" to="/quizee/badges" class="text-xs text-brand-600 hover:text-brand-700 font-medium pt-2 block">
                View all achievements →
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Quick Links</h3>
            <div class="space-y-2">
              <NuxtLink to="/quizee/quizzes" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">
                <span>Browse Quizzes</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/quizee/badges" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">
                <span>Achievements</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/quizee/points" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">
                <span>Points & Rewards</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { resolveAssetUrl } from '~/composables/useAssets'

// Profile is user-specific; avoid indexing user profile edit pages
definePageMeta({ layout: 'quizee', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'View your Modeh profile and manage personal information, avatar, and bio.' } ] })

const auth = useAuthStore()
const api = useApi()

interface Attempt {
  id: string | number
  quiz_id: string | number
  quiz_title?: string
  created_at: string
  score: number
  points_earned: number
  [key: string]: any
}

const attempts = ref<Attempt[]>([])
const attemptsLoading = ref(false)
const recentBadges = ref<any[]>([])
const currentStreak = ref(0)
const avgScore = ref(0)
const totalAttempts = ref(0)

onMounted(async () => {
  attemptsLoading.value = true
  const res = await api.get('/api/quiz-attempts?per_page=10')
  if (api.handleAuthStatus(res)) return
  if (res.ok) {
    const data = await res.json()
    // Handle pagination structure
    if (data.data?.data) {
      attempts.value = data.data.data
    } else if (Array.isArray(data.data)) {
      attempts.value = data.data
    } else if (Array.isArray(data)) {
      attempts.value = data
    }
  }
  attemptsLoading.value = false

  // Fetch stats
  try {
    const statsRes = await api.get('/api/user/quiz-stats')
    if (statsRes.ok) {
      const statsData = await statsRes.json()
      totalAttempts.value = statsData.total_attempts || 0
      avgScore.value = Math.round(statsData.average_score || 0)
      currentStreak.value = statsData.current_streak || 0
    }
  } catch (e) {
    console.error('Failed to fetch quiz stats:', e)
  }

  // Fetch badges
  try {
    const badgesRes = await api.get('/api/user/badges?per_page=6')
    if (badgesRes.ok) {
      const badgesData = await badgesRes.json()
      if (badgesData.badges && Array.isArray(badgesData.badges)) {
        recentBadges.value = badgesData.badges
      } else if (Array.isArray(badgesData)) {
        recentBadges.value = badgesData
      }
    }
  } catch (e) {
    console.error('Failed to fetch badges:', e)
  }
})

interface User {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  avatar_url?: string
  points?: number
  rewards?: { points?: number }
  username?: string
  verified?: boolean
  created_at?: string
  quizeeProfile?: {
    first_name?: string
    last_name?: string
    institution?: string
    grade?: { id: number; name: string }
    grade_id?: number
    level?: { id: number; name: string }
    level_id?: number
    subjects?: Array<{ id: number; name: string }>
    bio?: string
  }
}

// Since auth.user is a ref from the Pinia store, unwrap it to get the raw user object
const user = computed<User>(() => {
  const u: any = (auth as any).user
  // If it's a ref with a .value property, unwrap it; otherwise use it directly
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})

// Prefer `avatar_url` then fallback to `avatar`; resolve via runtime apiBase
const userAvatar = computed(() => resolveAssetUrl(user.value?.avatar_url || user.value?.avatar) || '/logo/avatar-placeholder.png')
const pointsDisplay = computed(() => {
  const p = user.value?.points ?? user.value?.rewards?.points
  return typeof p === 'number' ? `${p}` : '0'
})

// Get profile based on user type
const profile = computed(() => user.value?.quizeeProfile || {})

// Get grade label from profile
const gradeLabel = computed(() => {
  return profile.value?.grade?.name || null
})

// Get level label from profile
const levelLabel = computed(() => {
  return profile.value?.level?.name || null
})

// Get subject labels from profile
const subjectLabels = computed(() => {
  if (!Array.isArray(profile.value?.subjects)) return []
  return profile.value.subjects
    .map((s: any) => s.name || s)
    .filter(Boolean)
})

// Helper functions
function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatActivityDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>