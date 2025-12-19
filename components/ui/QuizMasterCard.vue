<template>
  <NuxtLink :to="profileUrl" class="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900 active:scale-[0.98] overflow-hidden">
    <!-- Top area: avatar overlaps card for a modern look -->
    <div class="relative bg-gradient-to-br from-slate-50 to-slate-100 h-20 flex items-center justify-center">
      <div class="absolute -top-8 left-4">
        <div class="h-16 w-16 rounded-full ring-2 ring-white overflow-hidden bg-white shadow-sm">
          <img v-if="avatarSrc" :src="avatarSrc" :alt="quizMaster.name" class="h-full w-full object-cover" />
          <div v-else class="h-full w-full grid place-items-center bg-slate-200 text-xl font-bold text-slate-700">{{ (quizMaster.name || '').charAt(0).toUpperCase() }}</div>
        </div>
      </div>

      <!-- Follow button (top right) -->
      <button
        @click.prevent.stop="$emit('follow', quizMaster.id)"
        :disabled="loading"
        :title="isFollowing ? 'Unfollow' : 'Follow'"
        :class="[
          'absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full p-2 transition-all duration-200 shadow-sm',
          isFollowing
            ? 'bg-rose-500/90 text-white hover:bg-rose-600'
            : 'bg-white/95 text-[#891f21] border border-white/30 hover:bg-white'
        ]"
      >
        <Icon :name="isFollowing ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" />
      </button>
    </div>

    <!-- Content section -->
    <div class="flex flex-1 flex-col p-4 pt-6">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">{{ quizMaster.name }}</h3>
          <div v-if="displayInstitution" class="mt-1 text-xs text-slate-500">{{ displayInstitution }}</div>
        </div>
      </div>

      <!-- Headline -->
      <p v-if="quizMaster.headline" class="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{{ quizMaster.headline }}</p>

      <!-- Subject tags and meta -->
      <div class="mt-3 flex items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <span v-for="subject in displaySubjects" :key="subject.id || subject" class="inline-flex items-center rounded-md bg-[#fff4f4] px-2 py-0.5 text-xs font-medium text-[#891f21]">
            {{ subject.name || subject.title || subject.label || subject.slug || subject }}
          </span>
          <span v-if="quizMaster.subjects.length > maxDisplaySubjects" class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            +{{ quizMaster.subjects.length - maxDisplaySubjects }}
          </span>
        </div>

        <div class="text-xs text-slate-500">
          <span v-if="displayGradeName">{{ isCourse ? 'Course ' + displayGradeName : 'Grade ' + displayGradeName }}</span>
        </div>
      </div>

      <!-- CTA: View Profile -->
      <div class="mt-auto pt-4">
        <NuxtLink :to="profileUrl" class="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-semibold text-white" :style="{ backgroundColor: '#891f21' }">
          View Profile
        </NuxtLink>
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

function simpleSlug(str) {
  try {
    if (!str) return ''
    return String(str).toLowerCase().trim().replace(/[^a-z0-9\s-_]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  } catch (e) { return '' }
}

const profileUrl = computed(() => {
  const s = props.quizMaster?.slug || simpleSlug(props.quizMaster?.name) || (props.quizMaster?.id ? String(props.quizMaster.id) : '')
  return `/quizee/quiz-masters/${s}`
})
</script>

