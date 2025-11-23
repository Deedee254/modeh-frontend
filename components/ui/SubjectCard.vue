<template>
  <div class="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:shadow-lg hover:ring-slate-300 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-700">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Header with subtle accent -->
    <div class="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

    <div class="p-4 sm:p-6">
      <!-- Header section -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-3 mb-3">
            <!-- Image / Icon -->
            <div class="flex-shrink-0">
              <template v-if="image">
                <img :src="image" alt="" class="h-10 w-10 rounded-lg object-cover" />
              </template>
              <template v-else>
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <template v-if="iconName">
                    <Icon :name="iconName" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </template>
                  <template v-else>
                    <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
                  </template>
                </div>
              </template>
            </div>

            <!-- Grade pill -->
            <div v-if="displayGrade" class="flex items-center">
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {{ isCourse ? 'Course' : 'Grade' }} {{ displayGrade }}
              </span>
            </div>
          </div>

          <h3 class="text-sm sm:text-lg font-semibold text-slate-900 line-clamp-2 dark:text-slate-50">
            {{ displayTitle }}
          </h3>
        </div>
      </div>

      <!-- Description -->
      <p v-if="displayDescription" class="text-xs sm:text-sm text-slate-600 line-clamp-2 dark:text-slate-400 mb-4">
        {{ displayDescription }}
      </p>

      <!-- Stats -->
      <div class="flex items-center gap-4 mb-6">
        <div class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:book-open" class="h-4 w-4" />
          <span class="font-medium">{{ topicsCount }}</span>
          <span class="text-xs">topics</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icon name="heroicons:document-text" class="h-4 w-4" />
          <span class="font-medium">{{ quizzes_count }}</span>
          <span class="text-xs">quizzes</span>
        </div>
      </div>

      <!-- Action button (uniform style, stacks on mobile) -->
      <div class="flex flex-col sm:flex-row gap-2">
        <NuxtLink
          v-if="startLink"
          :to="startLink"
          :class="primaryBtn"
        >
          {{ startLabel }}
          <Icon name="heroicons:arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </NuxtLink>
        <slot />
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

// Uniform primary button used across cards (mobile full-width, stacks)
const primaryBtn = 'inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm'


</script>