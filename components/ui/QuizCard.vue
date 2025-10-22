
<template>
  <div class="group relative flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 hover:scale-[1.02]">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
    <div class="relative h-32 overflow-hidden rounded-t-2xl bg-slate-100 sm:h-40">
      <img v-if="cover" :src="cover" :alt="title" class="h-full w-full object-cover" />
      <div v-else :class="['grid h-full w-full place-items-center font-bold', paletteClass]">
        <span class="text-2xl text-white">{{ (title || '').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <!-- Grade badge (top-left) -->
      <div v-if="showGrade && displayGrade" class="absolute left-3 top-3 z-10">
        <div class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm dark:bg-slate-800/70 dark:text-slate-100">
          Grade {{ displayGrade }}
        </div>
      </div>

      <!-- Like button (top-right) -->
      <button @click.stop="toggleLike" aria-label="Like quiz" class="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 p-2 text-rose-500 shadow-sm transition-transform hover:scale-105 dark:bg-slate-800/80">
        <Icon :name="localLiked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-5 w-5" />
        <span v-if="localLikes > 0" class="pr-1 text-xs font-medium text-slate-700 dark:text-slate-200">{{ localLikes }}</span>
      </button>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <!-- Title -->
      <h4 class="text-base font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">{{ title }}</h4>

      <!-- Description -->
      <p v-if="description" class="mt-1 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ description }}</p>

      <!-- Metadata -->
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800">
        <div v-if="difficultyLabel" :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold', difficultyClass]">
          <Icon name="heroicons:chart-bar" class="h-4 w-4" />
          {{ difficultyLabel }}
        </div>
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:question-mark-circle" class="h-4 w-4" />
          <span>{{ questionsCount }} {{ questionsCount === 1 ? 'question' : 'questions' }}</span>
        </div>
      </div>

      <!-- Topic and Subject -->
      <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span v-if="showSubject && displaySubject" class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:academic-cap" class="h-4 w-4" />
          {{ displaySubject }}
        </span>
        <span v-if="showTopic && displayTopic" class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:book-open" class="h-4 w-4" />
          {{ displayTopic }}
        </span>
      </div>

      <!-- Creator Info & Actions -->
      <div class="mt-auto flex items-center gap-3 pt-4">
        <div v-if="createdBy" class="flex flex-1 items-center gap-2">
          <div class="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            <img v-if="createdBy.avatar" :src="createdBy.avatar" :alt="createdBy.name" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-xs font-semibold text-slate-600">
              {{ createdBy.name?.[0]?.toUpperCase() || 'U' }}
            </div>
          </div>
          <NuxtLink :to="`/quiz-masters/${createdBy.id}`" class="relative z-10 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
            {{ createdBy.name }}
          </NuxtLink>
        </div>

        <!-- CTAs -->
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: [String, Object], default: '' },
  grade: { type: [String, Number, Object], default: null },
  topic: { type: [String, Object], default: '' },
  // optional: whole quiz object can be passed instead of individual fields
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
  // Quiz master info
  createdBy: { 
    type: Object, 
    default: () => null
  },
  // admin/edit support
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
  // handle object shapes
  return s.name || s.title || s.label || s.slug || String(s.id || s || '')
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

const computedCreatedBy = computed(() => {
  if (props.createdBy) return props.createdBy
  if (!props.quiz) return null
  // common shapes: quiz.created_by or quiz.user
  return props.quiz.created_by || props.quiz.user || null
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
const config = useRuntimeConfig()

const primaryHref = computed(() => {
  // prefer explicit takeLink, fallback to `to` prop
  return props.takeLink || props.to || null
})


async function toggleLike(e) {
  e.stopPropagation()
  if (likeInFlight) return
  likeInFlight = true

  // debounce multiple rapid clicks into a single intent
  clearTimeout(likeTimeout)
  likeTimeout = setTimeout(async () => {
    const api = useApi()
    const alert = useAppAlert()
    const id = props.quizId || (props.to && String(props.to).split('/').pop())

    // optimistic UI update
    const wasLiked = localLiked.value
    localLiked.value = !wasLiked
    localLikes.value = Math.max(0, (localLikes.value || 0) + (localLiked.value ? 1 : -1))
    emit('like', { liked: localLiked.value })

    try {
      const endpoint = localLiked.value ? `/api/quizzes/${id}/like` : `/api/quizzes/${id}/unlike`
      const res = await api.postJson(endpoint, {})
      if (api.handleAuthStatus(res)) {
        alert.push({ message: 'Session expired \u2014 please sign in again', type: 'warning' })
        // revert optimistic state until user logs back in
        localLiked.value = wasLiked
        localLikes.value = Math.max(0, (localLikes.value || 0) + (wasLiked ? 1 : -1))
        return
      }
      if (!res.ok) throw new Error('Like/Unlike failed')
      // if server returns authoritative likes_count, prefer it (not required)
      if (res.likes_count !== undefined) localLikes.value = res.likes_count
    } catch (err) {
      // revert optimistic on failure
      localLiked.value = wasLiked
      localLikes.value = Math.max(0, (localLikes.value || 0) + (wasLiked ? 1 : -1))
      console.error('Like/Unlike failed', err)
    } finally {
      likeInFlight = false
    }
  }, 180)
}

// Attach Echo listener to adjust likes when broadcasted
if (process.client && typeof window !== 'undefined' && window.Echo) {
  const quizId = props.quizId || null
  if (quizId) {
    try {
      const ch = window.Echo.private(`quiz.${quizId}`)
      ch.listen('.App\\Events\\QuizLiked', (payload) => {
        // payload.quiz.id, payload.user
        // Increment likes if someone else liked it
        if (payload && payload.quiz && payload.quiz.id == quizId) {
          // avoid changing local likes if the event came from this user
          if (!props.liked || (props.liked && payload.user && payload.user.id !== props.liked)) {
            localLikes.value = (localLikes.value || 0) + 1
          }
        }
      })
    } catch (e) {
      // ignore Echo attach failures
      console.error('Echo attach failed for quiz liked', e)
    }
  }
}

function handleEdit(e) {
  e.stopPropagation()
  emit('edit')
}
</script>
