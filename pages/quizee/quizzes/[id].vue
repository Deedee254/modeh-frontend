<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <!-- Skeleton Loading State -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 py-6 animate-pulse">
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
          <img v-if="quiz.cover || quiz.cover_image" :src="quiz.cover || quiz.cover_image" class="hidden" @load="onCoverLoaded" @error="onCoverError" />

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
              <span v-if="topic_name" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/80 text-white">
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
                <span>{{ formatTimeLimit(quiz.time_limit) }}</span>
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
            <VideoPlayer :src="quiz.video_url || quiz.media || quiz.cover_video || quiz.video" :poster="quiz.cover || quiz.cover_image" />
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
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    :class="activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/50'"
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
                    <li>You'll need {{ quiz.time_limit || 'sufficient time' }} to complete this quiz</li>
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
                  <span class="text-green-600">{{ lastAttempt.correct || 0 }} correct</span>
                  <span class="mx-2">•</span>
                  <span class="text-red-600">{{ lastAttempt.incorrect || 0 }} incorrect</span>
                </div>
              </div>

              <!-- Action buttons - Full width on mobile -->
              <div class="flex flex-col gap-3">
                <button @click="startQuiz" class="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors">
                  Begin Assessment
                </button>
                <button @click="showPreview" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Preview Questions
                </button>
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
        </div>
      </div>
    </div>

  
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })

// page meta will be defined after we fetch the quiz data (so computed values
// referencing the fetched `quizData` are available at runtime). See below.

import { ref, computed, watch, watchEffect } from 'vue'
import { useHead } from '#imports'
import { useRouter, useRoute } from 'vue-router'
import VideoPlayer from '~/components/media/VideoPlayer.vue'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

// Fetch data without blocking; useFetch returns refs (no top-level await).
// Avoid `await` here so `definePageMeta` and computed getters can react to the
// `quizData` ref safely without causing server-side timing/500 errors.
const { data: quizData, pending } = useFetch(config.public.apiBase + `/api/quizzes/${route.params.id}`)
const quiz = quizData?.value?.quiz || quizData?.value || { 
  id: route.params.id, 
  title: 'Loading...', 
  description: '', 
  questions: [] 
}

// Dynamic page meta for quiz detail (uses server-fetched data when available)
const pageTitle = computed(() => {
  try { return (quizData?.value?.quiz?.title || quiz?.title) ? `${quizData?.value?.quiz?.title || quiz?.title} — Modeh` : 'Quiz — Modeh' } catch (e) { return 'Quiz — Modeh' }
})
const pageDescription = computed(() => {
  try { return quizData?.value?.quiz?.description || quiz?.description || 'Practice and assess with Modeh quizzes.' } catch (e) { return 'Practice and assess with Modeh quizzes.' }
})

// Use definePageMeta reactively so meta updates when `quizData` resolves.
// Passing a function defers evaluation and avoids reading awaited values too early.
// We avoid using `definePageMeta` with top-level await or complex awaits inside
// its callback because the Nuxt macro runs at build-time and can error if it
// encounters `await` in the module. Instead, update document head reactively
// when `quizData` resolves using `useHead` inside a `watchEffect` below.

// Computed properties for nested taxonomy data
const topic_name = computed(() => quiz.topic?.name)
const subject_name = computed(() => quiz.topic?.subject?.name || quiz.subject?.name)
const grade_name = computed(() => quiz.grade?.name || quiz.topic?.subject?.grade?.name || null)
const level_name = computed(() => quiz.level?.name || quiz.grade?.level?.name || null)
const difficulty_level = computed(() => getDifficultyLevel(quiz.difficulty))

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'requirements', name: 'Requirements' },
  { id: 'instructions', name: 'Instructions' }
]
const activeTab = ref('overview')

// Computed properties
const questionCount = computed(() => {
  if (Array.isArray(quiz.questions)) return quiz.questions.length
  return quiz.questions_count || 0
})

const hasVideo = computed(() => {
  return Boolean(quiz.video_url || quiz.media || quiz.cover_video || quiz.video)
})

const heroStyle = computed(() => {
  const cover = quiz.cover || quiz.cover_image || quiz.cover_image_url || null
  if (!cover) return {}
  return {
    backgroundImage: `url(${cover})`,
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


// Media utility functions
const isYouTube = (url) => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'))
const isVimeo = (url) => typeof url === 'string' && url.includes('vimeo.com')
const isVideo = (url) => typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url)

function getVideoType(url) {
  const ext = url.split('.').pop().toLowerCase()
  return `video/${ext}`
}

function formatYouTubeUrl(url) {
  // Handle both youtube.com and youtu.be URLs
  let videoId = ''
  if (url.includes('youtube.com')) {
    videoId = url.split('v=')[1]
    const ampersandPosition = videoId?.indexOf('&')
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition)
    }
  } else if (url.includes('youtu.be')) {
    videoId = url.split('youtu.be/')[1]
  }
  
  // Return embed URL with additional parameters for better UX
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
}

function formatVimeoUrl(url) {
  // Extract Vimeo ID and format the embed URL
  const vimeoId = url.split('vimeo.com/')[1]
  return `https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0`
}

// Format time limit for display
function formatTimeLimit(limit) {
  if (!limit) return '∞'
  if (limit < 60) return `${limit}m`
  const hours = Math.floor(limit / 60)
  const mins = limit % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
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
  router.push(`/quizee/quizzes/take/${quiz.id}`)
}

function showPreview() {
  router.push(`/quizzes/${quiz.id}/preview`)
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
        { property: 'og:image', content: (quizData?.value?.quiz?.cover_image || quiz?.cover || '/social-share.png') },
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