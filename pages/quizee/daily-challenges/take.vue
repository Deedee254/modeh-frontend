<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <PlayerCard 
              :player="auth.user"
              role="Today's Challenge"
              :answered="Object.keys(answers).length"
              :is-active="true"
              class="w-full sm:w-auto"
            />
            <div class="mt-2 sm:mt-0">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ challenge?.title || 'Daily Challenge' }}</h1>
              <p class="text-gray-600 mt-1">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
            </div>
          </div>
          <div class="text-left sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
            <div class="text-sm text-gray-500">Time Remaining</div>
            <div class="text-lg font-mono font-bold text-indigo-600">{{ displayTime }}</div>
          </div>
        </div>
        <div class="mt-4 bg-gray-200 rounded-full h-2">
          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-8 mb-8">
        <div v-if="currentQuestion" class="mb-6">
          <QuestionCard v-model="selectedAnswer" :question="currentQuestion" @select="(val) => { if (currentQuestion && currentQuestion.id) answers[currentQuestion.id] = val }" @toggle="(opt) => { if (currentQuestion && currentQuestion.id) rawToggleMulti(currentQuestion.id, opt) }" />
        </div>

        <!-- Navigation -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="order-2 sm:order-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Previous
            </span>
          </button>

          <button
            v-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion"
            :disabled="!selectedAnswer"
            class="order-1 sm:order-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            <span class="flex items-center justify-center gap-2">
              Next
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </span>
          </button>

          <button
            v-else
            @click="submitChallenge"
            :disabled="!selectedAnswer || submitting"
            class="order-1 sm:order-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            <span class="flex items-center justify-center gap-2">
              <span v-if="submitting">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
              <span v-else>Submit Challenge</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Results Modal -->
    <div v-if="showResultsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Daily Challenge Complete!</h2>
            <p class="text-gray-600 mt-1">{{ challenge?.title || 'Today\'s Challenge' }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Your Score</div>
            <div class="text-3xl font-bold" :class="resultPayload?.score >= 70 ? 'text-green-600' : resultPayload?.score >= 50 ? 'text-yellow-600' : 'text-red-600'">
              {{ resultPayload?.score ?? '—' }}%
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="text-sm text-gray-600">Time taken: {{ formatTime(challengeAdapter.timer_seconds - timeLeft) }}</div>
          <div class="text-sm text-gray-600">Questions answered: {{ Object.keys(answers).length }}/{{ questions.length }}</div>
        </div>

        <div v-if="earnedAchievements && earnedAchievements.length" class="mt-4">
          <h3 class="font-medium">Awards & Badges</h3>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <div v-for="(a, i) in earnedAchievements" :key="i" class="p-3 border rounded-lg flex items-center gap-3">
              <img v-if="a.icon_url || a.icon" :src="a.icon_url || a.icon" alt="badge" class="w-10 h-10 rounded" />
              <div>
                <div class="font-semibold">{{ a.name || a.title || 'Badge' }}</div>
                <div class="text-sm text-gray-500">{{ a.description || a.note || '' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="closeResults" class="px-4 py-2 bg-indigo-600 text-white rounded">Continue</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAnswerNormalization } from '~/composables/useAnswerNormalization'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
const config = useRuntimeConfig()
const router = useRouter()
const auth = useAuthStore()

// Data
const challenge = ref(null)
const questions = ref([])
// reuse shared answers composable so daily-challenge answers are same shape as quizzes/battles
// Pass a computed wrapper around the local `questions` ref so the composable reads
// the actual questions when initializeAnswers() is called later (avoids initializing
// with an empty static array).
const { answers, initializeAnswers, clearSavedAnswers, toggleMulti: rawToggleMulti } = useQuizAnswers(computed(() => ({ questions: questions.value })), 'daily-challenge')
const startedAt = ref(null)
const currentQuestionIndex = ref(0)
// selectedAnswer is bound to the shared answers map via computed getter/setter
const selectedAnswer = computed({
  get() {
    const q = currentQuestion.value
    if (!q || !q.id) return null
    return answers.value[q.id]
  },
  set(v) {
    const q = currentQuestion.value
    if (!q || !q.id) return
    answers.value[q.id] = v
  }
})
const submitting = ref(false)
const showResultsModal = ref(false)
const resultPayload = ref(null)
const earnedAchievements = ref([])

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const challengeAdapter = computed(() => ({
  timer_seconds: 600 // Daily challenges have a fixed 10-minute timer
}))

import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'

// Timer
const { timeLeft, displayTime, startTimer, stopTimer } = useQuizTimer(challengeAdapter, () => submitChallenge())

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  // Handle potential negative values if timer overruns slightly
  if (mins < 0 || secs < 0) return '0:00'
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Methods
const selectAnswer = (answer) => {
  const { normalizeAnswer } = useAnswerNormalization()
  const normalizedAnswer = normalizeAnswer(answer)
  selectedAnswer.value = normalizedAnswer
}

const nextQuestion = () => {
  if (selectedAnswer.value) {
    currentQuestionIndex.value++
    // when moving, selectedAnswer computed will reflect the new question via getter
  }
}

const previousQuestion = () => {
  currentQuestionIndex.value--
}

const submitChallenge = async () => {
  if (submitting.value) return

  submitting.value = true
  stopTimer()

  try {
    // Import the shared answer normalization
    const { normalizeAnswer } = useAnswerNormalization()

    // Calculate score (comparing normalized answers)
    let correctCount = 0
    questions.value.forEach(q => {
      const normalizedAnswer = normalizeAnswer(answers.value[q.id])
      const normalizedCorrect = normalizeAnswer(q.correct_answer)
      const isCorrect = Array.isArray(normalizedAnswer) && Array.isArray(normalizedCorrect)
        ? normalizedAnswer.length === normalizedCorrect.length && normalizedAnswer.every(a => normalizedCorrect.includes(a))
        : normalizedAnswer === normalizedCorrect
      if (isCorrect) correctCount++
    })
    const score = Math.round((correctCount / questions.value.length) * 100)

    // Convert answers map using the shared formatter
    const { formatAnswersForSubmission } = useAnswerNormalization()
    const payloadAnswers = formatAnswersForSubmission(answers.value)

    // include optional client-side started_at so backend (or analytics) can use it
    const body = { answers: payloadAnswers, score }
    if (startedAt.value) body.started_at = startedAt.value

    const res = await $fetch(`${config.public.apiBase}/api/daily-challenges/${challenge.value?.id}/submit`, {
      method: 'POST',
      credentials: 'include',
      body
    })

    // Update auth store if server returned updated user or awarded achievements
    const auth = useAuthStore()
    try {
      if (res?.user) {
        const returnedUser = res.user || res.data?.user || null
        if (returnedUser) auth.setUser(returnedUser)
        else await auth.fetchUser()
      } else if (res?.awarded_achievements && res.awarded_achievements.length) {
        // refresh to pick up points/badges
        await auth.fetchUser()
      } else {
        // fallback: ensure auth is up to date
        await auth.fetchUser()
      }
    } catch (e) {
      console.debug('Failed to refresh auth after daily challenge submit', e)
    }

    // Show results modal with any returned achievements/awards
    resultPayload.value = res
    // Prefer explicit `awarded_achievements` then fallback to other shapes
    earnedAchievements.value = res?.awarded_achievements || res?.achievements || res?.data?.achievements || res?.awards || res?.user?.achievements || []
    showResultsModal.value = true
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

    // Fetch questions tailored to the authenticated user's profile (grade & subjects)
    // Prefer client-provided grade/subjects to select 5 randomized questions
    const auth = useAuthStore()
    const gradeId = auth.user?.grade?.id || auth.user?.grade_id || auth.user?.grade || null
    const levelId = auth.user?.level?.id || auth.user?.level_id || auth.user?.level || null

    if (!gradeId) {
      console.error('User grade is not set. Redirecting to settings.')
      // Optionally, show an alert to the user
      // alert('Please set your grade in your profile to take the daily challenge.');
      await router.push('/quizee/settings')
      return
    }

    const subjectIds = Array.isArray(auth.user?.subjects) ? auth.user.subjects.map(s => (s.id || s)) : []

    const params = {
      random: 1,
      question_count: 5,
      grade_id: gradeId,
    }
    if (levelId) {
      params.level_id = levelId
    }
    if (subjectIds.length) params.subject_id = subjectIds

    const questionsData = await $fetch(config.public.apiBase + '/api/questions', {
      credentials: 'include',
      params
    })

  // normalize various API shapes
  questions.value = questionsData?.questions?.data || questionsData?.data || questionsData?.questions || questionsData || []

  // initialize answers structure to match questions
  initializeAnswers()

  // record client-side started_at for timing/persistence purposes
  startedAt.value = new Date().toISOString()
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
  stopTimer()
})

const closeResults = async () => {
  showResultsModal.value = false
  // After user closes results, redirect to daily challenges page
  await router.push('/quizee/daily-challenges')
}
</script>