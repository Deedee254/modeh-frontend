<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto p-6 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
        <section class="lg:col-span-2 space-y-6">
          <div v-if="pending" class="bg-white rounded-lg shadow p-6 flex gap-6 items-center animate-pulse">
            <div class="w-40 h-40 rounded bg-gray-200"></div>
            <div class="flex-1 space-y-3">
              <div class="w-32 h-4 bg-gray-200 rounded"></div>
              <div class="w-3/4 h-8 bg-gray-200 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded"></div>
              <div class="flex items-center gap-3 mt-3">
                <div class="w-24 h-8 bg-gray-200 rounded"></div>
                <div class="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg shadow p-6 flex gap-6 items-center relative">
            <div class="w-40 h-40 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              <!-- show video if available -->
              <template v-if="quizMedia">
                <template v-if="isYouTube(quizMedia)">
                  <!-- YouTube embed -->
                  <iframe :src="quizMedia.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')" class="w-full h-full" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                </template>
                <template v-else-if="isVimeo(quizMedia)">
                  <!-- Vimeo embed -->
                  <iframe :src="quizMedia.replace('vimeo.com/', 'player.vimeo.com/video/')" class="w-full h-full" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>
                </template>
                <template v-else-if="isVideoFile(quizMedia)">
                  <!-- native video file -->
                  <video controls class="w-full h-full object-cover" :src="quizMedia"></video>
                </template>
                <template v-else>
                  <!-- fallback image -->
                  <img :src="quizMedia" alt="media" class="object-cover w-full h-full" onerror="this.style.display='none'" />
                </template>
              </template>
              <template v-else>
                <img :src="quiz.cover || '/assets/placeholder-quiz.png'" alt="cover" class="object-contain w-full h-full" onerror="this.style.display='none'" />
              </template>
            </div>
            <div class="flex-1">
              <div class="text-sm text-indigo-600">{{ quiz.topic_name || 'General' }}</div>
              <h1 class="text-3xl font-extrabold mt-1">{{ quiz.title }}</h1>
              <p class="text-sm text-gray-600 mt-2">{{ quiz.short_description || 'Practice and improve.' }}</p>
              <div class="mt-4 flex items-center gap-3">
                <template v-if="isLoggedIn">
                  <NuxtLink :to="`/quizee/quizzes/take/${quiz.id}`" class="px-4 py-2 bg-indigo-600 text-white rounded">Begin Assessment</NuxtLink>
                </template>
                <template v-else>
                  <NuxtLink :to="`/register?next=/quizee/quizzes/take/${quiz.id}`" class="px-4 py-2 bg-indigo-600 text-white rounded">Register / Login to take</NuxtLink>
                </template>
                <button @click="toggleLike" :class="['px-3 py-2 border rounded', liked ? 'bg-rose-50 text-rose-600' : 'text-gray-700']">
                  <span v-if="liked">♥</span>
                  <span v-else>♡</span>
                  <span class="ml-2">Like<span v-if="likesCount"> ({{ likesCount }})</span></span>
                </button>
                <div class="ml-3 text-sm text-gray-500">{{ quiz.marks || 10 }} pts • {{ questionCount }} questions
                  <span v-if="avgDifficulty" class="mx-2">•</span>
                  <span v-if="avgDifficulty" class="text-xs text-gray-500">Avg diff: {{ avgDifficulty }}</span>
                </div>
              </div>

              <!-- Summary badges: timer / attempts / shuffle / access -->
              <div class="mt-3 ml-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <div v-if="quiz.timer_seconds" class="px-2 py-1 bg-gray-100 rounded">⏱ {{ Math.round((quiz.timer_seconds||0)/60) }} min</div>
                <div v-if="quiz.attempts_allowed" class="px-2 py-1 bg-gray-100 rounded">🔁 {{ quiz.attempts_allowed === 'unlimited' ? 'Unlimited' : quiz.attempts_allowed + ' attempts' }}</div>
                <div v-if="quiz.shuffle_questions" class="px-2 py-1 bg-gray-100 rounded">🔀 Questions shuffled</div>
                <div v-if="quiz.shuffle_answers" class="px-2 py-1 bg-gray-100 rounded">🔀 Answers shuffled</div>
                <div v-if="quiz.access && quiz.access !== 'free'" class="px-2 py-1 bg-amber-50 text-amber-700 rounded">🔒 Paywalled</div>
              </div>
            </div>
            <!-- small actions menu (three-dot) -->
            <div class="absolute top-3 right-3">
              <ActionMenu>
                <template #trigger>
                  <button @click.stop class="p-2 rounded-md hover:bg-gray-100">
                    <svg class="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4z"/></svg>
                  </button>
                </template>

                <template #items="{ close }">
                  <button @click="onShare(close)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Share</button>
                  <button @click="onLike(close)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Like</button>
                  <button @click="onBookmark(close)" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Bookmark</button>
                  <button @click="onReport(close)" class="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-gray-50">Report</button>
                </template>
              </ActionMenu>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-4">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <a href="#" @click.prevent="quizTab = 'overview'" :class="quizTabClass('overview')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Overview</a>
              <a href="#" @click.prevent="quizTab = 'screenshots'" :class="quizTabClass('screenshots')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Screenshots</a>
              <a href="#" @click.prevent="quizTab = 'features'" :class="quizTabClass('features')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Features</a>
            </nav>

            <div v-show="quizTab === 'screenshots'" class="mt-4">
              <div class="flex gap-3 overflow-x-auto p-2">
                <div v-for="(s, i) in (quiz.screenshots || [])" :key="i" class="w-40 sm:w-56 h-28 sm:h-36 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img :src="s" class="object-cover w-full h-full" onerror="this.style.display='none'" />
                </div>
                <div v-if="!(quiz.screenshots || []).length" class="w-40 sm:w-56 h-28 sm:h-36 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No screenshots</div>
              </div>
            </div>

            <div v-show="quizTab === 'overview'" class="mt-4">
              <div class="prose max-w-none" v-html="quiz.description || '<p>Practice questions with instant feedback.</p>'"></div>

              <!-- Sample question preview -->
              <div class="mt-6">
                <h3 class="text-lg font-semibold mb-2">Try a sample question</h3>
                <div v-if="quiz.questions && quiz.questions.length" class="bg-white border rounded p-4">
                  <div class="text-sm text-gray-500 mb-2">Question 1</div>
                  <div class="prose max-w-none" v-html="sampleQuestionText()"></div>

                  <div class="mt-3 space-y-2">
                    <div v-for="(opt, i) in (quiz.questions[0].options || [])" :key="i" class="p-2 border rounded bg-gray-50">
                      <span v-html="opt?.text || opt"></span>
                    </div>
                  </div>

                  <div class="text-xs text-gray-400 mt-2">Answers and explanations are shown after you complete the quiz.</div>
                </div>
              </div>
            </div>

            <div v-show="quizTab === 'features'" class="mt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3 border rounded">Timed mode</div>
                <div class="p-3 border rounded">Instant feedback</div>
                <div class="p-3 border rounded">Hints & explanations</div>
                <div class="p-3 border rounded">Leaderboard</div>
              </div>
            </div>
          </div>
        </section>

        <aside class="space-y-4">
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-sm text-gray-500">Details</div>
            <div class="mt-3 flex items-center gap-3">
              <!-- Curvy blob avatar (Uiverse-inspired) -->
              <div class="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full curvy-bg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="g2" x1="0%" x2="100%">
                      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.95" />
                      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.95" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#g2)" d="M36.6,-46.8C47.1,-40.5,58.9,-34.9,65.6,-25.9C72.3,-16.9,74,-4.6,71.4,6.9C68.8,18.4,61.8,29.5,52.4,37.9C43,46.3,31.2,51.1,19.1,53.2C7,55.4,-5.5,54.9,-18,51.6C-30.5,48.4,-43,42.3,-50.5,32.3C-58,22.4,-60.6,8.6,-58.2,-4.3C-55.8,-17.2,-48.3,-29.1,-37.3,-36.4C-26.3,-43.6,-13.2,-46.3,-0.2,-46.1C12.8,-45.9,25.6,-42.9,36.6,-46.8Z" transform="translate(60 60)" />
                </svg>
                <div class="absolute inset-0 grid place-items-center">
                  <template v-if="quiz.author_avatar || quiz.author_image">
                    <img :src="quiz.author_avatar || quiz.author_image" alt="author" class="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" onerror="this.style.display='none'" />
                  </template>
                  <template v-else>
                    <div class="w-12 h-12 rounded-full border-2 border-white shadow-sm grid place-items-center text-white font-semibold bg-black/20">{{ (quiz.author || 'M').charAt(0).toUpperCase() }}</div>
                  </template>
                </div>
              </div>

              <div class="text-sm">
                <div>Author: <span class="font-medium">{{ quiz.author || 'Modeh' }}</span></div>
                <div class="text-xs text-gray-500">Difficulty: <span class="font-medium">{{ quiz.difficulty || 'Medium' }}</span></div>
                <div class="text-xs text-gray-500">Published: <span class="font-medium">{{ quiz.published_at || '—' }}</span></div>
              </div>
            </div>
            <div class="mt-4">
              <template v-if="isLoggedIn">
                <NuxtLink :to="`/quizee/quizzes/take/${quiz.id}`" class="block px-3 py-2 bg-indigo-600 text-white rounded text-center">Begin Assessment</NuxtLink>
              </template>
              <template v-else>
                <NuxtLink :to="`/register?next=/quizee/quizzes/take/${quiz.id}`" class="block px-3 py-2 bg-indigo-600 text-white rounded text-center">Register / Login to take</NuxtLink>
              </template>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-4">
            <div class="font-semibold">Related quizzes</div>
            <div class="mt-3 space-y-2">
              <div v-for="r in related" :key="r.id" class="flex items-center gap-3">
                <div class="w-12 h-8 bg-gray-100 rounded overflow-hidden flex items-center justify-center"><img :src="r.cover" class="w-full h-full object-cover" onerror="this.style.display='none'" /></div>
                <div class="flex-1 text-sm"><NuxtLink :to="`/quizee/quizzes/${r.id}`" class="font-medium text-indigo-700">{{ r.title }}</NuxtLink></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
