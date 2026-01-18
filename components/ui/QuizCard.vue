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
         <button @click.stop="toggleLike" class="text-slate-400 hover:text-rose-500 transition-colors p-1 -mr-1 -mt-1 relative z-10">
            <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" :class="localLiked ? 'text-rose-500' : ''" />
         </button>
      </div>

      <!-- Meta / Footer -->
      <div class="mt-auto flex items-center justify-between text-xs text-[#6a6f73]">
         <div class="flex items-center gap-1">
             <span class="text-[#6a6f73]">{{ localLikes }} likes</span>
         </div>
         <!-- Arrow for clickability hint -->
         <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-300" />
      </div>
    </div>
    
    <NuxtLink :to="to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')" class="absolute inset-0 z-0" aria-label="View Details"></NuxtLink>
  </div>

  <!-- Vertical variant (Desktop/Standard) -->
  <div v-else :class="[
      'group relative flex w-full flex-col rounded-xl overflow-hidden transition-all duration-300 h-full bg-card',
      props.clean ? 'shadow-none border-0' : 'shadow-card border border-border/50 dark:border-border/50 dark:bg-slate-900'
    ]">
    
    <!-- Hero Image (Aspect Ratio 16:9 approx) - Only show if not hideImage -->
    <div v-if="!props.hideImage" class="relative w-full aspect-video h-28 bg-[#800020] overflow-hidden">
      <template v-if="resolvedCover">
        <img :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent dark:from-card pointer-events-none z-10" />
      </template>
      <div v-else class="h-full w-full flex items-center justify-center text-white/50 bg-gradient-to-br from-[#800020] to-red-900">
        <Icon name="heroicons:academic-cap" class="h-14 w-14 opacity-50" />
      </div>

      <!-- Already Taken Badge -->
      <div v-if="quizTaken" class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
        <div class="text-center">
          <div class="text-4xl mb-2">✓</div>
          <span class="text-white font-semibold text-sm">Already Taken</span>
        </div>
      </div>

      <!-- Difficulty Label (Tag style) -->
      <div v-if="difficultyLabel" class="absolute top-2 left-2 pb-px z-20">
         <span class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm border border-black/5">
            {{ difficultyLabel }}
         </span>
      </div>

    <!-- Price Badge -->
    <div class="absolute top-2 right-2 pb-px z-20">
      <span :class="['inline-flex px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm', priceBadgeClass]">
        {{ priceBadgeLabel }}
      </span>
    </div>

      <!-- Like Button Overlay -->
      <button @click.stop="toggleLike" class="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-slate-500 hover:text-rose-500 shadow-sm backdrop-blur-sm transition-colors z-20">
         <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" :class="localLiked ? 'text-rose-500' : ''" />
      </button>
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 p-4">
       <!-- Header: Topic/Org -->
       <div class="flex items-center justify-between mb-2">
          <div v-if="displayTopic" class="flex items-center gap-1.5">
             <div class="w-5 h-5 rounded overflow-hidden bg-brand-50 flex-shrink-0 flex items-center justify-center text-[10px] text-brand-700 font-bold">
                 {{ displayTopic.charAt(0) }}
             </div>
             <span class="text-[13px] font-medium text-[#6a6f73] truncate max-w-[150px]">{{ displayTopic }}</span>
          </div>
          <span v-else class="text-[13px] font-medium text-[#6a6f73]">Quiz</span>
       </div>

       <!-- Title -->
       <h3 class="text-[16px] leading-[22px] font-semibold text-[#1f1f1f] dark:text-white line-clamp-2 mb-1 transition-colors">
         {{ displayTitle }}
       </h3>

       <!-- Subtitle / Description -->
       <p v-if="displaySubject" class="text-[12px] text-[#6a6f73] mb-4 truncate">
         {{ displaySubject }} {{ displayLevel ? `• ${displayLevel}` : '' }}
       </p>
       <div v-else class="mb-4"></div>

       <!-- Footer Action -->
       <div class="mt-auto flex items-center justify-between">
          <div class="flex items-center gap-2 text-[12px] text-[#6a6f73]">
            <span class="font-medium text-slate-700">{{ localLikes }} likes</span>
            <span class="border-l border-slate-300 h-3 mx-0.5" v-if="displayQuestions"></span>
            <span v-if="displayQuestions" class="truncate">{{ displayQuestions }} Qs</span>
          </div>

          <button
            v-if="quizTaken"
            disabled
            class="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-200 cursor-not-allowed"
          >
            ✓ Taken
          </button>
            <NuxtLink 
            v-else
            :to="startLink || takeLink || to || (props.quiz?.slug ? `/quizzes/${props.quiz.slug}` : '#')" 
            class="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors shadow-sm relative z-10"
          >
            Start
          </NuxtLink>
       </div>
    </div>
    
  <!-- Overall Link (z-0 to allow buttons to be clicked) -->
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
const priceBadgeClass = computed(() => isPaidComputed.value ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white')

const emit = defineEmits(['like', 'edit'])
const localLikes = ref(Number(props.likes) || 0)
const localLiked = ref(Boolean(props.liked))
const quizTaken = ref(false)
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

