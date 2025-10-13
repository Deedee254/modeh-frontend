<template>
  <div class="relative group rounded-2xl bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-0.5 hover:scale-[1.01]">
    <!-- Whole-card clickable overlay when `to` prop is provided -->
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>
  <!-- tighter heights on mobile -->
  <div class="w-full h-16 sm:h-28 bg-gray-100 overflow-hidden relative">
      <template v-if="image">
        <img :src="image" alt="" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"></div>
        <div class="absolute left-3 bottom-3 right-3 text-white z-10">
          <h4 class="text-sm font-semibold line-clamp-2">{{ title }}</h4>
        </div>
      </template>
      <template v-else>
        <div :class="['w-full h-full grid place-items-center font-bold', paletteClass]">
          <span class="text-white text-2xl">{{ badgeText || (title||'').charAt(0).toUpperCase() }}</span>
        </div>
      </template>
    </div>
  <div class="p-3 sm:p-5 relative z-10">
  <div class="min-w-0">
  <div class="text-[11px] sm:text-xs text-gray-500">{{ eyebrow }}</div>
  <h3 v-if="!image" class="font-semibold truncate text-sm sm:text-base text-indigo-900 dark:text-indigo-200">{{ title }}</h3>
        <!-- show subtitle only if no meta chips (we keep chips which have background) -->
        <div v-if="subtitle && !hasMeta" class="text-[11px] sm:text-xs text-gray-500 mt-1">{{ subtitle }}</div>
      </div>
      <div class="mt-3">
        <slot />
      </div>
  <div v-if="hasMeta" class="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
        <template v-for="chip in metaChips" :key="chip.key">
          <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">{{ chip.label }}</span>
        </template>
      </div>

      <!-- Card footer with primary Start CTA and optional Details -->
      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
        <div class="p-3 sm:p-4 flex items-center gap-3">
          <div class="flex-1">
            <NuxtLink v-if="detailsLink" :to="detailsLink" class="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-transparent rounded-md text-sm text-indigo-700 dark:text-indigo-200">Details</NuxtLink>
          </div>
          <div class="w-36 sm:w-40">
            <NuxtLink v-if="startLink" :to="startLink" @click.stop class="inline-flex justify-center items-center w-full px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold">Start</NuxtLink>
            <button v-else @click.stop="startNow" class="inline-flex justify-center items-center w-full px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold">Start</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'indigo' },
  badgeText: { type: String, default: '' },
  image: { type: String, default: '' },
  fallback: { type: String, default: '/images/subject-icon.svg' },
  // Optional: an explicit palette/class string to use for the fallback tile
  palette: { type: String, default: '' },
  to: { type: [String, Object], default: null },
  // Optional CTA link shown as a separate Details button
  detailsLink: { type: [String, Object], default: null },
  // Optional primary CTA to start or open the item directly
  startLink: { type: [String, Object], default: null },
  // Metadata props (optional)
  grade: { type: [String, Number], default: null },
  grades: { type: Array, default: () => [] },
  subject: { type: String, default: '' },
  quizzesCount: { type: [Number, String], default: null },
  topicsCount: { type: [Number, String], default: null },
  subjectsCount: { type: [Number, String], default: null },
  tutor: { type: String, default: '' }
})

const palettes = {
  indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
  emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  violet: 'bg-gradient-to-br from-violet-400 to-violet-600',
  sky: 'bg-gradient-to-br from-sky-300 to-sky-500',
  amber: 'bg-gradient-to-br from-amber-300 to-amber-500',
  rose: 'bg-gradient-to-br from-rose-300 to-rose-500',
  green: 'bg-gradient-to-br from-green-300 to-green-500'
}

const paletteClass = computed(() => {
  if (props.palette && typeof props.palette === 'string' && props.palette.trim().length) return props.palette
  return palettes[props.color] || palettes.indigo
})

// navigation helper for CTA
const router = useRouter()
function startNow(e) {
  e.stopPropagation()
  const dest = props.startLink || props.to
  try { router.push(dest) } catch (err) { /* ignore */ }
}

const hasMeta = computed(() => {
  return !!(props.grade || (props.grades && props.grades.length) || props.subject || props.quizzesCount != null || props.topicsCount != null || props.subjectsCount != null || props.tutor)
})

const metaChips = computed(() => {
  const out = []
  if (props.grade) out.push({ key: 'grade', label: typeof props.grade === 'string' || typeof props.grade === 'number' ? `Grade ${props.grade}` : String(props.grade) })
  if (Array.isArray(props.grades) && props.grades.length) out.push({ key: 'grades', label: `Grades ${props.grades.map(g => g.name || g).join(', ')}` })
  if (props.subject) out.push({ key: 'subject', label: props.subject })
  if (props.quizzesCount != null) out.push({ key: 'quizzes', label: `${props.quizzesCount} quizzes` })
  if (props.topicsCount != null) out.push({ key: 'topics', label: `${props.topicsCount} topics` })
  if (props.subjectsCount != null) out.push({ key: 'subjects', label: `${props.subjectsCount} subjects` })
  if (props.tutor) out.push({ key: 'tutor', label: props.tutor })
  return out
})
</script>