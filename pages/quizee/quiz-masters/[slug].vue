<template>
  <div class="bg-gray-50 min-h-screen">
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
      Loading quiz-master profile...
    </div>
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-500">
      Failed to load profile. The quiz-master may not exist or there was a server error.
    </div>
    <div v-else-if="quizMaster" class="pb-12">
      <!-- Breadcrumbs Navigation -->
      <div class="border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex items-center gap-2 text-sm">
            <NuxtLink to="/" class="text-slate-600 hover:text-slate-900 transition">Home</NuxtLink>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <NuxtLink to="/quizee/quiz-masters" class="text-slate-600 hover:text-slate-900 transition">Quiz Masters</NuxtLink>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-slate-900 font-medium">{{ quizMaster?.name || 'Profile' }}</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Profile Card -->
          <div class="lg:col-span-1">
            <div class="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl shadow-sm border border-brand-700 p-6 sticky top-24 text-white">
              <!-- Avatar Circle -->
              <div class="flex justify-center mb-6">
                <div class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-white flex items-center justify-center">
                  <img v-if="resolvedAvatar" :src="resolvedAvatar" :alt="quizMaster.name" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full bg-brand-600/10 text-brand-600 grid place-items-center font-bold text-5xl">
                    {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>

              <!-- Profile Info -->
              <div class="text-center mb-6">
                <h1 class="text-2xl font-bold text-white mb-2">{{ quizMaster.name }}</h1>
                <p class="text-sm text-brand-100 font-medium mb-3">{{ quizMaster.headline || 'Experienced Quiz Master' }}</p>
              </div>

              <!-- Level -->
              <div v-if="quizMaster?.level?.name" class="mb-4 pb-4 border-b border-brand-500">
                <p class="text-xs text-brand-100 mb-1">Level</p>
                <p class="text-sm font-bold text-white">{{ quizMaster.level.name }}</p>
              </div>

              <!-- Institution -->
              <div v-if="quizMaster.institution" class="mb-4 pb-4 border-b border-brand-500">
                <p class="text-xs text-brand-100 mb-1">Institution</p>
                <p class="text-sm font-bold text-white">{{ quizMaster.institution }}</p>
              </div>

              <!-- Bio -->
              <div v-if="quizMaster.bio" class="mb-6">
                <p class="text-xs text-brand-100 mb-2">About</p>
                <p class="text-xs text-brand-50 leading-relaxed" v-html="quizMaster.bio"></p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 flex-col">
                <button @click="openChatModal" class="w-full px-4 py-2 rounded-lg bg-white text-brand-600 text-sm font-medium hover:bg-brand-50 transition">
                  Message
                </button>
                <button @click="followHandler" :disabled="loadingFollow" class="w-full px-4 py-2 rounded-lg border border-white text-sm font-medium transition text-white hover:bg-white/10" :class="following ? 'bg-white/20' : ''">
                  <span v-if="following">Following</span>
                  <span v-else>Follow</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Stats and Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Stats Cards Grid -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Followers -->
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center hover:shadow-md transition">
                <div class="text-3xl mb-2">👥</div>
                <p class="text-2xl font-bold text-slate-900">{{ followersCount }}</p>
                <p class="text-xs text-slate-600 mt-1">Followers</p>
              </div>

              <!-- Quizzes -->
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center hover:shadow-md transition">
                <div class="text-3xl mb-2">📝</div>
                <p class="text-2xl font-bold text-slate-900">{{ quizzesCount }}</p>
                <p class="text-xs text-slate-600 mt-1">Quizzes</p>
              </div>
            </div>

            <!-- Areas of Expertise Section -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 class="text-lg font-bold text-slate-900 mb-4">📚 Areas of Expertise</h3>
              
              <!-- Level and Grade Pills -->
              <div class="flex flex-wrap gap-2 mb-4">
                <div v-if="quizMaster?.level?.name" class="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
                  <span class="text-xs font-medium">Level:</span>
                  <span class="text-xs font-bold">{{ quizMaster.level.name }}</span>
                </div>
                <div v-if="quizMaster?.grade?.name" class="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                  <span class="text-xs font-medium">Grade:</span>
                  <span class="text-xs font-bold">{{ quizMaster.grade.name }}</span>
                </div>
              </div>

              <!-- Subject Pills -->
              <div v-if="quizMaster?.subjects && quizMaster.subjects.length" class="border-t border-slate-200 pt-4">
                <p class="text-xs text-slate-600 font-medium mb-3">Specializations</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="subject in quizMaster.subjects" :key="subject.id" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition border border-slate-200">
                    {{ subject.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Quizzes Created Section -->
            <div v-if="quizMaster.quizzes && quizMaster.quizzes.length" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-slate-900">Quizzes Created</h2>
                <NuxtLink v-if="quizMaster.quizzes.length > 6" :to="`/quizee/quizzes?created_by=${quizMasterId}`" class="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  View All →
                </NuxtLink>
              </div>
              <div class="space-y-3">
                <div v-for="quiz in quizMaster.quizzes.slice(0, 6)" :key="quiz.id" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition border border-slate-100">
                  <div class="flex-1">
                    <NuxtLink :to="`/quizee/quizzes/${quiz.slug}`" class="text-sm font-medium text-slate-900 hover:text-brand-600">
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
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '#imports'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl } from '~/composables/useAssets'

definePageMeta({ layout: 'quizee' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const quizMasterSlug = route.params.slug

// Fetch quiz-master by slug (API may return a list or object)
const { data: quizMasterData, pending, error } = await useAsyncData(
  `quiz-master-${quizMasterSlug}`,
  () => $fetch(config.public.apiBase + `/api/quiz-masters?slug=${encodeURIComponent(quizMasterSlug)}`)
)

const quizMaster = computed(() => {
  if (!quizMasterData.value) return null
  const raw = quizMasterData.value.data || quizMasterData.value
  if (Array.isArray(raw)) return raw[0] || null
  return raw
})

const resolvedAvatar = computed(() => {
  const qm = quizMaster.value
  if (!qm) return null
  const v = qm.avatar_url || qm.avatar
  return resolveAssetUrl(v) || (v || null)
})

const auth = useAuthStore()
const api = useApi()
const alert = useAppAlert()
const following = ref(false)
const loadingFollow = ref(false)
const chatModalOpen = ref(false)

// initialize following when data loads
watchEffect(() => {
  if (quizMaster.value) {
    following.value = !!(quizMaster.value.is_following || quizMaster.value.isFollowing || quizMaster.value.is_following_by_current_user)
  }
})

const quizMasterId = computed(() => quizMaster.value?.id || quizMaster.value?._id || null)

// Computed properties for stats and info
const quizzesCount = computed(() => quizMaster.value?.quizzes?.length || 0)
const followersCount = computed(() => quizMaster.value?.followers_count || quizMaster.value?.follower_count || 0)
const subjectsCount = computed(() => quizMaster.value?.subjects?.length || 0)
const joinedDate = computed(() => {
  const createdAt = quizMaster.value?.created_at
  if (!createdAt) return 'N/A'
  const date = new Date(createdAt)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

async function followHandler() {
  if (!auth.user) return router.push('/login')
  if (loadingFollow.value) return
  const id = quizMasterId.value
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

// Echo listener for follow events (attach if client-side)
if (process.client && typeof window !== 'undefined' && window.Echo) {
  try {
    const ch = window.Echo.private(`quiz-master.${quizMasterId.value}`)
    ch.listen('.App\\Events\\QuizMasterFollowed', (payload) => {
      if (!payload || !payload.quizMaster) return
      const id = payload.quizMaster.id
      if (String(id) !== String(quizMasterId.value)) return

      if (payload.quizMaster.followers_count !== undefined && quizMaster.value) {
        quizMaster.value.followers_count = payload.quizMaster.followers_count
      } else if (quizMaster.value) {
        quizMaster.value.followers_count = (quizMaster.value.followers_count || 0) + 1
      }
    })
  } catch (e) {
    console.error('Echo attach failed for quiz-master follow', e)
  }
}

// Set head tags for SEO
useHead({
  title: () => quizMaster.value ? `${quizMaster.value.name} — Quiz Master | Modeh` : 'Quiz Master — Modeh',
  meta: [
    { name: 'description', content: () => quizMaster.value ? (quizMaster.value.headline || quizMaster.value.bio || `Profile of ${quizMaster.value.name}`) : 'Quiz master profile' }
  ]
})

function openChatModal() {
  if (!auth.user) return router.push('/login')
  chatModalOpen.value = true
}

function onMessageSent(messageData) {
  alert.push({ type: 'success', message: 'Message sent successfully!' })
  if (window.__messageSent) window.__messageSent(messageData)
}
</script>
