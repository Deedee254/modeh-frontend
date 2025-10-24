<template>
  <div class="group relative flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 hover:scale-[1.02]">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
    <div class="relative h-32 overflow-hidden rounded-t-2xl bg-slate-100 sm:h-40">
      <img v-if="cover" :src="cover" :alt="displayTitle" class="h-full w-full object-cover" />
      <div v-else :class="['grid h-full w-full place-items-center font-bold text-white', paletteClass]">
        <span class="text-2xl">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <div class="absolute left-3 top-3 z-10">
        <div class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm dark:bg-slate-800/70 dark:text-slate-100">
          {{ badgeLabel }}
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h4 class="text-base font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">{{ displayTitle }}</h4>
      <p v-if="displayDescription" class="mt-2 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ displayDescription }}</p>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800">
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:squares-2x2" class="h-4 w-4" />
          <span>{{ gradesCountNumber }} {{ gradesCountNumber === 1 ? 'grade' : 'grades' }}</span>
        </div>
      </div>

      <div v-if="displayGrades.length" class="mt-3 flex flex-wrap gap-2">
        <span v-for="(grade, index) in displayGrades.slice(0, 2)" :key="gradeKey(grade, index)" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {{ gradeLabel(grade) }}
        </span>
        <span v-if="hasMoreGrades" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          +{{ moreGradesCount }} more
        </span>
      </div>

      <div class="relative z-10 mt-auto flex items-center gap-2 pt-4">
        <NuxtLink v-if="actionLink" :to="actionLink" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600">
          {{ actionLabel }}
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
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  palette: { type: String, default: '' },
  grades_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore Level' },
  level: { type: Object, default: null }
})

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-violet-500'
})

const displayTitle = computed(() => props.title || props.level?.name || 'Level')
const displayDescription = computed(() => props.description || props.subtitle || props.level?.description || '')
const badgeLabel = computed(() => {
  if (props.subtitle && props.subtitle.trim()) return props.subtitle
  if (props.level?.stage) return props.level.stage
  return 'Level'
})

const displayGrades = computed(() => {
  if (props.level && Array.isArray(props.level.grades)) return props.level.grades
  return []
})

const hasMoreGrades = computed(() => displayGrades.value.length > 2)
const moreGradesCount = computed(() => {
  if (!hasMoreGrades.value) return 0
  return displayGrades.value.length - 2
})

const gradesCountNumber = computed(() => {
  const value = Number(props.grades_count)
  if (Number.isNaN(value)) return displayGrades.value.length
  return value
})

const gradeLabel = grade => {
  if (!grade) return ''
  if (typeof grade === 'string' || typeof grade === 'number') return grade
  return grade.name || grade.title || grade.label || grade.code || grade.slug || 'Grade'
}

const gradeKey = (grade, index) => {
  if (!grade) return `grade-${index}`
  if (typeof grade === 'string' || typeof grade === 'number') return `grade-${grade}`
  return grade.id || grade.uuid || grade.name || grade.title || grade.label || `grade-${index}`
}
</script>
