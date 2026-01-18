<template>
  <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="flex-1 font-semibold text-lg">Recent Quizzes</div>
        <NuxtLink to="/quiz-master/quizzes" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">View all →</NuxtLink>
      </div>
    </template>

    <div class="p-6">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse"></div>
      </div>
      <div v-else-if="error" class="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div class="font-semibold">Failed to load quizzes</div>
        <div class="text-xs mt-1">{{ error?.message || 'Unknown error' }}</div>
      </div>
      <div v-else-if="!quizzes || quizzes.length === 0" class="text-center py-8">
        <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">No quizzes yet</p>
        <NuxtLink to="/quiz-master/quizzes/create" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Create Your First Quiz
        </NuxtLink>
      </div>
      <div v-else class="space-y-3">
        <div v-for="(q, idx) in (Array.isArray(quizzes) ? quizzes.filter(Boolean).slice(0, 5) : [])" :key="q?.slug || idx" class="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ q?.title || 'Untitled' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ q?.description || 'No description' }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ q?.items_count || q?.questions_count || 0 }} Q's
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <NuxtLink v-if="q?.slug" :to="`/quiz-master/quizzes/${q.slug}`" class="p-2 text-brand-600 dark:text-brand-400 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'

defineProps({
  loading: { type: Boolean, default: true },
  quizzes: { type: Array, default: () => [] },
  error: { type: Error, default: null },
})
</script>
