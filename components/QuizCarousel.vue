<template>
  <!-- Framed carousel: rounded container that clips content. Use white fades at
       the top/bottom to create a soft glow effect over the hero image. -->
  <div class="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] overflow-hidden rounded-3xl ring-1 ring-white/5">
    <!-- White gradient overlays for soft glow at ends -->
    <div class="pointer-events-none absolute left-0 right-0 top-0 z-10 h-24 bg-gradient-to-b from-white/50 to-transparent" />
    <div class="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-white/50 to-transparent" />

    <!-- Loading State -->
    <div v-if="props.loading || (Array.isArray(props.quizzes) && props.quizzes.length === 0)" class="absolute inset-0 flex items-center justify-center z-20">
      <div class="text-center">
        <div class="inline-block p-4 rounded-lg bg-slate-900/50 backdrop-blur-sm">
          <!-- Reuse spinner SVG used elsewhere for consistency -->
          <svg class="h-8 w-8 animate-spin text-brand-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p class="text-slate-300 text-sm font-medium">Loading quizzes...</p>
        </div>
      </div>
    </div>

    <!-- Scrolling Quiz Cards Container -->
    <div
      v-else
      :style="animationStyle"
      class="animate-scroll-up flex flex-col gap-3 sm:gap-5 py-4 w-full min-w-0 max-w-full overflow-hidden"
      @mouseenter="pauseAnimation"
      @mouseleave="resumeAnimation"
    >
      <div 
        v-for="(quiz, idx) in displayQuizzes" 
        :key="`${quiz.id}-${idx}`" 
        class="flex-shrink-0 w-full px-2 sm:px-3 min-w-0 max-w-full"
      >
          <QuizCard
          :quiz="quiz"
          :title="quiz.title || 'Untitled'"
          :quizId="quiz.id"
          :cover="quiz.cover_image || ''"
          :to="`/quizzes/${quiz.slug || quiz.id}`"
            :horizontal="isDesktop"
          :difficulty="quiz.difficulty"
          :level="quiz.level_name"
          :subject="quiz.subject_name"
          :topic="quiz.topic_name"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import QuizCard from '~/components/ui/QuizCard.vue'

interface Quiz {
  id: string | number
  slug?: string
  title?: string
  description?: string
  cover_image?: string
  difficulty?: string
  questions_count?: number
  attempts_count?: number
  likes?: number
  level_name?: string
  subject_name?: string
  topic_name?: string
  created_at?: string
}

const props = withDefaults(
  defineProps<{
    quizzes: Quiz[]
    duration?: number
    limit?: number
    loading?: boolean
  }>(),
  {
    duration: 50,
    limit: 8
  }
)

const isAnimating = ref(true)

// Responsive - detect desktop breakpoint (md and up)
const isDesktop = ref(false)
if (process.client) {
  const mq = window.matchMedia('(min-width: 768px)')
  const update = (e?: MediaQueryListEvent) => {
    isDesktop.value = e ? e.matches : mq.matches
  }
  onMounted(() => {
    // Initial check
    update()
    // Listen for changes
    try { 
      mq.addEventListener('change', update) 
    } catch (e) { 
      mq.addListener(update) 
    }
  })
  onUnmounted(() => {
    try { 
      mq.removeEventListener('change', update) 
    } catch (e) { 
      mq.removeListener(update) 
    }
  })
}

const displayQuizzes = computed(() => {
  // Sort by creation date (newest first)
  const base = Array.isArray(props.quizzes) ? [...props.quizzes] : []
  const sorted = base.slice().sort((a, b) => {
    const aDate = new Date(a?.created_at || 0)
    const bDate = new Date(b?.created_at || 0)
    return bDate.getTime() - aDate.getTime()
  })

  const limit = typeof props.limit === 'number' && props.limit > 0 ? props.limit : sorted.length
  const slice = sorted.slice(0, limit)

  // Duplicate for seamless infinite scroll
  return [...slice, ...slice]
})

// Watch for changes in quizzes data to restart animation properly
watch(() => props.quizzes, (newQuizzes) => {
  if (Array.isArray(newQuizzes) && newQuizzes.length > 0) {
    // Briefly pause and resume animation to reset carousel state
    isAnimating.value = false
    setTimeout(() => {
      isAnimating.value = true
    }, 100)
  }
}, { deep: false })

// Calculate scroll duration based on number of cards
const scrollDuration = computed(() => {
  const uniqueCards = Math.max(1, displayQuizzes.value.length / 2)
  const timePerCard = 5
  const totalDuration = uniqueCards * timePerCard
  return Math.max(30, totalDuration)
})

// Expose a plain JS style object computed so the template receives a concrete
// style and we can override the animation duration dynamically while using
// the CSS helper class for the rest of the animation properties.
const animationStyle = computed(() => ({
  animationDuration: `${scrollDuration.value}s`,
  animationPlayState: isAnimating.value ? 'running' : 'paused',
  willChange: 'transform'
}))

const pauseAnimation = () => {
  isAnimating.value = false
}

const resumeAnimation = () => {
  isAnimating.value = true
}
</script>

<style>
/* Infinite scroll animation */
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.animate-scroll-up {
  animation-name: scroll-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  /* default duration; will be overridden by inline style from Vue */
  animation-duration: 25s;
  /* Force GPU compositing and hide backface to reduce subpixel overflow on mobile */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* Ensure proper rendering on low-end devices */
  contain: layout style paint;
}

.animate-scroll-up:hover {
  animation-play-state: paused;
}

/* Ensure proper sizing on mobile when cards are horizontal */
@media (max-width: 767px) {
  .animate-scroll-up {
    /* Tighter spacing on mobile */
    gap: 0.75rem !important;
  }
}
</style>
