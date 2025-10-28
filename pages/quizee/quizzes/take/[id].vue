<template>
  <div class="min-h-screen bg-gray-50 md:p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white md:rounded-lg md:shadow-sm md:border pb-24 md:pb-0">
        <div class="p-4 md:p-6 border-b">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-lg md:text-xl font-semibold text-gray-900">{{ quiz.title || 'Loading...' }}</div>
              <div class="text-sm text-gray-600">{{ quiz.description }}</div>

              <!-- Quiz rules badges -->
              <div class="mt-2 flex flex-wrap gap-2 text-sm">
                <div v-if="quiz.attempts_allowed" class="px-2 py-1 bg-gray-100 rounded">🔁 {{ quiz.attempts_allowed === 'unlimited' ? 'Unlimited attempts' : quiz.attempts_allowed + ' attempts' }}</div>
                <div v-if="quiz.shuffle_questions" class="px-2 py-1 bg-gray-100 rounded">🔀 Questions shuffled</div>
                <div v-if="quiz.shuffle_answers" class="px-2 py-1 bg-gray-100 rounded">🔀 Answers shuffled</div>
                <div v-if="quiz.access && quiz.access !== 'free'" class="px-2 py-1 bg-amber-50 text-amber-700 rounded">🔒 Paywalled</div>
              </div>
            </div>

            <!-- Accessible announcements -->
            <div class="sr-only" aria-live="polite">{{ lastAnnouncement }}</div>
            <div class="flex items-center gap-4" v-if="quiz.questions.length > 0">
              <!-- Quiz Timer -->
              <div class="flex flex-col items-end">
                <div v-if="quiz.timer_seconds" class="text-sm text-gray-500">Total Time</div>
                <div class="text-lg font-mono font-bold" :class="{
                  'text-red-500': timeLeft.value < 60,
                  'text-orange-500': timeLeft.value < 180,
                  'text-indigo-600': timeLeft.value >= 180 || !quiz.timer_seconds
                }">
                  {{ displayTime }}
                </div>
              </div>

              <!-- Question Timer -->
              <div v-if="quiz.use_per_question_timer || quiz.per_question_seconds" class="flex flex-col items-end border-l pl-4">
                <div class="text-sm text-gray-500">Question Time</div>
                <div class="text-lg font-mono font-bold" :class="qTimerColorClass">
                  {{ qDisplayTime }}
                </div>
              </div>

              <!-- Time per Remaining -->
              <div v-else-if="quiz.timer_seconds" class="flex flex-col items-end border-l pl-4">
                <div class="text-sm text-gray-500">Per Question</div>
                <div class="text-sm font-mono font-medium text-gray-600">
                  ~{{ formatTime(Math.floor(timeLeft.value / (quiz.questions.length - currentQuestion))) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Timer progress (timed quizzes) -->
          <div v-if="quiz.timer_seconds" class="w-full mb-3">
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden" role="progressbar" :aria-valuenow="timeLeft" :aria-valuemax="quiz.timer_seconds" :aria-valuetext="`Time remaining ${displayTime}`">
              <div :class="timerColorClass" class="h-2 rounded-full transition-all duration-500" :style="{ width: `${timerPercent}%` }"></div>
            </div>
          </div>

          <!-- Progress bar (questions answered) -->
          <div v-if="!loading && quiz.questions.length > 0" class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-500">
              Question {{ currentQuestion + 1 }} of {{ quiz.questions.length }}
            </div>
            <!-- Encouragement badge based on progress -->
            <div v-if="encouragementMessage" class="text-sm px-3 py-1 rounded-full bg-gradient-to-r" :class="encouragementStyle">
              {{ encouragementMessage }}
              <span v-if="currentStreak > 1" class="ml-1 font-semibold">🔥 {{ currentStreak }}</span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="p-6"><UiSkeleton :count="5" /></div>

        <div v-else-if="quiz.questions.length > 0" class="p-4 md:p-6">
          <div class="max-w-4xl mx-auto">
            <!-- Question Card -->
            <transition name="fade-slide" mode="out-in">
              <div :key="currentQuestion" class="bg-white rounded-lg shadow-sm border mb-6">
                <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Media Section -->
                  <div v-if="currentQuestionData.media" class="lg:col-span-1">
                    <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                      <img :src="currentQuestionData.media" alt="Question media" class="max-w-full max-h-full object-contain rounded" />
                    </div>
                  </div>
                  <!-- Question Section -->
                  <div :class="currentQuestionData.media ? 'lg:col-span-1' : 'lg:col-span-2'">
                    <div class="font-semibold text-lg text-gray-900 mb-4">Question {{ currentQuestion + 1 }}</div>
                    <div class="text-gray-800 mb-4" v-html="currentQuestionData.body || currentQuestionData.text || currentQuestionData.question"></div>
                    <div class="space-y-3">
                      <QuestionCard :question="currentQuestionData" v-model="answers[currentQuestionData.id]" @select="onQuestionSelect" />
                    </div>
                    <div class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>

                    </div>
                  </div>
                </div>
              </div>
              </div>
            </transition>

            <!-- Navigation -->
            <div class="fixed bottom-0 left-0 right-0 md:relative bg-white/80 backdrop-blur-sm md:bg-transparent border-t md:border-0 p-4 md:p-0">
              <div class="max-w-4xl mx-auto flex items-center justify-between">
                <button type="button" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" :disabled="currentQuestion === 0" @click="previousQuestion">
                  Previous
                </button>
                <div class="flex gap-2">
                  <button v-if="currentQuestion < quiz.questions.length - 1" type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="nextQuestion">
                    Next
                  </button>
                  <button v-else type="button" :disabled="submitting.value" :class="['px-6 py-2 rounded-lg transition-colors', submitting.value ? 'bg-green-500 text-white opacity-60 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700']" @click="confirmSubmit">
                    <svg v-if="submitting.value" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    <span>{{ submitting.value ? 'Submitting…' : 'Submit Quiz' }}</span>
                  </button>
                  <button v-if="lastSubmitFailed" type="button" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors" @click="submitAnswers" :disabled="submitting.value">
                    Retry
                  </button>
                </div>
                <div v-if="submissionMessage" class="mt-3 text-sm text-slate-600">{{ submissionMessage }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- confirmation modal -->
        <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Submit Quiz</h3>
                  <p class="text-sm text-gray-600">Are you sure you want to submit? You won't be able to change your answers.</p>
                </div>
              </div>
              <div class="flex gap-3 justify-end">
                <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" @click="showConfirm = false" :disabled="submitting.value">Cancel</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="submitAnswers" :disabled="submitting.value">
                  <svg v-if="submitting.value" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results are shown on a dedicated results page. After submit the user is redirected there. -->
      </div>
    </div>
  </div>
</template>

<script setup>
import UiTextarea from '~/components/ui/UiTextarea.vue'
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

const route = useRoute()
const router = useRouter()
const id = route.params.id

// --- Core State ---
const quiz = ref({ questions: [] })
const loading = ref(true)
const submitting = ref(false)
const lastSubmitFailed = ref(false)
const submissionMessage = ref('')
let submissionInterval = null
const { push: pushAlert } = useAppAlert()
import useApi from '~/composables/useApi'
const api = useApi()
const showConfirm = ref(false)



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
const { timePerQuestion, questionRemaining, questionStartTs, displayTime: qDisplayTime, timerColorClass: qTimerColorClass, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)
const { answers, initializeAnswers, selectMcq: rawSelectMcq, toggleMulti: rawToggleMulti, updateBlank, clearSavedAnswers } = useQuizAnswers(quiz, id)

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

// Wrap navigation to record question time and manage per-question timers
function nextQuestion() {
  // record time for current
  const qid = currentQuestionData.value.id
  if (qid) recordQuestionTime(qid)
  navNextQuestion()
  // restart per-question timer for new question
  startQuestionTimer(timePerQuestion.value)
  schedulePerQuestionLimit(currentQuestionLimit(), () => {
    if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion()
    else submitAnswers()
  })
}

function previousQuestion() {
  const qid = currentQuestionData.value.id
  if (qid) recordQuestionTime(qid)
  navPreviousQuestion()
  startQuestionTimer(timePerQuestion.value)
  schedulePerQuestionLimit(currentQuestionLimit(), () => {
    if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion()
    else submitAnswers()
  })
}
const { currentStreak, achievements, encouragementMessage, encouragementStyle, calculateAchievements, resetAchievements } = useQuizEnhancements(quiz, progressPercent, currentQuestion, answers)

const currentQuestionData = computed(() => quiz.value.questions[currentQuestion.value] || {})

// Per-question timing (uses composable)
const questionTimes = ref({})

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
  answers.value[q.id] = val
  // record per-question time
  recordQuestionTime(q.id)
  if (q.type === 'mcq') {
    setTimeout(() => { if (currentQuestion.value < quizQuestionsLength.value - 1) nextQuestion() }, 250)
  }
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
  // Record client-side started_at timestamp. If you prefer server-trusted starts,
  // re-enable the POST /api/quizzes/{id}/start call and store returned attempt id.
  quiz.value._started_at_ms = Date.now()
  startTimer()
  // start per-question timer and question timer
  startQuestionTimer()
  schedulePerQuestionLimit()

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

  // Normalize answer values before sending to backend
  function normalizeAnswer(answer) {
    if (!answer) return answer;
    if (Array.isArray(answer)) {
      return answer.map(a => normalizeAnswer(a));
    }
    if (typeof answer === 'object') {
      return answer.body || answer.text || answer.toString();
    }
    return answer;
  }

  const payload = {
    answers: Object.keys(answers.value).map(qid => ({ 
      question_id: parseInt(qid, 10) || 0, 
      selected: normalizeAnswer(answers.value[qid])
    })),
    defer_marking: true,
    question_times: questionTimes.value,
    total_time_seconds: totalTime,
    started_at: quiz.value._started_at_ms ? new Date(quiz.value._started_at_ms).toISOString() : (quiz.value.started_at || null),
    attempt_id: quiz.value._attempt_id || null,
  }

    const res = await api.postJson(`/api/quizzes/${id}/submit`, payload)
    if (api.handleAuthStatus(res)) { pushAlert({ message: 'Session expired — please sign in again', type: 'warning' }); lastSubmitFailed.value = true; submissionMessage.value = ''; submitting.value = false; showConfirm.value = false; return }
    if (res.ok) {
      // stop saving message
      submissionMessage.value = ''
      const body = await res.json()
      stopTimer()
      clearSavedAnswers()

      // If backend returned an attempt id, redirect to centralized checkout so user can see results after checkout
      const attemptId = body?.attempt_id ?? body?.attempt?.id
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
  if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
  submissionMessage.value = ''
  // ensure no inline result is shown — stay on page with answers preserved for retry
      // show error alert and keep answers saved to allow retry
  let errMsg = 'Failed to submit quiz. Please try again.'
  try { const errBody = await res.json(); if (errBody?.message) errMsg = errBody.message } catch(e) {}
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
  clearSavedAnswers()
  // Reset achievement tracking
  resetAchievements()
  window.location.reload()
}

</script>



<style scoped>
</style>

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
</style>
