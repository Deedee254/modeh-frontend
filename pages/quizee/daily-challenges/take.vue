<template>
  <QuizLayoutWrapper
    :title="challenge?.title || 'Daily Challenge'"
    :current-question="currentQuestionIndex"
    :total-questions="questions.length"
    :show-timer="true"
    :timer-display="perQuestionSeconds"
    :timer-color-class="timerColorClass"
    :timer-circumference="circumference"
    :timer-dash-offset="dashOffset"
    :encouragement="''"
    :show-meta="false"
    :alert-message="''"
    :show-previous="currentQuestionIndex > 0"
    :disable-previous="currentQuestionIndex === 0"
    :show-next="currentQuestionIndex < questions.length - 1"
    :disable-next="!selectedAnswer"
    :show-submit="currentQuestionIndex === questions.length - 1"
    :submit-label="'Submit Challenge'"
    :disable-submit="!selectedAnswer || submitting"
    :is-submitting="submitting"
    :show-confirmation="false"
    @previous="previousQuestion"
    @next="nextQuestion"
    @submit="submitChallenge"
  >
    <template #content>
      <!-- Persistent countdown alert (shows near the top during final seconds) -->
      <div v-if="countdownAlert.show" class="mb-4">
        <div :class="countdownClass" class="rounded px-4 py-2 text-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span v-if="countdownAlert.type === 'warning'" class="text-xl">⚠️</span>
            <span v-else-if="countdownAlert.type === 'error'" class="text-xl">⛔</span>
            <span v-else class="text-xl">⏱️</span>
            <div class="text-sm">{{ countdownAlert.message }}</div>
          </div>
          <div class="text-2xl font-mono font-bold">{{ countdownAlert.timeRemaining }}</div>
        </div>
      </div>
      <div v-if="errorState.show" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-red-900">Unable to Load Daily Challenge</h3>
        <p class="mt-2 text-sm text-red-700">{{ errorState.message }}</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button @click="retryFetchChallenge" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            Try Again
          </button>
          <NuxtLink to="/quizee/profile" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
            Update Profile
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="isLoading" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 text-brand-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 font-medium">Loading today's daily challenge...</p>
      </div>

      <div v-else-if="questions.length > 0">
        <transition name="fade-slide" mode="out-in">
          <div :key="currentQuestionIndex" class="space-y-6">
            <QuestionCard v-if="currentQuestion" v-model="selectedAnswer" :question="currentQuestion" @select="(val) => { if (currentQuestion && currentQuestion.id) answers[currentQuestion.id] = val }" @toggle="(opt) => { if (currentQuestion && currentQuestion.id) rawToggleMulti(currentQuestion.id, opt) }" />
          </div>
        </transition>
      </div>
    </template>
  </QuizLayoutWrapper>

  <!-- Results Modal -->
  <div v-if="showResultsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Challenge Complete!</h2>
          <p class="text-gray-600 text-sm mt-1">{{ challenge?.title || 'Daily Challenge' }}</p>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">Score</div>
          <div class="text-2xl font-bold" :class="resultPayload?.score >= 70 ? '' : resultPayload?.score >= 50 ? 'text-yellow-600' : 'text-red-600'" :style="resultPayload?.score >= 70 ? { color: '#891f21' } : {}">
            {{ resultPayload?.score ?? '—' }}%
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded p-3 text-sm text-gray-600 space-y-1 mb-4">
        <div>Time taken: {{ formatTime(challengeAdapter.timer_seconds - timeLeft) }}</div>
        <div v-if="resultPayload?.streak !== undefined" class="font-semibold text-brand-600">🔥 Streak: {{ resultPayload.streak }} day{{ resultPayload.streak !== 1 ? 's' : '' }}</div>
      </div>

      <div class="flex justify-end">
        <button @click="closeResults" class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Continue</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee', hideTopBar: true })
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import QuizLayoutWrapper from '~/components/QuizLayoutWrapper.vue'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useAppAlert } from '~/composables/useAppAlert'
import useDisableUserActions from '~/composables/useDisableUserActions'
import { useAuthStore } from '~/stores/auth'
import { useAnswerNormalization } from '~/composables/useAnswerNormalization'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import useApi from '~/composables/useApi'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const api = useApi()

// Data
const challenge = ref(null)
const cache_id = ref(null)
const questions = ref([])
const questionTimes = ref({})
const isLoading = ref(true)
const errorState = ref({
  show: false,
  message: '',
  type: null // 'profile_incomplete', 'no_questions', 'already_completed', 'server_error'
})

