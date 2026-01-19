<template>
  <ClientOnly>
    <UiCard class="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-burgundy-100 to-burgundy-50 dark:from-burgundy-900/30 dark:to-burgundy-800/30 flex items-center justify-center">
            <svg class="w-5 h-5 text-burgundy-600 dark:text-burgundy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
          </div>
          <div class="flex items-center gap-3 flex-1">
            <div class="font-semibold text-lg">Recommended for you</div>
            <span class="text-xs font-bold px-3 py-1 bg-gradient-to-r from-burgundy-100 to-burgundy-100 dark:from-burgundy-900/30 dark:to-burgundy-900/30 text-burgundy-700 dark:text-burgundy-300 rounded-full">Grade {{ displayGrade }}</span>
          </div>
        </div>
      </template>

      <div class="mt-4 p-6">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <svg class="h-8 w-8 animate-spin text-burgundy-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div v-else-if="!quizzes.length" class="py-8 text-center">
          <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">No recommendations yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try browsing quizzes to get personalized suggestions</p>
        </div>
        <div v-else class="space-y-3">
          <!-- Horizontal Card - Stacked Vertically -->
          <div 
            v-for="q in quizzes"
            :key="q.id"
            class="relative p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-burgundy-300 dark:hover:border-burgundy-500 hover:shadow-sm transition-all group flex gap-3 h-fit"
          >
            <!-- Left: Image thumbnail -->
            <div class="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
              <img v-if="q.cover_image || q.cover" :src="q.cover_image || q.cover" :alt="q.title" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                <UIcon name="heroicons:photo" class="text-xl" />
              </div>
            </div>
            
            <!-- Middle: Content -->
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <!-- Topic/Subject -->
              <div>
                <div v-if="q.topic?.name || q.topic_name" class="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider mb-0.5 truncate">
                  {{ q.topic?.name || q.topic_name }}
                </div>
                
                <!-- Title -->
                <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-400 transition-colors">
                  {{ q.title || q.name || 'Untitled Quiz' }}
                </h4>
              </div>
              
              <!-- Meta -->
              <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span class="flex items-center gap-1">
                  <UIcon name="heroicons:question-mark-circle" class="w-3 h-3" />
                  {{ q.questions_count ?? q.questions ?? 0 }} Qs
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="heroicons:clock" class="w-3 h-3" />
                  {{ Math.floor((q.timer_seconds || 600) / 60) }}m
                </span>
              </div>
            </div>
            
            <!-- Right: Action Area -->
            <div class="flex flex-col items-center gap-2 flex-shrink-0 self-center">
              <!-- Like Button -->
              <button 
                @click.stop="$emit('quiz-liked', { quiz: q, liked: !q.liked })"
                class="text-slate-400 hover:text-rose-500 transition-colors p-1 relative z-10"
              >
                <UIcon :name="q.liked ? 'heroicons:heart-solid' : 'heroicons:heart'" class="w-4 h-4" :class="q.liked ? 'text-rose-500' : ''" />
              </button>
              <!-- Start Button -->
              <NuxtLink 
                :to="`/quizee/quizzes/${q.slug}`" 
                class="px-3 py-1.5 bg-burgundy-600 hover:bg-burgundy-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 relative z-10"
              >
                Start
              </NuxtLink>
            </div>
            
            <NuxtLink :to="`/quizee/quizzes/${q.slug}`" class="absolute inset-0 z-0" aria-label="View quiz"></NuxtLink>
          </div>
        </div>
      </div>
    </UiCard>
  </ClientOnly>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'

defineProps({
  loading: { type: Boolean, default: true },
  quizzes: { type: Array, default: () => [] },
  displayGrade: { type: [String, Number], default: '8' },
})

defineEmits(['quiz-liked'])
</script>
