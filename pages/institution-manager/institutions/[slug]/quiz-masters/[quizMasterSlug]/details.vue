<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { resolveAssetUrl } from '~/composables/useAssets'

definePageMeta({ layout: 'institution' as any })

const route = useRoute()
const api = useApi()
const auth = useAuthStore()

const institutionSlug = computed(() => route.params.slug)
const quizMasterId = computed(() => {
  // The slug is now just the name in lowercase format, we need to fetch from the members list to find the ID
  // We'll use the slug to search through members
  const slug = route.params.quizMasterSlug as string
  // Return the slug itself, we'll find the ID by matching members
  return slug
})

// State
const loading = ref(false)
const error = ref<string | null>(null)
const quizMaster = ref<any>(null)
const stats = ref<any>(null)
const recentQuizzes = ref<any[]>([])
const followers = ref<any[]>([])
const isFollowing = ref(false)

// Fetch quiz master profile
async function fetchQuizMasterProfile() {
  if (!quizMasterId.value || !institutionSlug.value) return
  
  loading.value = true
  error.value = null
  try {
    // First, fetch all quiz-masters from the institution to find ID by name slug
    const membersRes = await api.get(`/api/institutions/${institutionSlug.value}/members?role=quiz-master&per_page=100`)
    if (api.handleAuthStatus(membersRes)) return
    
    const membersData = await api.parseResponse(membersRes)
    const members = membersData?.members || membersData?.data || []
    
    // Find the member by matching the slug with their name
    const nameSlug = quizMasterId.value.toLowerCase()
    const member = members.find((m: any) => {
      const memberSlug = m.name ? m.name.toLowerCase().replace(/\s+/g, '-') : ''
      return memberSlug === nameSlug
    })
    
    if (!member) {
      error.value = 'Quiz master not found in institution'
      return
    }
    
    // Now fetch the public quiz master profile using their ID
    const res = await api.get(`/api/quiz-masters/${member.id}`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    quizMaster.value = data?.data || data
    
    if (quizMaster.value) {
      isFollowing.value = quizMaster.value.is_following || false
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load quiz master profile'
    console.error('Error fetching quiz master profile:', e)
  } finally {
    loading.value = false
  }
}

// Fetch quiz master analytics/stats
async function fetchQuizMasterStats() {
  if (!quizMasterId.value) return
  
  try {
    // Fetch user details for analytics
    const res = await api.get(`/api/users/${quizMasterId.value}`)
    if (api.handleAuthStatus(res)) return
    
    const userData = await api.parseResponse(res)
    
    if (userData?.quiz_master_profile) {
      stats.value = {
        bio: userData.quiz_master_profile?.bio,
        headline: userData.quiz_master_profile?.headline,
        verified: userData.is_verified || false,
        createdAt: userData.created_at,
        grade: userData.quiz_master_profile?.grade,
        level: userData.quiz_master_profile?.level,
        subjects: userData.quiz_master_profile?.subject_models || []
      }
    }
  } catch (e: any) {
    console.warn('Could not fetch detailed stats:', e)
  }
}

// Formatted display values
const displayName = computed(() => quizMaster.value?.name || 'Quiz Master')
const displayAvatar = computed(() => resolveAssetUrl(quizMaster.value?.avatar) || '/logo/avatar-placeholder.png')
const displayHeadline = computed(() => quizMaster.value?.headline || stats.value?.headline || 'An experienced quiz master')
const displayInstitution = computed(() => quizMaster.value?.institution || 'Independent Educator')
const displayGrade = computed(() => quizMaster.value?.grade?.name || stats.value?.grade?.name || '—')
const displaySubjects = computed(() => {
  const subjects = quizMaster.value?.subjects || stats.value?.subjects || []
  return Array.isArray(subjects) ? subjects : []
})

const quizzesSummary = computed(() => {
  const quizzes = quizMaster.value?.quizzes || []
  return {
    total: quizzes.length,
    byTopic: quizzes.reduce((acc: any, q: any) => {
      const topic = q.topic_name || 'Uncategorized'
      acc[topic] = (acc[topic] || 0) + 1
      return acc
    }, {})
  }
})

// Actions
async function toggleFollow() {
  if (!quizMasterId.value) return
  
  try {
    const action = isFollowing.value ? 'unfollow' : 'follow'
    const res = await api.postJson(`/api/quiz-masters/${quizMasterId.value}/${action}`, {})
    if (api.handleAuthStatus(res)) return
    
    isFollowing.value = !isFollowing.value
  } catch (e: any) {
    error.value = e?.message || `Failed to ${isFollowing.value ? 'unfollow' : 'follow'}`
  }
}

// Load data on mount
onMounted(async () => {
  if (quizMasterId.value) {
    await Promise.all([
      fetchQuizMasterProfile(),
      fetchQuizMasterStats()
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
        <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quiz-masters`" class="mt-4 inline-block text-sm text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to quiz masters
        </NuxtLink>
      </div>

      <!-- Profile Content -->
      <div v-else-if="quizMaster" class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900"></div>
          <div class="px-6 pb-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
              <!-- Avatar -->
              <div v-if="displayAvatar" class="w-32 h-32 rounded-xl border-4 border-white dark:border-slate-800 overflow-hidden shadow-lg">
                <img :src="displayAvatar" :alt="displayName" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-32 h-32 rounded-xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
                <span class="text-4xl font-black text-white">{{ displayName.charAt(0).toUpperCase() }}</span>
              </div>

              <!-- Info & Actions -->
              <div class="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full sm:w-auto">
                <div>
                  <h1 class="text-3xl font-black text-gray-900 dark:text-white">{{ displayName }}</h1>
                  <p class="text-base text-gray-600 dark:text-gray-400 mt-1">{{ displayHeadline }}</p>
                  <div class="flex items-center gap-2 mt-3">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                      Quiz Master
                    </span>
                    <span v-if="stats?.verified" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>
                      Verified
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-2">
                  <button v-if="auth.user" @click="toggleFollow" :class="[
                    'px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2',
                    isFollowing
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  ]">
                    <svg v-if="!isFollowing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>
                    {{ isFollowing ? 'Following' : 'Follow' }}
                  </button>
                  <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quiz-masters`" class="px-6 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 text-center">
                    ← Back
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Institution</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displayInstitution }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Grade</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displayGrade }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Subjects</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ displaySubjects.length || 0 }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quizzes</div>
                <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ quizzesSummary.total }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
          <div v-if="stats?.bio || quizMaster.bio">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ stats?.bio || quizMaster.bio }}</p>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            📝 No bio added yet
          </div>
        </div>

        <!-- Subjects Section -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specializations</h2>
          <div v-if="displaySubjects.length > 0" class="flex flex-wrap gap-2">
            <span v-for="subject in displaySubjects" :key="subject.id" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 border border-brand-200 dark:border-brand-800">
              <span class="w-2 h-2 rounded-full bg-brand-600"></span>
              <span class="font-medium text-brand-900 dark:text-brand-200">{{ subject.name }}</span>
            </span>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            🎓 No specializations added yet
          </div>
        </div>

        <!-- Quizzes Analytics -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Statistics</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Total Quizzes -->
            <div class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Quizzes</p>
                  <p class="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{{ quizzesSummary.total }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg bg-blue-200 dark:bg-blue-900/40 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
              </div>
            </div>

            <!-- Topics Coverage -->
            <div class="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Topics Covered</p>
                  <p class="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{{ Object.keys(quizzesSummary.byTopic).length }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg bg-purple-200 dark:bg-purple-900/40 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                </div>
              </div>
            </div>

            <!-- Join Date -->
            <div class="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Member Since</p>
                  <p class="text-sm font-medium text-emerald-900 dark:text-emerald-200 mt-1">
                    {{ stats?.createdAt ? new Date(stats.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—' }}
                  </p>
                </div>
                <div class="w-12 h-12 rounded-lg bg-emerald-200 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Topics Breakdown -->
          <div v-if="Object.keys(quizzesSummary.byTopic).length > 0" class="border-t dark:border-slate-700 pt-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Quizzes by Topic</h3>
            <div class="space-y-2">
              <div v-for="(count, topic) in quizzesSummary.byTopic" :key="topic" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <span class="font-medium text-gray-900 dark:text-white">{{ topic }}</span>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 font-semibold text-brand-600 dark:text-brand-400">{{ count }}</span>
              </div>
            </div>
          </div>
          <div v-else class="border-t dark:border-slate-700 pt-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              📚 No topics covered yet
            </p>
          </div>
        </div>

        <!-- Recent Quizzes List -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Quizzes</h2>
          <div v-if="quizMaster.quizzes && quizMaster.quizzes.length > 0" class="space-y-3">
            <div v-for="(quiz, idx) in quizMaster.quizzes.slice(0, 5)" :key="quiz.id || idx" class="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ quiz.title }}</h3>
                  <p v-if="quiz.topic_name" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      {{ quiz.topic_name }}
                    </span>
                  </p>
                </div>
                <div class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {{ quiz.id }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            📝 No quizzes created yet
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold">Quiz master not found</p>
        <NuxtLink :to="`/institution-manager/institutions/${institutionSlug}/quiz-masters`" class="mt-4 inline-block text-sm text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to quiz masters
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
