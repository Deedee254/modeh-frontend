<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 border-b">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Quiz Complete! 🎉</h2>
            <p class="text-brand-100 mt-1">{{ results?.quiz_title }}</p>
          </div>
          <button
            v-if="!alreadyAttempted"
            @click="$emit('close')"
            class="p-2 hover:bg-brand-500 rounded-lg transition"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Results Content -->
      <div class="p-6 space-y-6 relative">
        <!-- Blurred Results Section (for non-authenticated users) -->
        <div v-if="!isAuthenticated" class="relative">
          <!-- Score Card - Blurred -->
          <div class="grid grid-cols-3 gap-4 blur-sm opacity-50">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-600 font-medium">Score</p>
              <p class="text-3xl font-bold text-green-600">{{ results?.percentage || 0 }}%</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-600 font-medium">Correct</p>
              <p class="text-3xl font-bold text-blue-600">{{ results?.correct_count }}/{{ results?.total_questions }}</p>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-600 font-medium">Time</p>
              <p class="text-3xl font-bold text-amber-600">{{ formatTime(results?.time_taken || 0) }}</p>
            </div>
          </div>

          <!-- Unlock Overlay -->
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-lg backdrop-blur-sm">
            <Icon name="heroicons:lock-closed" class="h-12 w-12 text-blue-600 mb-3" />
            <p class="text-center font-semibold text-gray-800 mb-3">See your full results</p>
            <button
              @click="$emit('signup')"
              class="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition shadow-lg"
            >
              Sign Up to View Results
            </button>
          </div>
        </div>

        <!-- Clear Results (for authenticated users) -->
        <div v-else class="grid grid-cols-3 gap-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-600 font-medium">Score</p>
            <p class="text-3xl font-bold text-green-600">{{ results?.percentage || 0 }}%</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-600 font-medium">Correct</p>
            <p class="text-3xl font-bold text-blue-600">{{ results?.correct_count }}/{{ results?.total_questions }}</p>
          </div>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-600 font-medium">Time</p>
            <p class="text-3xl font-bold text-amber-600">{{ formatTime(results?.time_taken || 0) }}</p>
          </div>
        </div>

        <!-- Performance Message -->
        <div class="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-200">
          <p class="text-gray-700 font-medium">{{ performanceMessage }}</p>
        </div>

        <!-- Already Attempted Message -->
        <div v-if="alreadyAttempted" class="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <p class="text-yellow-800">
            <strong>⚠️ You've already attempted this quiz.</strong> Your previous results are shown above. 
            <span v-if="isAuthenticated" class="block mt-2">Sign in to unlock additional attempts and premium features.</span>
          </p>
        </div>

        <!-- Authenticated User Actions -->
        <div v-if="isAuthenticated" class="rounded-lg bg-green-50 p-4 border border-green-200">
          <p class="text-green-800">
            ✓ Your results have been saved to your account. Track your progress and compare with other Quizees!
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="sticky bottom-0 bg-gray-50 border-t p-6 flex flex-col sm:flex-row gap-3 justify-between">
        <button
          @click="$emit('back')"
          class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Back to Quizzes
        </button>
        <button
          v-if="!alreadyAttempted && !isAuthenticated"
          @click="$emit('signup')"
          class="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition"
        >
          Create Account
        </button>
        <button
          v-else-if="!alreadyAttempted"
          @click="$emit('retake')"
          class="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

interface Props {
  show: boolean
  results: any
  alreadyAttempted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alreadyAttempted: false
})

const emit = defineEmits<{
  close: [];
  signup: [];
  login: [];
  back: [];
  retake: [];
}>()

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.user !== null)

const performanceMessage = computed(() => {
  const percentage = props.results?.percentage || 0
  if (percentage >= 90) return "🌟 Excellent work! You've mastered this topic!"
  if (percentage >= 75) return "👏 Great job! Keep up the good work!"
  if (percentage >= 60) return "✓ Good effort! Review the topics you found challenging."
  if (percentage >= 40) return "📚 You're on the right track. Keep practicing!"
  return "💪 Keep studying! You'll improve with practice."
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
