<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Welcome to Modeh! 🎉</h1>
        <p class="text-lg text-gray-600">Here's your quiz result from before you registered</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin">
          <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-brand-600" />
        </div>
      </div>

      <!-- Results Card -->
      <div v-else-if="result" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header Section -->
        <div class="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-8">
          <h2 class="text-3xl font-bold mb-2">{{ result.quiz_title }}</h2>
          <p class="text-brand-100">Quiz completed on {{ formatDate(result.attempted_at) }}</p>
        </div>

        <!-- Score Section -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Score -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <p class="text-sm text-gray-600 font-medium mb-2">Overall Score</p>
              <p class="text-5xl font-bold text-green-600">{{ result.percentage }}%</p>
              <p class="text-xs text-gray-500 mt-2">{{ Math.round(result.score) }} / 100 points</p>
            </div>

            <!-- Correct Answers -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <p class="text-sm text-gray-600 font-medium mb-2">Correct Answers</p>
              <p class="text-5xl font-bold text-blue-600">{{ result.correct_count }}<span class="text-xl text-gray-600">/{{ result.total_questions }}</span></p>
              <p class="text-xs text-gray-500 mt-2">{{ result.incorrect_count }} incorrect</p>
            </div>

            <!-- Time Taken -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 text-center">
              <p class="text-sm text-gray-600 font-medium mb-2">Time Taken</p>
              <p class="text-5xl font-bold text-amber-600">{{ formatTime(result.time_taken) }}</p>
              <p class="text-xs text-gray-500 mt-2">{{ result.time_taken }} seconds</p>
            </div>
          </div>

          <!-- Performance Badge -->
          <div class="mb-8 p-4 rounded-lg" :class="performanceClass">
            <p class="font-semibold text-center">{{ performanceMessage }}</p>
          </div>

          <!-- Question Results (if available) -->
          <div v-if="result.results && result.results.length > 0" class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Question Breakdown</h3>
            <div class="space-y-3">
              <div 
                v-for="(questionResult, idx) in result.results" 
                :key="idx"
                :class="[
                  'p-4 rounded-lg border-l-4 transition-all',
                  questionResult.is_correct 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                ]"
              >
                <div class="flex items-start gap-4">
                  <div :class="[
                    'flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 text-white font-bold text-sm',
                    questionResult.is_correct ? 'bg-green-500' : 'bg-red-500'
                  ]">
                    {{ questionResult.is_correct ? '✓' : '✗' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 mb-1">{{ questionResult.question_body }}</p>
                    <p v-if="!questionResult.is_correct && questionResult.correct_answer" class="text-sm text-gray-600">
                      <span class="font-semibold">Correct answer:</span> {{ questionResult.correct_answer }}
                    </p>
                    <p v-if="questionResult.explanation" class="text-sm text-gray-700 mt-2 italic">
                      {{ questionResult.explanation }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              @click="goToDashboard"
              class="flex-1 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
            >
              Go to Dashboard
            </button>
            <button 
              @click="retakeQuiz"
              class="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Retake Quiz
            </button>
            <button 
              @click="browseSimilarQuizzes"
              class="flex-1 px-6 py-3 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition"
            >
              Browse Similar Quizzes
            </button>
          </div>
        </div>
      </div>

      <!-- No Result State -->
      <div v-else class="bg-white rounded-xl shadow-lg p-8 text-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-gray-900 mb-2">Quiz Result Not Found</h2>
        <p class="text-gray-600 mb-6">We couldn't find the quiz results for this slug. The data may have expired.</p>
        <button 
          @click="goToDashboard"
          class="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'

definePageMeta({
  layout: 'default'
  // Note: auth-guard.global.ts handles global auth checks
})

const router = useRouter()
const route = useRoute()
const slug = computed(() => route.params.slug)

const result = ref(null)
const loading = ref(true)

const performanceClass = computed(() => {
  if (!result.value) return 'bg-gray-100 text-gray-700'
  const score = result.value.percentage || 0
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-blue-100 text-blue-700'
  if (score >= 40) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
})

const performanceMessage = computed(() => {
  if (!result.value) return ''
  const score = result.value.percentage || 0
  if (score >= 80) return `Excellent work! 🌟 You scored ${score}%`
  if (score >= 60) return `Good job! 👍 You scored ${score}%`
  if (score >= 40) return `Keep practicing! 💪 You scored ${score}%`
  return `Nice effort! 🚀 Keep improving - You scored ${score}%`
})

function formatTime(seconds) {
  if (!seconds) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function goToDashboard() {
  clearSessionData()
  router.push('/quizee/dashboard')
}

function retakeQuiz() {
  clearSessionData()
  router.push(`/quizzes/${slug.value}/take`)
}

function browseSimilarQuizzes() {
  clearSessionData()
  router.push('/quizzes')
}

function clearSessionData() {
  try {
    sessionStorage.removeItem('modeh:justCompletedGuestQuiz')
  } catch (e) {}
}

onMounted(() => {
  // Try to load result from guest quiz store
  const guestQuizStore = useGuestQuizStore()
  guestQuizStore.initializeStore()
  
  const quizSlug = slug.value
  const allResults = guestQuizStore.getAllResults()
  
  // Find result matching this slug
  const matchedResult = allResults.find(r => r.quiz_slug === quizSlug)
  
  if (matchedResult) {
    result.value = matchedResult
  } else {
    // Try to check sessionStorage for the quiz info
    try {
      const sessionData = sessionStorage.getItem('modeh:justCompletedGuestQuiz')
      if (sessionData) {
        const info = JSON.parse(sessionData)
        if (info.quiz_slug === quizSlug) {
          // Still try to load from guest store
          const quizFromStore = guestQuizStore.getQuizResult(info.quiz_id)
          if (quizFromStore) {
            result.value = quizFromStore
          }
        }
      }
    } catch (e) {}
  }
  
  loading.value = false
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
