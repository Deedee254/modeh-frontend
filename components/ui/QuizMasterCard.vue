<template>
  <UCard class="p-0 transition-all duration-200 border border-slate-200 shadow-sm hover:shadow-lg">
    <!-- cover image on top -->
    <div class="relative overflow-hidden rounded-t-lg">
      <div class="h-40 sm:h-48 w-full bg-slate-100">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="quizMaster.name" class="h-full w-full object-cover" />
        <div v-else class="h-full w-full grid place-items-center bg-indigo-100 text-2xl font-bold text-indigo-700">
          {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- compact bottom overlay matching the card body color (semi-transparent) -->
      <div class="absolute left-0 right-0 bottom-0 px-2 py-1 backdrop-blur-sm bg-white/90 dark:bg-slate-900/70">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{{ quizMaster.name }}</div>
            <!-- institution on its own row -->
            <div v-if="displayInstitution" class="mt-1 text-xs text-gray-600 dark:text-slate-300 truncate block">{{ displayInstitution }}</div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click.stop="$emit('follow', quizMaster.id)"
              :disabled="loading"
              :title="isFollowing ? 'Unfollow' : 'Follow'"
              :class="[
                'inline-flex items-center justify-center rounded-full px-2 py-1 text-sm transition border',
                isFollowing
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-200 hover:text-indigo-700'
              ]"
            >
              <Icon :name="isFollowing ? 'heroicons:heart-solid' : 'heroicons:user-plus'" :class="isFollowing ? 'h-4 w-4 text-rose-500' : 'h-4 w-4 text-indigo-500'" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-2 sm:p-4">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <p v-if="quizMaster.headline" class="text-sm text-gray-600 truncate">{{ quizMaster.headline }}</p>
        </div>
      </div>

      <div class="mt-3">
        <div v-if="displayGradeName || displayLevel" class="text-xs text-gray-600">
          <p v-if="displayGradeName">
            <span v-if="isCourse">Course {{ displayGradeName }}</span>
            <span v-else>Grade {{ displayGradeName }}</span>
          </p>
          <p v-if="displayLevel" class="text-xs text-slate-500">{{ displayLevel }}</p>
        </div>

        <div v-if="quizMaster.subjects?.length" class="mt-2 flex flex-wrap gap-1">
          <span v-for="subject in displaySubjects" :key="subject.id || subject" class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            {{ subject.name || subject.title || subject.label || subject.slug || subject }}
          </span>
          <span v-if="quizMaster.subjects.length > maxDisplaySubjects" class="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
            +{{ quizMaster.subjects.length - maxDisplaySubjects }} more
          </span>
        </div>
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

import resolveAssetUrl from '~/composables/useAssets'

const avatarSrc = computed(() => {
  const v = props.quizMaster?.avatar || props.quizMaster?.avatar_url || props.quizMaster?.image || ''
  return resolveAssetUrl(v) || (v || null)
})
</script>
