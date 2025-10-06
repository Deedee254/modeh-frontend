<template>
  <NuxtLink :to="to" class="group block rounded-2xl border border-transparent bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition overflow-hidden relative">
    <!-- Accent gradient border on hover -->
    <div class="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition" aria-hidden="true"
         style="background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(16,185,129,.06));"></div>
    <!-- Top media -->
    <div class="w-full h-40 bg-gray-100 overflow-hidden">
      <template v-if="cover">
        <img :src="cover" alt="cover" class="w-full h-full object-cover" />
      </template>
      <template v-else>
        <div :class="['w-full h-full grid place-items-center font-bold', paletteClass]">
          <span class="text-white text-2xl">{{ (title||'').charAt(0).toUpperCase() }}</span>
        </div>
      </template>
    </div>
    <div class="p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-semibold text-indigo-900 dark:text-indigo-200 truncate text-base">{{ title }}</h3>
          <div class="text-xs text-gray-500 mt-2 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              <span class="i-heroicons-book-open text-[14px]"></span>
              <span>{{ topic || 'General' }}</span>
            </span>
            <span v-if="marks" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{{ marks }} pts</span>
            <span v-if="difficulty" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{{ difficultyLabel }}</span>
          </div>
          <div class="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span class="i-heroicons-user-circle text-[18px]"></span>
            <span>{{ tutor || 'Anonymous Tutor' }}</span>
          </div>
        </div>
        <div class="shrink-0 text-xs text-gray-500">{{ updatedAtLabel }}</div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  topic: { type: String, default: '' },
  marks: { type: [String, Number], default: '' },
  updatedAt: { type: [String, Number, Date], default: '' },
  cover: { type: String, default: '' },
  difficulty: { type: [String, Number], default: null },
  // optional palette class for fallback tile
  palette: { type: String, default: '' },
  // tutor who owns the quiz
  tutor: { type: String, default: '' }
})

const difficultyLabel = computed(() => {
  const d = props.difficulty
  if (d == null) return null
  if (d <= 1) return 'Easy'
  if (d === 2) return 'Medium'
  return 'Hard'
})

const paletteClass = computed(() => {
  if (props.palette && props.palette.trim()) return props.palette
  return 'bg-gradient-to-br from-indigo-400 to-indigo-600'
})

const updatedAtLabel = computed(() => {
  if (!props.updatedAt) return '—'
  try {
    const d = new Date(props.updatedAt)
    if (Number.isNaN(+d)) return '—'
    return `Updated ${d.toLocaleDateString()}`
  } catch (e) {
    return '—'
  }
})
</script>