<template>
  <!-- Horizontal variant (Mobile/List view) -->
  <div v-if="isHorizontal" :class="[
      'group relative w-full flex flex-row rounded-xl bg-card overflow-hidden transition-all duration-300',
      props.clean ? 'shadow-none border-0' : 'shadow-card border border-border/50 dark:border-border/50 dark:bg-slate-900'
    ]">
    <!-- Image Left (Fixed width 96-112px per spec) -->
    <div v-if="!props.hideImage" class="relative w-24 sm:w-28 flex-shrink-0 bg-slate-100">
      <template v-if="resolvedCover">
        <img :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent dark:from-card pointer-events-none z-10" />
      </template>
      <div v-else class="h-full w-full flex items-center justify-center text-slate-300">
        <Icon name="heroicons:photo" class="h-8 w-8" />
      </div>
      
      <!-- Difficulty Badge (mini) -->
      <div v-if="difficultyLabel" class="absolute top-1 left-1 z-20">
         <div :class="['w-2 h-2 rounded-full shadow-sm', difficultyBgClass]" :title="difficultyLabel"></div>
      </div>
      <!-- Price Badge -->
      <div class="absolute top-1 right-1 z-20">
        <span :class="['inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded', priceBadgeClass]">
          {{ priceBadgeLabel }}
        </span>
      </div>
    </div>

    <!-- Content Right -->
    <div class="flex flex-col flex-1 min-w-0 p-3">
      <div class="flex items-start justify-between gap-2">
         <div class="flex-1 min-w-0">
             <!-- Org / Topic Name -->
             <div v-if="displayTopic" class="text-[10px] uppercase font-semibold text-[#6a6f73] tracking-wider mb-0.5 truncate">
               {{ displayTopic }}
             </div>
             
             <!-- Title -->
             <h4 class="text-[14px] leading-[18px] font-semibold text-[#1f1f1f] dark:text-slate-100 line-clamp-2 mb-1">
               {{ displayTitle }}
             </h4>
         </div>
         
         <!-- Like Button -->
         <button @click.stop="toggleLike" class="text-slate-400 hover:text-brand-700 transition-colors p-1 -mr-1 -mt-1 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="localLiked ? 'currentColor' : 'currentColor'" :class="['h-4 w-4', localLiked ? 'text-brand-700' : '']">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
         </button>
      </div>

      <!-- Meta / Footer -->
      <div class="mt-auto flex items-center justify-between text-xs text-[#6a6f73]">
         <div class="flex items-center gap-1">
             <span class="font-medium">{{ displayQuestions || 0 }} Q</span>
             <span class="text-[#c0c4c8]">•</span>
             <span class="font-medium">{{ displayTimeLabel }}</span>
             <span class="text-[#c0c4c8]">•</span>
             <span class="font-medium">⭐ {{ localLikes || 0 }}</span>
         </div>
         <NuxtLink :to="to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')" class="inline-flex items-center justify-center px-3 py-1 bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-bold uppercase tracking-wide rounded transition-colors shadow-sm relative z-10">
            View
         </NuxtLink>
      </div>
    </div>
    
    <NuxtLink :to="to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')" class="absolute inset-0 z-0" aria-label="View Details"></NuxtLink>
  </div>

  <!-- Vertical variant (Desktop/Standard - Coursera Layout with Brand Colors) -->
  <div v-else :class="[
      'group relative flex w-full flex-col rounded-lg overflow-hidden transition-all duration-300 bg-white border border-slate-300/40 hover:shadow-md hover:border-slate-300/60 dark:bg-slate-900 dark:border-slate-700/40 p-3',
      props.clean ? 'shadow-none border-0' : 'shadow-sm'
    ]">
    
    <!-- Hero Image (Fixed height with gap and rounded corners) -->
    <div v-if="!props.hideImage" class="relative w-full h-40 bg-gradient-to-br from-brand-600 to-brand-700 overflow-hidden flex-shrink-0 rounded-md">
      <!-- Image with overlay if present -->
      <template v-if="resolvedCover">
        <img :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-md" />
      </template>
      
      <!-- Missing image: Burgundy background with white overlay -->
      <div v-else class="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 rounded-md">
        <Icon name="heroicons:play-circle" class="h-16 w-16 text-white/20" />
      </div>

      <!-- Status Badges overlaid on image -->
      <div v-if="quizTaken" class="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm z-20">
        <div class="text-center">
          <div class="text-3xl text-white mb-1">✓</div>
          <span class="text-white font-bold text-xs uppercase tracking-widest">Completed</span>
        </div>
      </div>

      <!-- Difficulty Badge (Top Left) -->
      <div v-if="difficultyLabel" class="absolute top-2 left-2 z-30">
        <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-700 shadow-sm border border-slate-200/50">
          {{ difficultyLabel }}
        </span>
      </div>

      <!-- Price Badge (Top Right) -->
      <span :class="['absolute top-2 right-2 z-30 inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm text-white', priceBadgeClass]">
        {{ priceBadgeLabel }}
      </span>

      <!-- Like Button (Bottom Right) -->
      <button @click.stop="toggleLike" class="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-brand-700 transition-all z-30 shadow-sm hover:shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="localLiked ? 'currentColor' : 'currentColor'" :class="['h-5 w-5', localLiked ? 'text-brand-700' : '']">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
        </svg>
      </button>
    </div>

    <!-- Content Section - Clean Minimal Design -->
    <div class="flex flex-col flex-1 bg-white dark:bg-slate-900">
       <!-- Topic/Partner Info -->
       <div v-if="displayTopic" class="text-[11px] uppercase font-semibold text-slate-600 dark:text-slate-400 tracking-wider mb-2">
          {{ displayTopic }}
       </div>

       <!-- Title - Simple Bold -->
       <h3 class="text-base leading-snug font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
         {{ displayTitle }}
       </h3>

       <!-- Skills/Description (like IBM card) -->
       <div v-if="props.description" class="mb-3">
         <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
           {{ props.description }}
         </p>
       </div>

       <!-- Meta Information -->
       <div class="mt-auto space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <!-- Subject & Grade & Level on one line -->
          <div v-if="displaySubject || (props.showGrade && displayGrade) || displayLevel" class="text-[12px] text-slate-600 dark:text-slate-400">
            <span v-if="displaySubject">{{ displaySubject }}</span>
            <span v-if="displaySubject && (props.showGrade && displayGrade || displayLevel)"> • </span>
            <span v-if="props.showGrade && displayGrade">{{ displayGrade }}</span>
            <span v-if="(props.showGrade && displayGrade) && displayLevel"> • </span>
            <span v-if="displayLevel">{{ displayLevel }}</span>
          </div>

          <!-- Questions & Time & Likes (always shown) -->
          <div class="flex items-center justify-between text-[12px] text-slate-600 dark:text-slate-400">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ displayQuestions || 0 }} Q</span>
              <span class="text-slate-400">•</span>
              <span class="font-medium">{{ displayTimeLabel }}</span>
              <span class="text-slate-400">•</span>
              <span class="flex items-center gap-0.5">
                ⭐ {{ localLikes || 0 }}
              </span>
            </div>
          </div>

          <!-- View Button -->
          <NuxtLink 
            :to="to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')"
            class="w-full mt-3 inline-flex items-center justify-center px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm relative z-10"
          >
            View
          </NuxtLink>
       </div>
    </div>
    
    <!-- Overall Link -->
    <NuxtLink :to="to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')" class="absolute inset-0 z-0" aria-label="View Details"></NuxtLink>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl } from '~/composables/useAssets'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import { useAuthStore } from '~/stores/auth'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const guestQuizStore = useGuestQuizStore()
