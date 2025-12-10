<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/50" :style="{ 'border-color': 'rgba(137, 31, 33, 0.2)' }">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Hero Section with Icon -->
    <div class="relative h-32" :style="{ background: 'linear-gradient(to bottom right, rgba(137, 31, 33, 0.05), rgba(247, 185, 50, 0.05))' }">
      <!-- Decorative icon -->
      <div class="absolute inset-0 flex items-center justify-center opacity-50 dark:opacity-30">
        <Icon name="heroicons:document-text" class="h-16 w-16" :style="{ color: '#891f21' }" />
      </div>

      <!-- Check mark - Top Right -->
      <div class="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full" :style="{ backgroundColor: '#891f21' }">
        <Icon name="heroicons:check-solid" class="h-4 w-4 text-white" />
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Topic Badge -->
      <p class="uppercase tracking-wider text-xs font-semibold mb-2" :style="{ color: '#891f21' }">
        Topic
      </p>

      <!-- Title in Burgundy -->
      <h3 class="text-base sm:text-base font-semibold" :style="{ color: '#891f21' }">
        {{ displayTitle }}
      </h3>

      <!-- Subject Tag -->
          <!-- Meta Tags (Subject / Grade / Course) -->
          <div class="mt-2 flex flex-wrap gap-2 items-center">
            <span v-if="displaySubject" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Subject: {{ displaySubject }}
            </span>
            <span v-if="displayGrade" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Grade: {{ displayGrade }}
            </span>
            <span v-if="displayCourse" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Course: {{ displayCourse }}
            </span>
          </div>

      <!-- Description -->
      <p v-if="displayDescription" class="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
        {{ displayDescription }}
      </p>

      <!-- Quiz Count - Bottom -->
      <div class="mt-auto pt-4">
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span :style="{ color: '#891f21' }">{{ quizzesCount }}</span> {{ quizzesCount === 1 ? 'quiz' : 'quizzes' }}
        </p>
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
  palette: { type: String, default: '' },
  subject: { type: [String, Object], default: '' },
  grade: { type: [String, Object], default: '' },
  course: { type: [String, Object], default: '' },
  quizzesCount: { type: [String, Number], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'View Quizzes' },
  topic: { type: Object, default: null },
})

const displayTitle = computed(() => props.title || props.name || props.topic?.name || 'Topic')
const displayDescription = computed(() => props.description || props.topic?.description || '')
const displaySubject = computed(() => {
  const s = props.subject || (props.topic?.subject)
  if (!s) return ''
  if (typeof s === 'string') return s
  return s.name || s.title || s.label || String(s.id || '')
})
const displayGrade = computed(() => {
  const g = props.grade || props.topic?.grade
  if (!g) return ''
  if (typeof g === 'string') return g
  return g.name || g.title || String(g.id || '')
})
const displayCourse = computed(() => {
  const c = props.course || props.topic?.course
  if (!c) return ''
  if (typeof c === 'string') return c
  return c.name || c.title || String(c.id || '')
})
</script>
