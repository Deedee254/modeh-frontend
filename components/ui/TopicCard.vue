<template>
  <div class="group relative flex w-full flex-col rounded-lg overflow-hidden transition-all duration-300 h-full bg-white shadow-sm hover:shadow-md border border-slate-200 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
    
    <!-- Hero Section (Aspect Ratio 16:9) -->
    <div class="relative w-full aspect-video bg-slate-100 overflow-hidden">
       <!-- Gradient Overlay for Topic if no image -->
       <div v-if="!image" class="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100/50 flex items-center justify-center opacity-60">
          <Icon name="heroicons:document-text" class="h-12 w-12 text-brand-700/50" />
       </div>
       <img v-else :src="image" :alt="displayTitle" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

       <!-- Badge Top Left -->
       <div class="absolute top-2 left-2">
         <div class="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm border border-black/5">
            TOPIC
         </div>
       </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 p-4">
       <!-- Organization / Subject Name -->
       <div class="flex items-center gap-1.5 mb-2">
          <span class="text-[13px] font-medium text-[#6a6f73] truncate">{{ displaySubject || 'Learning Resource' }}</span>
       </div>

       <!-- Title -->
       <h3 class="text-[16px] leading-[22px] font-semibold text-[#1f1f1f] dark:text-white line-clamp-2 mb-2 transition-colors">
         {{ displayTitle }}
       </h3>

       <!-- Description -->
       <p v-if="displayDescription" class="text-[13px] text-[#6a6f73] line-clamp-2 mb-4 leading-relaxed">
         {{ displayDescription }}
       </p>
       <div v-else class="mb-4"></div>

       <!-- Tags -->
       <div class="flex flex-wrap gap-2 mb-4">
          <span v-if="displayGrade" class="px-2 py-0.5 bg-[#f1f3f4] text-[#6a6f73] text-[11px] font-medium rounded-full border border-slate-100">
            {{ displayGrade }}
          </span>
          <span v-if="displayCourse" class="px-2 py-0.5 bg-[#f1f3f4] text-[#6a6f73] text-[11px] font-medium rounded-full border border-slate-100">
            {{ displayCourse }}
          </span>
       </div>

       <!-- Footer: Meta -->
       <div class="mt-auto flex items-center justify-between">
          <div class="flex items-center gap-1 text-[12px] text-[#6a6f73]">
             <span class="font-bold text-slate-700">{{ quizzesCount }}</span> 
             <span>{{ quizzesCount === 1 ? 'Quiz' : 'Quizzes' }}</span>
          </div>

          <NuxtLink 
            :to="to || (quizId ? `/quizzes/${props.quiz?.slug || quizId}` : '#')" 
            class="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors shadow-sm relative z-10"
          >
            Open
          </NuxtLink>
       </div>
    </div>

    <!-- Full Clickable Overlay -->
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-label="View Topic Details"></NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  palette: { type: String, default: '' },
  subject: { type: [String, Object], default: '' },
  grade: { type: [String, Object], default: '' },
  course: { type: [String, Object], default: '' },
  quizzesCount: { type: [String, Number], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'View Quizzes' },
  topic: { type: Object, default: null },
})

const displayTitle = computed(() => props.title || props.name || props.topic?.name || 'Topic')
const displayDescription = computed(() => props.description || props.topic?.description || '')
const displaySubject = computed(() => {
  const s = props.subject || (props.topic?.subject)
  if (!s) return ''
  if (typeof s === 'string') return s
  return s.name || s.title || s.label || String(s.id || '')
})
const displayGrade = computed(() => {
  const g = props.grade || props.topic?.grade
  if (!g) return ''
  if (typeof g === 'string') return g
  return g.name || g.title || String(g.id || '')
})
const displayCourse = computed(() => {
  const c = props.course || props.topic?.course
  if (!c) return ''
  if (typeof c === 'string') return c
  return c.name || c.title || String(c.id || '')
})
</script>
