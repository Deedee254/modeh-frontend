<template>
  <div class="group relative flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 hover:scale-[1.02]">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- left color strip -->
    <div :class="['absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl', paletteClass]" aria-hidden="true"></div>

    <div class="flex flex-1 flex-col p-3 sm:p-4 pl-6">
      <h4 class="text-sm sm:text-base font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">{{ displayTitle }}</h4>
      <p v-if="displayDescription" class="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{{ displayDescription }}</p>

      <!-- Metadata -->
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800">
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:document-text" class="h-4 w-4" />
          <span>{{ quizzes_count }} {{ quizzes_count === 1 ? 'quiz' : 'quizzes' }}</span>
        </div>
        <div class="inline-flex items-center gap-1.5">
          <Icon name="heroicons:squares-2x2" class="h-4 w-4" />
          <span>{{ subjects_count }} {{ subjects_count === 1 ? 'subject' : 'subjects' }}</span>
        </div>
      </div>



      <!-- CTA -->
      <div class="relative z-10 mt-auto flex flex-col sm:flex-row items-center gap-2 pt-4">
        <NuxtLink v-if="actionLink" :to="actionLink" :class="primaryBtn">
          {{ actionLabel }}
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
  description: { type: String, default: '' }
})

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-rose-500'
})

const displayTitle = computed(() => props.title || props.grade?.name || 'Grade')
const displayDescription = computed(() => props.description || props.grade?.description || props.subtitle || '')

const isCourse = computed(() => {
  if (props.grade && typeof props.grade === 'object') return String(props.grade.type || '').toLowerCase() === 'course'
  return false
})



const resolvedCover = computed(() => {
  const v = props.cover || (props.grade && (props.grade.cover_image || props.grade.cover)) || ''
  return resolveAssetUrl(v) || ''
})

// Uniform primary button used across cards (mobile full-width, stacks)
const primaryBtn = 'inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm'
</script>