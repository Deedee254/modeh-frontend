<template>
  <div class="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/20 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

  <!-- TOP SECTION (Gradient with grade/course info) -->
  <div :class="['flex flex-col justify-between text-white', isCompact ? 'w-full p-4' : 'w-full p-6']" style="background: linear-gradient(to bottom right, #891f21, #a83435)">
      <!-- Badge -->
      <div>
        <p :class="['uppercase tracking-wider mb-2', isCompact ? 'text-xs font-medium' : 'text-xs font-semibold mb-3']" style="color: rgba(255, 255, 255, 0.8)">
          {{ isCourse ? 'COURSE' : 'GRADE' }}
        </p>
        <h3 :class="['leading-tight', isCompact ? 'text-base font-semibold' : 'text-base sm:text-lg font-semibold']">{{ displayTitle }}</h3>
      </div>
    </div>

  <!-- BOTTOM SECTION (Content area) -->
  <div :class="['flex flex-col', isCompact ? 'w-full p-4' : 'w-full p-6']">
      <!-- Description Title -->
      <h4 :class="['text-slate-900 dark:text-slate-50 mb-2', isCompact ? 'text-sm font-semibold' : 'text-lg font-semibold']">About this {{ isCourse ? 'course' : 'grade' }}</h4>

      <!-- Description/Intro -->
      <p v-if="displayDescription" :class="['text-slate-600 dark:text-slate-400 mb-4', isCompact ? 'text-xs line-clamp-2' : 'text-sm mb-6 line-clamp-2']">
        {{ displayDescription }}
      </p>

      <!-- Subjects Pills -->
      <div v-if="displaySubjects && displaySubjects.length > 0" :class="['flex flex-wrap gap-2 mb-4', isCompact ? 'mb-3' : 'mb-6']">
        <template v-for="(subject, index) in displaySubjectsLimited" :key="`subject-${index}`">
          <span :class="['inline-block rounded-full px-2 py-1', isCompact ? 'text-xs font-medium' : 'px-3 py-1.5 text-xs font-medium']" style="background-color: rgba(137, 31, 33, 0.1); color: #891f21">
            {{ typeof subject === 'string' ? subject : (subject.name || subject.title || 'Subject') }}
          </span>
        </template>
        
        <!-- +More button if subjects exceed limit -->
        <button v-if="hasMoreSubjects" :class="['relative z-10 inline-block rounded-full transition', isCompact ? 'px-2 py-1 text-xs font-medium' : 'px-3 py-1.5 text-xs font-medium']" style="background-color: rgba(137, 31, 33, 0.1); color: #891f21" :style="{ 'background-color': 'rgba(137, 31, 33, 0.15)' }">
          +{{ moreSubjectsCount }} more
        </button>
      </div>

      <!-- Quiz Count and Subject Count -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-6">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:document-text" class="h-5 w-5" :style="{ color: '#891f21' }" />
          <div class="flex flex-col">
            <span :class="['text-slate-600 dark:text-slate-400', isCompact ? 'text-xs' : 'text-sm']">{{ quizzes_count }}</span>
            <span :class="['font-semibold text-slate-900 dark:text-slate-50', isCompact ? 'text-xs' : 'text-sm']">{{ quizzes_count === 1 ? 'Quiz' : 'Quizzes' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="heroicons:squares-2x2" class="h-5 w-5" :style="{ color: '#891f21' }" />
          <div class="flex flex-col">
            <span :class="['text-slate-600 dark:text-slate-400', isCompact ? 'text-xs' : 'text-sm']">{{ subjects_count }}</span>
            <span :class="['font-semibold text-slate-900 dark:text-slate-50', isCompact ? 'text-xs' : 'text-sm']">{{ subjects_count === 1 ? 'Subject' : 'Subjects' }}</span>
          </div>
        </div>
      </div>

      <!-- View all subjects Button -->
      <div class="mt-auto">
        <NuxtLink 
          v-if="to"
          :to="to"
          :class="['relative z-10 w-full inline-flex items-center justify-center gap-2 rounded-full text-white transition', isCompact ? 'px-4 py-2 text-xs font-semibold' : 'px-6 py-3 text-sm font-semibold']"
          :style="{ backgroundColor: '#891f21' }"
        >
          <span>View all subjects</span>
          <Icon name="heroicons:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
