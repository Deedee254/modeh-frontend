<template>
  <div class="group relative w-full overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-400/20 dark:bg-slate-900 dark:hover:shadow-slate-900/50">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Top accent bar -->
    <div :class="['h-2 w-full transition-all duration-300 group-hover:h-3', paletteClass]"></div>

    <!-- Content -->
    <div class="flex flex-col h-full p-5 sm:p-6">
      <!-- Header with icon and badge -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <!-- Icon -->
        <div :class="['flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110', paletteClass]">
          <template v-if="iconName">
            <Icon :name="iconName" class="h-6 w-6 text-white" />
          </template>
          <template v-else>
            <span class="text-lg font-bold text-white">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
          </template>
        </div>

        <!-- Grade badge -->
        <div v-if="displayGrade" class="flex-shrink-0">
          <div class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-tight text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {{ isCourse ? 'Course' : 'Grade' }} {{ displayGrade }}
          </div>
        </div>
      </div>

      <!-- Title -->
      <h4 class="text-base font-semibold text-slate-900 line-clamp-2 dark:text-slate-50">{{ displayTitle }}</h4>

      <!-- Description -->
      <p v-if="displayDescription" class="mt-1.5 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ displayDescription }}</p>

      <!-- Metadata -->
      <div class="mt-4 flex items-center gap-4 border-t border-slate-200 pt-3 dark:border-slate-800">
        <div class="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:book-open" class="h-4 w-4" />
          <span class="font-medium">{{ topicsCount }}</span>
        </div>
        <div class="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:document-text" class="h-4 w-4" />
          <span class="font-medium">{{ quizzes_count }}</span>
        </div>
      </div>

      <!-- Topics tags -->
      <div v-if="displayTopics.length" class="mt-3 flex flex-wrap gap-1.5">
        <span v-for="topic in displayTopics.slice(0, 2)" :key="topic.id" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ topic.name }}
        </span>
        <span v-if="hasMoreTopics" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          +{{ moreTopicsCount }}
        </span>
      </div>

      <!-- CTA -->
      <div class="mt-5 pt-3">
        <NuxtLink v-if="startLink" :to="startLink" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          {{ startLabel }}
          <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
// resolveAssetUrl removed: subjects now use icons/initials instead of cover images

const iconName = computed(() => {
  // prefer explicit icon name on subject (e.g., 'heroicons:academic-cap')
  const s = props.subject
  if (s && s.icon && typeof s.icon === 'string' && s.icon.trim()) return s.icon.trim()
  // allow image prop to point to an inline icon name (fast fallback)
  if (props.image && typeof props.image === 'string' && props.image.includes(':')) return props.image
  return null
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