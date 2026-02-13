<template>
  <!-- Horizontal variant (Mobile) -->
  <div v-if="isHorizontal" class="group relative w-full flex flex-row rounded-lg overflow-hidden transition-all duration-300 bg-white shadow-sm hover:shadow-md border border-slate-200 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
    <!-- Image Left (Fixed width) -->
    <div class="relative w-24 sm:w-28 flex-shrink-0 bg-slate-100 overflow-hidden rounded-l-lg">
      <img v-if="finalImage" :src="finalImage" :alt="displayTitle" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div v-else class="h-full w-full bg-gradient-to-br from-brand-50 to-brand-100/50 flex items-center justify-center">
        <span class="text-lg font-bold text-brand-800">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
      </div>
      <!-- Grade Badge on image -->
      <div v-if="displayGrade" class="absolute top-1 left-1 z-20">
        <div class="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm border border-black/5">
          {{ displayGrade }}
        </div>
      </div>
    </div>

    <!-- Content Right -->
    <div class="flex flex-col flex-1 min-w-0 p-3">
      <h3 class="text-[14px] leading-[18px] font-semibold text-[#1f1f1f] dark:text-white line-clamp-2 mb-1">
        {{ displayTitle }}
      </h3>
      
      <!-- Meta -->
      <div class="mt-auto flex items-center justify-between text-xs text-[#6a6f73]">
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ topicsCount }}</span>
          <span class="text-slate-400">•</span>
          <span class="font-medium">{{ quizzes_count }}</span>
        </div>
          <NuxtLink 
            v-if="link" 
            :to="link" 
          class="inline-flex items-center justify-center rounded px-3 py-1 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors shadow-sm relative z-10"
        >
          View
        </NuxtLink>
      </div>
    </div>
    
      <NuxtLink v-if="link" :to="link" class="absolute inset-0 z-0" aria-label="Explore Subject"></NuxtLink>
  </div>

  <!-- Vertical variant (Desktop) -->
  <div v-else class="group relative flex w-full flex-col rounded-lg overflow-hidden transition-all duration-300 h-full bg-white shadow-sm hover:shadow-md border border-slate-200 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900 p-3">
    
    <!-- Hero Image (Fixed height h-32 to match QuizCard, allows shrinking) -->
    <div class="relative w-full h-32 bg-slate-100 overflow-hidden rounded-md">
       <!-- Use Icon/Image fallback logic -->
       <div v-if="!image && !iconName" class="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100/50 flex items-center justify-center">
          <span class="text-2xl font-bold text-brand-800">{{ (displayTitle || '').charAt(0).toUpperCase() }}</span>
       </div>
       <div v-else-if="iconName" class="absolute inset-0 bg-slate-50 flex items-center justify-center">
          <Icon :name="iconName" class="h-12 w-12 text-slate-400" />
       </div>
       <img v-else :src="finalImage" :alt="displayTitle" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

       <!-- Badge Top Left -->
       <div class="absolute top-2 left-2" v-if="displayGrade">
         <div class="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm border border-black/5">
            {{ displayGrade }}
         </div>
       </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 mt-3">
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
       <div class="mt-auto flex items-center justify-between">
          <!-- Stats Grid -->
          <div class="flex items-center gap-3 text-[12px] text-[#6a6f73]">
             <div class="flex items-center gap-1">
                <span class="font-bold text-slate-700">{{ topicsCount }}</span> Topics
             </div>
             <span class="text-slate-300">|</span>
             <div class="flex items-center gap-1">
                <span class="font-bold text-slate-700">{{ quizzes_count }}</span> Quizzes
             </div>
          </div>

        <NuxtLink 
          v-if="link" 
          :to="link" 
            class="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors shadow-sm relative z-10"
          >
            Explore
          </NuxtLink>
       </div>
    </div>

    <!-- Full Clickable Overlay -->
    <NuxtLink v-if="link" :to="link" class="absolute inset-0 z-0" aria-label="Explore Subject"></NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  grade: { type: [String, Number, Object], default: null },
  palette: { type: String, default: '' },
  topicsCount: { type: [Number, String], default: 0 },
  quizzes_count: { type: [Number, String], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'Explore Topics' },
  subject: { type: Object, default: null },
  isHorizontal: { type: Boolean, default: false },
})

const finalImage = computed(() => {
  // Use provided image first, otherwise use default subject image
  return props.image || '/images/subject.png'
})

const iconName = computed(() => {
  const s = props.subject
  if (s && s.icon && typeof s.icon === 'string' && s.icon.trim()) return s.icon.trim()
  if (props.image && typeof props.image === 'string' && props.image.includes(':')) return props.image
  return null
})

const displayTitle = computed(() => props.title || props.name || props.subject?.name || 'Subject')
const displayDescription = computed(() => props.description || props.subject?.description || '')

const store = useTaxonomyStore()

const displayGrade = computed(() => {
  const g = props.grade || props.subject?.grade
  if (!g) return ''

  // If grade is an object, prefer readable name fields
  if (typeof g === 'object') return g.name || g.title || g.label || String(g.id || '')

  // If grade is a primitive (id or slug), try to resolve from taxonomy store
  try {
    const idStr = String(g)
    const found = (store.grades || []).find(x => x && (String(x.id) === idStr || String(x.slug || '') === idStr || String(x.name || '') === idStr))
    if (found) return found.display_name || found.name || found.title || String(found.id)
  } catch (e) {
    // ignore
  }

  // fallback to showing the raw value
  return String(g)
})

const isCourse = computed(() => {
  const g = props.grade || props.subject?.grade
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course'
})

// Compute preferred link (support both `to` and legacy `startLink` prop)
const link = computed(() => props.to || props.startLink || null)
</script>