// Make this page public: guests can view quiz details. If the user is logged in
// the UI will still show the appropriate "Begin Assessment" action that leads
// to the quizee take route. Guests will be prompted to register/login.

import { ref, computed, onMounted, onBeforeUnmount, h, markRaw } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useBottomNavStore } from '~/stores/bottomNav'
import ActionMenu from '~/components/ui/ActionMenu.vue'
const config = useRuntimeConfig()
const route = useRoute()
const id = route.params.id

const { data: quizData, pending } = await useFetch(config.public.apiBase + `/api/quizzes/${id}`)
const quiz = quizData?.value?.quiz || quizData?.value || { id, title: 'Loading...', description: '', screenshots: [], cover: null, questions: [] }

// Compute actual questions count (prefer explicit array if present)
const questionCount = computed(() => {
  try {
    if (Array.isArray(quiz.questions)) return quiz.questions.length
  } catch (e) { /* ignore */ }
  return quiz.questions_count || 0
})

// Find a media URL to show: prefer quiz-level video/image, fall back to first question media_path
const firstQuestionMedia = computed(() => {
  try {
    if (Array.isArray(quiz.questions)) {
      const q = quiz.questions.find(x => x && (x.media_path || x.media || x.video))
      return q ? (q.media_path || q.media || q.video) : null
    }
  } catch (e) { }
  return null
})

