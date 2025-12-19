<template>
  <!-- Horizontal variant: icon/image on the left, content on the right -->
  <div v-if="props.horizontal" :class="[
      'group relative w-full flex flex-row rounded-2xl p-4 transition-all duration-300 gap-4',
      props.clean ? 'bg-transparent border-transparent shadow-none' : 'bg-white shadow hover:shadow-md border border-slate-100 dark:border-slate-800/20 dark:bg-slate-900'
    ]">
    <!-- Icon/Image Container -->
    <div class="relative flex-shrink-0 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl overflow-hidden bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105">
      <img v-if="resolvedCover" :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover" />
      <Icon v-else name="heroicons:book-open" class="h-10 w-10 text-slate-400" />

      <!-- Difficulty badge placed over the image for horizontal layout (right side) -->
      <div v-if="difficultyLabel" class="absolute right-3 top-3 z-10">
        <div :class="['rounded-full px-3 py-1 text-xs font-semibold text-white', difficultyBgClass]">
          {{ difficultyLabel }}
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex flex-col flex-grow min-w-0">
  <!-- Allow long titles to wrap to the next line(s) in horizontal layout -->
  <h4 class="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 whitespace-normal break-words">{{ displayTitle }}</h4>
      <p v-if="description" class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">{{ description }}</p>

      <div class="mt-auto pt-3 flex flex-wrap items-center gap-2">
        <span v-if="displayLevel" class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{{ displayLevel }}</span>
        <span v-if="displayGrade" class="inline-flex items-center rounded-full bg-brand-600/10 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-600/30 dark:text-accent-500">{{ displayGrade }}</span>
        <span v-if="showSubject && displaySubject" class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{{ displaySubject }}</span>
        <span v-if="showTopic && displayTopic" class="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">{{ displayTopic }}</span>
  <!-- difficulty badge moved to image overlay for horizontal layout -->

        <NuxtLink :to="to || (quizId ? `/quizzes/${props.quiz?.slug || quizId}` : '#')" class="ml-auto inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold text-white" :style="{ backgroundColor: '#891f21' }">View Details</NuxtLink>
      </div>
    </div>
  </div>

  <!-- Default vertical card (existing layout) -->
  <div v-else :class="[
      'group relative flex w-full flex-col rounded-2xl transition-all duration-300',
      props.clean ? 'bg-transparent border-transparent shadow-none' : 'bg-white shadow hover:shadow-md border border-slate-100 dark:border-slate-800/20 dark:bg-slate-900'
    ]">
    <!-- Hero Section with smaller image for compact card -->
    <div class="relative h-40 sm:h-44 overflow-hidden rounded-t-2xl" :style="{ background: 'linear-gradient(to bottom right, #891f21, #a83435)' }">
      <!-- Background Image if available (no overlay so image is fully visible) -->
      <img v-if="resolvedCover" :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover" />

      <!-- Difficulty Badge - Top Left (smaller) -->
      <div v-if="difficultyLabel" class="absolute left-3 top-3 z-10">
        <div :class="['rounded-full px-3 py-1 text-xs font-semibold text-white', difficultyBgClass]">
          {{ difficultyLabel }}
        </div>
      </div>

      <!-- Heart/Like Button - Top Right (keep) -->
      <button @click.stop="toggleLike" aria-label="Like quiz" class="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-rose-500 shadow-sm transition-transform hover:scale-110 dark:bg-slate-800/80">
        <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" />
        <span class="text-xs font-semibold">{{ localLikes }}</span>
      </button>

      <!-- Share Button - Bottom Right -->
      <div class="absolute bottom-3 right-3 z-10">
        <AffiliateShareButton 
          v-if="quizId"
          :itemType="'Quiz'"
          :itemId="quizId"
          :itemSlug="props.quiz?.slug"
          :baseUrl="baseUrl"
          :btnClass="'inline-flex items-center justify-center p-2 rounded-full border border-slate-200 text-slate-700 shadow-sm hover:shadow-md transition-transform hover:scale-105 dark:border-slate-800/30 dark:bg-slate-800/5 dark:text-slate-300'"
          :iconOnly="true"
          @click.stop
        />
      </div>
    </div>

    <!-- Content Section (compact) -->
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <!-- Title -->
      <h4 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{{ displayTitle }}</h4>

      <!-- Topic (smaller, muted) -->
      <div v-if="displayTopic" class="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{{ displayTopic }}</div>

      <!-- Level Badge only -->
      <div class="mt-2">
        <span v-if="displayLevel" class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{{ displayLevel }}</span>
      </div>

      <!-- Meta Information (likes and questions) -->
      <div class="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <div class="inline-flex items-center gap-1">
          <Icon name="heroicons:heart" class="h-4 w-4 text-rose-500" />
          <span class="font-medium">{{ localLikes }}</span>
        </div>

        <div class="inline-flex items-center gap-1">
          <Icon name="heroicons:collection" class="h-4 w-4" />
          <span class="font-medium">{{ displayQuestions }} questions</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="mt-auto pt-3">
        <NuxtLink
          v-if="!showEdit || !quizId"
          :to="to || (quizId ? `/quiz-master/quizzes/${props.quiz?.slug || quizId}` : '#')"
          class="mt-2 block w-full text-center inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white transition active:scale-95"
          :style="{ backgroundColor: '#891f21' }"
        >
          Start Quiz
        </NuxtLink>

        <div v-else class="flex gap-3">
          <NuxtLink
            :to="to || (quizId ? `/quiz-master/quizzes/${props.quiz?.slug || quizId}` : '#')"
            class="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:shadow-sm"
          >
            Details
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl } from '~/composables/useAssets'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const baseUrl = computed(() => {
  const base = config.public?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  return base.endsWith('/') ? `${base}quizzes` : `${base}/quizzes`
})

const props = defineProps({
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

const emit = defineEmits(['like', 'edit'])
const localLikes = ref(Number(props.likes) || 0)
const localLiked = ref(Boolean(props.liked))
let likeInFlight = false
let likeTimeout = null

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

if (process.client && typeof window !== 'undefined' && window.Echo) {
  const quizId = props.quizId || null
  if (quizId) {
    try {
      const ch = window.Echo.private(`quiz.${quizId}`)
      ch.listen('.App\\Events\\QuizLiked', (payload) => {
        if (payload && payload.quiz && payload.quiz.id == quizId) {
          if (!props.liked || (props.liked && payload.user && payload.user.id !== props.liked)) {
            localLikes.value = (localLikes.value || 0) + 1
          }
        }
      })
    } catch (e) {
      console.error('Echo attach failed for quiz liked', e)
    }
  }
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

