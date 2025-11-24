<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Hero Section with Icon -->
    <div class="relative h-32 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-emerald-900/20">
      <!-- Decorative icon -->
      <div class="absolute inset-0 flex items-center justify-center opacity-50 dark:opacity-30">
        <Icon name="heroicons:document-text" class="h-16 w-16 text-teal-400 dark:text-teal-500" />
      </div>

      <!-- Check mark - Top Right -->
      <div class="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 dark:bg-teal-600">
        <Icon name="heroicons:check-solid" class="h-4 w-4 text-white" />
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Title in Teal -->
      <h3 class="text-lg font-bold text-teal-600 dark:text-teal-400 line-clamp-2">
        {{ displayTitle }}
      </h3>

      <!-- Subject Tag -->
      <div v-if="displaySubject" class="mt-2 inline-block">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ displaySubject }}
        </span>
      </div>

      <!-- Description -->
      <p v-if="displayDescription" class="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
        {{ displayDescription }}
      </p>

      <!-- Quiz Count - Bottom -->
      <div class="mt-auto pt-4">
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span class="text-teal-600 dark:text-teal-400">{{ quizzesCount }}</span> {{ quizzesCount === 1 ? 'quiz' : 'quizzes' }}
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
</script>