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
          <div v-if="resultPayload?.streak !== undefined" class="text-sm text-gray-600 mt-2">
            <span class="font-semibold text-indigo-600">🔥 Streak: {{ resultPayload.streak }} day{{ resultPayload.streak !== 1 ? 's' : '' }}</span>
          </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

const router = useRouter()
const auth = useAuthStore()
const api = useApi()

// Data
const challenge = ref(null)
const cache_id = ref(null)
const questions = ref([])
const questionTimes = ref({})
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

// Timer
const { timeLeft, displayTime, startTimer, stopTimer } = useQuizTimer(challengeAdapter, () => submitChallenge())

// per-question timer (derive per-question from challenge total when available)
const { timePerQuestion, questionRemaining, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)

const { push: pushAlert } = useAppAlert()

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

    const res = await api.post('/api/daily-challenges/submit', body)
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
    const res = await api.get('/api/daily-challenges/today')
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      await router.push('/quizee/daily-challenges')
      return
    }

    const challengeData = await res.json()
    if (!challengeData || !challengeData.challenge) {
      await router.push('/quizee/daily-challenges')
      return
    }

    challenge.value = challengeData.challenge
    cache_id.value = challengeData.cache_id
    questions.value = challengeData.questions || []

    // If already completed, redirect
    if (challengeData.completion) {
      await router.push('/quizee/daily-challenges')
      return
    }

    // initialize answers structure to match questions
    initializeAnswers()

    // record client-side started_at for timing/persistence purposes
    startedAt.value = new Date().toISOString()
    // Attempt to restore any saved progress (including per-question remaining)
    try { restoreProgress() } catch (e) {}
    // If restore didn't start a per-question timer, start normally
    if (typeof questionRemaining.value !== 'number') startTimer()
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