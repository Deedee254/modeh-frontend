<template>
  <div class="group relative flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 hover:scale-[1.02]">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
    <div class="relative h-32 overflow-hidden rounded-t-2xl bg-slate-100 sm:h-40">
      <img v-if="image" :src="image" :alt="displayTitle" class="h-full w-full object-cover" />
      <div v-else :class="['grid h-full w-full place-items-center font-bold', paletteClass]">
        <span class="text-2xl text-white">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <!-- Grade badge (top-left) -->
      <div v-if="displayGrade" class="absolute left-3 top-3 z-10">
        <div class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm dark:bg-slate-800/70 dark:text-slate-100">
          {{ isCourse ? 'Course' : 'Grade' }} {{ displayGrade }}
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h4 class="text-base font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">{{ displayTitle }}</h4>
      <p v-if="displayDescription" class="mt-2 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ displayDescription }}</p>

      <!-- Metadata -->
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800">
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:book-open" class="h-4 w-4" />
          <span>{{ topicsCount }} {{ topicsCount === 1 ? 'topic' : 'topics' }}</span>
        </div>
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:document-text" class="h-4 w-4" />
          <span>{{ quizzes_count }} {{ quizzes_count === 1 ? 'quiz' : 'quizzes' }}</span>
        </div>
      </div>

      <!-- Topic tags (max 2) -->
      <div v-if="displayTopics.length" class="mt-3 flex flex-wrap gap-2">
        <span v-for="topic in displayTopics.slice(0, 2)" :key="topic.id" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ topic.name }}
        </span>
        <span v-if="hasMoreTopics" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          +{{ moreTopicsCount }} more
        </span>
      </div>

      <!-- CTA -->
      <div class="relative z-10 mt-auto flex items-center gap-2 pt-4">
        <NuxtLink v-if="startLink" :to="startLink" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          {{ startLabel }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  grade: { type: [String, Number, Object], default: null },
  palette: { type: String, default: '' },
  topicsCount: { type: [Number, String], default: 0 },
  quizzes_count: { type: [Number, String], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'Explore Topics' },
  subject: { type: Object, default: null },
})

const displayTitle = computed(() => props.title || props.name || props.subject?.name || 'Subject')
const displayDescription = computed(() => props.description || props.subject?.description || '')

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-indigo-500'
})

const displayGrade = computed(() => {
  const g = props.grade || props.subject?.grade
  if (!g) return ''
  if (typeof g === 'string' || typeof g === 'number') return g
  return g.name || g.title || g.label || String(g.id || '')
})

const isCourse = computed(() => {
  const g = props.grade || props.subject?.grade
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course'
})

const displayTopics = computed(() => {
  if (props.subject && Array.isArray(props.subject.topics)) {
    return props.subject.topics
  }
  return []
})

const hasMoreTopics = computed(() => {
  return props.subject && Array.isArray(props.subject.topics) && props.subject.topics.length > 2
})

const moreTopicsCount = computed(() => {
  if (!hasMoreTopics.value) return 0
  return props.subject.topics.length - 2
})
</script>