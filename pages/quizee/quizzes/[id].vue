<template>
  <div class="bg-gray-50">
    <!-- Sticky Share Button -->
    <StickyShareButton
      itemType="Quiz"
      :itemId="quiz.id"
      :itemTitle="`${quiz.title} - Take the challenge on Modeh!`"
      :disabled="!quiz.id"
    />

    <!-- Skeleton Loading State -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-pulse">
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
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- New Integrated Hero Section -->
      <div class="mb-6">
        <button @click="router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back
        </button>
        <div class="relative h-64 md:h-80 rounded-xl overflow-hidden" :style="heroStyle">
          <!-- preload cover to detect load state -->
          <img v-if="coverSrc" :src="coverSrc || undefined" class="hidden" @load="onCoverLoaded" @error="onCoverError" />

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
              <!-- Creator Info -->
              <div v-if="quiz.created_by" class="flex items-center gap-1.5">
                 <div class="w-5 h-5 rounded-full bg-gray-300 overflow-hidden" v-if="quiz.created_by.avatar">
                    <img :src="quiz.created_by.avatar" alt="" class="w-full h-full object-cover">
                 </div>
                 <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                 <span>By {{ quiz.created_by.name }}</span>
              </div>
              
              <!-- Pricing -->
              <div class="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">
                <span v-if="quiz.is_paid && quiz.price">
                  {{ typeof quiz.price === 'number' ? '$' + quiz.price : quiz.price }}
                </span>
                <span v-else>Free</span>
              </div>

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
                <span>{{ quiz.marks || quiz.points || 10 }} points</span>
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
            <VideoPlayer :src="quiz.youtube_url || quiz.video_url || quiz.media || quiz.cover_video || quiz.video" :poster="posterSrc || undefined"></VideoPlayer>
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
              <!-- Progress if attempted -->
              <div v-if="lastAttempt" class="border-b pb-4">
                <div class="text-sm text-gray-500">Last attempt</div>
                <div class="mt-1 font-medium">Score: {{ lastAttempt.score }}%</div>
                <div class="mt-2 text-sm">
                  <span style="color: #891f21">{{ lastAttempt.correct || 0 }} correct</span>
                  <span class="mx-2">•</span>
                  <span class="text-red-600">{{ lastAttempt.incorrect || 0 }} incorrect</span>
                </div>
              </div>

              <!-- Action buttons - Full width on mobile -->
              <div class="flex flex-col gap-3">
                <button @click="startQuiz" class="w-full px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-950 text-white rounded-lg hover:from-brand-700 hover:to-brand-900 transition-colors">
                  Begin Assessment
                </button>
                <div class="flex gap-3">
                  <button @click="showPreview" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Preview Questions
                  </button>
                  <AffiliateShareButton 
                    :itemType="'Quiz'"
                    :itemId="quiz.id"
                    :baseUrl="baseUrl"
                  ></AffiliateShareButton>
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
                  <img :src="r.cover || undefined" alt="" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm truncate">{{ r.title }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ r.questions_count || 0 }} questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
// page meta will be defined after we fetch the quiz data (so computed values
// referencing the fetched `quizData` are available at runtime). See below.

import { ref, computed, watch, watchEffect } from 'vue'
import { useHead } from '#imports'
import { useRouter, useRoute } from 'vue-router'
import VideoPlayer from '~/components/media/VideoPlayer.vue'
import { resolveAssetUrl } from '~/composables/useAssets'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
import useApi from '~/composables/useApi'

// --- Type Definitions ---

interface Taxonomy {
  name: string;
}

interface Level extends Taxonomy {}

interface Grade extends Taxonomy {
  level?: Level;
}

interface Subject extends Taxonomy {
  grade?: Grade;
}

interface Topic extends Taxonomy {
  subject?: Subject;
}

interface Quiz {
  id: string | number;
  title: string;
  description: string;
  cover?: string | null;
  cover_image?: string | null;
  cover_image_url?: string | null;
  difficulty?: number | null;
  questions_count?: number;
  points?: number;
  marks?: number;
  youtube_url?: string | null;
  video_url?: string | null;
  media?: string | null;
  cover_video?: string | null;
  video?: string | null;
  media_caption?: string | null;
  video_description?: string | null;
  topic?: Topic;
  subject?: Subject;
  grade?: Grade;
  level?: Level;
  questions?: any[];
  timer_seconds?: number | null;
  per_question_seconds?: number | null;
  use_per_question_timer?: boolean;
  attempts_allowed?: number;
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  is_paid?: boolean;
  price?: string | number;
  created_by?: {
    id: number;
    name: string;
    avatar?: string | null;
  } | null;
}

interface RelatedQuiz {
  id: number;
  title: string;
  cover: string | null;
  questions_count: number;
}

interface LastAttempt {
  score: number;
  correct: number;
  incorrect: number;
}

// --- Page Meta ---
definePageMeta({ layout: 'quizee' })

