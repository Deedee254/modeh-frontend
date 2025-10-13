<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ challenge?.title || 'Daily Challenge' }}</h1>
            <p class="text-gray-600 mt-1">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Time Remaining</div>
            <div class="text-lg font-mono font-bold text-indigo-600">{{ formatTime(timeRemaining) }}</div>
          </div>
        </div>
        <div class="mt-4 bg-gray-200 rounded-full h-2">
          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div v-if="currentQuestion" class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ currentQuestion.question }}</h2>

          <!-- Options -->
          <div class="space-y-3">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              @click="selectAnswer(option)"
              :class="[
                'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <span class="font-medium">{{ String.fromCharCode(65 + index) }}.</span> {{ option }}
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            v-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion"
            :disabled="!selectedAnswer"
            class="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>

          <button
            v-else
            @click="submitChallenge"
            :disabled="!selectedAnswer || submitting"
            class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span v-if="submitting">Submitting...</span>
            <span v-else>Submit Challenge</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const router = useRouter()

// Data
const challenge = ref(null)
const questions = ref([])
const answers = ref({})
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const timeRemaining = ref(600) // 10 minutes
const submitting = ref(false)

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)

// Timer
let timer = null
const startTimer = () => {
  timer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timer)
      submitChallenge()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Methods
const selectAnswer = (answer) => {
  selectedAnswer.value = answer
  if (currentQuestion && currentQuestion.id) answers.value[currentQuestion.id] = answer
}

const nextQuestion = () => {
  if (selectedAnswer.value) {
    currentQuestionIndex.value++
    selectedAnswer.value = answers.value[questions.value[currentQuestionIndex.value]?.id] || null
  }
}

const previousQuestion = () => {
  currentQuestionIndex.value--
  selectedAnswer.value = answers.value[questions.value[currentQuestionIndex.value]?.id] || null
}

const submitChallenge = async () => {
  if (submitting.value) return

  submitting.value = true
  clearInterval(timer)

  try {
    // Calculate score (simple: correct answers / total * 100)
    let correctCount = 0
    questions.value.forEach(q => {
      if (answers.value[q.id] === q.correct_answer) correctCount++
    })
    const score = Math.round((correctCount / questions.value.length) * 100)

    await $fetch(`${config.public.apiBase}/api/daily-challenges/${challenge.value?.id}/submit`, {
      method: 'POST',
      credentials: 'include',
      body: { answers: answers.value, score }
    })

    // Redirect to result or back to daily challenges
    await router.push('/quizee/daily-challenges')
  } catch (error) {
    console.error('Failed to submit challenge:', error)
    // Handle error
  } finally {
    submitting.value = false
  }
}

// Fetch data
const fetchChallengeData = async () => {
  try {
    // Fetch today's challenge
    const challengeData = await $fetch(config.public.apiBase + '/api/daily-challenges/today', { credentials: 'include' })
    if (!challengeData || !challengeData.challenge) {
      await router.push('/quizee/daily-challenges')
      return
    }

    challenge.value = challengeData.challenge

    // If already completed, redirect
    if (challengeData.completion) {
      await router.push('/quizee/daily-challenges')
      return
    }

    // Fetch questions for the challenge
    // Assuming questions are associated or fetched separately
    // For now, simulate or use a placeholder
    // In real implementation, might need to fetch questions based on challenge
    const questionsData = await $fetch(config.public.apiBase + '/api/questions', {
      credentials: 'include',
      params: { for: 'daily-challenge', challenge_id: challenge.value?.id }
    })
    questions.value = questionsData?.data || questionsData || []

    startTimer()
  } catch (error) {
    console.error('Failed to fetch challenge data:', error)
    await router.push('/quizee/daily-challenges')
  }
}

// Lifecycle
onMounted(() => {
  fetchChallengeData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>