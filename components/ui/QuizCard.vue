<template>
  <div class="group relative flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 hover:scale-[1.02]">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
    <div class="relative h-32 overflow-hidden rounded-t-2xl bg-slate-100 sm:h-40">
  <img v-if="resolvedCover" :src="resolvedCover" :alt="displayTitle || title" class="h-full w-full object-cover" />
      <div v-else :class="['grid h-full w-full place-items-center font-bold text-white', paletteClass]">
        <span class="text-2xl">{{ (displayTitle || title || '').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <div v-if="badgeLabel" class="absolute left-3 top-3 z-10">
        <div class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm dark:bg-slate-800/70 dark:text-slate-100">
          {{ badgeLabel }}
        </div>
      </div>

      <button @click.stop="toggleLike" aria-label="Like quiz" class="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 p-2 text-rose-500 shadow-sm transition-transform hover:scale-105 dark:bg-slate-800/80">
        <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-5 w-5" />
        <span v-if="localLikes > 0" class="pr-1 text-xs font-medium text-slate-700 dark:text-slate-200">{{ localLikes }}</span>
      </button>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-start justify-between gap-3">
        <h4 class="text-base font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">{{ displayTitle }}</h4>

        <component :is="creatorHref ? 'NuxtLink' : 'div'" :to="creatorHref" class="relative z-10 inline-flex items-center justify-center" @click.stop>
          <div class="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            <img v-if="avatarSrc" :src="avatarSrc" :alt="avatarAlt" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-xs font-semibold text-slate-600">
              <template v-if="avatarInitial">
                {{ avatarInitial }}
              </template>
              <template v-else>
                <Icon name="heroicons:user" class="h-4 w-4 text-slate-500" />
              </template>
            </div>
          </div>
        </component>
      </div>

      <p v-if="description" class="mt-2 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ description }}</p>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800">
        <div v-if="difficultyLabel" :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold', difficultyClass]">
          <Icon name="heroicons:chart-bar" class="h-4 w-4" />
          {{ difficultyLabel }}
        </div>
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:question-mark-circle" class="h-4 w-4" />
          <span>{{ questionsCount }} {{ questionsCount === 1 ? 'question' : 'questions' }}</span>
        </div>
        <div v-if="showGrade && displayGrade" class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:academic-cap" class="h-4 w-4" />
          <span>{{ isCourse ? `Course ${displayGrade}` : `Grade ${displayGrade}` }}</span>
        </div>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span v-if="showSubject && displaySubject" class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:bookmark" class="h-4 w-4" />
          {{ displaySubject }}
        </span>
        <span v-if="showTopic && displayTopic" class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:book-open" class="h-4 w-4" />
          {{ displayTopic }}
        </span>
      </div>

      <div class="mt-auto flex items-center gap-3 pt-4">
        <div class="relative z-10 flex items-center gap-2">
          <NuxtLink v-if="to || quizId" :to="to || `/quiz-master/quizzes/${quizId}`" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            View Details
          </NuxtLink>
          <NuxtLink v-if="primaryHref" :to="primaryHref" class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
            Take Quiz
          </NuxtLink>
          <button @click.stop="handleEdit" v-if="showEdit && !editLink" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Edit
          </button>
          <NuxtLink v-if="showEdit && editLink" :to="editLink" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Edit
          </NuxtLink>
          <AffiliateShareButton 
            v-if="quizId"
            :itemType="'Quiz'"
            :itemId="quizId"
            :baseUrl="baseUrl"
            class="relative z-10"
            @click.stop
          />
        </div>
      </div>
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

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-indigo-500'
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

const displayGrade = computed(() => {
  const g = props.grade || (props.quiz && (props.quiz.grade || props.quiz.grade_id ? props.quiz.grade : null))
  if (g === null || g === undefined || g === '') return ''
  if (typeof g === 'string' || typeof g === 'number') return g
  return g.name || g.title || g.label || String(g.id || g || '')
})

const displayLevel = computed(() => {
  const g = props.grade || (props.quiz && (props.quiz.grade || props.quiz.grade_id ? props.quiz.grade : null))
  if (g && typeof g === 'object') {
    const lvl = g.level || g.level_id || g.levelId
    if (lvl) return typeof lvl === 'string' || typeof lvl === 'number' ? String(lvl) : lvl.name || String(lvl.id || '')
  }
  const ql = props.quiz && props.quiz.level ? props.quiz.level : null
  if (ql) return ql.name || String(ql.id || '')
  return ''
})

const badgeLabel = computed(() => {
  if (displayLevel.value) return displayLevel.value
  if (props.showGrade && displayGrade.value) return isCourse.value ? `Course ${displayGrade.value}` : `Grade ${displayGrade.value}`
  return ''
})

const isCourse = computed(() => {
  const g = props.grade || (props.quiz && (props.quiz.grade || props.quiz.grade_id ? props.quiz.grade : null))
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course'
})

const computedCreatedBy = computed(() => {
  if (props.createdBy) return props.createdBy
  if (props.quizMaster) {
    if (typeof props.quizMaster === 'object') return props.quizMaster
    return { id: null, name: String(props.quizMaster), avatar: null }
  }
  if (!props.quiz) return null
  return props.quiz.created_by || props.quiz.user || null
})

const avatarInitial = computed(() => {
  const c = computedCreatedBy.value
  if (!c) return ''
  const maybe = c.name || c.full_name || c.username || c.email || ''
  const trimmed = String(maybe || '').trim()
  if (trimmed.length) return trimmed.charAt(0).toUpperCase()
  return ''
})

const avatarSrc = computed(() => {
  const c = computedCreatedBy.value
  if (c && c.avatar) {
    const v = c.avatar
    // if absolute URL or data/blob, return as-is; otherwise prefix with apiBase
    try {
      if (/^(?:https?:)?\/\//.test(v) || /^(?:data:|blob:)/.test(v)) return v
    } catch (e) {}
    const base = config.public?.apiBase || ''
    if (!base) return v.startsWith('/') ? v : `/${v}`
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
    const cleanPath = v.startsWith('/') ? v : `/${v}`
    return `${cleanBase}${cleanPath}`
  }
  return ''
})

const avatarAlt = computed(() => {
  const c = computedCreatedBy.value
  if (!c) return 'Quiz master'
  return c.name || c.full_name || c.username || 'Quiz master'
})

const creatorHref = computed(() => {
  const c = computedCreatedBy.value
  if (c && c.id) return `/quiz-masters/${c.id}`
  return null
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

const difficultyClass = computed(() => {
  const d = props.difficulty
  const num = Number(d)
  if (!isFinite(num)) return 'bg-gray-200 text-gray-800'
  if (num <= 1.6) return 'bg-emerald-100 text-emerald-800'
  if (num <= 2.3) return 'bg-amber-100 text-amber-800'
  return 'bg-rose-100 text-rose-800'
})

const emit = defineEmits(['like', 'edit'])
const localLikes = ref(Number(props.likes) || 0)
const localLiked = ref(Boolean(props.liked))
let likeInFlight = false
let likeTimeout = null

// Only treat explicit `takeLink` as the primary "Take Quiz" action.
// Do not use `to` as the take link; `to` is used as the clickable overlay
// or detail page in listing contexts (e.g., quiz-master). This prevents
// showing a "Take Quiz" button on quiz-master list views where `to` is set.
const primaryHref = computed(() => {
  return props.takeLink || null
})

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

function handleEdit(e) {
  e.stopPropagation()
  emit('edit')
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

// expose resolvedCover to parent if required (avoid `export` inside <script setup>)
defineExpose({
  resolvedCover
})
</script>