const auth = useAuthStore()
const baseUrl = computed(() => {
  const base = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}quizzes` : `${base}/quizzes`
})

const props = defineProps({
  isPaid: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  horizontal: { type: Boolean, default: false },
  clean: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: [String, Object], default: '' },
  grade: { type: [String, Number, Object], default: null },
  topic: { type: [String, Object], default: '' },
  quiz: { type: Object, default: null },
  difficulty: { type: [String, Number], default: null },
  cover: { type: String, default: '' },
  palette: { type: String, default: '' },
  likes: { type: [Number, String], default: null },
  questionsCount: { type: [Number, String], default: null },
  quizId: { type: [String, Number], default: null },
  liked: { type: Boolean, default: false },
  attempted: { type: Boolean, default: false },
  attemptScore: { type: [Number, String], default: null },
  attemptCorrect: { type: [Number, String], default: null },
  attemptIncorrect: { type: [Number, String], default: null },
  attemptsCount: { type: [Number, String], default: 0 },
  showGrade: { type: Boolean, default: false },
  showSubject: { type: Boolean, default: true },
  showTopic: { type: Boolean, default: true },
  hideImage: { type: Boolean, default: false },
  startLink: { type: [String, Object], default: null },
  takeLink: { type: [String, Object], default: null },
  primaryOnRight: { type: Boolean, default: false },
  createdBy: {
    type: Object,
    default: () => null
  },
  quizMaster: { type: [String, Object], default: null },
  showEdit: { type: Boolean, default: false },
  editLink: { type: [String, Object], default: null }
})

const displaySubject = computed(() => {
  const s = props.subject || (props.quiz && (props.quiz.subject_name || props.quiz.topic?.subject?.name || props.quiz.subject?.name))
  if (!s && s !== 0) return ''
  if (typeof s === 'string') return s
  return s.name || s.title || s.label || s.slug || String(s.id || s || '')
})

const displayTitle = computed(() => {
  const raw = props.title || ''
  const topic = props.topic || (props.quiz && (props.quiz.topic_name || props.quiz.topic?.name)) || ''
  if (!raw) return ''
  if (!topic) return raw
  try {
    const rawNorm = String(raw).trim()
    const topicNorm = String(topic).trim()
    const separators = [' — ', ' - ', ' – ', ': ']
    for (const sep of separators) {
      const suffix = sep + topicNorm
      if (rawNorm.endsWith(suffix)) return rawNorm.slice(0, rawNorm.length - suffix.length).trim()
      const prefix = topicNorm + sep
      if (rawNorm.startsWith(prefix)) return rawNorm.slice(prefix.length).trim()
    }
    return rawNorm
  } catch (e) {
    return raw
  }
})

const displayTopic = computed(() => {
  const t = props.topic || (props.quiz && (props.quiz.topic_name || props.quiz.topic?.name))
  if (!t && t !== 0) return ''
  if (typeof t === 'string') return t
  return t.name || t.title || t.label || t.slug || String(t.id || t || '')
})

const displayGrade = computed(() => {
  // Check props first, then quiz object with grade_name field
  const g = props.grade || (props.quiz && (props.quiz.grade_name || props.quiz.grade?.name))
  if (!g && g !== 0) return ''
  if (typeof g === 'string') return g
  // If it's an object with name/title, extract it
  if (typeof g === 'object') return g.name || g.title || g.label || ''
  return ''
})

const displayLevel = computed(() => {
  // Check quiz object with level_name field (which handles course_name for tertiary)
  const l = props.quiz && (props.quiz.level_name || props.quiz.level?.name)
  if (!l && l !== 0) return ''
  if (typeof l === 'string') return l
  // If it's an object with name/title, extract it
  if (typeof l === 'object') return l.name || l.title || l.label || ''
  return ''
})

const displayQuestions = computed(() => {
  const q = props.questionsCount ?? (props.quiz && (props.quiz.questions_count ?? props.quiz.questions ?? props.quiz.items_count))
  if (!q && q !== 0) return 0
  return Number(q)
})

const displayTime = computed(() => {
  const seconds = props.quiz && props.quiz.timer_seconds
  if (!seconds) return null
  const minutes = Math.floor(seconds / 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m`
})

