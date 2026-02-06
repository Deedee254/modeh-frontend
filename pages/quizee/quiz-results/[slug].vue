<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
    <!-- Confetti Container -->
    <canvas id="confetti-canvas" class="fixed inset-0 pointer-events-none"></canvas>
    
    <div class="max-w-4xl mx-auto relative z-10">
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
                    <p class="font-medium text-gray-900 mb-1">Q{{ idx + 1 }}: {{ questionResult.question_body }}</p>
                    <p v-if="!questionResult.is_correct && questionResult.correct_answer" class="text-sm text-gray-600 mt-1">
                      <span class="font-semibold">Correct answer:</span> {{ questionResult.correct_answer }}
                    </p>
                    <p v-if="questionResult.explanation" class="text-sm text-gray-700 mt-2 italic border-l-2 border-gray-300 pl-3">
                      💡 {{ questionResult.explanation }}
                    </p>
                    <div class="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Marks: <span class="font-semibold">{{ questionResult.marks_earned || 0 }}</span></span>
                      <span>Status: <span :class="questionResult.is_correct ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">{{ questionResult.is_correct ? 'Correct' : 'Incorrect' }}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Auto-save Notice for Logged-in Users -->
          <div v-if="isLoggedIn" class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-900 font-medium">
              ✓ This attempt is being saved to your profile automatically. View your progress anytime in your dashboard!
            </p>
          </div>

          <!-- Sync In Progress -->
          <div v-if="isSyncingAttempt" class="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-amber-600"></div>
            <p class="text-sm text-amber-900">Saving to your profile...</p>
          </div>

          <!-- Sync Failed Notice -->
          <div v-if="syncError" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-900">
              ⚠ Could not save attempt automatically. {{ syncError }}
            </p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({
  layout: 'default'
  // Note: auth-guard.global.ts handles global auth checks
})

const router = useRouter()
const route = useRoute()
const slug = computed(() => route.params.slug)
const api = useApi()
const alert = useAppAlert()
const authStore = useAuthStore()

const result = ref(null)
const loading = ref(true)
const isSyncingAttempt = ref(false)
const syncError = ref(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)

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

// Confetti Effect
function createConfetti() {
  const canvas = document.getElementById('confetti-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502', '#ff6348', '#8e44ad', '#3498db', '#e74c3c']

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height - canvas.height
      this.size = Math.random() * 5 + 2
      this.speedX = Math.random() * 8 - 4
      this.speedY = Math.random() * 5 + 4
      this.rotation = Math.random() * 360
      this.rotationSpeed = Math.random() * 10 - 5
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.opacity = 1
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY
      this.rotation += this.rotationSpeed
      this.opacity -= 0.01
      this.speedY += 0.1 // gravity
    }

    draw() {
      ctx.save()
      ctx.globalAlpha = this.opacity
      ctx.fillStyle = this.color
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
      ctx.restore()
    }
  }

  // Create confetti particles
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle())
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update()
      particles[i].draw()

      if (particles[i].opacity <= 0 || particles[i].y > canvas.height) {
        particles.splice(i, 1)
      }
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Auto-sync attempt when user logs in
async function autoSyncAttempt() {
  if (!isLoggedIn.value || !result.value) return

  isSyncingAttempt.value = true
  syncError.value = null
  
  try {
    const payload = {
      quiz_id: result.value.quiz_id,
      score: result.value.score,
      percentage: result.value.percentage,
      correct_count: result.value.correct_count,
      incorrect_count: result.value.incorrect_count,
      total_questions: result.value.total_questions,
      time_taken: result.value.time_taken,
      results: result.value.results || []
    }

    const res = await api.postJson('/api/quizzes/sync-guest-attempt', payload)

    if (res.ok) {
      const data = await res.json()
      
      // Update auth store with new user data if points were added
      if (data.user) {
        authStore.setUser(data.user)
      }
      
      // Remove from guest store since it's now in the user's account
      const guestStore = useGuestQuizStore()
      guestStore.clearQuizResult(result.value.quiz_id)
    } else {
      const error = await res.json().catch(() => ({}))
      syncError.value = error.message || 'Failed to sync attempt'
    }
  } catch (error) {
    console.error('Error syncing attempt:', error)
    syncError.value = 'Network error while syncing'
  } finally {
    isSyncingAttempt.value = false
  }
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
    // Play confetti on successful load
    setTimeout(() => {
      createConfetti()
    }, 300)
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
            // Play confetti on successful load
            setTimeout(() => {
              createConfetti()
            }, 300)
          }
        }
      }
    } catch (e) {}
  }
  
  loading.value = false
})

// Auto-sync when user logs in while viewing results
watch(() => isLoggedIn.value, (newVal) => {
  if (newVal && result.value) {
    autoSyncAttempt()
  }
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
