
<template>
  <div class="w-full group block rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 hover:scale-[1.01] overflow-hidden relative">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
  <div class="relative h-28 sm:h-40 bg-gray-100 overflow-hidden">
      <img v-if="cover" :src="cover" alt="cover" class="w-full h-full object-cover" />
      <div v-else :class="['w-full h-full grid place-items-center font-bold', paletteClass]">
        <span class="text-white text-2xl">{{ (title||'').charAt(0).toUpperCase() }}</span>
      </div>
          <!-- Grade badge (top-left) -->
          <div v-if="showGrade && displayGrade" class="absolute left-3 top-3 z-30">
            <div class="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/70 text-xs font-semibold text-gray-800 dark:text-gray-100">Grade {{ displayGrade }}</div>
          </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      <div class="absolute left-4 bottom-4 right-4 text-white z-10">
        <h4 class="text-lg sm:text-xl font-semibold line-clamp-2">{{ title }}</h4>
      </div>
      <button @click.stop="toggleLike" aria-label="Like quiz" class="absolute top-2 right-2 z-20 bg-white/90 dark:bg-slate-800/80 rounded-full p-2 shadow-sm hover:scale-105 transition-transform inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span class="text-xs text-gray-700 dark:text-gray-200">{{ localLikes }}</span>
      </button>
    </div>
  <div class="p-3 sm:p-4 flex flex-col gap-3">
      <div>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500 flex flex-wrap items-center gap-2">
            <span v-if="showSubject && displaySubject">{{ displaySubject }}</span>
            <span v-if="showTopic && displayTopic">{{ displayTopic }}</span>
          </div>
          <div v-if="difficultyLabel" :class="['px-2 py-0.5 rounded-full text-xs font-semibold', difficultyClass]">{{ difficultyLabel }}</div>
        </div>
        <div class="mt-2 text-sm text-gray-600">{{ questionsCount }} questions</div>
        <div v-if="description" class="mt-2 text-sm text-gray-700 line-clamp-3">{{ description }}</div>
      </div>

      <!-- Footer CTAs: primary (Take) and secondary (View/Preview) -->
          <div class="mt-auto flex gap-3">
            <template v-if="primaryOnRight">
                <NuxtLink v-if="startLink" :to="startLink" class="flex-1 inline-flex justify-center items-center px-3 py-3 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200">Open</NuxtLink>
                <NuxtLink v-if="primaryHref" :to="primaryHref" class="flex-1 inline-flex justify-center items-center px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold">Take Quiz</NuxtLink>
              </template>
              <template v-else>
                <NuxtLink v-if="primaryHref" :to="primaryHref" class="flex-1 inline-flex justify-center items-center px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold">Take Quiz</NuxtLink>
                <NuxtLink v-if="startLink" :to="startLink" class="flex-1 inline-flex justify-center items-center px-3 py-3 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200">Open</NuxtLink>
              </template>

            <!-- optional edit CTA for admins/content managers -->
            <div v-if="showEdit" class="flex-1">
              <button @click.stop="handleEdit" v-if="!editLink" class="w-full inline-flex justify-center items-center px-3 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">Edit</button>
              <NuxtLink v-else :to="editLink" class="w-full inline-flex justify-center items-center px-3 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">Edit</NuxtLink>
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
  to: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: [String, Object], default: '' },
  grade: { type: [String, Number, Object], default: null },
  topic: { type: [String, Object], default: '' },
  difficulty: { type: [String, Number], default: null },
  cover: { type: String, default: '' },
  palette: { type: String, default: '' },
  likes: { type: [Number, String], default: null },
  questionsCount: { type: [Number, String], default: null },
  quizId: { type: [String, Number], default: null },
  liked: { type: Boolean, default: false },
  showGrade: { type: Boolean, default: false },
  showSubject: { type: Boolean, default: false },
  showTopic: { type: Boolean, default: true },
  startLink: { type: [String, Object], default: null },
  takeLink: { type: [String, Object], default: null }
  ,
  primaryOnRight: { type: Boolean, default: false }
  ,
  // admin/edit support
  showEdit: { type: Boolean, default: false },
  editLink: { type: [String, Object], default: null }
})

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-gradient-to-br from-indigo-400 to-indigo-600'
})

const displaySubject = computed(() => {
  const s = props.subject
  if (!s && s !== 0) return ''
  if (typeof s === 'string') return s
  // handle object shapes
  return s.name || s.title || s.label || s.slug || String(s.id || '')
})

const displayTopic = computed(() => {
  const t = props.topic
  if (!t && t !== 0) return ''
  if (typeof t === 'string') return t
  return t.name || t.title || t.label || t.slug || String(t.id || '')
})

const displayGrade = computed(() => {
  const g = props.grade
  if (g === null || g === undefined || g === '') return ''
  if (typeof g === 'string' || typeof g === 'number') return g
  return g.name || g.title || g.label || String(g.id || '')
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
const config = useRuntimeConfig()

const primaryHref = computed(() => {
  // prefer explicit takeLink, fallback to `to` prop
  return props.takeLink || props.to || null
})

function handleEdit(e) {
  e.stopPropagation()
  emit('edit')
}

async function toggleLike(e) {
  e.stopPropagation()
  if (!localLiked.value) {
    localLikes.value = (localLikes.value || 0) + 1
    localLiked.value = true
    emit('like', { liked: true })
    try {
      const api = useApi()
      const alert = useAppAlert()
      const id = props.quizId || (props.to && String(props.to).split('/').pop())
      const res = await api.postJson(`/api/quizzes/${id}/like`, {})
      if (api.handleAuthStatus(res)) {
        alert.push({ message: 'Session expired — please sign in again', type: 'warning' })
        return
      }
      if (!res.ok) throw new Error('Like failed')
    } catch (err) {
      localLikes.value = Math.max(0, (localLikes.value || 1) - 1)
      localLiked.value = false
      console.error('Like failed', err)
    }
  } else {
    localLikes.value = Math.max(0, (localLikes.value || 1) - 1)
    localLiked.value = false
    emit('like', { liked: false })
    try {
      const api = useApi()
      const alert = useAppAlert()
      const id = props.quizId || (props.to && String(props.to).split('/').pop())
      const res = await api.postJson(`/api/quizzes/${id}/unlike`, {})
      if (api.handleAuthStatus(res)) {
        alert.push({ message: 'Session expired — please sign in again', type: 'warning' })
        return
      }
      if (!res.ok) throw new Error('Unlike failed')
    } catch (err) {
      localLikes.value = (localLikes.value || 0) + 1
      localLiked.value = true
      console.error('Unlike failed', err)
    }
  }
}
</script>