// --- Component Logic ---

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const baseUrl = computed(() => {
  const baseRaw = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  const base = String(baseRaw || '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}quizzes` : `${base}/quizzes`
})

const api = useApi()

const fetchHeaders = computed(() => {
  const h: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
  try {
    const xsrf = api.getXsrfFromCookie()
    if (xsrf) h['X-XSRF-TOKEN'] = String(xsrf)
  } catch (e) {
    console.error('Failed to get XSRF token:', e)
  }
  return h
})

const { data: quizData, pending } = useFetch<{ quiz: Quiz } | { data: Quiz } | Quiz>(config.public.apiBase + `/api/quizzes/${route.params.id}`, {
  credentials: 'include',
  headers: fetchHeaders
})

const quiz = computed<Quiz>(() => {
  const data = quizData.value
  const defaultQuiz: Quiz = {
    id: route.params.id as string,
    title: 'Loading...',
    description: '',
  }

  if (!data) return defaultQuiz

  // Handles { quiz: Quiz }
  if ('quiz' in data && data.quiz) return data.quiz
  // Handles { data: Quiz }
  if ('data' in data && data.data) return data.data as Quiz
  // Handles Quiz
  if ('id' in data) return data as Quiz

  return defaultQuiz
})

const pageTitle = computed(() => (quiz.value.title && quiz.value.title !== 'Loading...') ? `${quiz.value.title} — Modeh` : 'Quiz — Modeh')
const pageDescription = computed(() => quiz.value.description || 'Practice and assess with Modeh quizzes.')

// Computed properties for nested taxonomy data
const topic_name = computed(() => quiz.value.topic?.name)
const subject_name = computed(() => quiz.value.topic?.subject?.name || quiz.value.subject?.name)
const grade_name = computed(() => quiz.value.grade?.name || quiz.value.topic?.subject?.grade?.name || null)
const level_name = computed(() => quiz.value.level?.name || quiz.value.grade?.level?.name || null)
const difficulty_level = computed(() => getDifficultyLevel(quiz.value.difficulty))

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'requirements', name: 'Requirements' },
  { id: 'instructions', name: 'Instructions' }
]
const activeTab = ref('overview')

// Computed properties
const questionCount = computed(() => {
  if (Array.isArray(quiz.value.questions)) return quiz.value.questions.length
  return quiz.value.questions_count || 0
})

const hasVideo = computed(() => {
  return Boolean(quiz.value.youtube_url || quiz.value.video_url || quiz.value.media || quiz.value.cover_video || quiz.value.video)
})

function onCoverLoaded() {}
function onCoverError() {}

const coverSrc = computed(() => {
  const c = quiz.value.cover || quiz.value.cover_image || quiz.value.cover_image_url || null
  return typeof c === 'string' && c ? resolveAssetUrl(c) : null
})

const posterSrc = computed(() => {
  const p = quiz.value.cover || quiz.value.cover_image || quiz.value.cover_image_url || null
  return typeof p === 'string' && p ? resolveAssetUrl(p) : null
})

const heroStyle = computed(() => {
  if (!coverSrc.value) return {}
  return {
    backgroundImage: `url(${coverSrc.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const related = ref<RelatedQuiz[]>([
  { id: 1, title: 'Similar Quiz 1', cover: null, questions_count: 10 },
  { id: 2, title: 'Similar Quiz 2', cover: null, questions_count: 15 }
])

const lastAttempt = ref<LastAttempt | null>(null)

// Format time limit for display
function formatTimeLimit(limit: number | null | undefined): string {
  if (!limit) return '∞'
  if (limit < 60) return `${limit}m`
  const hours = Math.floor(limit / 60)
  const mins = limit % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

// Get difficulty level text
function getDifficultyLevel(level: number | null | undefined): string {
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
function getDifficultyEmoji(level: number | null | undefined): string {
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
  router.push(`/quizee/quizzes/take/${quiz.value.id}`)
}

function showPreview() {
  router.push(`/quizzes/${quiz.value.id}/preview`)
}

// Update head reactively when quizData becomes available
watchEffect(() => {
  try {
    // Resolve og:image safely across the possible shapes returned by useFetch:
    // - { quiz: Quiz }
    // - { data: Quiz }
    // - Quiz
    // fall back to computed quiz cover or a default image.
    let ogImg = '/social-share.png'
    const v = quizData?.value

    if (v && typeof v === 'object') {
      if ('quiz' in v && v.quiz?.cover_image) {
        ogImg = v.quiz.cover_image
      } else if ('data' in v && v.data?.cover_image) {
        ogImg = v.data.cover_image
      } else if ('cover_image' in v && (v as any).cover_image) {
        // v might already be a Quiz object
        ogImg = (v as any).cover_image
      } else if (quiz.value.cover) {
        ogImg = quiz.value.cover
      }
    } else if (quiz.value.cover) {
      ogImg = quiz.value.cover
    }

    useHead({
      title: pageTitle.value,
      meta: [
        { name: 'description', content: pageDescription.value },
        { property: 'og:title', content: pageTitle.value },
        { property: 'og:description', content: pageDescription.value },
        { property: 'og:image', content: ogImg },
        { name: 'twitter:card', content: 'summary_large_image' }
      ]
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