// Get user's profile info from auth store (for error display)
const userGrade = computed(() => {
  return auth.user?.quizeeProfile?.grade?.name || auth.user?.grade?.name || null
})

const userLevel = computed(() => {
  return auth.user?.quizeeProfile?.level?.name || auth.user?.level?.name || null
})
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
// Adapt total timer from questions (each question gets 15s). Fallback to 600s if questions not loaded.
const challengeAdapter = computed(() => ({
  timer_seconds: questions.value && questions.value.length ? (questions.value.length * 15) : 600
}))

// Timer
const { timeLeft, displayTime, startTimer, stopTimer } = useQuizTimer(challengeAdapter, () => submitChallenge())

// per-question timer (derive per-question from challenge total when available)
// Set per-question default to 15 seconds
const { timePerQuestion, questionRemaining, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(15)

// Circular timer helpers (for header display)
const perQuestionTotal = computed(() => timePerQuestion.value || 15)
const perQuestionSeconds = computed(() => {
  const rem = typeof questionRemaining.value === 'number' ? Math.ceil(questionRemaining.value) : perQuestionTotal.value
  return Math.max(0, rem)
})
const circleRadius = 18
const circumference = 2 * Math.PI * circleRadius
const dashOffset = computed(() => {
  const frac = perQuestionTotal.value ? (perQuestionSeconds.value / perQuestionTotal.value) : 0
  return String(circumference * (1 - Math.max(0, Math.min(1, frac))))
})
const lowTime = computed(() => perQuestionSeconds.value <= 5)

const { push: pushAlert } = useAppAlert()

// Persistent countdown alert state for daily challenge
const countdownAlert = ref({ show: false, type: 'info', message: '', timeRemaining: 0 })
const countdownClass = computed(() => {
  if (!countdownAlert.value?.type) return 'bg-blue-50 text-blue-800 border border-blue-200'
  switch (countdownAlert.value.type) {
    case 'error': return 'bg-red-50 text-red-800 border border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    default: return 'bg-blue-50 text-blue-800 border border-blue-200'
  }
})

function formatSeconds(s) {
  const mins = Math.floor(s / 60)
  const secs = Math.max(0, Math.floor(s % 60))
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function updateCountdownAlertDaily() {
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatSeconds(Math.ceil(questionRemaining.value))}`
    return
  }
  if (typeof timeLeft.value === 'number' && timeLeft.value <= 5 && timeLeft.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeLeft.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(timeLeft.value)
    countdownAlert.value.message = `⏱️ Challenge time remaining: ${formatSeconds(Math.ceil(timeLeft.value))}`
    return
  }
  countdownAlert.value.show = false
}

watch(questionRemaining, () => updateCountdownAlertDaily(), { immediate: false })
watch(timeLeft, () => updateCountdownAlertDaily(), { immediate: false })

// Disable context menu, common shortcuts and text selection while this page is active
useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })

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
    // record elapsed for analytics
    try { const elapsed = recordAndReset(); questionTimes.value = questionTimes.value || {}; if (currentQuestion.value && currentQuestion.value.id) questionTimes[currentQuestion.value.id] = elapsed } catch (e) {}
    try { persistProgress() } catch (e) {}
    currentQuestionIndex.value++
    // reset per-question timer for new question
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    const per = (challengeAdapter.value?.timer_seconds && questions.value.length) ? Math.floor(challengeAdapter.value.timer_seconds / questions.value.length) : null
    if (typeof per === 'number' && Number.isFinite(per) && per > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < per) ? questionRemaining.value : undefined
      startQuestionTimer(per, remainingForSchedule)
      schedulePerQuestionLimit(per, () => {
        if (currentQuestionIndex.value < questions.value.length - 1) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          currentQuestionIndex.value++
        } else {
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitChallenge()
        }
      }, remainingForSchedule)
    } else {
      try { stopQuestionTimer() } catch (e) {}
    }
    // when moving, selectedAnswer computed will reflect the new question via getter
  }
}

const previousQuestion = () => {
  currentQuestionIndex.value--
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
  const per = (challengeAdapter.value?.timer_seconds && questions.value.length) ? Math.floor(challengeAdapter.value.timer_seconds / questions.value.length) : null
  if (typeof per === 'number' && Number.isFinite(per) && per > 0) {
    const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < per) ? questionRemaining.value : undefined
    startQuestionTimer(per, remainingForSchedule)
    schedulePerQuestionLimit(per, () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
        currentQuestionIndex.value++
      } else {
        pushAlert({ message: 'Time is over — submitting...', type: 'info' })
        submitChallenge()
      }
    }, remainingForSchedule)
  } else {
    try { stopQuestionTimer() } catch (e) {}
  }
}

const submitChallenge = async () => {
  if (submitting.value) return

  submitting.value = true
  stopTimer()

  try {
    // Format answers for daily challenge submission (direct format, not quiz attempt format)
    const { normalizeAnswer } = useAnswerNormalization()
    const payloadAnswers = {}
    for (const [qid, answer] of Object.entries(answers.value)) {
      payloadAnswers[parseInt(qid, 10)] = normalizeAnswer(answer)
    }

    // Calculate time taken in seconds
    const timeTaken = Math.round((challengeAdapter.value?.timer_seconds - timeLeft.value) || 0)

    // Submit with cache_id, answers, and time taken (backend calculates score)
    const body = { cache_id: cache_id.value, answers: payloadAnswers, time_taken: timeTaken }

    const res = await api.postJson('/api/daily-challenges/submit', body)
    if (api.handleAuthStatus(res)) return

    if (!res.ok) {
      throw new Error('Failed to submit challenge')
    }

    const data = await res.json()

    // Update auth store if server returned updated user or awarded achievements
    const auth = useAuthStore()
    try {
      if (data?.user) {
        const returnedUser = data.user || data.data?.user || null
        if (returnedUser) auth.setUser(returnedUser)
        else await auth.fetchUser()
      } else if (data?.awarded_achievements && data.awarded_achievements.length) {
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
    resultPayload.value = data
    // Prefer explicit `awarded_achievements` then fallback to other shapes
    earnedAchievements.value = data?.awarded_achievements || data?.achievements || data?.data?.achievements || data?.awards || data?.user?.achievements || []
    showResultsModal.value = true

    // --- Instant UI update for leaderboard & streak (no redirect required) ---
    // Persist a small local cache and dispatch events so other pages/components
    // can react immediately without waiting for navigation.
    try {
      // Streak from server response
      const newStreak = data?.streak
      if (typeof newStreak !== 'undefined') {
        try { localStorage.setItem('daily-challenge:last-streak', String(newStreak)) } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('daily-challenge:submitted', { detail: { streak: newStreak, submission: data?.submission || null } })) } catch (e) {}
      }

      // Refresh leaderboard immediately and cache it for other pages
      try {
        const lbRes = await api.get('/api/daily-challenges/leaderboard')
        if (lbRes && lbRes.ok) {
          const lbJson = await lbRes.json()
          const list = lbJson?.data || lbJson || []
          try { localStorage.setItem('daily-challenge:leaderboard', JSON.stringify(list)) } catch (e) {}
          try { window.dispatchEvent(new CustomEvent('daily-challenge:leaderboard:updated', { detail: { leaderboard: list } })) } catch (e) {}
        }
      } catch (e) {
        // non-fatal: leaderboard refresh failed; continue without blocking the user
        console.debug('Failed to refresh daily challenge leaderboard immediately:', e)
      }
    } catch (e) {
      // ignore any failures in the instant update logic
    }
  } catch (error) {
    console.error('Failed to submit challenge:', error)
    // Handle error
  } finally {
    submitting.value = false
  }
}

// Fetch data
const fetchChallengeData = async () => {
  isLoading.value = true
  errorState.value = { show: false, message: '', type: null }
  
  try {
    const res = await api.get('/api/daily-challenges/today')
    if (api.handleAuthStatus(res)) return
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const statusCode = res.status
      
      if (statusCode === 400) {
        errorState.value = {
          show: true,
          message: errorData.error || 'Your profile is incomplete. You need a grade and level assigned.',
          type: 'profile_incomplete'
        }
      } else if (statusCode === 404) {
        errorState.value = {
          show: true,
          message: errorData.error || 'No questions available for your grade/level combination.',
          type: 'no_questions'
        }
      } else if (statusCode === 409) {
        errorState.value = {
          show: true,
          message: 'You have already completed today\'s daily challenge.',
          type: 'already_completed'
        }
      } else {
        errorState.value = {
          show: true,
          message: errorData.error || `Error loading challenge (${statusCode})`,
          type: 'server_error'
        }
      }
      isLoading.value = false
      return
    }

    const challengeData = await res.json()
    if (!challengeData || !challengeData.challenge) {
      errorState.value = {
        show: true,
        message: 'Invalid challenge data received from server.',
        type: 'server_error'
      }
      isLoading.value = false
      return
    }

    if (challengeData.completion) {
      errorState.value = {
        show: true,
        message: 'You have already completed today\'s daily challenge.',
        type: 'already_completed'
      }
      isLoading.value = false
      return
    }

    // Success
    challenge.value = challengeData.challenge
    cache_id.value = challengeData.cache_id
    questions.value = challengeData.questions || []
    initializeAnswers()
    startedAt.value = new Date().toISOString()
    try { restoreProgress() } catch (e) {}
    if (typeof questionRemaining.value !== 'number') startTimer()
    // Start per-question timer and schedule limit (enforce 15s per question)
    try {
      const per = 15
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < per) ? questionRemaining.value : undefined
      startQuestionTimer(per, remainingForSchedule)
      schedulePerQuestionLimit(per, () => {
        if (currentQuestionIndex.value < questions.value.length - 1) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          currentQuestionIndex.value++
        } else {
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitChallenge()
        }
      }, remainingForSchedule)
    } catch (e) {}
    isLoading.value = false
  } catch (error) {
    console.error('Failed to fetch challenge data:', error)
    errorState.value = {
      show: true,
      message: error?.message || 'An unexpected error occurred while loading the challenge.',
      type: 'server_error'
    }
    isLoading.value = false
  }
}

// Retry function
const retryFetchChallenge = async () => {
  await fetchChallengeData()
}

// Lifecycle
onMounted(() => {
  fetchChallengeData()
})

onUnmounted(() => {
  stopTimer()
  try { clearPerQuestionLimit() } catch (e) {}
  try { stopQuestionTimer() } catch (e) {}
})

// Persist on changes
try { watch(answers, () => persistProgress(), { deep: true }) } catch (e) {}
try { watch(questionTimes, () => persistProgress(), { deep: true }) } catch (e) {}

// Persist/restore helpers for daily challenge (save answers, index and per-question remaining)
function persistProgress() {
  try {
    const meta = {
      currentQuestionIndex: currentQuestionIndex.value,
      questionRemaining: (typeof questionRemaining.value === 'number') ? questionRemaining.value : null,
      answers: answers.value,
      startedAt: startedAt.value
    }
    localStorage.setItem(`daily-challenge:progress:${cache_id.value || 'draft'}`, JSON.stringify(meta))
  } catch (e) {}
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(`daily-challenge:progress:${cache_id.value || 'draft'}`)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.answers && typeof parsed.answers === 'object') {
      Object.keys(parsed.answers).forEach(k => { answers.value[k] = parsed.answers[k] })
    }
    if (typeof parsed.currentQuestionIndex === 'number') currentQuestionIndex.value = parsed.currentQuestionIndex
    if (typeof parsed.questionRemaining === 'number' && parsed.questionRemaining > 0) questionRemaining.value = parsed.questionRemaining
    if (parsed?.startedAt) startedAt.value = parsed.startedAt

    // If per-question timing applies, start the per-question interval and schedule expiry using remaining
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    const per = (challengeAdapter.value?.timer_seconds && questions.value.length) ? Math.floor(challengeAdapter.value.timer_seconds / questions.value.length) : null
    if (typeof per === 'number' && Number.isFinite(per) && per > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < per) ? questionRemaining.value : undefined
      startQuestionTimer(per, remainingForSchedule)
      schedulePerQuestionLimit(per, () => {
        if (currentQuestionIndex.value < questions.value.length - 1) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          currentQuestionIndex.value++
        } else {
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitChallenge()
        }
      }, remainingForSchedule)
    }
  } catch (e) {}
}

const closeResults = async () => {
  showResultsModal.value = false
  // After user closes results, redirect to daily challenges page
  await router.push('/quizee/daily-challenges')
}
</script>

<style scoped>
/* Circular timer styles and low-time pulse */
.timer-ring { stroke: #4f46e5; transition: stroke-dashoffset 0.3s linear, stroke 0.2s ease, filter 0.2s ease; }
.low-time .timer-ring { stroke: #dc2626; filter: drop-shadow(0 0 8px rgba(220,38,38,0.6)); animation: pulse 1s infinite; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }

/* Make QuestionCard and options tighter in this context if needed */
.question-compact .content-col h3 { margin-bottom: 0.5rem; font-size: 1rem; }
.question-compact { padding: 0.75rem; }
</style>