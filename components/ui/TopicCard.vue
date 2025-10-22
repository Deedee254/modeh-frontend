<template>
  <div class="w-full group block rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 hover:scale-[1.01] overflow-hidden relative">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
    <div class="relative h-28 sm:h-40 bg-gray-100 overflow-hidden">
      <div class="absolute inset-0" :class="!image ? paletteClass : ''" :style="image ? { backgroundImage: `url(${image})` } : {}"></div>
      <div v-if="image" class="absolute inset-0">
        <img :src="image" alt="" class="w-full h-full object-cover" />
      </div>
      <!-- Grade pill (top-left) -->
      <div v-if="grade" class="absolute top-3 left-3 z-30">
        <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/90 text-xs font-semibold text-slate-800">
          <span v-if="isCourse">Course {{ (grade && grade.name) ? grade.name : grade }}</span>
          <span v-else>Grade {{ (grade && grade.name) ? grade.name : grade }}</span>
        </span>
      </div>
      <div v-if="displayLevel" class="absolute top-12 left-3 z-30">
        <span class="inline-flex items-center px-2 py-1 rounded-full bg-white/80 text-xs font-medium text-slate-700">{{ displayLevel }}</span>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
      <div class="absolute left-4 bottom-4 right-4 z-10 text-white">
        <h4 class="text-lg sm:text-xl font-semibold line-clamp-2">{{ displayTitle }}</h4>
      </div>
    </div>
    <div class="p-4 sm:p-5 flex flex-col gap-3 relative z-10">
      <div>
        <div class="text-sm text-gray-600">{{ metaText }}</div>
        <div class="mt-2 text-sm text-emerald-600">{{ quizzesCountText }}</div>
        <div v-if="description" class="mt-2 text-sm text-gray-700 line-clamp-3">{{ description }}</div>
      </div>

      <div class="mt-auto">
        <NuxtLink v-if="startLink" :to="startLink" class="w-full inline-flex justify-center items-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">View Quizzes</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, required: false },
  // accept `name` from API objects as fallback
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  grade: { type: [String, Number], default: null },
  // if true, keep showing the grade in the meta line; default false to avoid duplication with header pill
  showGradeInMeta: { type: Boolean, default: false },
  subject: { type: String, default: '' },
  quizzesCount: { type: [String, Number], default: 0 },
  startLink: { type: [String, Object], default: null }
  ,
  startLabel: { type: String, default: 'View Quizzes' }
})
const quizzesCountText = computed(() => `${props.quizzesCount || 0} quizzes`)
const metaText = computed(() => {
  // avoid repeating grade if header pill is shown; allow opt-in via showGradeInMeta
  if (props.showGradeInMeta) {
    return `${props.grade ? 'Grade ' + props.grade + ' • ' : ''}${props.subject || ''}`
  }
  return props.subject || ''
})
const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-emerald-400 to-emerald-600')
const displayTitle = computed(() => props.title || props.name || '')

const displayLevel = computed(() => {
  // props.grade may be a primitive or object; try to read .level
  const g = props.grade
  if (g && typeof g === 'object') {
    const lvl = g.level || g.level_id || g.levelId
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''))
  }
  return ''
})

const isCourse = computed(() => {
  const g = props.grade
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course'
})
</script>