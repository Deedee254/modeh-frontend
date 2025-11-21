<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <ProfileHeader
          :title="user?.name || 'Profile'"
          :subtitle="user?.email"
          :avatar-url="userAvatar"
          cover-url="/placeholder/cover.jpg"
        >
          <template #actions>
            <NuxtLink
              to="/quiz-master/settings"
              class="px-3 py-2 border rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer inline-block"
            >
              Edit Profile
            </NuxtLink>
          </template>
          <template #meta>
            <span v-if="user?.wallet" class="inline-flex items-center gap-1">
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 6h18v12H3V6zm1 12h16v-2H4v2zm0-4h16V8H4v6z"/></svg>
              <span class="font-medium">${{ user?.wallet }}</span>
            </span>
          </template>
        </ProfileHeader>

        <!-- Profile Display Card -->
        <div class="rounded-xl border bg-white shadow-sm p-6">
          <div class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-500">Display Name</label>
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
              <label class="block text-sm font-medium text-slate-500">Teaching Subjects</label>
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

            <!-- Quiz Master Specific -->
            <div>
              <label class="block text-sm font-medium text-slate-500">Headline</label>
              <p class="mt-1 text-lg text-slate-900">{{ profile?.headline || '—' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-500">Bio</label>
              <p class="mt-1 text-base text-slate-900 whitespace-pre-line">{{ profile?.bio || '—' }}</p>
            </div>

            <!-- Action Button -->
            <div class="flex justify-end pt-4 border-t">
              <NuxtLink
                to="/quiz-master/settings"
                class="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Profile
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'

definePageMeta({ layout: 'quiz-master' })

const auth = useAuthStore()
const { isQuizMaster } = useUserRole()

interface User {
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
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

const user = computed<User>(() => auth.user || {})
const userAvatar = computed(() => resolveAssetUrl(user.value.avatar_url) || '/logo/avatar-placeholder.png')

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

// Get subject labels from profile
const subjectLabels = computed(() => {
  if (!profile.value || !Array.isArray(profile.value.subjects)) return []
  return profile.value.subjects
    .map((s: any) => s.name || s)
    .filter(Boolean)
})
</script>
