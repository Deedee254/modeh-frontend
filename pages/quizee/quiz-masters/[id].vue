<template>
  <div class="bg-gray-50 min-h-screen">
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
      Loading quiz-master profile...
    </div>
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-500">
      Failed to load profile. The quiz-master may not exist or there was a server error.
    </div>
    <div v-else-if="quizMaster" class="pb-12">
      <!-- Hero Header Section -->
      <div class="relative h-40 bg-gradient-to-r from-brand-600 to-brand-700 overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,...');"></div>
        <div class="absolute top-4 left-4 sm:top-6 sm:left-6">
          <NuxtLink to="/quizee/quiz-masters" class="text-white hover:text-brand-100 text-sm font-medium flex items-center gap-1 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </NuxtLink>
        </div>
        <div class="h-full flex flex-col justify-end p-4 sm:p-6">
          <h1 class="text-3xl sm:text-4xl font-bold text-white">{{ quizMaster.name }}</h1>
          <p class="text-brand-100 mt-1">{{ quizMaster.headline || 'Experienced Quiz Master' }}</p>
        </div>
      </div>

      <!-- Profile Info & Actions -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 relative z-10 mb-6">
          <!-- Avatar -->
          <div class="flex items-end gap-4">
            <div class="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg bg-white flex-shrink-0">
              <img v-if="resolvedAvatar" :src="resolvedAvatar" :alt="quizMaster.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-brand-600/10 text-brand-600 grid place-items-center font-bold text-5xl">
                {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="pb-2">
              <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="flex flex-wrap gap-2 mb-2">
                <span v-for="subject in quizMaster.subjects.slice(0, 3)" :key="subject.id" class="bg-brand-600/10 text-brand-600 text-xs font-medium px-2 py-1 rounded-full">
                  {{ subject.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 sm:flex-col sm:items-end">
            <button @click="openChatModal" class="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition">
              Message
            </button>
            <button @click="followHandler" :disabled="loadingFollow" class="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium transition" :class="following ? 'bg-brand-50 text-brand-600 border-brand-200' : 'text-slate-700 hover:bg-slate-50'">
              <span v-if="following">Following</span>
              <span v-else>Follow</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Quizzes Created -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 mb-1">Quizzes Created</p>
                <p class="text-2xl sm:text-3xl font-bold text-slate-900">{{ quizzesCount }}</p>
              </div>
              <div class="text-3xl">📝</div>
            </div>
          </div>

          <!-- Followers -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 mb-1">Followers</p>
                <p class="text-2xl sm:text-3xl font-bold text-slate-900">{{ followersCount }}</p>
              </div>
              <div class="text-3xl">👥</div>
            </div>
          </div>

          <!-- Average Rating -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 mb-1">Avg Rating</p>
                <p class="text-2xl sm:text-3xl font-bold text-slate-900">{{ averageRating }}</p>
              </div>
              <div class="text-3xl">⭐</div>
            </div>
          </div>

          <!-- Member Since -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 mb-1">Member Since</p>
                <p class="text-sm sm:text-lg font-bold text-slate-900">{{ memberSince }}</p>
              </div>
              <div class="text-3xl">📅</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Main Content (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- About Section -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 class="text-lg font-bold text-slate-900 mb-4">About</h2>
              <div v-if="quizMaster.bio" class="text-sm text-slate-700 leading-relaxed" v-html="quizMaster.bio"></div>
              <p v-else class="text-sm text-slate-500">
                This quiz master has not yet provided a bio.
              </p>
            </div>

            <!-- Recent Quizzes -->
            <div v-if="quizMaster.quizzes && quizMaster.quizzes.length" class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-slate-900">Recent Quizzes</h2>
                <NuxtLink v-if="quizMaster.quizzes.length > 6" :to="`/quizee/quizzes?created_by=${quizMasterId}`" class="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  View All →
                </NuxtLink>
              </div>
              <div class="space-y-3">
                <div v-for="quiz in quizMaster.quizzes.slice(0, 6)" :key="quiz.id" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition border border-slate-100">
                  <div class="flex-1">
                    <NuxtLink :to="`/quizee/quizzes/${quiz.id}`" class="text-sm font-medium text-slate-900 hover:text-brand-600">
                      {{ quiz.title }}
                    </NuxtLink>
                    <p class="text-xs text-slate-500 mt-1">{{ quiz.topic_name || 'General' }}</p>
                  </div>
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/3) -->
          <aside class="space-y-6">
            <!-- Expertise Section -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 class="text-sm font-bold text-slate-900 mb-4">📚 Expertise</h3>
              <div v-if="quizMaster.subjects && quizMaster.subjects.length" class="space-y-2">
                <div v-for="subject in quizMaster.subjects" :key="subject.id" class="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 font-medium">
                  {{ subject.name }}
                </div>
              </div>
              <p v-else class="text-xs text-slate-500">
                Subjects not yet specified
              </p>
            </div>

            <!-- Contact Info -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 class="text-sm font-bold text-slate-900 mb-4">ℹ️ Info</h3>
              <div class="space-y-3">
                <div v-if="quizMaster.email" class="flex items-start gap-2">
                  <span class="text-xs text-slate-600 mt-0.5">📧</span>
                  <div class="text-xs">
                    <p class="text-slate-600">Email</p>
                    <p class="text-slate-900 font-medium break-all">{{ quizMaster.email }}</p>
                  </div>
                </div>
                <div v-if="quizMaster.phone" class="flex items-start gap-2">
                  <span class="text-xs text-slate-600 mt-0.5">📱</span>
                  <div class="text-xs">
                    <p class="text-slate-600">Phone</p>
                    <p class="text-slate-900 font-medium">{{ quizMaster.phone }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-xs text-slate-600 mt-0.5">📅</span>
                  <div class="text-xs">
                    <p class="text-slate-600">Joined</p>
                    <p class="text-slate-900 font-medium">{{ joinedDate }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 class="text-sm font-bold text-slate-900 mb-4">📊 Stats</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-600">Total Quiz Takers</span>
                  <span class="text-sm font-bold text-slate-900">{{ totalQuizTakers }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-600">Avg Questions</span>
                  <span class="text-sm font-bold text-slate-900">{{ avgQuestions }}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatModal
      :is-open="chatModalOpen"
      :recipient-id="quizMasterId"
      :recipient-name="quizMaster?.name || 'User'"
      :recipient-avatar="resolvedAvatar"
      :recipient-greeting="`Hi there! Feel free to send me a message about quizzes or anything else.`"
      @close="chatModalOpen = false"
      @message-sent="onMessageSent"
    />
  </div>
</template>

<script setup>
import ChatModal from '~/components/ChatModal.vue'

definePageMeta({ layout: 'quizee' })



const route = useRoute()
const config = useRuntimeConfig()
const quizMasterId = route.params.id

import { resolveAssetUrl } from '~/composables/useAssets'
import { computed as _computed } from 'vue'

const { data: quizMasterData, pending, error } = await useAsyncData(
  `quiz-master-${quizMasterId}`,
  () => $fetch(config.public.apiBase + `/api/quiz-masters/${quizMasterId}`)
)

const quizMaster = computed(() => {
    if (!quizMasterData.value) return null
    // API might return quiz-master object nested under a 'data' key
    return quizMasterData.value.data || quizMasterData.value
})

const resolvedAvatar = _computed(() => {
  const qm = quizMaster.value
  if (!qm) return null
  const v = qm.avatar_url || qm.avatar || qm.image || qm.photo || qm.profile_image
  return resolveAssetUrl(v) || (v || null)
})

// Update head/meta reactively once quizMaster resolves
watchEffect(() => {
  try {
    useHead({
      title: quizMaster?.value?.name ? `${quizMaster.value.name} — Quiz Master | Modeh` : 'Quiz Master — Modeh',
      meta: [
        { name: 'description', content: (quizMaster?.value?.headline || quizMaster?.value?.bio || `Profile of ${quizMaster?.value?.name || 'Quiz Master'} on Modeh`) },
        { property: 'og:title', content: quizMaster?.value?.name ? `${quizMaster.value.name} — Quiz Master | Modeh` : 'Quiz Master — Modeh' },
        { property: 'og:description', content: (quizMaster?.value?.headline || quizMaster?.value?.bio || `Profile of ${quizMaster?.value?.name || 'Quiz Master'} on Modeh`) },
        { property: 'og:image', content: quizMaster?.value?.avatar_url || quizMaster?.value?.avatar || '/social-share.png' }
      ]
    })
  } catch (e) {
    // ignore head update errors
  }
})

import { ref, computed, watchEffect } from 'vue'
import { useHead } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const auth = useAuthStore()
const router = useRouter()
const following = ref(false)
const loadingFollow = ref(false)
const chatModalOpen = ref(false)
const api = useApi()
const alert = useAppAlert()

// Initialize following state from API response when data loads
watchEffect(() => {
  if (quizMasterData.value) {
    const qm = quizMasterData.value.data || quizMasterData.value
    following.value = !!(qm?.is_following || qm?.isFollowing || qm?.is_following_by_current_user)
  }
})

// Computed properties for stats and info
const quizzesCount = _computed(() => {
  return quizMaster.value?.quizzes?.length || 0
})

const followersCount = _computed(() => {
  return quizMaster.value?.followers_count || quizMaster.value?.follower_count || 0
})

const averageRating = _computed(() => {
  const rating = quizMaster.value?.average_rating || quizMaster.value?.rating || 0
  return Number(rating).toFixed(1)
})

const memberSince = _computed(() => {
  const createdAt = quizMaster.value?.created_at
  if (!createdAt) return 'N/A'
  const date = new Date(createdAt)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
})

const joinedDate = _computed(() => {
  const createdAt = quizMaster.value?.created_at
  if (!createdAt) return 'N/A'
  const date = new Date(createdAt)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const totalQuizTakers = _computed(() => {
  return quizMaster.value?.total_quiz_takers || 0
})

const avgQuestions = _computed(() => {
  const count = quizMaster.value?.avg_questions_per_quiz || 0
  return Number(count).toFixed(0)
})

async function followHandler() {
  if (!auth.user) return router.push('/login')
  const id = quizMasterId
  const current = following.value
  following.value = !current
  loadingFollow.value = true
  try {
    let res
    if (!current) res = await api.postJson(`/api/quiz-masters/${id}/follow`, {})
    else res = await api.postJson(`/api/quiz-masters/${id}/unfollow`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      following.value = current
      alert.push({ message: 'Failed to follow/unfollow. Please try again.', type: 'error' })
    }
  } catch (err) {
    following.value = current
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = false
  }
}

function openChatModal() {
  if (!auth.user) return router.push('/login')
  chatModalOpen.value = true
}

function onMessageSent(messageData) {
  // Successfully sent message - could trigger chat widget update here
  alert.push({
    type: 'success',
    message: 'Message sent successfully!'
  })
  // Optionally, emit event to update chat widget or other components
  if (window.__messageSent) {
    window.__messageSent(messageData)
  }
}
</script>