const quizMedia = computed(() => {
  // common fields that APIs sometimes use
  return quiz.video_url || quiz.media || quiz.media_url || quiz.cover_video || quiz.cover_video_url || quiz.cover || firstQuestionMedia.value || null
})

const isYouTube = (url) => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'))
const isVimeo = (url) => typeof url === 'string' && url.includes('vimeo.com')
const isVideoFile = (url) => typeof url === 'string' && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)

const related = [ { id: 21, title: 'Fractions Practice', cover: null }, { id: 22, title: 'Decimals Quick', cover: null } ]
const bottomNav = useBottomNavStore()
const quizTab = ref('overview')
const liked = ref(false)
// defensive: quiz is a plain object (not a ref), read properties directly
const likesCount = ref((quiz && (quiz.likes_count ?? quiz.likes)) ?? 0)
const likeAnimating = ref(false)
const api = useApi()
const alert = useAppAlert()
const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user && !!auth.user.id)
// If a logged-in user visits the public quiz page, redirect them to the
// appropriate role-specific route so they receive the correct layout.
onMounted(() => {
  try {
    const role = auth.user?.role
    const path = String(window?.location?.pathname || '')
    // Only redirect when on the public path (i.e., not already under /quizee or /quiz-master)
    if (auth.user && !path.startsWith('/quizee') && !path.startsWith('/quiz-master')) {
      if (role === 'quizee') {
        // use replace to avoid adding an extra history entry
        const r = useRouter()
        r.replace(`/quizee/quizzes/${id}`)
        return
      }
      if (role === 'quiz-master') {
        const r = useRouter()
        r.replace(`/quiz-master/quizzes/${id}`)
        return
      }
    }
  } catch (e) {
    // ignore
  }
})
async function toggleLike(){
  // optimistic
  liked.value = !liked.value
  likesCount.value = Math.max(0, likesCount.value + (liked.value ? 1 : -1))
  // small pulse animation
  likeAnimating.value = true
  setTimeout(() => (likeAnimating.value = false), 350)
  try{
    let res
    if (liked.value) res = await api.postJson(`/api/quizzes/${quiz.id}/like`, {})
    else res = await api.postJson(`/api/quizzes/${quiz.id}/unlike`, {})
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      // revert on error
      liked.value = !liked.value
      likesCount.value = Math.max(0, likesCount.value + (liked.value ? 1 : -1))
      alert.push({ message: 'Could not like/unlike quiz. Please try again.', type: 'error' })
    }
  }catch(err){
    // revert on error
    liked.value = !liked.value
    likesCount.value = Math.max(0, likesCount.value + (liked.value ? 1 : -1))
    console.error('Like failed', err)
    alert.push({ message: 'Network error while liking. Try again.', type: 'error' })
  }
}
function onLike(close){ if (typeof close === 'function') close(); toggleLike(); }
function quizTabClass(t) { return quizTab.value === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }

