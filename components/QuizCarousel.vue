<template>
  <div class="relative w-full h-[300px] sm:h-[450px] lg:h-[600px] overflow-hidden rounded-3xl bg-slate-900/10 backdrop-blur-sm border border-white/5 mx-auto">
    <!-- Soft Glow Overlays -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-slate-950/50 to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-slate-950/50 to-transparent" />

    <!-- Loading State -->
    <div v-if="props.loading || !displayQuizzes.length" class="absolute inset-0 flex items-center justify-center z-20">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p class="text-slate-300 text-sm font-medium">Loading quizzes...</p>
      </div>
    </div>

    <!-- Scrolling Container -->
    <div
      v-else
      :style="animationStyle"
      class="flex flex-col gap-3 p-3 w-full animate-scroll-vertical"
      @mouseenter="pauseAnimation"
      @mouseleave="resumeAnimation"
    >
      <div 
        v-for="(quiz, idx) in displayQuizzes" 
        :key="quiz.slug || idx" 
        class="flex-shrink-0 w-full"
      >
        <QuizCard
          :quiz="quiz"
          :title="quiz.title || 'Untitled'"
          :quizId="quiz.id"
          :cover="quiz.cover_image || ''"
          :to="{ path: `/quizzes/${quiz.slug}` }"
          :horizontal="true"
          :difficulty="quiz.difficulty"
          :level="quiz.level_name"
          :subject="quiz.subject_name"
          :topic="quiz.topic_name"
          class="!shadow-none !border-white/10 !bg-white transition-colors"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import type { Quiz } from '~/types'

const props = withDefaults(
  defineProps<{
    quizzes: Quiz[]
    duration?: number
    limit?: number
    loading?: boolean
  }>(),
  {
    duration: 40,
    limit: 8
  }
)

const isAnimating = ref(true)

const displayQuizzes = computed(() => {
  const base = Array.isArray(props.quizzes) ? [...props.quizzes] : []
  const sorted = base.sort((a, b) => {
    const aDate = new Date(a?.created_at || 0)
    const bDate = new Date(b?.created_at || 0)
    return bDate.getTime() - aDate.getTime()
  })

  const limitCount = props.limit || sorted.length
  const slice = sorted.slice(0, limitCount)

  // Infinite scroll duplication
  return slice.length > 0 ? [...slice, ...slice] : []
})

const animationStyle = computed(() => ({
  animationDuration: `${props.duration}s`,
  animationPlayState: isAnimating.value ? 'running' : 'paused',
}))

const pauseAnimation = () => { isAnimating.value = false }
const resumeAnimation = () => { isAnimating.value = true }
</script>

<style scoped>
@keyframes scroll-vertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.animate-scroll-vertical {
  animation-name: scroll-vertical;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
</style>
