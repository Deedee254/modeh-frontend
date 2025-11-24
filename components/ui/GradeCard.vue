<template>
  <div :class="['group relative flex w-full flex-col', isCompact ? 'md:flex-col' : 'md:flex-row', 'overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/20 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900']">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- LEFT SIDE (Desktop) / TOP (Mobile) -->
    <div :class="['flex flex-col justify-between bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 text-white', isCompact ? 'w-full p-4' : 'w-full md:w-1/3 p-6']">
      <!-- Badge -->
      <div>
        <p :class="['uppercase tracking-wider text-teal-200 mb-2', isCompact ? 'text-xs font-medium' : 'text-xs font-semibold mb-3']">
          {{ isCourse ? 'COURSE' : 'GRADE' }}
        </p>
        <h3 :class="['leading-tight', isCompact ? 'text-lg font-semibold' : 'text-xl sm:text-2xl font-normal']">{{ displayTitle }}</h3>
      </div>

      <!-- View Link -->
      <NuxtLink :to="to" :class="['relative z-10 inline-flex items-center gap-2 text-white hover:text-teal-100 transition group', isCompact ? 'text-xs font-medium mt-3' : 'text-sm font-medium']">
        View all subjects
        <Icon name="heroicons:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <!-- RIGHT SIDE -->
    <div :class="['flex flex-col', isCompact ? 'w-full p-4' : 'w-full md:w-2/3 p-6']">
      <!-- Description Title -->
      <h4 :class="['text-slate-900 dark:text-slate-50 mb-2', isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold']">About this {{ isCourse ? 'course' : 'grade' }}</h4>

      <!-- Description/Intro -->
      <p v-if="displayDescription" :class="['text-slate-600 dark:text-slate-400 mb-4', isCompact ? 'text-xs line-clamp-2' : 'text-sm mb-6 line-clamp-2']">
        {{ displayDescription }}
      </p>

      <!-- Subjects Pills -->
      <div v-if="displaySubjects && displaySubjects.length > 0" :class="['flex flex-wrap gap-2 mb-4', isCompact ? 'mb-3' : 'mb-6']">
        <template v-for="(subject, index) in displaySubjectsLimited" :key="`subject-${index}`">
          <span :class="['inline-block rounded-full bg-teal-100 dark:bg-teal-900/30 px-2 py-1 text-teal-700 dark:text-teal-300', isCompact ? 'text-xs font-medium' : 'px-3 py-1.5 text-xs font-medium']">
            {{ typeof subject === 'string' ? subject : (subject.name || subject.title || 'Subject') }}
          </span>
        </template>
        
        <!-- +More button if subjects exceed limit -->
        <button v-if="hasMoreSubjects" :class="['relative z-10 inline-block rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition', isCompact ? 'px-2 py-1 text-xs font-medium' : 'px-3 py-1.5 text-xs font-medium']">
          +{{ moreSubjectsCount }} more
        </button>
      </div>

      <!-- Quiz Count (Right Side) -->
      <div v-if="quizzes_count" :class="['inline-flex items-center gap-2 mb-4', isCompact ? 'text-xs' : 'text-sm mb-6']">
        <Icon name="heroicons:document-text" class="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <span :class="[isCompact ? 'font-medium' : 'font-medium', 'text-slate-900 dark:text-slate-50']">{{ quizzes_count }} {{ quizzes_count === 1 ? 'quiz' : 'quizzes' }}</span>
      </div>

      <!-- Continue Button -->
      <div class="mt-auto flex items-center gap-3">
        <NuxtLink 
          v-if="to"
          :to="to"
          :class="['relative z-10 inline-flex items-center justify-center rounded-full bg-teal-600 dark:bg-teal-700 text-white transition hover:bg-teal-700 dark:hover:bg-teal-600', isCompact ? 'px-4 py-1.5 text-xs font-semibold' : 'px-6 py-2 text-sm font-semibold']"
        >
          Continue
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { resolveAssetUrl } from '~/composables/useAssets'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  grade: { type: Object, default: null },
  palette: { type: String, default: '' },
  quizzes_count: { type: [Number, String], default: 0 },
  subjects_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore Grade' },
  cover: { type: String, default: '' },
  description: { type: String, default: '' },
  subjects: { type: Array, default: () => [] },
  class: { type: String, default: '' }
})

const isCompact = computed(() => {
  return props.class?.includes('compact-view')
})

const displayTitle = computed(() => props.title || props.grade?.name || 'Grade')
const displayDescription = computed(() => props.description || props.grade?.description || props.subtitle || '')

const isCourse = computed(() => {
  if (props.grade && typeof props.grade === 'object') return String(props.grade.type || '').toLowerCase() === 'course'
  return false
})

const displaySubjects = computed(() => {
  return props.subjects || (props.grade && props.grade.subjects) || []
})

const SUBJECTS_LIMIT = 3
const displaySubjectsLimited = computed(() => {
  return displaySubjects.value.slice(0, SUBJECTS_LIMIT)
})

const hasMoreSubjects = computed(() => {
  return displaySubjects.value.length > SUBJECTS_LIMIT
})

const moreSubjectsCount = computed(() => {
  return displaySubjects.value.length - SUBJECTS_LIMIT
})

const resolvedCover = computed(() => {
  const v = props.cover || (props.grade && (props.grade.cover_image || props.grade.cover)) || ''
  return resolveAssetUrl(v) || ''
})
</script>