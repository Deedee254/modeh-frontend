<template>
  <ClientOnly>
    <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center">
            <svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
          </div>
          <div class="flex items-center gap-3 flex-1">
            <div class="font-semibold text-lg">Recommended for you</div>
            <span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-full">Grade {{ displayGrade }}</span>
          </div>
        </div>
      </template>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
        <div v-if="loading">
          <SkeletonGrid :count="2" variant="single-row" />
        </div>
        <div v-else-if="!quizzes.length" class="col-span-full py-8 text-center">
          <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">No recommendations yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try browsing quizzes to get personalized suggestions</p>
        </div>
        <NuxtLink v-for="q in quizzes" :key="q.id" :to="`/quizee/quizzes/${q.slug}`" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border border-gray-200 dark:border-slate-600 p-5 hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="absolute inset-0 bg-gradient-to-br from-brand-600/0 to-brand-600/0 group-hover:from-brand-600/5 group-hover:to-brand-600/10 transition-all duration-300"></div>
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ q.title || q.name || 'Untitled Quiz' }}</h3>
              </div>
              <div class="ml-3 flex-shrink-0">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ q.description || 'Challenge yourself with this quiz' }}</p>
            <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 group-hover:bg-brand-700 text-white font-semibold rounded-lg transition-all duration-200">
              <span>Take Quiz</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </UiCard>
  </ClientOnly>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'
import SkeletonGrid from '~/components/SkeletonGrid.vue'

defineProps({
  loading: { type: Boolean, default: true },
  quizzes: { type: Array, default: () => [] },
  displayGrade: { type: [String, Number], default: '8' },
})
</script>
