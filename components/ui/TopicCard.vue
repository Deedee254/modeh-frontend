<template>
  <div class="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:shadow-lg hover:ring-slate-300 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-700">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Header with subtle accent -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

  <div class="p-4 sm:p-6">
      <!-- Header section -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm sm:text-lg font-semibold text-slate-900 line-clamp-2 dark:text-slate-50">
            {{ displayTitle }}
          </h3>
          <p v-if="displaySubject" class="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {{ displaySubject }}
          </p>
        </div>

        <!-- Quiz count pill -->
        <div class="flex-shrink-0">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Icon name="heroicons:document-text" class="h-4 w-4" />
            <span>{{ quizzesCount }}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p v-if="displayDescription" class="text-xs sm:text-sm text-slate-600 line-clamp-2 dark:text-slate-400 mb-6">
        {{ displayDescription }}
      </p>

      <!-- Action button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div class="flex-1">
          <NuxtLink v-if="startLink" :to="startLink" :class="primaryBtn">
            {{ startLabel }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>

        <!-- Subtle progress indicator -->
        <div class="text-xs text-slate-500 dark:text-slate-400">
          {{ quizzesCount }} {{ quizzesCount === 1 ? 'quiz' : 'quizzes' }}
        </div>
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

// Uniform primary button used across cards (mobile full-width, stacks)
const primaryBtn = 'inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm'
</script>