<template>
  <div class="group relative flex w-full flex-col rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900">
    <!-- Hero Section with Play Button -->
    <div class="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700">
      <!-- Background Image if available -->
      <img v-if="resolvedCover" :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover opacity-40" />
      
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-teal-500/80 to-teal-600/80 dark:from-teal-600/80 dark:to-teal-700/80"></div>

      <!-- Play Button Icon (centered) -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="rounded-full bg-white/20 p-4 backdrop-blur-sm">
          <Icon name="heroicons:play-solid" class="h-12 w-12 text-white" />
        </div>
      </div>

      <!-- Difficulty Badge - Top Left -->
      <div v-if="difficultyLabel" class="absolute left-4 top-4 z-10">
        <div :class="['rounded-full px-4 py-1.5 text-xs font-semibold text-white', difficultyBgClass]">
          {{ difficultyLabel }}
        </div>
      </div>

      <!-- Heart/Like Button - Top Right -->
      <button @click.stop="toggleLike" aria-label="Like quiz" class="absolute right-4 top-4 z-10 inline-flex items-center justify-center rounded-full bg-white/90 p-3 text-rose-500 shadow-sm transition-transform hover:scale-110 dark:bg-slate-800/80">
        <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-5 w-5" />
      </button>

      <!-- Share Button - Bottom Right -->
      <div class="absolute bottom-4 right-4 z-10">
        <AffiliateShareButton 
          v-if="quizId"
          :itemType="'Quiz'"
          :itemId="quizId"
          :baseUrl="baseUrl"
          class="inline-flex items-center justify-center rounded-full bg-white/90 p-3 text-slate-700 shadow-sm transition-transform hover:scale-110 dark:bg-slate-800/80 dark:text-slate-300"
          @click.stop
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Title -->
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{{ displayTitle }}</h4>

      <!-- Description -->
      <p v-if="description" class="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
        {{ description }}
      </p>

      <!-- Meta Information -->
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <!-- Questions Count -->
        <div class="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:star" class="h-4 w-4" />
          <span class="font-medium">{{ localLikes }}</span>
        </div>

        <!-- Duration/Time -->
        <div class="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:clock" class="h-4 w-4" />
          <span class="font-medium">{{ questionsCount }}m</span>
        </div>
      </div>

      <!-- Subject/Topic Tags -->
      <div v-if="showSubject && displaySubject || showTopic && displayTopic" class="mt-4 flex flex-wrap gap-2">
        <span v-if="showSubject && displaySubject" class="inline-block rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ displaySubject }}
        </span>
        <span v-if="showTopic && displayTopic" class="inline-block rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ displayTopic }}
        </span>
      </div>

      <!-- CTA Button -->
      <NuxtLink 
        :to="to || (quizId ? `/quiz-master/quizzes/${quizId}` : '#')" 
        class="mt-auto pt-4 inline-flex w-full items-center justify-center rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        Start Quiz
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
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
  const s = props.subject || (props.quiz && (props.quiz.subject || props.quiz.subject_id ? props.quiz.subject : null))
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
  const t = props.topic || (props.quiz && (props.quiz.topic || props.quiz.topic_id ? props.quiz.topic : null))
  if (!t && t !== 0) return ''
  if (typeof t === 'string') return t
  return t.name || t.title || t.label || t.slug || String(t.id || t || '')
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
  try {
    if (/^(?:https?:)?\/\//.test(v) || /^(?:data:|blob:)/.test(v)) return v
  } catch (e) {}
  const base = config.public?.apiBase || ''
  if (!base) return v.startsWith('/') ? v : `/${v}`
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = v.startsWith('/') ? v : `/${v}`
  return `${cleanBase}${cleanPath}`
})

defineExpose({
  resolvedCover
})
</script>