const displayTimeLabel = computed(() => {
  const time = displayTime.value
  return time || 'No limit'
})

const difficultyLabel = computed(() => {
  const d = props.difficulty
  if (d === null || d === undefined || d === '') return ''
  const num = Number(d)
  if (!isFinite(num)) return String(d)
  if (num <= 1.6) return 'Easy'
  if (num <= 2.3) return 'Medium'
  return 'Hard'
})

const difficultyBgClass = computed(() => {
  const d = props.difficulty
  const num = Number(d)
  if (!isFinite(num)) return 'bg-slate-500'
  if (num <= 1.6) return 'bg-emerald-500'
  if (num <= 2.3) return 'bg-amber-500'
  return 'bg-rose-500'
})

const isPaidComputed = computed(() => {
  // prefer explicit prop, otherwise check quiz object
  return Boolean(props.isPaid || (props.quiz && (props.quiz.is_paid === true || props.quiz.is_paid === 1)))
})

const priceBadgeLabel = computed(() => isPaidComputed.value ? 'Premium' : 'Free')
const priceBadgeClass = computed(() => isPaidComputed.value ? 'bg-amber-500 text-white' : 'bg-yellow-400 text-slate-900')

const emit = defineEmits(['like', 'edit'])
const localLikes = ref(Number(props.likes) || 0)
const localLiked = ref(Boolean(props.liked))
const quizTaken = ref(false)
const guestQuizLimitReached = ref(false)
const completedQuizPercentile = ref(null)
let likeInFlight = false
let likeTimeout = null

