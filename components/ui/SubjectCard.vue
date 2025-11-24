<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Header: Icon and Title with Check Mark -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-start gap-3">
          <!-- Icon/Image -->
          <div class="flex-shrink-0">
            <template v-if="image">
              <img :src="image" alt="" class="h-12 w-12 rounded-lg object-cover" />
            </template>
            <template v-else>
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <template v-if="iconName">
                  <Icon :name="iconName" class="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </template>
                <template v-else>
                  <span class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
                </template>
              </div>
            </template>
          </div>

          <!-- Title -->
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 dark:text-slate-50">
              {{ displayTitle }}
            </h3>
            <!-- Grade pill below title -->
            <div v-if="displayGrade" class="mt-2 inline-block">
              <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {{ isCourse ? 'Course' : 'Grade' }} {{ displayGrade }}
              </span>
            </div>
          </div>
        </div>

        <!-- Check Mark - Top Right -->
        <div class="flex-shrink-0">
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 dark:bg-teal-600">
            <Icon name="heroicons:check-solid" class="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      <!-- Description -->
      <p v-if="displayDescription" class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
        {{ displayDescription }}
      </p>

      <!-- Stats -->
      <div class="mt-auto pt-2 flex items-center gap-3 text-sm">
        <span class="text-slate-600 dark:text-slate-400">
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ topicsCount }}</span> topics
        </span>
        <span class="text-slate-400 dark:text-slate-600">·</span>
        <span class="text-slate-600 dark:text-slate-400">
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ quizzes_count }}</span> quizzes
        </span>
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

const iconName = computed(() => {
  const s = props.subject
  if (s && s.icon && typeof s.icon === 'string' && s.icon.trim()) return s.icon.trim()
  if (props.image && typeof props.image === 'string' && props.image.includes(':')) return props.image
  return null
})

const displayTitle = computed(() => props.title || props.name || props.subject?.name || 'Subject')
const displayDescription = computed(() => props.description || props.subject?.description || '')

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
</script>