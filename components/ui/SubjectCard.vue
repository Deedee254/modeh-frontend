<template>
  <div class="w-full group block rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 hover:scale-[1.01] overflow-hidden relative">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
  <div>
    <div class="w-full h-36 sm:h-44 bg-gray-100 overflow-hidden">
      <img v-if="image" :src="image" alt="" class="w-full h-full object-cover" />
      <div v-else :class="['w-full h-full', paletteClass]" class="grid place-items-center">
        <div class="text-white font-bold text-2xl">{{ badgeText || (displayTitle || '').charAt(0) }}</div>
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col gap-2">
      <div>
  <h4 class="text-lg sm:text-xl font-semibold line-clamp-2 text-gray-900 dark:text-white">{{ displayTitle }}</h4>
        <div v-if="subtitle || displayLevel" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          <div v-if="subtitle">{{ subtitle }}</div>
          <div v-if="displayLevel" class="text-xs text-slate-500">{{ displayLevel }}</div>
        </div>
      </div>

      <div v-if="description" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{{ description }}</div>

      <div class="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <div>{{ topicsCount }} topics • {{ quizzes_count }} quizzes</div>
      </div>

      <div class="mt-3">
        <NuxtLink v-if="startLink" :to="startLink" class="w-full inline-flex justify-center items-center px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">{{ startLabel }}</NuxtLink>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, required: false },
  // Accept `name` since many APIs return `name` instead of `title` and callers often spread objects
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  grade: { type: [String, Number], default: null },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  topicsCount: { type: [Number, String], default: 0 },
  quizzes_count: { type: [Number, String], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'Explore Topics' }
})

const displayTitle = computed(() => props.title || props.name || '')

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-indigo-400 to-indigo-600')
const backgroundStyle = computed(() => {
  if (props.image) return { backgroundImage: `url(${props.image})` }
  // fallback to palette gradient
  return {}
})

const displayLevel = computed(() => {
  if (props.grade && typeof props.grade === 'object') {
    const lvl = props.grade.level || props.grade.level_id || props.grade.levelId
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''))
  }
  return ''
})
</script>