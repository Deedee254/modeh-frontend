<template>
  <UiCard v-if="topicStrength && topicStrength.length > 0" class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <div class="font-semibold text-lg">Topic Progress</div>
        <NuxtLink to="/quizee/topics" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 ml-auto">View all →</NuxtLink>
      </div>
    </template>
    <div class="p-6 space-y-5">
      <div v-for="topic in topicStrength.slice(0, 5)" :key="topic.name" class="group">
        <!-- Topic Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ topic.name }}</span>
          <span class="text-sm font-bold text-brand-600 dark:text-brand-400">{{ Math.round(topic.accuracy || 0) }}%</span>
        </div>
        
        <!-- Accuracy Progress Bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-2">
          <div class="bg-gradient-to-r from-brand-500 to-brand-600 h-2.5 rounded-full transition-all duration-700 ease-out group-hover:shadow-lg group-hover:shadow-brand-500/50" :style="{ width: Math.round(topic.accuracy || 0) + '%' }"></div>
        </div>
        
        <!-- Stats Row -->
        <div v-if="topic.quizzes_completed !== undefined || topic.progress !== undefined" class="grid grid-cols-2 gap-3 text-xs">
          <!-- Completion -->
          <div class="text-center">
            <div class="font-semibold text-gray-900 dark:text-white">{{ Math.round(topic.progress || 0) }}%</div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">complete</p>
          </div>
          <!-- Quizzes Completed -->
          <div class="text-center">
            <div class="font-semibold text-gray-900 dark:text-white">{{ topic.quizzes_completed || 0 }}/{{ topic.total_quizzes || '?' }}</div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">quizzes</p>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'

defineProps({
  topicStrength: { type: Array, default: () => [] },
})
</script>
