<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <!-- Hero Section - Enhanced Mobile Responsive -->
    <div class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <!-- Back button + Title - Better Mobile Layout -->
        <div class="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
          <div class="flex items-start gap-4 md:items-center">
            <button 
              @click="router.back()" 
              class="inline-flex items-center justify-center shrink-0 w-10 h-10 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="space-y-2">
              <h1 class="text-2xl md:text-3xl font-bold leading-tight">{{ quiz.title }}</h1>
              <p class="text-white/80 text-sm md:text-base line-clamp-2">{{ quiz.description }}</p>
            </div>
          </div>
          
          <!-- Quick Actions - Visible on Desktop -->
          <div class="hidden md:flex gap-3">
            <button 
              v-if="lastAttempt"
              class="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
            >
              Last Score: {{ lastAttempt.score }}%
            </button>
          </div>
        </div>

        <!-- Enhanced Stats Grid - Better Mobile Layout -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-white/70 text-sm font-medium">Questions</span>
            </div>
            <div class="text-2xl font-bold">{{ quiz.questions_count || questionCount }}</div>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-white/70 text-sm font-medium">Time Limit</span>
            </div>
            <div class="text-2xl font-bold">{{ formatTimeLimit(quiz.time_limit) }}</div>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span class="text-white/70 text-sm font-medium">Points</span>
            </div>
            <div class="text-2xl font-bold">{{ quiz.points || quiz.marks || 10 }}</div>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span class="text-white/70 text-sm font-medium">Difficulty</span>
            </div>
            <div class="text-2xl font-bold capitalize flex items-center gap-2">
              {{ quiz.difficulty || 'Medium' }}
              <span class="text-lg">{{ getDifficultyEmoji(quiz.difficulty) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content - Responsive Grid -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Enhanced Quiz Media Section -->
          <div v-if="quizMedia" class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="aspect-video relative bg-gray-100">
              <!-- YouTube Video -->
              <template v-if="isYouTube(quizMedia)">
                <div class="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <iframe 
                    :src="formatYouTubeUrl(quizMedia)" 
                    class="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    referrerpolicy="no-referrer"
                    title="Quiz video"
                  ></iframe>
                </div>
              </template>

              <!-- Vimeo Video -->
              <template v-if="isVimeo(quizMedia)">
                <div class="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <iframe 
                    :src="formatVimeoUrl(quizMedia)"
                    class="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    referrerpolicy="no-referrer"
                    title="Quiz video"
                  ></iframe>
                </div>
              </template>

              <!-- Direct MP4/WebM Video -->
              <template v-else-if="isVideo(quizMedia)">
                <video
                  class="absolute inset-0 w-full h-full"
                  controls
                  controlsList="nodownload"
                  preload="metadata"
                >
                  <source :src="quizMedia" :type="getVideoType(quizMedia)">
                  Your browser does not support the video tag.
                </video>
              </template>

              <!-- Image Fallback -->
              <template v-else>
                <div class="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <img 
                    :src="quizMedia" 
                    alt="Quiz media" 
                    class="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </template>

              <!-- Loading State -->
              <div 
                v-if="!mediaLoaded" 
                class="absolute inset-0 bg-gray-100 flex items-center justify-center"
              >
                <div class="animate-pulse flex flex-col items-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                  </svg>
                  <span class="mt-2 text-sm text-gray-500">Loading media...</span>
                </div>
              </div>
            </div>

            <!-- Media Caption/Description -->
            <div v-if="quiz.media_caption || quiz.video_description" class="p-4 border-t">
              <p class="text-sm text-gray-600">
                {{ quiz.media_caption || quiz.video_description }}
              </p>
            </div>
          </div>

          <!-- Enhanced Tabs Section - Better Mobile Experience -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- Mobile Segmented Control -->
            <div class="block sm:hidden p-4">
              <div class="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="relative py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                  :class="[
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  ]"
                >
                  {{ tab.name }}
                  <div
                    v-if="activeTab === tab.id"
                    class="absolute inset-0 bg-indigo-600 rounded-md"
                    style="z-index: -1;"
                  ></div>
                </button>
              </div>
            </div>

            <!-- Desktop Tabs -->
            <div class="hidden sm:block">
              <nav class="flex px-6 border-b border-gray-200" aria-label="Tabs">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none transition-colors"
                  :class="[
                    activeTab === tab.id 
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700',
                    'whitespace-nowrap'
                  ]"
                  :aria-current="activeTab === tab.id ? 'page' : undefined"
                >
                  <span>{{ tab.name }}</span>
                  <span
                    aria-hidden="true"
                    :class="[
                      activeTab === tab.id ? 'bg-indigo-500' : 'bg-transparent',
                      'absolute inset-x-0 bottom-0 h-0.5 transition-colors'
                    ]"
                  ></span>
                </button>
              </nav>
            </div>

            <!-- Tab content -->
            <div class="p-6">
              <!-- Overview -->
              <div v-if="activeTab === 'overview'" class="prose max-w-none">
                <div v-html="quiz.description || 'No description available.'"></div>
                
                <!-- Topic tags -->
                <div class="mt-6 flex flex-wrap gap-2">
                  <span v-if="quiz.topic_name" class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700">
                    {{ quiz.topic_name }}
                  </span>
                  <span v-if="quiz.subject_name" class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700">
                    {{ quiz.subject_name }}
                  </span>
                </div>
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
                  Start Quiz
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
                  <span>{{ quiz.time_limit || 'No time limit' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <span>{{ quiz.points || quiz.marks || 10 }} points possible</span>
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

    <!-- Mobile bottom action bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
      <div class="flex gap-3">
        <button @click="showPreview" class="flex-1 px-4 py-3 border rounded-lg">
          Preview
        </button>
        <button @click="startQuiz" class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg">
          Start Quiz
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'student' })

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

// Fetch quiz data
const { data: quizData, pending } = await useFetch(config.public.apiBase + `/api/quizzes/${route.params.id}`)
const quiz = quizData?.value?.quiz || quizData?.value || { 
  id: route.params.id, 
  title: 'Loading...', 
  description: '', 
  questions: [] 
}

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

const quizMedia = computed(() => {
  return quiz.video_url || quiz.media || quiz.media_url || quiz.cover_video || quiz.cover || null
})

// Related quizzes (mock data - replace with actual API call)
const related = ref([
  { id: 1, title: 'Similar Quiz 1', cover: null, questions_count: 10 },
  { id: 2, title: 'Similar Quiz 2', cover: null, questions_count: 15 }
])

// Mock last attempt (replace with actual API call)
const lastAttempt = ref(null)
const mediaLoaded = ref(false)

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

// Media loading handler
function handleMediaLoad() {
  mediaLoaded.value = true
}

// Format time limit for display
function formatTimeLimit(limit) {
  if (!limit) return '∞'
  if (limit < 60) return `${limit}m`
  const hours = Math.floor(limit / 60)
  const mins = limit % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

// Get emoji for difficulty level
function getDifficultyEmoji(difficulty) {
  const level = difficulty?.toLowerCase()
  if (!level) return '📚'
  switch (level) {
    case 'easy': return '🌟'
    case 'medium': return '⭐⭐'
    case 'hard': return '🔥'
    case 'expert': return '💪'
    default: return '📚'
  }
}

// Actions
function startQuiz() {
  router.push(`/student/quizzes/take/${quiz.id}`)
}

function showPreview() {
  router.push(`/quizzes/${quiz.id}/preview`)
}
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