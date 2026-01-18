<template>
  <div v-if="loading" class="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
    <div class="h-6 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-6"></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i">
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
        <div class="h-8 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
      </div>
    </div>
  </div>
  <UiCard v-else class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div class="font-semibold text-lg">Performance Overview</div>
      </div>
    </template>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
      <div class="border-l-3 border-purple-500 pl-4">
        <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Average per Quiz</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatTime(avgQuizTime) }}</div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">How long you typically spend</p>
      </div>
      <div class="border-l-3 border-green-500 pl-4">
        <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Fastest Quiz</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatTime(fastestQuizTime) }}</div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Your personal best</p>
      </div>
      <div class="border-l-3 border-orange-500 pl-4">
        <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Per Question</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatTime(avgQuestionTime) }}</div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Average thinking time</p>
      </div>
    </div>
  </UiCard>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'

defineProps({
  loading: { type: Boolean, default: true },
  avgQuizTime: { type: Number, default: 0 },
  fastestQuizTime: { type: Number, default: 0 },
  avgQuestionTime: { type: Number, default: 0 },
})

function formatTime(seconds) {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>