// Check if quiz has been taken in guest store
// Responsive: force horizontal layout on small screens (mobile) unless `horizontal` prop is explicitly provided
const isMobile = ref(false)
let _mq = null
function _updateMobile(e) {
  // e may be a MediaQueryListEvent or the MediaQueryList itself
  try {
    isMobile.value = e && typeof e.matches === 'boolean' ? e.matches : (typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false)
  } catch (err) {
    isMobile.value = false
  }
}

let echoChannel = null

onMounted(() => {
  guestQuizStore.initializeStore()
  const quizId = props.quizId || (props.quiz && props.quiz.id)
  if (quizId) {
    quizTaken.value = guestQuizStore.hasQuizBeenTaken(quizId)
  }

  // Check if guest has taken any quiz (free quiz limit = 1)
  const allResults = guestQuizStore.getAllResults()
  if (allResults.length > 0 && !auth.user) {
    guestQuizLimitReached.value = true
    // Get the percentile from the first completed quiz
    const firstResult = allResults[0]
    completedQuizPercentile.value = firstResult.percentile || null
  }

  if (process.client && typeof window !== 'undefined') {
    try {
      _mq = window.matchMedia('(max-width: 639px)')
      _updateMobile(_mq)
      if (_mq.addEventListener) _mq.addEventListener('change', _updateMobile)
      else if (_mq.addListener) _mq.addListener(_updateMobile)
    } catch (e) {
      // ignore
    }
  }

  // Subscribe to Echo channel for quiz updates (only if user is logged in)
  // Guests don't need real-time updates, so we skip subscription for them
  if (process.client && typeof window !== 'undefined' && window.Echo && quizId && auth.user) {
    try {
      echoChannel = window.Echo.private(`quiz.${quizId}`)
      echoChannel.listen('.App\\Events\\QuizLiked', (payload) => {
        if (payload && payload.quiz && payload.quiz.id == quizId) {
          if (!props.liked || (props.liked && payload.user && payload.user.id !== props.liked)) {
            localLikes.value = (localLikes.value || 0) + 1
          }
        }
      })
    } catch (e) {
      // Silently fail if Echo subscription fails
      echoChannel = null
    }
  }
})

onUnmounted(() => {
  if (_mq) {
    if (_mq.removeEventListener) _mq.removeEventListener('change', _updateMobile)
    else if (_mq.removeListener) _mq.removeListener(_updateMobile)
  }

  // Clean up Echo channel subscription
  if (echoChannel) {
    try {
      if (typeof echoChannel.stopListening === 'function') {
        echoChannel.stopListening('.App\\Events\\QuizLiked')
      }
      if (typeof echoChannel.leave === 'function') {
        echoChannel.leave()
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    echoChannel = null
  }
})

const isHorizontal = computed(() => Boolean(props.horizontal) || isMobile.value)

async function toggleLike(e) {
  e.stopPropagation()
  if (likeInFlight) return
  likeInFlight = true

  clearTimeout(likeTimeout)
  likeTimeout = setTimeout(async () => {
    const api = useApi()
    const alert = useAppAlert()
    const id = props.quizId || (props.to && String(props.to).split('/').pop())

    const wasLiked = localLiked.value
    localLiked.value = !wasLiked
    localLikes.value = Math.max(0, (localLikes.value || 0) + (localLiked.value ? 1 : -1))
    emit('like', { liked: localLiked.value })

    try {
      const endpoint = localLiked.value ? `/api/quizzes/${id}/like` : `/api/quizzes/${id}/unlike`
      const res = await api.postJson(endpoint, {})
      if (api.handleAuthStatus(res)) {
        alert.push({ message: 'Session expired — please sign in again', type: 'warning' })
        localLiked.value = wasLiked
        localLikes.value = Math.max(0, (localLikes.value || 0) + (wasLiked ? 1 : -1))
        return
      }
      if (!res.ok) throw new Error('Like/Unlike failed')
      if (res.likes_count !== undefined) localLikes.value = res.likes_count
    } catch (err) {
      localLiked.value = wasLiked
      localLikes.value = Math.max(0, (localLikes.value || 0) + (wasLiked ? 1 : -1))
      console.error('Like/Unlike failed', err)
    } finally {
      likeInFlight = false
    }
  }, 180)
}

const resolvedCover = computed(() => {
  const v = props.cover
  if (!v) return ''
  return resolveAssetUrl(v) || ''
})

defineExpose({
  resolvedCover
})
</script>

