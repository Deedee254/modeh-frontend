<template>
  <NuxtLink :to="`/quizee/quiz-masters/${quizMaster.id}`" class="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900 active:scale-[0.98]">
    <!-- Cover image with overlay -->
    <div class="relative h-32 overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-100 to-purple-100">
      <img v-if="avatarSrc" :src="avatarSrc" :alt="quizMaster.name" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
      <div v-else class="grid h-full w-full place-items-center bg-gradient-to-br from-indigo-200 to-purple-200 text-3xl font-bold text-indigo-700">
        {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
      </div>

      <!-- Follow button overlay (top right) -->
      <button
        @click.prevent.stop="$emit('follow', quizMaster.id)"
        :disabled="loading"
        :title="isFollowing ? 'Unfollow' : 'Follow'"
        :class="[
          'absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full p-2 transition-all duration-200',
          isFollowing
            ? 'bg-rose-500/90 text-white hover:bg-rose-600'
            : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white dark:bg-slate-800/90 dark:text-slate-300'
        ]"
      >
        <Icon :name="isFollowing ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" />
      </button>
    </div>

    <!-- Content section -->
    <div class="flex flex-1 flex-col p-3">
      <!-- Name -->
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{{ quizMaster.name }}</h3>

      <!-- Institution badge -->
      <div v-if="displayInstitution" class="mt-1.5 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 w-fit">
        {{ displayInstitution }}
      </div>

      <!-- Headline (truncated) -->
      <p v-if="quizMaster.headline" class="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{{ quizMaster.headline }}</p>

      <!-- Grade/Level info (compact) -->
      <div v-if="displayGradeName || displayLevel" class="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <Icon name="heroicons:academic-cap" class="h-3.5 w-3.5" />
        <span>
          <span v-if="isCourse">Course {{ displayGradeName }}</span>
          <span v-else>Grade {{ displayGradeName }}</span>
        </span>
      </div>

      <!-- Subject tags (compact) -->
      <div v-if="quizMaster.subjects?.length" class="mt-2 flex flex-wrap gap-1">
        <span v-for="subject in displaySubjects" :key="subject.id || subject" class="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {{ subject.name || subject.title || subject.label || subject.slug || subject }}
        </span>
        <span v-if="quizMaster.subjects.length > maxDisplaySubjects" class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          +{{ quizMaster.subjects.length - maxDisplaySubjects }}
        </span>
      </div>

      <!-- View profile link (at bottom) -->
      <div class="mt-auto pt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all duration-200">
        <span>View Profile</span>
        <Icon name="heroicons:arrow-right-20-solid" class="h-3.5 w-3.5" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  quizMaster: {
    type: Object,
    required: true
  },
  isFollowing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxDisplaySubjects: {
    type: Number,
    default: 3
  }
})

defineEmits(['follow'])

const displaySubjects = computed(() => props.quizMaster.subjects?.slice(0, props.maxDisplaySubjects) || [])

const displayInstitution = computed(() => {
  const institution = props.quizMaster.institution
  if (!institution) return ''
  if (typeof institution === 'string') return institution
  if (typeof institution === 'object') return institution.name || institution.title || institution.label || institution.code || ''
  return ''
})

const displayGradeName = computed(() => {
  const grade = props.quizMaster.grade
  if (!grade) return ''
  if (typeof grade === 'string' || typeof grade === 'number') return grade
  if (typeof grade === 'object') return grade.name || grade.title || grade.label || ''
  return ''
})

const displayLevel = computed(() => {
  const grade = props.quizMaster.grade || null
  if (grade && typeof grade === 'object') {
    const level = grade.level || grade.level_id || grade.levelId
    if (level) return typeof level === 'string' || typeof level === 'number' ? String(level) : level.name || String(level.id || '')
  }
  return ''
})

const isCourse = computed(() => {
  const grade = props.quizMaster.grade || null
  if (!grade || typeof grade !== 'object') return false
  return String(grade.type || '').toLowerCase() === 'course'
})

import { resolveAssetUrl } from '~/composables/useAssets'

const avatarSrc = computed(() => {
  const v = props.quizMaster?.avatar_url || props.quizMaster?.avatar || props.quizMaster?.image || ''
  // prefer asset resolution, fall back to raw value if needed
  return resolveAssetUrl(v) || (v || null)
})
</script>
