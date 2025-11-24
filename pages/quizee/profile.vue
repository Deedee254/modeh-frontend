<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
      <ProfileHeader
        :title="user?.name || 'Profile'"
        :subtitle="user?.email"
        :avatar-url="userAvatar"
      >
        <template #meta>
          <span v-if="pointsDisplay" class="inline-flex items-center gap-1 text-slate-700">
            <span class="inline-flex w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span class="font-medium">{{ pointsDisplay }}</span>
          </span>
        </template>
        <template #actions>
          <NuxtLink
            to="/quizee/settings"
            class="px-3 py-2 border rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer w-full sm:w-auto text-center"
          >
            Edit Profile
          </NuxtLink>
        </template>
      </ProfileHeader>

      <UiCard class="shadow-sm">
        <template #header>
          <div class="text-sm font-semibold">Profile details</div>
        </template>
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-500">Name</label>
              <p class="mt-1 text-lg text-slate-900">{{ user?.name || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-500">Email</label>
              <p class="mt-1 text-lg text-slate-900">{{ user?.email || '—' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-500">Institution</label>
              <p class="mt-1 text-lg text-slate-900">{{ profile?.institution || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-500">Phone</label>
              <p class="mt-1 text-lg text-slate-900">{{ user?.phone || '—' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-500">Grade</label>
              <p class="mt-1 text-lg text-slate-900">{{ gradeLabel || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-500">Level</label>
              <p class="mt-1 text-lg text-slate-900">{{ levelLabel || '—' }}</p>
            </div>
          </div>

          <!-- Subjects -->
          <div>
            <label class="block text-sm font-medium text-slate-500">Subjects</label>
            <div v-if="subjectLabels.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="subject in subjectLabels"
                :key="subject"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {{ subject }}
              </span>
            </div>
            <p v-else class="mt-1 text-lg text-slate-500">—</p>
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-slate-500">Bio</label>
            <p class="mt-1 text-base text-slate-900 whitespace-pre-line">{{ profile?.bio || '—' }}</p>
          </div>
        </div>
      </UiCard>

      <!-- Quiz Attempts -->
      <UiCard class="shadow-sm">
        <template #header>
          <div class="text-sm font-semibold">Quiz Attempts</div>
        </template>
        <div v-if="attemptsLoading" class="text-center py-4">Loading attempts...</div>
        <div v-else-if="attempts.length === 0" class="text-center py-4 text-slate-500">No attempts yet</div>
        <div v-else class="space-y-4">
          <div v-for="attempt in attempts" :key="attempt.id" class="border rounded p-4">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">Quiz #{{ attempt.quiz_id }}</div>
                <div class="text-sm text-slate-500">{{ attempt.created_at }}</div>
              </div>
              <div class="text-right">
                <div class="font-semibold">{{ attempt.score }}%</div>
                <div class="text-sm text-slate-500">{{ attempt.points_earned }} points</div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import UiCard from '~/components/ui/UiCard.vue'

// Profile is user-specific; avoid indexing user profile edit pages
definePageMeta({ layout: 'quizee', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'View your Modeh profile and manage personal information, avatar, and bio.' } ] })

const auth = useAuthStore()
const api = useApi()

interface Attempt {
  id: string | number
  quiz_id: string | number
  created_at: string
  score: number
  points_earned: number
  [key: string]: any
}

const attempts = ref<Attempt[]>([])
const attemptsLoading = ref(false)

onMounted(async () => {
  attemptsLoading.value = true
  const res = await api.get('/api/quiz-attempts')
  if (api.handleAuthStatus(res)) return
  if (res.ok) {
    const data = await res.json()
    attempts.value = data.data?.data || []
  }
  attemptsLoading.value = false
})

interface User {
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
  points?: number
  rewards?: { points?: number }
  quizeeProfile?: {
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

const userAvatar = computed(() => resolveAssetUrl(user.value?.avatar_url) || '/logo/avatar-placeholder.png')
const pointsDisplay = computed(() => {
  const p = user.value?.points ?? user.value?.rewards?.points
  return typeof p === 'number' ? `${p} points` : ''
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
</script>