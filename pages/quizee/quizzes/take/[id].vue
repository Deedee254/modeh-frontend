<template>
  <QuizLayoutWrapper
    :title="Q.title || 'Quiz'"
    :current-question="currentQuestion"
    :total-questions="Q.questions.length"
    :show-timer="true"
    :timer-display="formatTime(Math.ceil(questionRemaining))"
    :timer-color-class="qTimerColorClass"
    :timer-circumference="timerCircumference"
    :timer-dash-offset="timerDashOffset"
    :encouragement="encouragementMessage"
    :encouragement-class="encouragementStyle"
    :show-meta="true"
    :alert-message="countdownAlert.show ? countdownAlert.message : ''"
    :alert-class="countdownAlert.show ? (countdownAlert.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : countdownAlert.type === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300') : ''"
    :show-previous="currentQuestion > 0"
    :disable-previous="currentQuestion === 0"
    :show-next="currentQuestion < Q.questions.length - 1"
    :disable-next="false"
    :show-submit="currentQuestion === Q.questions.length - 1"
    :submit-label="lastSubmitFailed ? 'Retry' : 'Submit Quiz'"
    :disable-submit="submitting.value"
    :is-submitting="submitting.value"
    :show-confirmation="showConfirm"
    :confirm-title="'Submit Quiz?'"
    :confirm-message="'Are you sure you want to submit? You won\'t be able to change your answers.'"
    :confirm-button-label="'Submit Quiz'"
    @previous="previousQuestion"
    @next="nextQuestion"
    @submit="confirmSubmit"
    @cancel-confirm="showConfirm = false"
    @confirm-submit="submitAnswers"
  >
    <template #meta-badges>
      <div v-if="Q.attempts_allowed" class="px-2 py-1 bg-gray-100 rounded text-xs">🔁 {{ Q.attempts_allowed === 'unlimited' ? 'Unlimited' : Q.attempts_allowed + ' attempts' }}</div>
      <div v-if="Q.shuffle_questions" class="px-2 py-1 bg-gray-100 rounded text-xs">🔀 Shuffled</div>
    </template>

    <template #content>
      <div v-if="loading"><UiSkeleton :count="5" /></div>
      <div v-else-if="quiz.questions.length > 0">
        <transition name="fade-slide" mode="out-in">
          <QuestionCard :key="currentQuestion" :question="currentQuestionData" v-model="answers[currentQuestionData.id]" @select="onQuestionSelect" @toggle="(opt) => rawToggleMulti(currentQuestionData.id, opt)" />
        </transition>
      </div>
    </template>
  </QuizLayoutWrapper>
</template>

<script setup>
import UiTextarea from '~/components/ui/UiTextarea.vue'
import QuizLayoutWrapper from '~/components/QuizLayoutWrapper.vue'
// set page layout meta for quizee. This is an in-progress assessment page — do not index.
definePageMeta({
  layout: 'quizee',
  hideBottomNav: true,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Take this assessment on Modeh. Your progress will be saved automatically.' },
    { property: 'og:title', content: 'Take Quiz — Modeh' }
  ]
})
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import { useQuizNavigation } from '~/composables/quiz/useQuizNavigation'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'
import useQuestionTimer from '~/composables/useQuestionTimer'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import resolveAssetUrl from '~/composables/useAssets'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// --- Core State ---
// Provide a defensive default shape so SSR/template rendering never reads properties
// off an undefined `quiz` value.
const quiz = ref({
  id: id || null,
  title: 'Loading...',
  description: '',
  questions: [],
  timer_seconds: null,
  attempts_allowed: null,
  shuffle_questions: false,
  shuffle_answers: false,
  access: 'free',
  use_per_question_timer: false,
  per_question_seconds: null,
  _attempt_id: null,
  _started_at_ms: null
})

// Template-safe alias that returns a plain object when `quiz.value` is undefined
const Q = computed(() => quiz.value || { title: 'Loading...', description: '', questions: [], timer_seconds: null, attempts_allowed: null, shuffle_questions: false, shuffle_answers: false, access: 'free', use_per_question_timer: false, per_question_seconds: null })
const loading = ref(true)
const submitting = ref(false)
const lastSubmitFailed = ref(false)
const submissionMessage = ref('')
let submissionInterval = null
const { push: pushAlert } = useAppAlert()

import useApi from '~/composables/useApi'
const api = useApi()
const showConfirm = ref(false)
import useDisableUserActions from '~/composables/useDisableUserActions'

