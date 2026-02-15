<template>
  <NuxtLink :to="profileUrl" class="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <!-- Top Gradient Decoration -->
    <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <!-- Avatar -->
    <div class="relative mb-4">
      <div class="h-24 w-24 rounded-full p-1 bg-white border border-slate-100 shadow-sm group-hover:border-brand-100 transition-colors">
        <img 
          v-if="avatarSrc" 
          :src="avatarSrc" 
          :alt="quizMaster.name" 
          class="h-full w-full rounded-full object-cover" 
        />
        <div 
          v-else 
          class="h-full w-full rounded-full bg-slate-50 flex items-center justify-center text-3xl font-bold text-slate-400 group-hover:text-brand-500 transition-colors"
        >
          {{ (quizMaster.name || '').charAt(0).toUpperCase() }}
        </div>
      </div>
      
      <!-- Follow Button (absolute to avatar) -->
      <button
        @click.prevent.stop="$emit('follow', quizMaster.id)"
        :disabled="loading"
        :title="isFollowing ? 'Unfollow' : 'Follow'"
        class="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md border border-slate-100 hover:scale-110 transition-transform"
        :class="isFollowing ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'"
      >
         <Icon :name="isFollowing ? 'heroicons:heart-solid' : 'heroicons:heart'" class="h-4 w-4" />
      </button>
    </div>

    <!-- Info -->
    <div class="text-center w-full">
       <h3 class="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-1 truncate px-2">
         {{ quizMaster.name }}
       </h3>
       
       <div v-if="displayInstitution" class="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3 truncate px-4">
         {{ displayInstitution }}
       </div>
       <div v-else class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
         Quiz Master
       </div>

       <!-- Bio/Headline -->
       <p class="text-sm text-slate-500 line-clamp-2 h-10 mb-4 px-2 leading-relaxed">
         {{ quizMaster.headline || 'Passionate educator creating engaging quizzes.' }}
       </p>

       <!-- Stats / Tags -->
       <div class="flex flex-wrap justify-center gap-2 mb-6">
          <span 
            v-for="subject in displaySubjects" 
            :key="subject.id || subject"
            class="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100"
          >
            {{ subject.name || subject.title || subject.label || subject.slug || subject }}
          </span>
       </div>

       <!-- Action -->
       <span class="inline-flex items-center text-sm font-bold text-brand-600 group-hover:text-brand-700">
         View Profile <Icon name="heroicons:arrow-right" class="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
       </span>
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

import { resolveUserAvatar } from '~/composables/useAssets'

const avatarSrc = computed(() => resolveUserAvatar(props.quizMaster))

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

