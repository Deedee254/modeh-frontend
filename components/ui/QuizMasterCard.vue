<template>
  <UCard class="p-3 sm:p-6 transition-all duration-200 border border-slate-200 shadow-sm hover:shadow-lg">
    <!-- mobile: stacked (column) with rich content; sm+: compact row -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <!-- avatar -->
      <div class="flex-shrink-0">
        <div class="h-14 w-14 overflow-hidden rounded-full bg-slate-100 sm:h-20 sm:w-20">
          <img v-if="avatarSrc" :src="avatarSrc" :alt="quizMaster.name" class="h-full w-full object-cover" />
          <div v-else class="grid h-full w-full place-items-center bg-indigo-100 text-xl font-bold text-indigo-700 sm:text-3xl">
            {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0 w-full">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div class="truncate">
            <h3 class="text-base sm:text-sm font-semibold text-gray-800 truncate">{{ quizMaster.name }}</h3>
            <p v-if="quizMaster.headline" class="text-sm sm:text-xs text-gray-600 mt-1 truncate">{{ quizMaster.headline }}</p>
            <p v-if="displayInstitution" class="text-sm sm:text-xs text-gray-500 mt-1 truncate">{{ displayInstitution }}</p>
          </div>

          <!-- actions: stack on mobile (column) and inline on sm+ (row) -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <!-- follow pill button: full-width on mobile, pill with accent when following -->
            <button
              @click="$emit('follow', quizMaster.id)"
              :disabled="loading"
              :title="isFollowing ? 'Unfollow' : 'Follow'"
              :class="[
                'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm transition border',
                isFollowing
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-200 hover:text-indigo-700'
              ]"
              class="w-full sm:w-auto"
            >
              <Icon :name="isFollowing ? 'heroicons:heart-solid' : 'heroicons:user-plus'" :class="isFollowing ? 'h-4 w-4 text-rose-500 mr-2' : 'h-4 w-4 text-indigo-500 mr-2'" />
              <span class="inline">{{ isFollowing ? 'Following' : 'Follow' }}</span>
            </button>

            <!-- view details: full width on mobile -->
            <NuxtLink
              :to="`/quizee/quiz-masters/${quizMaster.id}`"
              class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 w-full sm:w-auto"
            >
              <span class="hidden sm:inline">View</span>
              <span class="sm:hidden">View Profile</span>
            </NuxtLink>
          </div>
        </div>

        <!-- visible on mobile and desktop: more details beneath -->
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
