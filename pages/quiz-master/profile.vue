<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
      <!-- Profile Header Hero -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <!-- Cover area -->
        <div class="h-40 bg-gradient-to-r from-brand-600 to-brand-700 relative"></div>

        <!-- Profile Info Below Cover (Facebook Style) -->
        <div class="px-6 sm:px-8 py-6">
          <!-- Avatar on left, Info on right -->
          <div class="flex flex-col sm:flex-row gap-6 items-start">
            <!-- Circular Avatar -->
            <div class="flex-shrink-0">
              <div class="relative">
                <img
                  :src="userAvatar"
                  :alt="user?.name"
                  class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-brand-50 bg-slate-100 object-cover shadow-lg"
                />
                <div v-if="user?.verified" class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-md">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Profile Info on Right -->
            <div class="flex-1">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ user?.name || 'Quiz Master' }}</h1>
                <p class="text-sm text-slate-600 mt-1">@{{ userUsername }}</p>
              </div>

              <!-- Quick Info -->
              <div class="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-600 mb-4">
                <div v-if="(user as any)?.institution" class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m-2.5 0H3m14 0v-6m0 0V9m0 6v6m-9-13h9" />
                  </svg>
                  <span class="flex items-center gap-1">
                    {{ instName }}
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

              <!-- Bio -->
              <p v-if="(user as any)?.bio" class="text-slate-700 text-sm leading-relaxed mb-4">{{ (user as any)?.bio }}</p>

              <!-- Edit button -->
              <NuxtLink
                to="/quiz-master/settings"
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
                  <p class="text-sm font-medium text-slate-600">Quizzes Created</p>
                  <p class="text-2xl sm:text-3xl font-bold text-brand-600 mt-2">{{ quizzesCreated }}</p>
                </div>
                <div class="text-4xl text-brand-100">📝</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Questions Created</p>
                  <p class="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{{ questionsCreated }}</p>
                </div>
                <div class="text-4xl text-emerald-100">✍️</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Total Earnings</p>
                  <p class="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">${{ walletDisplay }}</p>
                </div>
                <div class="text-4xl text-amber-100">💰</div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Students Reached</p>
                  <p class="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">{{ studentsReached }}</p>
                </div>
                <div class="text-4xl text-orange-100">👥</div>
              </div>
            </div>
          </div>

          <!-- Recent Quizzes -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div v-if="recentQuizzesLoading" class="text-center py-8 text-slate-500">
              Loading recent quizzes...
            </div>
            <div v-else-if="recentQuizzes.length === 0" class="text-center py-8 text-slate-500">
              <p>No quizzes created yet. Start creating quizzes!</p>
              <NuxtLink to="/quiz-master/quizzes/create" class="text-brand-600 hover:underline mt-2 inline-block">
                Create a Quiz →
              </NuxtLink>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(quiz, idx) in recentQuizzes.slice(0, 5)" :key="quiz.id" class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition">
                <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 truncate">{{ quiz.title || 'Quiz #' + quiz.id }}</p>
                  <p class="text-sm text-slate-600">{{ formatActivityDate(quiz.created_at) }} • {{ quiz.questions_count || 0 }} questions</p>
                </div>
                <div v-if="quiz.times_taken" class="text-right flex-shrink-0">
                  <p class="font-semibold text-blue-600">{{ quiz.times_taken }}</p>
                  <p class="text-xs text-slate-500">attempts</p>
                </div>
              </div>
              <NuxtLink to="/quiz-master/quizzes" class="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium pt-2">
                View All Quizzes →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-4 sm:space-y-6">
          <!-- Personal Info Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Personal Info</h3>
            <div class="space-y-3 text-sm">
              <div v-if="(user as any)?.first_name">
                <label class="block font-medium text-slate-700">First Name</label>
                <p class="text-slate-600 mt-1">{{ (user as any)?.first_name }}</p>
              </div>
              <div v-if="(user as any)?.last_name">
                <label class="block font-medium text-slate-700">Last Name</label>
                <p class="text-slate-600 mt-1">{{ (user as any)?.last_name }}</p>
              </div>
              <div v-if="(user as any)?.first_name || (user as any)?.last_name" class="pt-2 border-t border-slate-200">
                <NuxtLink
                  to="/quiz-master/settings"
                  class="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Edit personal info →
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Teaching Info</h3>
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

          <!-- Quick Links -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Quick Links</h3>
            <div class="space-y-2">
              <NuxtLink to="/quiz-master/quizzes" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">Browse Quizzes <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></NuxtLink>
              <NuxtLink to="/quiz-master/wallet" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">Wallet <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></NuxtLink>
              <NuxtLink to="/quiz-master/topics" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700 hover:text-brand-600">Manage Topics <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></NuxtLink>
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
import { resolveAvatar } from '~/composables/useAssets'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

