<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <!-- Skeleton Loading State -->
    <div v-if="pending && !quizData" class="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <!-- New Integrated Hero Section -->
      <div class="mb-6">
        <div class="h-6 w-24 bg-gray-200 rounded-md mb-4"></div>
        <div class="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gray-200"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-gray-200 rounded-xl h-48"></div>
          <div class="bg-gray-200 rounded-xl h-64"></div>
        </div>
        <div class="space-y-6">
          <div class="bg-gray-200 rounded-xl h-72 sticky top-6"></div>
        </div>
      </div>
    </div>

    <!-- Main Content - Responsive Grid -->
    <div v-else class="max-w-7xl mx-auto px-4 py-6">
      <!-- New Integrated Hero Section -->
      <div class="mb-6">
        <button @click="router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back
        </button>
        <div class="relative h-64 md:h-80 rounded-xl overflow-hidden" :style="heroStyle">
          <!-- preload cover to detect load state -->
          <img v-if="coverSrc" :src="coverSrc" class="hidden" @load="onCoverLoaded" @error="onCoverError" />

          <!-- Overlay Content (title, badges) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6 text-white">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-500/90 text-white border-0 capitalize">
                {{ difficulty_level }} {{ getDifficultyEmoji(quiz.difficulty) }}
              </div>
              <span v-if="level_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
                {{ level_name }}
              </span>
              <span v-if="grade_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/80 text-white">
                {{ grade_name }}
              </span>
              <span v-if="topic_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-600/80 text-white">
                {{ topic_name }}
              </span>
              <span v-if="subject_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/80 text-white">
                {{ subject_name }}
              </span>
            </div>
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">{{ quiz.title }}</h1>
            <div class="flex flex-wrap gap-x-4 gap-y-2 text-white/90 text-sm">
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>{{ quiz.questions_count || questionCount }} questions</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{{ quiz.timer_seconds ? formatTimeLimit(Math.floor(quiz.timer_seconds / 60)) : 'No time limit' }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span>{{ quiz.points || quiz.marks || 10 }} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Video player (separate from hero) -->
          <div v-if="hasVideo" class="mb-4">
            <!-- Accept youtube_url (canonical), video_url and other fallbacks -->
            <VideoPlayer :src="quiz.youtube_url || quiz.video_url || quiz.media || quiz.cover_video || quiz.video" :poster="coverSrc" />
          </div>

          <!-- Media Caption/Description -->
          <div v-if="quiz.media_caption || quiz.video_description" class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-gray-600">
              {{ quiz.media_caption || quiz.video_description }}
            </p>
          </div>
          <!-- Enhanced Tabs Section - Better Mobile Experience -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- New Unified Tab Style -->
            <div class="p-2 sm:p-4">
              <div role="tablist" class="grid w-full grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1 text-gray-500">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    role="tab"
                    :aria-selected="activeTab === tab.id"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    :class="activeTab === tab.id ? 'bg-white text-brand-600 shadow-sm' : 'hover:bg-white/50'"
                  >
                    {{ tab.name }}
                  </button>
              </div>
            </div>

            <!-- Tab content -->
            <div class="p-6">
              <!-- Overview -->
              <div v-if="activeTab === 'overview'" class="prose max-w-none">
                <div v-html="quiz.description || 'No description available.'"></div>
              </div>

              <!-- Requirements -->
              <div v-else-if="activeTab === 'requirements'" class="space-y-4">
                <div class="prose max-w-none">
                  <h3 class="text-lg font-medium">Before you start</h3>
                  <ul>
                    <li>Make sure you have a stable internet connection</li>
                    <li>You'll need {{ quiz.timer_seconds ? formatTimeLimit(Math.floor(quiz.timer_seconds / 60)) : 'sufficient time' }} to complete this quiz</li>
                    <li>Have paper and pen ready for calculations if needed</li>
                  </ul>
                </div>
              </div>

              <!-- Instructions -->
              <div v-else-if="activeTab === 'instructions'" class="space-y-4">
                <div class="prose max-w-none">
                  <h3 class="text-lg font-medium">How to take this quiz</h3>
                  <ul>
                    <li>Read each question carefully before answering</li>
                    <li>You can't return to previous questions once answered</li>
                    <li>Your progress is saved automatically</li>
                    <li>Click "Submit" when you're done</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Action Card - Fixed bottom on mobile -->
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <div class="space-y-6">
                <!-- Creator / meta row -->
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0">
                      <NuxtLink v-if="authorLink" :to="authorLink" class="block">
                        <img v-if="author?.avatar" :src="author.avatar" alt="Creator avatar" class="w-10 h-10 rounded-full object-cover" />
                        <div v-else class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1c0-2.21 3.582-4 6-4s6 1.79 6 4v1"></path></svg>
                        </div>
                      </NuxtLink>
                      <div v-else>
                        <img v-if="author?.avatar" :src="author.avatar" alt="Creator avatar" class="w-10 h-10 rounded-full object-cover" />
                        <div v-else class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1c0-2.21 3.582-4 6-4s6 1.79 6 4v1"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-slate-800 truncate">
                        <NuxtLink v-if="authorLink" :to="authorLink" class="hover:underline">{{ author?.name || 'Creator' }}</NuxtLink>
                        <span v-else>{{ author?.name || 'Creator' }}</span>
                      </div>
                      <div class="text-xs text-slate-500">Quiz creator</div>
                    </div>
                  <div class="text-right">
                    <div class="text-sm font-bold text-slate-800">{{ likes_count }} <span class="text-xs text-slate-400">likes</span></div>
                    <div class="text-xs text-slate-500">{{ priceDisplay }}</div>
                  </div>
                </div>

              <!-- Guest Quiz Results -->
              <div v-if="lastAttempt" class="border-b pb-4 space-y-3">
                <div class="text-sm font-semibold text-slate-700">Your Results</div>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-3xl font-bold text-brand-600">{{ Math.round(lastAttempt.score) }}%</div>
                    <div class="text-xs text-slate-500 mt-1">Score</div>
                  </div>
                  <div class="text-right space-y-1">
                    <div class="text-sm">
                      <span class="font-semibold text-green-600">{{ lastAttempt.correct }} correct</span>
                    </div>
                    <div class="text-sm">
                      <span class="font-semibold text-red-600">{{ lastAttempt.incorrect }} incorrect</span>
                    </div>
                  </div>
                </div>
                <div v-if="lastAttempt.time_taken" class="text-xs text-slate-500">
                  Time taken: {{ formatTimeTaken(lastAttempt.time_taken) }}
                </div>
              </div>

              <!-- Action buttons - Full width on mobile -->
              <div class="flex flex-col gap-3">
                <button 
                  v-if="!lastAttempt"
                  @click="startQuiz" 
                  class="w-full px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-950 text-white rounded-lg hover:from-brand-700 hover:to-brand-900 transition-colors"
                >
                  {{ startButtonLabel }}
                </button>
                <div v-if="!lastAttempt" class="flex gap-3">
                  <button @click="showPreview" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Preview Questions
                  </button>
                  <AffiliateShareButton 
                    :itemType="'Quiz'"
                    :itemId="quiz.id"
                    :baseUrl="baseUrl"
                  />
                </div>
              </div>

              <!-- Sign in prompt if guest completed (uses theme primary / buttons.brand styling) -->
              <div v-if="lastAttempt && !isLoggedIn" class="rounded-lg p-4" :class="['bg-primary/10', 'border', 'border-primary/20']">
                <p class="text-sm mb-3" :class="['text-primary']">
                  <strong>Save your results!</strong> Create an account to access your score history and track progress.
                </p>
                <div class="flex gap-3">
                  <button
                    @click="showLoginModal = true"
                    class="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition"
                    :class="['bg-primary', 'text-primary-foreground', 'hover:opacity-95']"
                  >
                    Sign In
                  </button>
                  <NuxtLink
                    to="/register/quizee"
                    class="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition text-center"
                    :class="['bg-white', 'border', 'border-primary', 'text-primary', 'hover:bg-primary/5']"
                  >
                    Register
                  </NuxtLink>
                </div>
              </div>

              <!-- Quiz info -->
              <div class="text-sm text-gray-500 space-y-2">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ quiz.timer_seconds ? formatTimeLimit(Math.floor(quiz.timer_seconds / 60)) : 'No time limit' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                  <span>{{ level_name ? level_name : 'Level: —' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                  <span>{{ grade_name ? grade_name : 'Grade: —' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <span>{{ quiz.points || quiz.marks || 10 }} points possible</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>{{ quiz.attempts_allowed ? `${quiz.attempts_allowed} attempts allowed` : 'Unlimited attempts' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Quizzes - Hidden on mobile -->
          <div class="hidden md:block bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-medium mb-4">Related Quizzes</h3>
            <div class="space-y-4">
              <div v-for="r in related" :key="r.id" 
                   class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                  <img :src="r.cover" alt="" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm truncate">{{ r.title }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ r.questions_count || 0 }} questions</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Results (Guest Quiz) - Only show if quiz taken -->
          <div v-if="lastAttempt && lastAttempt.results" class="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 class="font-semibold text-slate-900">Detailed Results</h3>
            
            <!-- Results Summary Stats -->
            <div class="grid grid-cols-3 gap-2">
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-green-600">{{ lastAttempt.correct }}</div>
                <div class="text-xs text-green-700 mt-1">Correct</div>
              </div>
              <div class="bg-red-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-red-600">{{ lastAttempt.incorrect }}</div>
                <div class="text-xs text-red-700 mt-1">Incorrect</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-slate-600">{{ lastAttempt.total_questions || 0 }}</div>
                <div class="text-xs text-slate-700 mt-1">Total</div>
              </div>
            </div>

            <!-- Question Results -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div v-for="(result, idx) in lastAttempt.results" :key="idx" class="p-3 rounded-lg border" :class="result.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
                <div class="flex items-start gap-2">
                  <div :class="['flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold', result.is_correct ? 'bg-green-600' : 'bg-red-600']">
                    {{ result.is_correct ? '✓' : '✗' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 mb-1">{{ result.question_body }}</p>
                    <div v-if="result.explanation" class="text-xs text-slate-700 mb-1">
                      <strong>Explanation:</strong> {{ result.explanation }}
                    </div>
                    <div v-if="!result.is_correct && result.correct_answer" class="text-xs text-slate-700">
                      <strong>Correct answer:</strong> {{ result.correct_answer }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  
  </div>

  <UModal v-model="showLoginModal" :ui="{ width: 'sm:max-w-md' }">
    <div class="p-4">
      <LoginForm :compact="true" :suppressRedirect="true" @success="onLoginSuccess" />
    </div>
  </UModal>

</template>

<script setup>
definePageMeta({ layout: 'default' })

import { ref, computed, watch, watchEffect } from 'vue'
import { useHead } from '#imports'
import { useRouter, useRoute } from 'vue-router'
import VideoPlayer from '~/components/media/VideoPlayer.vue'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
import useApi from '~/composables/useApi'
import { resolveAssetUrl } from '~/composables/useAssets'
import UModal from '~/components/ui/UModal.vue'
import LoginForm from '~/components/Auth/LoginForm.vue'
import { useAuthStore } from '~/stores/auth'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()
const guestQuizStore = useGuestQuizStore()
const isLoggedIn = computed(() => !!auth.user && !!auth.user.id)
const showLoginModal = ref(false)

const baseUrl = computed(() => {
  const base = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}quizzes` : `${base}/quizzes`
})

// Fetch data without blocking; useFetch returns refs (no top-level await).
// Avoid `await` here so `definePageMeta` and computed getters can react to the
// `quizData` ref safely without causing server-side timing/500 errors.
const api = useApi()
const slugRaw = computed(() => String(route.params.slug ?? ''))
const slug = computed(() => slugRaw.value.replace(/^\{+|\}+$/g, ''))

// Fetch quiz by slug or ID - singular show endpoint handles both via route model binding
const { data: quizData, pending } = useFetch(() => {
  if (!slug.value) return null
  const safe = encodeURIComponent(slug.value)
  return config.public.apiBase + `/api/quizzes/${safe}`
}, {
  credentials: isLoggedIn.value ? 'include' : 'omit',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  transform: (data) => {
    // Singular show endpoint returns { quiz: { ... } }
    return { quiz: data?.quiz || data || null }
  }
})

// Make `quiz` a computed ref so its value is derived from `quizData` reactively.
// This avoids taking a snapshot of `quizData` at setup time (which caused the
// server to render placeholders while the client immediately had data,
// producing hydration mismatches).
const quiz = computed(() => (
  quizData?.value?.quiz || {
    id: null,
    slug: route.params.slug,
    title: 'Loading...',
    description: '',
    questions: []
  }
))

// Dynamic page meta for quiz detail (uses server-fetched data when available)
const pageTitle = computed(() => quiz.value?.title ? `${quiz.value.title} — Modeh` : 'Quiz — Modeh')
const pageDescription = computed(() => quiz.value?.description || 'Practice and assess with Modeh quizzes.')

const structuredData = computed(() => {
  if (!quiz.value || !quiz.value.slug || pending.value) return null

  const quizUrl = `${baseUrl.value}/${quiz.value.slug}`
  const orgUrl = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: quiz.value.title,
    description: quiz.value.description,
    url: quizUrl,
    image: coverSrc.value,
    learningResourceType: 'Quiz',
    educationalLevel: level_name.value || grade_name.value || undefined,
    author: {
      '@type': 'Organization',
      name: 'Modeh',
      url: orgUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Modeh',
      url: orgUrl
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': quizUrl
    }
  }

  if (quiz.value.timer_seconds) {
    const minutes = Math.floor(quiz.value.timer_seconds / 60)
    data.timeRequired = `PT${minutes}M`
  }

  return data
})

// Computed properties for nested taxonomy data
// Use flattened names from API (unified show endpoint)
const topic_name = computed(() => quiz.value.topic_name || quiz.value.topic?.name || null)
const subject_name = computed(() => quiz.value.subject_name || quiz.value.subject?.name || quiz.value.topic?.subject?.name || null)
const grade_name = computed(() => quiz.value.grade_name || quiz.value.grade?.name || null)
const level_name = computed(() => quiz.value.level_name || quiz.value.level?.name || null)
const difficulty_level = computed(() => getDifficultyLevel(quiz.value.difficulty))
const isLiked = computed(() => Boolean(quiz.value.liked))

// Author, likes and pricing (match API: quiz.created_by, quiz.likes_count, quiz.is_paid, quiz.price)
// Backend provides `created_by` which may be an id or a user object. Normalize to an object
// so template can safely read `.name` and `.avatar` without backend changes.
const author = computed(() => {
  const cb = quiz.value?.created_by
  if (!cb) return null
  if (typeof cb === 'object') return cb
  // created_by is an id -> return minimal object with id only
  return { id: cb, name: null, avatar: null, slug: null }
})
const likes_count = computed(() => Number(quiz.value.likes_count ?? 0))
const isPaid = computed(() => Boolean(quiz.value.is_paid))
const price = computed(() => quiz.value.price)
const priceDisplay = computed(() => {
  if (!isPaid.value) return 'Free'
  const p = Number(price.value)
  if (!isFinite(p)) return 'Paid'
  try {
    const currency = config.public?.currency || 'USD'
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(p)
  } catch (e) {
    return `${p}`
  }
})

// Author link (prefer canonical slug coming from API; fallback to id)
const authorLink = computed(() => {
  if (!author.value) return null
  if (author.value.slug) return `/quizee/quiz-masters/${author.value.slug}`
  if (author.value.id) return `/quizee/quiz-masters/${author.value.id}`
  return null
})

const startButtonLabel = computed(() => isPaid.value ? `Buy & Begin — ${priceDisplay.value}` : 'Begin Assessment')

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'requirements', name: 'Requirements' },
  { id: 'instructions', name: 'Instructions' }
]
const activeTab = ref('overview')

// Computed properties
const questionCount = computed(() => Array.isArray(quiz.value.questions) ? quiz.value.questions.length : 0)

// Only consider explicit video URLs per API
const hasVideo = computed(() => Boolean(quiz.value.youtube_url || quiz.value.video_url))

// Safe no-op handlers for the hidden preload image above
function onCoverLoaded() {}
function onCoverError() {}

const coverSrc = computed(() => {
  const c = quiz.value.cover_image || null
  return typeof c === 'string' && c ? resolveAssetUrl(c) : null
})

const heroStyle = computed(() => {
  if (!coverSrc.value) return {}
  return {
    backgroundImage: `url(${coverSrc.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

// Related quizzes (mock data - replace with actual API call)
const related = ref([
  { id: 1, title: 'Similar Quiz 1', cover: null, questions_count: 10 },
  { id: 2, title: 'Similar Quiz 2', cover: null, questions_count: 15 }
])

// Mock last attempt (replace with actual API call)
const lastAttempt = ref(null)

// Watch for guest quiz attempts
watch(() => quiz.value?.id, (quizId) => {
  if (quizId) {
    guestQuizStore.initializeStore()
    const guestResult = guestQuizStore.getQuizResult(quizId)
    if (guestResult) {
      lastAttempt.value = {
        score: guestResult.score,
        percentage: guestResult.percentage,
        correct: guestResult.correct_count,
        incorrect: guestResult.incorrect_count,
        time_taken: guestResult.time_taken,
        attempted_at: guestResult.attempted_at,
        results: guestResult.results
      }
    }
  }
}, { immediate: true })

// Format time limit for display
function formatTimeLimit(limit) {
  if (!limit) return '∞'
  if (limit < 60) return `${limit}m`
  const hours = Math.floor(limit / 60)
  const mins = limit % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

// Format time taken (in seconds) to readable format
function formatTimeTaken(seconds) {
  if (!seconds) return 'N/A'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes === 0) return `${secs}s`
  if (minutes < 60) return `${minutes}m ${secs}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Get difficulty level text
function getDifficultyLevel(level) {
  if (!level) return 'Medium'
  switch (level) {
    case 1: return 'Easy'
    case 2: return 'Medium'
    case 3: return 'Hard'
    case 4: return 'Expert'
    default: return 'Medium'
  }
}

// Get emoji for difficulty level
function getDifficultyEmoji(level) {
  if (!level) return '📚'
  switch (level) {
    case 1: return '🌟'
    case 2: return '⭐⭐'
    case 3: return '🔥'
    case 4: return '💪'
    default: return '📚'
  }
}

// Actions
function startQuiz() {
  // If paid quizzes require quizee login -> direct to quizee take route.
  if (isPaid.value) {
    const quizeeTake = `/quizee/quizzes/take/${quiz.value.slug}`
    if (isLoggedIn.value) {
      // logged-in users go straight to the quizee take route
      router.push(quizeeTake)
    } else {
      // unauthenticated users should login first; send them to /login with next
      router.push({ path: '/login', query: { next: quizeeTake } })
    }
  } else {
    router.push(`/quizzes/${quiz.value.slug}/take`)
  }
}

function showPreview() {
  router.push(`/quizzes/${quiz.value.slug}/preview`)
}

function onLoginSuccess(user) {
  showLoginModal.value = false
  // prefer role from emitted user payload, fallback to auth store
  const role = user?.role || auth.user?.role
  if (role === 'quizee') router.push(`/quizee/quizzes/take/${quiz.value.slug}`)
  else if (role === 'quiz-master') router.push(`/quiz-master/quizzes/${quiz.value.slug}`)
  else router.push(`/quizee/quizzes/take/${quiz.value.slug}`)
}

// Update head reactively when quizData becomes available
watchEffect(() => {
  try {
    useHead({
      title: pageTitle.value,
      meta: [
        { name: 'description', content: pageDescription.value },
        { property: 'og:title', content: pageTitle.value },
        { property: 'og:description', content: pageDescription.value },
        { property: 'og:image', content: (quizData?.value?.quiz?.cover_image || quiz.value.cover || '/social-share.png') },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      script: structuredData.value ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(structuredData.value)
        }
      ] : []
    })
  } catch (e) {
    // swallow errors from head updates to avoid breaking the page
  }
})
</script>

<style scoped>
/* Custom scrollbar for better mobile experience */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>
