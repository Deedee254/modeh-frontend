<template>
  <UCard class="p-4 sm:p-6 transition-all duration-200 hover:shadow-lg">
    <div class="flex flex-col items-center text-center gap-3">
      <div class="h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24">
        <img v-if="quizMaster.avatar" :src="quizMaster.avatar" :alt="quizMaster.name" class="h-full w-full object-cover" />
        <div v-else class="grid h-full w-full place-items-center bg-indigo-100 text-xl font-bold text-indigo-700 sm:text-3xl">
          {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
        </div>
      </div>

      <div class="space-y-1">
        <h3 class="text-base font-semibold text-gray-800 sm:text-lg">{{ quizMaster.name }}</h3>
        <p v-if="quizMaster.headline" class="text-sm text-gray-500">{{ quizMaster.headline }}</p>
      </div>

      <div v-if="displayInstitution || displayGradeName || displayLevel" class="text-sm text-gray-600">
        <p v-if="displayInstitution" class="font-medium text-gray-700">{{ displayInstitution }}</p>
        <p v-if="displayGradeName">
          <span v-if="isCourse">Course {{ displayGradeName }}</span>
          <span v-else>Grade {{ displayGradeName }}</span>
        </p>
        <p v-if="displayLevel" class="text-xs text-slate-500">{{ displayLevel }}</p>
      </div>

      <div v-if="quizMaster.subjects?.length" class="mt-1 flex flex-wrap justify-center gap-1">
        <span v-for="subject in displaySubjects" :key="subject.id || subject" class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
          {{ subject.name || subject.title || subject.label || subject.slug || subject }}
        </span>
        <span v-if="quizMaster.subjects.length > maxDisplaySubjects" class="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
          +{{ quizMaster.subjects.length - maxDisplaySubjects }} more
        </span>
      </div>

      <div class="mt-4 flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <NuxtLink :to="`/quizee/quiz-masters/${quizMaster.id}`" class="w-full rounded-md border border-indigo-200 px-3 py-2 text-center text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:w-auto">
          View Profile
        </NuxtLink>
        <button @click="$emit('follow', quizMaster.id)" :disabled="loading" class="w-full rounded-md border px-3 py-2 text-sm font-medium transition sm:w-auto" :class="isFollowing ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-indigo-200 hover:text-indigo-700'">
          <span v-if="isFollowing">Following</span>
          <span v-else>Follow</span>
        </button>
      </div>
    </div>
  </UCard>
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
</script>
