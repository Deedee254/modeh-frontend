<template>
  <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3"></div>
      <div class="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
      <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
    </div>
  </div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <!-- Average Score -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average Score</span>
        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ avgScore }}<span class="text-lg">%</span></div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ totalAttempts }} quizzes completed</div>
    </div>

    <!-- Total Time -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Time</span>
        <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ formatTime(totalQuizTime) }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">All quizzes</div>
    </div>

    <!-- Points -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Points</span>
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ points || 0 }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400"><span class="text-brand-600 font-semibold">{{ pointsToday }}</span> today</div>
    </div>

    <!-- Streak -->
    <div class="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Streak</span>
        <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        </div>
      </div>
      <div class="text-3xl font-black text-gray-900 dark:text-white">{{ topStreak }}</div>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400"><span class="text-brand-600 font-semibold">{{ streakDays }}</span> days</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: true },
  avgScore: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  totalQuizTime: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  pointsToday: { type: Number, default: 0 },
  topStreak: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
})

function formatTime(seconds) {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>