// Profile is user-specific; avoid indexing user profile edit pages
definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'View your Modeh profile and manage personal information, avatar, and bio.' } ] })

const auth = useAuthStore()
const api = useApi()
const taxonomy = useTaxonomyStore()

interface Quiz {
  id: string | number
  title?: string
  created_at: string
  questions_count?: number
  times_taken?: number
  [key: string]: any
}

const recentQuizzes = ref<Quiz[]>([])
const recentQuizzesLoading = ref(false)
const quizzesCreated = ref(0)
const questionsCreated = ref(0)
const studentsReached = ref(0)

onMounted(async () => {
  recentQuizzesLoading.value = true
  
  // Parallelize all initial data fetching
  await Promise.all([
    // Fetch recent quizzes
    api.get('/api/quiz-master/quizzes?per_page=10').then(async (res) => {
      if (await api.handleAuthStatus(res)) return
      if (res.ok) {
        const data = await res.json()
        if (data.data?.data) {
          recentQuizzes.value = data.data.data
        } else if (Array.isArray(data.data)) {
          recentQuizzes.value = data.data
        } else if (Array.isArray(data)) {
          recentQuizzes.value = data
        }
      }
    }).finally(() => {
      recentQuizzesLoading.value = false
    }),

    // Fetch stats
    api.get('/api/quiz-master/stats').then(async (statsRes) => {
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        quizzesCreated.value = statsData.quizzes_created || 0
        questionsCreated.value = statsData.questions_created || 0
        studentsReached.value = statsData.students_reached || 0
      }
    }).catch(e => console.error('Failed to fetch stats:', e))
  ])
})

interface User {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  avatar_url?: string
  avatarUrl?: string
  verified?: boolean
  institution_verified?: boolean
  created_at?: string
  username?: string
  profile?: {
    first_name?: string
    last_name?: string
    institution?: string | { name?: string; slug?: string }
    grade?: { id: number; name: string }
    grade_id?: number
    level?: { id: number; name: string }
    level_id?: number
    subjects?: Array<any>
    subjectModels?: Array<{ id: number; name: string }>
    bio?: string
  }
}

// Since auth.user is a ref from the Pinia store, unwrap it to get the raw user object
const user = computed<User>(() => {
  const rawUser: any = (auth as any).user
  const unwrapped = (rawUser && typeof rawUser === 'object' && 'value' in rawUser) ? rawUser.value : rawUser
  return (unwrapped || {}) as User
})

// Derive username from name if not present (username field is not in users table)
const userUsername = computed(() => {
  const u = user.value
  if (u?.username) return u.username
  if (u?.name && typeof u.name === 'string') {
    const parts = u.name.split(' ')
    return parts[0]?.toLowerCase() || 'user'
  }
  return 'user'
})

// Prefer the canonical `userAvatar` from the auth store and resolve via `resolveAvatar`.
const userAvatar = computed(() => resolveAvatar((auth as any).userAvatar, user.value?.name))

const walletDisplay = computed(() => {
  const w = (user.value as any)?.wallet ?? (user.value as any)?.profile?.wallet
  return typeof w === 'number' ? `${w.toFixed(2)}` : '0.00'
})

// Use the backend-provided user data directly.
const profile = computed(() => user.value || {})

// Get grade label from profile
const gradeLabel = computed(() => {
  return (user.value as any)?.grade?.name || null
})

// Get level label from profile
const levelLabel = computed(() => {
  return (user.value as any)?.level?.name || null
})

// Get subject labels from profile — prefer subjectModels (full objects), fallback to subjects
const subjectLabels = computed(() => {
  const subjectArray = Array.isArray((user.value as any)?.subjectModels)
    ? (user.value as any).subjectModels
    : Array.isArray((user.value as any)?.subjects)
      ? (user.value as any).subjects
      : []
  return subjectArray
    .map((s: any) => (s && typeof s === 'object' ? s.name : s))
    .filter(Boolean)
})

// Institution name helper: sometimes `institution` is an object, sometimes a string.
const instName = computed(() => {
  const inst = (user.value as any)?.institution
  if (!inst) return ''
  if (typeof inst === 'string') return inst
  if (typeof inst === 'object' && inst.name) return inst.name
  if (typeof inst === 'object' && inst.slug) return inst.slug
  // Unknown format - don't show anything
  return ''
})

// Helper functions
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