const avgDifficulty = computed(() => {
  try {
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) return null
    const vals = quiz.questions.map(q => Number(q.difficulty) || 0).filter(Boolean)
    if (!vals.length) return null
    const avg = (vals.reduce((a,b)=>a+b,0) / vals.length)
    return Math.round(avg * 100) / 100
  } catch (e) { return null }
})

function sampleQuestionText() {
  try {
    const q = Array.isArray(quiz.questions) && quiz.questions.length ? quiz.questions[0] : null
    return q ? (q.text || q.body || q.question || '') : ''
  } catch (e) { return '' }
}

// Action handlers accept an optional close callback (provided by ActionMenu slot)
function onShare(close) { if (typeof close === 'function') close(); void navigator.clipboard?.writeText(window.location.href).then(()=> useAppAlert().push({ message: 'Link copied to clipboard', type: 'success' })) }
function onPreview(close) { if (typeof close === 'function') close(); window.location.href = `/quizzes/${quiz.id}/preview` }
function onBookmark(close) { if (typeof close === 'function') close(); useAppAlert().push({ message: 'Bookmarked (demo)', type: 'info' }) }
function onReport(close) { if (typeof close === 'function') close(); useAppAlert().push({ message: 'Reported (demo)', type: 'info' }) }

onMounted(() => {
  // Provide a custom center slot component: Play button that starts the quiz
  const PlayCenter = markRaw({
    name: 'BottomNavPlayCenter',
    setup() {
      const router = useRouter()
      function start() {
        router.push(`/quizee/quizzes/take/${quiz.id}`)
      }
      return () => h('button', { onClick: start, class: 'bg-indigo-600 text-white rounded-full p-4 shadow-lg transform -translate-y-2 hover:scale-105 transition' }, [
        h('svg', { class: 'w-6 h-6', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
          h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.752 11.168l-6.518-3.758A1 1 0 006 8.236v7.528a1 1 0 001.234.97l6.518-1.96a1 1 0 00.752-.97v-1.666a1 1 0 00-.752-.97z' })
        ])
      ])
    }
  })

  bottomNav.setSlots({ center: PlayCenter })
})

onBeforeUnmount(() => {
  bottomNav.setSlots({ center: null })
})
</script>

<style scoped>
.prose p { margin: 0 0 0.75rem 0 }
.curvy-bg { transform-origin: center; }
</style>
