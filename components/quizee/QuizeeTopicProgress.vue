<template>
  <div>
    <!-- Skeleton Loader -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse">
        <div class="flex items-center justify-between mb-3">
          <div class="h-5 bg-gray-200 dark:bg-slate-600 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 dark:bg-slate-600 rounded w-16"></div>
        </div>
        <div class="h-2 bg-gray-200 dark:bg-slate-600 rounded-full"></div>
      </div>
    </div>

    <!-- Topics List -->
    <div v-else-if="topics.length" class="space-y-4">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
      >
        <!-- Topic Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3 flex-1">
            <!-- Topic Icon/Color -->
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: topic.color || '#e5e7eb', color: getTextColor(topic.color) }"
            >
              <span class="text-lg">{{ topic.icon || '📚' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ topic.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ topic.quizzes_completed || 0 }} of {{ topic.total_quizzes || 0 }} quizzes completed
              </p>
            </div>
          </div>
          <!-- Progress Percentage -->
          <div class="flex flex-col items-end flex-shrink-0 ml-4">
            <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {{ Math.round(topic.progress || 0) }}%
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">complete</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="relative h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
            :style="{ width: `${Math.round(topic.progress || 0)}%` }"
          ></div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <!-- Accuracy -->
          <div class="text-center">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ Math.round(topic.accuracy || 0) }}%
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">accuracy</p>
          </div>
          <!-- Time Spent -->
          <div class="text-center">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ formatTime(topic.time_spent || 0) }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">time spent</p>
          </div>
          <!-- Streak -->
          <div class="text-center">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ topic.streak || 0 }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">day streak</p>
          </div>
        </div>
      </div>

      <!-- View All Topics Button -->
      <div class="text-center pt-2">
        <NuxtLink
          to="/quizee/topics"
          class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <span>View all topics</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 font-medium">No topics yet</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Start a quiz to see your topic progress</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useApi from '~/composables/useApi'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  topics: {
    type: Array,
    default: () => []
  }
})

// Helper to format time
function formatTime(seconds) {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Get contrasting text color for background
function getTextColor(bgColor) {
  if (!bgColor) return '#000000'
  // Simple contrast check - if color is dark, use white text
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 155 ? '#000000' : '#ffffff'
}
</script>