// Disable context menu, common shortcuts and text selection while this page is active
useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })



// Cache the quiz questions length to avoid recomputing
const quizQuestionsLength = ref(0)
watch(() => quiz.value?.questions?.length, len => {
  quizQuestionsLength.value = len || 0
})

// Optimize progress calculation to use cached length
const progressPercent = computed(() => {
  const total = quizQuestionsLength.value
  if (!total) return 0
  let answered = 0
  for (const q of quiz.value.questions) {
    const val = answers.value[q.id]
    if (val === null || val === undefined) continue
    if (typeof val === 'string' && val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    answered++
  }
  return Math.round((answered / total) * 100)
})

// --- Composables ---
const { isImage, isAudio, isYouTube, getAudioType, formatYouTubeUrl } = useQuizMedia()
// Timer composable tracks overall quiz timer. We'll also track per-question times locally here.
const { timeLeft, displayTime, timerPercent, timerColorClass, lastAnnouncement, startTimer, stopTimer } = useQuizTimer(quiz, () => submitAnswers())
// per-question timer composable
const { timePerQuestion, questionRemaining, questionStartTs, displayTime: qDisplayTime, timerColorClass: qTimerColorClass, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, resetTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)
const { answers, initializeAnswers, selectMcq: rawSelectMcq, toggleMulti: rawToggleMulti, updateBlank, clearSavedAnswers } = useQuizAnswers(quiz, id)
import { normalizeAnswer, formatAnswersForSubmission } from '~/composables/useAnswerNormalization'

// Timer circle SVG properties
const timerCircleRadius = 18
const timerCircumference = computed(() => 2 * Math.PI * timerCircleRadius)
const timerDashOffset = computed(() => {
  const remaining = Math.max(0, Math.ceil(questionRemaining.value || 20))
  const limit = timePerQuestion.value || 20
  const frac = limit ? (remaining / limit) : 0
  return String(timerCircumference.value * (1 - Math.max(0, Math.min(1, frac))))
})

// Persistent countdown alert state (shows real-time countdown instead of discrete alerts)
const countdownAlert = ref({
  show: false,
  type: 'info', // 'info', 'warning', 'error'
  message: '',
  timeRemaining: 0
})

// Update countdown alert based on which timer is critical
const updateCountdownAlert = () => {
  // Check per-question timer first (more urgent) - show when <= 5 seconds
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatTime(Math.ceil(questionRemaining.value))}`
  }
  // Then check overall quiz timer if per-question is not critical - show when <= 5 seconds
  else if (typeof timeLeft.value === 'number' && timeLeft.value <= 5 && timeLeft.value > 0 && quiz.value?.timer_seconds) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeLeft.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = timeLeft.value
    countdownAlert.value.message = `⏱️ Quiz time remaining: ${formatTime(timeLeft.value)}`
  } else {
    countdownAlert.value.show = false
  }
}

// Watch timers to update countdown alert
watch(timeLeft, () => updateCountdownAlert(), { immediate: false })
watch(questionRemaining, () => updateCountdownAlert(), { immediate: false })

// Progress persistence helpers (include attempt_id so restore maps to server attempt)
// Per-question timing state (declare early so functions/watchers below can reference it)
const questionTimes = ref({})

let persistTimeoutRef = { t: null }
function progressKey() {
  return `quiz:attempt:progress:${quiz.value?.id || id}:${quiz.value?._attempt_id || 'draft'}`
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(progressKey())
    if (!raw) {
      // No attempt-specific saved progress yet. Try to migrate any existing 'draft' progress
      try {
        const legacyKey = `quiz:attempt:progress:${quiz.value?.id || id}:draft`
        const legacyRaw = localStorage.getItem(legacyKey)
        if (legacyRaw) {
          // copy legacy to the new key so future saves use the server attempt id
          localStorage.setItem(progressKey(), legacyRaw)
          try { localStorage.removeItem(legacyKey) } catch (e) {}
        } else {
          return
        }
      } catch (e) { return }
    }
    const parsed = JSON.parse(localStorage.getItem(progressKey()) || '{}')
    if (parsed?.answers && typeof parsed.answers === 'object') {
      Object.keys(parsed.answers).forEach(k => { answers.value[k] = parsed.answers[k] })
    }
    if (parsed?.question_times && typeof parsed.question_times === 'object') {
      questionTimes.value = parsed.question_times
    }
    if (typeof parsed.questionRemaining === 'number' && parsed.questionRemaining > 0) questionRemaining.value = parsed.questionRemaining
    // If this quiz uses per-question limits, resume the per-question UI timer and schedule the authoritative expiry
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    const limit = currentQuestionLimit()
    if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < limit) ? questionRemaining.value : undefined
      startQuestionTimer(limit, remainingForSchedule)
      schedulePerQuestionLimit(limit, () => {
        if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion()
        else {
          submissionMessage.value = 'Time is over — submitting...'
          submitAnswers()
        }
      }, remainingForSchedule)
    }
    if (!quiz.value._started_at_ms && parsed?.started_at) {
      try { quiz.value._started_at_ms = new Date(parsed.started_at).getTime() } catch (e) {}
    }
  } catch (e) { /* ignore */ }
}

function persistProgress() {
  try {
    if (persistTimeoutRef.t) clearTimeout(persistTimeoutRef.t)
    persistTimeoutRef.t = setTimeout(() => {
      const payload = {
        quiz_id: quiz.value?.id || id,
        attempt_id: quiz.value?._attempt_id || null,
        started_at: quiz.value?._started_at_ms ? new Date(quiz.value._started_at_ms).toISOString() : null,
        answers: answers.value,
        question_times: questionTimes.value,
        questionRemaining: (typeof questionRemaining.value === 'number') ? questionRemaining.value : null
      }
      try { localStorage.setItem(progressKey(), JSON.stringify(payload)) } catch (e) {}
    }, 400)
  } catch (e) {}
}

function clearProgress() {
  try { localStorage.removeItem(progressKey()) } catch (e) {}
}

// Persist on changes
watch(answers, () => persistProgress(), { deep: true })
watch(questionTimes, () => persistProgress(), { deep: true })
watch(() => quiz.value?._attempt_id, () => persistProgress())

// Wrapped answer handlers to capture timing
function selectMcq(qid, opt) {
  rawSelectMcq(qid, opt)
  // record time for this question when answered
  recordQuestionTime(qid)
  // automatically advance after a short delay for single-choice
  setTimeout(() => { if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion() }, 250)
}

function toggleMulti(qid, opt) {
  rawToggleMulti(qid, opt)
  // record time for this question; don't auto-advance
  recordQuestionTime(qid)
}
const { currentQuestion, nextQuestion: navNextQuestion, previousQuestion: navPreviousQuestion } = useQuizNavigation(computed(() => quiz.value.questions))

// Watch question change to update countdown immediately for new question
watch(currentQuestion, () => {
  // Force alert update when changing questions
  updateCountdownAlert()
}, { immediate: false })

// Wrap navigation to record question time and manage per-question timers
function nextQuestion() {
  // record time for current
  const qid = currentQuestionData.value.id
  if (qid) recordQuestionTime(qid)
  
  // Reset timer and clear any scheduled limits before moving
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
  
  // Move to next question
  navNextQuestion()
  
  // Reinitialize timer for new question with 15 seconds
  startQuestionTimer(15, undefined)
  
  // Schedule the expiry action (auto-next or submit)
  schedulePerQuestionLimit(15, () => {
    if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion()
    else {
      submissionMessage.value = 'Time is over — submitting...'
      submitAnswers()
    }
  }, undefined)
  
  // Force update countdown alert for new question
  updateCountdownAlert()
}

function previousQuestion() {
  const qid = currentQuestionData.value.id
  if (qid) recordQuestionTime(qid)
  
  // Reset timer and clear any scheduled limits before moving
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
  
  // Move to previous question
  navPreviousQuestion()
  
  // Reinitialize timer for previous question with 15 seconds
  startQuestionTimer(15, undefined)
  
  schedulePerQuestionLimit(15, () => {
    if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion()
    else {
      submissionMessage.value = 'Time is over — submitting...'
      submitAnswers()
    }
  }, undefined)
  
  // Force update countdown alert for new question
  updateCountdownAlert()
}
const { currentStreak, achievements, encouragementMessage, encouragementStyle, calculateAchievements, resetAchievements } = useQuizEnhancements(quiz, progressPercent, currentQuestion, answers)

const currentQuestionData = computed(() => quiz.value.questions[currentQuestion.value] || {})

// Per-question timing (uses composable)

function recordQuestionTime(qid) {
  // record elapsed time from composable and reset the per-question timer
  const elapsed = recordAndReset()
  questionTimes.value[qid] = elapsed
}

// Respect per-question time limits if present (question.time_limit_seconds or quiz.per_question_seconds)
function currentQuestionLimit() {
  const q = currentQuestionData.value
  // Prefer an explicit per-question limit on the question, then the quiz's per-question setting.
  // If the quiz uses a quiz-level timer instead (timer_seconds), compute an approximate per-question
  // limit by dividing total quiz timer by number of questions so each question gets an equal share.
  if (q?.time_limit_seconds) return q.time_limit_seconds
  if (quiz.value?.per_question_seconds) return quiz.value.per_question_seconds
  // If quiz is not using per-question timer but has a timer_seconds, spread it across questions
  if (!quiz.value?.use_per_question_timer && quiz.value?.timer_seconds && quizQuestionsLength.value) {
    const per = Math.floor(quiz.value.timer_seconds / quizQuestionsLength.value)
    return per > 0 ? per : null
  }
  return null
}

// schedulePerQuestionLimit and clearPerQuestionLimit are provided by the composable
// For short-answer questions, expose a computed value with getter/setter so v-model doesn't bind to a read-only expression
const currentShortAnswer = computed({
  get() {
    const q = currentQuestionData.value
    if (!q || !q.id) return ''
    return answers.value[q.id] ?? ''
  },
  set(v) {
    const q = currentQuestionData.value
    if (!q || !q.id) return
    answers.value[q.id] = v
  }
})
// centralized checkout handles payments and result viewing

// --- Methods ---

// Timer formatting helper
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onQuestionSelect(val) {
  const q = currentQuestionData.value
  if (!q || !q.id) return
  console.log('Question selected:', { questionId: q.id, questionType: q.type, answer: val })
  answers.value[q.id] = val
  // record per-question time
  recordQuestionTime(q.id)
  if (q.type === 'mcq') {
    setTimeout(() => { if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion() }, 250)
  }
}

// Initialize the question timer with proper quiz configuration
function initializeQuestionTimer() {
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
  
  // Start with 15 seconds per question
  const timerLimit = 15
  
  // Start the question timer explicitly
  startQuestionTimer(timerLimit, undefined)
  
  // Schedule the expiry callback
  schedulePerQuestionLimit(timerLimit, () => {
    if (currentQuestion.value < quizQuestionsLength.value - 1) {
      nextQuestion()
    } else {
      submissionMessage.value = 'Time is over — submitting...'
      submitAnswers()
    }
  }, undefined)
}

onMounted(async () => {
  const cfg = useRuntimeConfig()
  try {
    const res = await api.get(`/api/quizzes/${id}`)
    if (api.handleAuthStatus(res)) { /* auth redirect handled */ }
    else if (res && res.ok) {
      const body = await res.json()
      quiz.value = body.quiz || body
      initializeAnswers()
        // Try to create a server-side attempt to get authoritative attempt_id and started_at.
        // If that fails (unauthenticated or network), fall back to a client-side started_at timestamp.
        try {
          const startRes = await api.postJson(`/api/quizzes/${id}/start`, {})
          if (!api.handleAuthStatus(startRes) && startRes && startRes.ok) {
            const startBody = await startRes.json().catch(() => null)
            quiz.value._attempt_id = startBody?.attempt_id ?? startBody?.attempt?.id ?? null
            if (startBody?.started_at) {
              try { quiz.value._started_at_ms = new Date(startBody.started_at).getTime() } catch (e) { quiz.value._started_at_ms = Date.now() }
            } else {
              quiz.value._started_at_ms = Date.now()
            }
          } else {
            // server start failed or returned non-ok (e.g. unauthenticated) — use client timestamp
            quiz.value._started_at_ms = Date.now()
          }
        } catch (e) {
          // network error — fallback to client timestamp
          quiz.value._started_at_ms = Date.now()
        }

        // Start timers after establishing started_at / attempt_id
        startTimer()
        
        // Initialize question timer AFTER quiz data is loaded
        initializeQuestionTimer()
        
        try { restoreProgress() } catch (e) {}

      // fill-blank handling is handled by the FillBlankCard component via v-model/select

    } else {
      // Handle quiz not found or other errors
      console.error("Failed to load quiz", res.status)
      // Optionally redirect or show an error message
    }
  } catch (e) {}
  loading.value = false
})

async function submitAnswers() {
  if (submitting.value) return
  submitting.value = true
  lastSubmitFailed.value = false
  // Calculate achievements before submitting
  calculateAchievements()

  // show a short saving message while answers persist; actual marking happens on checkout
  submissionMessage.value = 'Saving answers...'
  try {
    const cfg = useRuntimeConfig()
  // finalize timing
  recordQuestionTime(currentQuestionData.value.id)
  // clear per-question limit timer from composable
  clearPerQuestionLimit()
  stopTimer()
  const totalTime = Math.floor((Date.now() - (quiz.value._started_at_ms || Date.now())) / 1000)

  // Get the latest answers from memory and localStorage
  let answersToSubmit = answers.value
  try {
    const saved = localStorage.getItem(progressKey())
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed?.answers && Object.keys(parsed.answers).length > 0) {
        answersToSubmit = parsed.answers
        console.log('Using saved answers from localStorage:', answersToSubmit)
      }
    }
  } catch (e) {
    console.log('Could not retrieve saved answers, using in-memory:', e)
  }

  // Build answers payload using central normalization helpers.
  // This ensures consistent formatting between different quiz flows (battles, tournaments, normal quizzes).
  const sanitizedAnswers = formatAnswersForSubmission(answersToSubmit, questionTimes.value)
  
  // Log for debugging
  console.log('Raw answers object:', answersToSubmit)
  console.log('Sanitized answers:', sanitizedAnswers)
  
  // Only filter out answers with question_id of 0 (completely invalid)
  const finalAnswers = sanitizedAnswers.filter(a => {
    const qid = Number(a.question_id)
    return Number.isFinite(qid)
  })

  const payload = {
    answers: finalAnswers,
    defer_marking: true,
    total_time_seconds: totalTime,
    started_at: quiz.value._started_at_ms ? new Date(quiz.value._started_at_ms).toISOString() : (quiz.value.started_at || null),
    attempt_id: quiz.value._attempt_id || null,
  }

  console.log('Final payload being sent to server:', payload)
  console.log('Number of answers in payload:', finalAnswers.length)
  console.log('First few answers detail:', finalAnswers.slice(0, 3))
  
    const res = await api.postJson(`/api/quizzes/${id}/submit`, payload)
    console.log('Submission response status:', res.status)
    if (api.handleAuthStatus(res)) { pushAlert({ message: 'Session expired — please sign in again', type: 'warning' }); lastSubmitFailed.value = true; submissionMessage.value = ''; submitting.value = false; showConfirm.value = false; return }
    if (res.ok) {
      // stop saving message
      submissionMessage.value = ''
      const body = await res.json()
      console.log('Submission response body:', body)
      stopTimer()
      try { clearProgress() } catch (e) {}
      clearSavedAnswers()

      // If backend returned an attempt id, redirect to centralized checkout so user can see results after checkout
      const attemptId = body?.attempt_id ?? body?.attempt?.id
      console.log('Extracted attemptId from response:', attemptId)
      // If backend included awarded achievements or updated user, update auth store to reflect new badges/points
      try {
        const auth = useAuthStore()
        if (body?.user) auth.setUser(body.user)
        else if (body?.awarded_achievements && body.awarded_achievements.length) await auth.fetchUser()
      } catch (e) {}
      if (attemptId) {
        router.push(`/quizee/payments/checkout?type=quiz&attempt_id=${attemptId}`)
        return
      }

      // No attempt id returned — redirect to checkout with quiz id so user can continue to payment flow
      router.push(`/quizee/payments/checkout?type=quiz&quiz_id=${id}`)
      return
  } else {
      // restore optimistic to null to indicate failure
  console.error('Submission failed with status:', res.status)
  if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
  submissionMessage.value = ''
  // ensure no inline result is shown — stay on page with answers preserved for retry
      // show error alert and keep answers saved to allow retry
  let errMsg = 'Failed to submit quiz. Please try again.'
  try { const errBody = await res.json(); if (errBody?.message) errMsg = errBody.message; console.error('Submission error response:', errBody) } catch(e) {}
  pushAlert({ message: errMsg, type: 'error' })
      // Keep answers in-place so user can retry; showConfirm dialog will be closed and user can press Retry
    }
  } catch (e) {
    if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
    submissionMessage.value = ''
  // keep answers saved locally so user can retry
    pushAlert({ message: 'Network error while submitting quiz. Your answers are still saved — try again.', type: 'error' })
    lastSubmitFailed.value = true
  } finally {
    submitting.value = false
    showConfirm.value = false
  }
}

function confirmSubmit() { showConfirm.value = true }

function cancel() { router.push('/quizee/quizzes') }

function retakeQuiz() {
  // Clear local storage and reload to retake
  try { clearProgress() } catch (e) {}
  clearSavedAnswers()
  // Reset achievement tracking
  resetAchievements()
  window.location.reload()
}

</script>



<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.995);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-enter-to, .slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
