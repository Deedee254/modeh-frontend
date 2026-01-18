<template>
  <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3"></div>
      <div class="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
      <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
    </div>
  </div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <!-- Quizzes Created -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quizzes</span>
        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ quizzesCount }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Total created</div>
    </div>

    <!-- Questions -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Questions</span>
        <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ questionsCount }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">In your bank</div>
    </div>

    <!-- Published -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Published</span>
        <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ publishedCount }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Approved</div>
    </div>

    <!-- Pending -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</span>
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ pendingCount }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Awaiting review</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: true },
  quizzesCount: { type: Number, default: 0 },
  questionsCount: { type: Number, default: 0 },
  publishedCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
})
</script>
