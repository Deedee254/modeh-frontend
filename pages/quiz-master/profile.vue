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
              <h1 class="text-3xl sm:text-4xl font-bold">{{ user?.name || 'Quiz-master' }}</h1>
              <p class="text-brand-100 mt-1">{{ user?.email }}</p>
            </div>
            <!-- Quick meta on cover -->
            <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-brand-100">
              <div v-if="institutionLabel" class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m-2.5 0H3m14 0v-6m0 0V9m0 6v6m-9-13h9" />
                </svg>
                <span class="flex items-center gap-1">{{ institutionLabel }}</span>
              </div>
              <div v-if="gradeLabel" class="flex items-center gap-1">Grade {{ gradeLabel }}</div>
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
            </div>

            <!-- Info and buttons -->
            <div class="flex-1">
              <div class="space-y-2 mb-4">
                <p v-if="profile?.bio" class="text-slate-700 text-sm leading-relaxed">{{ profile?.bio }}</p>
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div v-if="user?.phone" class="flex items-center gap-2">{{ user?.phone }}</div>
                  <div v-if="user?.created_at" class="flex items-center gap-2">Joined {{ formatDate(user?.created_at) }}</div>
                </div>
              </div>

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

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-4 sm:space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">About</h2>
            <div class="space-y-4 text-sm">
              <div>
                <label class="block font-medium text-slate-700">Headline</label>
                <p class="text-slate-600 mt-1">{{ profile?.headline || '—' }}</p>
              </div>
              <div>
                <label class="block font-medium text-slate-700">Bio</label>
                <p class="text-slate-600 mt-1 whitespace-pre-line">{{ profile?.bio || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-4 sm:space-y-6">
            <!-- Personal Info card intentionally removed for quiz-masters (was empty) -->

          <!-- Learning Info -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Teaching Info</h3>
            <div class="space-y-4 text-sm">
              <div>
                <label class="block font-medium text-slate-700">Grade Level</label>
                <p class="text-slate-600 mt-1">{{ gradeLabel || '—' }}</p>
              </div>
              <div>
                <label class="block font-medium text-slate-700">Level</label>
                <p class="text-slate-600 mt-1">{{ levelLabel || '—' }}</p>
              </div>
              <div v-if="subjectLabels.length > 0">
                <label class="block font-medium text-slate-700 mb-2">Subjects</label>
                <div class="flex flex-wrap gap-1">
                  <span v-for="subject in subjectLabels" :key="subject" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">{{ subject }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements card removed as requested -->

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
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

definePageMeta({ layout: 'quiz-master' })

useHead({
  title: 'My Profile'
})

const auth = useAuthStore()
const { isQuizMaster } = useUserRole()

interface User {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  avatar_url?: string
  avatarUrl?: string
  created_at?: string | Date
  wallet?: number
  quizMasterProfile?: {
    institution?: string
    grade?: { id: number; name: string }
    grade_id?: number
    level?: { id: number; name: string }
    level_id?: number
    subjects?: Array<{ id: number; name: string }>
    headline?: string
    bio?: string
  }
}

// Since auth.user is a ref from the Pinia store, unwrap it to get the raw user object
const user = computed<User>(() => {
  const u: any = (auth as any).user
  // If it's a ref with a .value property, unwrap it; otherwise use it directly
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})
// Prefer the canonical `userAvatar` from the auth store and resolve via `resolveAssetUrl`.
const userAvatar = computed(() => resolveAssetUrl((auth as any).userAvatar) || '/logo/avatar-placeholder.png')

// Get profile based on role
const profile = computed(() => {
  return isQuizMaster.value ? user.value.quizMasterProfile : null
})

// Get grade label from profile
const gradeLabel = computed(() => {
  if (!profile.value) return null
  return profile.value.grade?.name || null
})

// Get level label from profile
const levelLabel = computed(() => {
  if (!profile.value) return null
  return profile.value.level?.name || null
})

// Get institution label from profile (handle both string and object formats)
const institutionLabel = computed(() => {
  if (!profile.value || !profile.value.institution) return null
  const inst = profile.value.institution as any
  if (typeof inst === 'string') return inst
  if (typeof inst === 'object' && inst?.name) return inst.name
  return null
})

// Get subject labels from profile
const taxonomy = useTaxonomyStore()

// Ensure taxonomy subjects are available when profile subjects are primitive ids
onMounted(() => {
  try {
    if (profile.value && Array.isArray(profile.value.subjects)) {
      const hasPrimitive = profile.value.subjects.some((s: any) => typeof s !== 'object')
      if (hasPrimitive && (!taxonomy.subjects || taxonomy.subjects.length === 0)) {
        // fire-and-forget; fetch to populate name lookups
        taxonomy.fetchAllSubjects().catch(() => {})
      }
    }
  } catch (e) {
    // ignore
  }
})

const subjectLabels = computed(() => {
  if (!profile.value || !Array.isArray(profile.value.subjects)) return []
  return profile.value.subjects
    .map((s: any) => {
      if (!s) return null
      // if subject is already an object, prefer its name
      if (typeof s === 'object') return s.name || s.title || String(s.id || '')
      // otherwise treat as id/value and try to lookup in taxonomy
      const id = String(s)
      const found = (taxonomy.subjects || []).find((ts: any) => String(ts.id) === id || String(ts.value) === id)
      return found ? found.name : id
    })
    .filter(Boolean)
})
</script>
