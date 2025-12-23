<template>
  <div class="group relative flex w-full flex-col rounded-lg overflow-hidden transition-all duration-300 h-full bg-white shadow-sm hover:shadow-md border border-slate-200 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
    
    <!-- Hero Image (Aspect Ratio 16:9) -->
    <div class="relative w-full aspect-video bg-slate-100 overflow-hidden">
       <!-- Gradient Overlay for Image fallback if no image -->
       <div v-if="!resolvedCover" class="absolute inset-0 bg-gradient-to-br from-[#891f21] to-[#a83435] flex items-center justify-center">
          <Icon :name="isCourse ? 'heroicons:academic-cap' : 'heroicons:book-open'" class="h-12 w-12 text-white/50" />
       </div>
       <img v-else :src="resolvedCover" :alt="displayTitle" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

       <!-- Badge Top Left -->
       <div class="absolute top-2 left-2">
         <div class="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm border border-black/5">
            {{ isCourse ? 'COURSE' : 'GRADE' }}
         </div>
       </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 p-4">
       <!-- Title -->
       <h3 class="text-[16px] leading-[22px] font-semibold text-[#1f1f1f] dark:text-white line-clamp-2 mb-2 transition-colors">
         {{ displayTitle }}
       </h3>

       <!-- Description -->
       <p v-if="displayDescription" class="text-[13px] text-[#6a6f73] line-clamp-2 mb-4 leading-relaxed">
         {{ displayDescription }}
       </p>
       <div v-else class="mb-4"></div>

       <!-- Footer Area -->
       <div class="mt-auto">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-2 mb-4">
             <div class="flex items-center gap-1.5 text-[11px] text-[#6a6f73] bg-slate-50 p-1.5 rounded border border-slate-100">
                <Icon name="heroicons:document-text" class="h-3.5 w-3.5 text-slate-400" />
                <span class="font-bold text-slate-700">{{ quizzes_count }}</span> Qs
             </div>
             <div class="flex items-center gap-1.5 text-[11px] text-[#6a6f73] bg-slate-50 p-1.5 rounded border border-slate-100">
                <Icon name="heroicons:squares-2x2" class="h-3.5 w-3.5 text-slate-400" />
                <span class="font-bold text-slate-700">{{ subjects_count }}</span> Subj
             </div>
          </div>

          <!-- Action Button -->
          <NuxtLink 
            v-if="to" 
            :to="to" 
            class="w-full inline-flex items-center justify-center rounded px-4 py-2 text-[13px] font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors relative z-10 shadow-sm"
          >
            Explore
          </NuxtLink>
       </div>
    </div>

    <!-- Full Clickable Overlay -->
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-label="Explore"></NuxtLink>
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
