<template>
  <div class="flex flex-col bg-gray-50 h-screen">
    <!-- Header: Title, Progress, Timer -->
    <header class="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
      <div class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div class="flex items-center justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
          <!-- Left: Title and Progress -->
          <div class="flex-1 min-w-0">
            <h1 class="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{{ title }}</h1>
            <div class="flex items-center gap-1 sm:gap-2 mt-1">
              <span class="text-xs font-medium text-gray-600 whitespace-nowrap">Q{{ currentQuestion + 1 }}/{{ totalQuestions }}</span>
              <div class="flex-1 bg-gray-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                <div class="bg-brand-600 h-full transition-all" :style="{ width: `${progressPercent}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Right: Timer Circle -->
          <div v-if="showTimer" class="flex-shrink-0">
            <div class="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" class="text-gray-200" fill="none" />
                <circle class="transition-all" cx="20" cy="20" r="18" stroke-width="2" stroke-linecap="round" fill="none" :stroke-dasharray="timerCircumference" :stroke-dashoffset="timerDashOffset" :class="timerColorClass" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-mono font-semibold" :class="timerColorClass">{{ timerDisplay }}</div>
            </div>
          </div>
        </div>

        <!-- Info badges and encouragement -->
        <div v-if="showMeta" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 text-xs">
          <div class="flex flex-wrap gap-1 sm:gap-2">
            <slot name="meta-badges" />
          </div>
          <div v-if="encouragement" class="px-2 sm:px-3 py-0.5 rounded-full bg-gradient-to-r whitespace-nowrap font-semibold text-xs" :class="encouragementClass">
            {{ encouragement }}
          </div>
        </div>
      </div>
    </header>

    <!-- Alert/Status Messages -->
    <transition name="slide-down">
      <div v-if="alertMessage" :class="['max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-xs flex items-center gap-2 font-semibold', alertClass]">
        <svg class="w-4 h-4 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414L9 9.414V6z" clip-rule="evenodd" />
        </svg>
        <span>{{ alertMessage }}</span>
      </div>
    </transition>

    <!-- Main Content: Question Area -->
    <!-- add bottom padding on small screens to avoid content being hidden under the fixed footer -->
    <main class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-1 sm:py-2 pb-24 sm:pb-2 flex-1 w-full overflow-y-auto overflow-x-hidden min-h-0 flex flex-col items-center justify-center">
      <div class="w-full max-w-2xl">
        <slot name="content" />
      </div>
    </main>

    <!-- Footer: Navigation -->
    <!-- Make the footer fixed on small screens so controls behave like a bottom nav.
         On larger screens it remains sticky in flow. Add safe-area padding so it doesn't collide with device UI. -->
    <footer class="fixed sm:sticky bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex-shrink-0" style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 flex-wrap">
        <button 
          v-if="showPrevious" 
          @click="$emit('previous')" 
          :disabled="disablePrevious"
          class="px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base lg:text-lg font-medium"
        >
          ← Previous
        </button>

        <div v-else class="flex-1" />

        <div class="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          <button 
            v-if="showNext" 
            @click="$emit('next')" 
            :disabled="disableNext"
            class="px-5 sm:px-6 py-2 sm:py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base lg:text-lg font-semibold shadow-sm"
          >
            Next →
          </button>
          <button 
            v-else-if="showSubmit" 
            @click="$emit('submit')" 
            :disabled="disableSubmit"
            :class="['px-5 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-2 sm:gap-3', disableSubmit ? 'bg-gray-400 text-white opacity-60 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700']"
          >
            <svg v-if="isSubmitting" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
            </svg>
            <span>{{ isSubmitting ? 'Submitting…' : submitLabel }}</span>
          </button>
        </div>
      </div>
    </footer>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div class="flex items-start gap-2 sm:gap-3">
            <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">{{ confirmTitle }}</h3>
              <p class="text-xs sm:text-sm text-gray-600 mt-1">{{ confirmMessage }}</p>
            </div>
          </div>
          <div class="flex gap-2 sm:gap-3 justify-end pt-2 sm:pt-4">
            <button 
              @click="$emit('cancel-confirm')" 
              :disabled="isSubmitting"
              class="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button 
              @click="$emit('confirm-submit')" 
              :disabled="isSubmitting"
              class="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <svg v-if="isSubmitting" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
              </svg>
              {{ confirmButtonLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // Content
  title: { type: String, required: true },
  currentQuestion: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  
  // Timer
  showTimer: { type: Boolean, default: true },
  timerDisplay: { type: String, default: '00:00' },
  timerColorClass: { type: String, default: 'text-brand-600' },
  timerCircumference: { type: Number, default: 113 },
  timerDashOffset: { type: Number, default: 0 },
  
  // Encouragement
  encouragement: { type: String, default: '' },
  encouragementClass: { type: String, default: 'from-brand-100 to-brand-50 text-brand-700' },
  
  // Meta
  showMeta: { type: Boolean, default: true },
  
  // Alert/Status
  alertMessage: { type: String, default: '' },
  alertClass: { type: String, default: 'bg-brand-100 text-brand-800 border border-brand-300' },
  
  // Navigation
  showPrevious: { type: Boolean, default: true },
  disablePrevious: { type: Boolean, default: false },
  showNext: { type: Boolean, default: true },
  disableNext: { type: Boolean, default: false },
  
  // Submit
  showSubmit: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Submit' },
  disableSubmit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  
  // Confirmation
  showConfirmation: { type: Boolean, default: false },
  confirmTitle: { type: String, default: 'Confirm Submission' },
  confirmMessage: { type: String, default: 'Are you sure? You won\'t be able to change your answers.' },
  confirmButtonLabel: { type: String, default: 'Submit' },
})

defineEmits(['previous', 'next', 'submit', 'cancel-confirm', 'confirm-submit'])

const progressPercent = computed(() => {
  if (props.totalQuestions === 0) return 0
  return Math.round(((props.currentQuestion + 1) / props.totalQuestions) * 100)
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

