<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <p class="text-slate-600">Loading quiz...</p>
      </div>
    </div>

    <!-- Premium Quiz Error -->
    <div v-else-if="premiumError" class="flex items-center justify-center min-h-screen py-6 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🔒
        </div>
        
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Premium Quiz</h2>
        <p class="text-slate-600 mb-6">
          This quiz requires authentication. Please create a free account or login to continue.
        </p>

        <div class="space-y-3">
          <NuxtLink 
            to="/login" 
            class="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            Login to Your Account
          </NuxtLink>
          <NuxtLink 
            to="/register" 
            class="block w-full py-3 border border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Create Free Account
          </NuxtLink>
          <NuxtLink 
            :to="`/quizzes/${slug}`"
            class="block w-full py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to Quiz Details
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quiz Taking Interface -->
    <div v-else-if="!quizCompleted" class="py-6 md:py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Quiz Header -->
        <div class="mb-8">
          <button @click="goBack" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Back to Quiz
          </button>
          
          <!-- Progress Bar -->
          <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-semibold text-slate-900">{{ quiz.title }}</h2>
              <div v-if="encouragementMessage" class="text-sm mt-1" :class="encouragementStyle">{{ encouragementMessage }}</div>
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-slate-600">Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</span>
                <!-- Timer (with per-question circle + textual remaining) -->
                <div v-if="hasTimeLimit" class="flex items-center gap-3">
                  <div class="w-10 h-10 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" class="w-10 h-10">
                      <!-- background ring -->
                      <circle cx="20" cy="20" r="18" class="text-slate-200" stroke="currentColor" stroke-width="3" fill="none" />
                      <!-- animated foreground ring -->
                      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"
                        :class="qTimerColorClass"
                        :style="{ strokeDasharray: timerCircumference, strokeDashoffset: timerDashOffset }"
                        class="transform -rotate-90 origin-center"
                      />
                    </svg>
                  </div>

                  <div :class="['px-3 py-1 rounded-lg font-semibold', timeWarning ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700']">
                    <span>{{ timeRemaining }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-brand-600 transition-all duration-300" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>
          <!-- Countdown alert banner (per-question or quiz-level warnings) -->
          <div v-if="countdownAlert.show" :class="['mt-4 p-3 rounded-lg text-sm', countdownAlertClass]">
            {{ countdownAlert.message }}
          </div>
        </div>

        <!-- Current Question (use shared QuestionCard so all question types are supported) -->
        <div class="mb-6">
          <QuestionCard :key="currentQuestionIndex" :question="currentQuestion" v-model="answers[currentQuestion?.id]" @select="onQuestionSelect" @toggle="(opt) => rawToggleMulti(currentQuestion.id, opt)" />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3 justify-end">
          <button 
            @click="nextQuestion"
            :disabled="!answered"
            class="px-6 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLastQuestion ? 'Complete Quiz' : 'Next →' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results Modal -->
    <div v-if="quizCompleted" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🎉
        </div>
        
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p class="text-slate-600 mb-6">
          You scored <span class="font-bold text-brand-600">{{ quizAttempt?.percentage || 0 }}%</span>
        </p>

        <!-- Score Breakdown -->
        <div class="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Correct:</span>
            <span class="font-semibold text-green-600">{{ quizAttempt?.correct_count || 0 }}/{{ totalQuestions }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Incorrect:</span>
            <span class="font-semibold text-red-600">{{ quizAttempt?.incorrect_count || 0 }}/{{ totalQuestions }}</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span class="text-slate-600">Time taken:</span>
            <span class="font-semibold text-slate-900">{{ formatTime(quizAttempt?.time_taken || 0) }}</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="space-y-3">
          <NuxtLink 
            to="/register" 
            class="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            Create Free Account to Save
          </NuxtLink>
          <NuxtLink 
            :to="`/quizzes/${quiz.slug}`"
            class="block w-full py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to Quiz Details
          </NuxtLink>
        </div>

        <p class="text-xs text-slate-500 mt-4">
          💡 Sign up to save your results and track progress.
        </p>

        <p class="text-xs text-slate-400 mt-2">
          Join 10,000+ learners mastering new skills daily.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import { formatAnswersForSubmission } from '~/composables/useAnswerNormalization'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const api = useApi()
const guestQuizStore = useGuestQuizStore()

// Initialize guest quiz store on component mount
onMounted(() => {
  guestQuizStore.initializeStore()
})

// State
const quiz = ref({})
const questions = ref([])
const loading = ref(true)
const currentQuestionIndex = ref(0)
const quizCompleted = ref(false)
// answers stored by question id (useQuizAnswers ensures every question id exists)
const { answers, initializeAnswers, selectMcq: rawSelectMcq, toggleMulti: rawToggleMulti, clearSavedAnswers } = useQuizAnswers(computed(() => ({ questions: questions.value })), '')

// per-question timing & tracking
const questionTimes = ref({})
function recordQuestionTime(qid) {
  try {
    const elapsed = recordAndReset()
    questionTimes.value[qid] = elapsed
  } catch (e) {}
}

const hasTimeLimit = ref(false)
const startTime = ref(null)
const quizAttempt = ref(null)
const submitting = ref(false)
const premiumError = ref(false)

// Computed properties
const slug = computed(() => route.params.slug)
const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {})
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const progress = computed(() => ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100)

// per-question timer composable
const { timePerQuestion, questionRemaining, questionStartTs, displayTime: qDisplayTime, timerColorClass: qTimerColorClass, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)

// overall quiz timer composable (same as quizee)
const { timeLeft, displayTime, startTimer: startQuizTimer, stopTimer: stopQuizTimer } = useQuizTimer(quiz, () => submitQuizAttempt())

// enhancements (encouragement message only for guest flow)
const { encouragementMessage, encouragementStyle } = useQuizEnhancements(quiz, progress, computed(() => currentQuestionIndex.value), answers)

// Show per-question display when a per-question limit exists, else show overall timer
// show per-question display when available, else overall timer display from useQuizTimer
const timeRemaining = computed(() => {
  if (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) return qDisplayTime.value
  return displayTime.value || '0:00'
})

const timeWarning = computed(() => {
  const per = typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0
  return per || (timeLeft.value < 60 && hasTimeLimit.value)
})

// Timer circle SVG properties (for per-question visual)
const timerCircleRadius = 18
const timerCircumference = computed(() => 2 * Math.PI * timerCircleRadius)
const timerDashOffset = computed(() => {
  const remaining = Math.max(0, Math.ceil(questionRemaining.value || 0))
  const limit = timePerQuestion.value || currentQuestionLimit() || 20
  const frac = limit ? (remaining / limit) : 0
  return timerCircumference.value * (1 - Math.max(0, Math.min(1, frac)))
})

// Countdown alert state (mirrors quizee)
const countdownAlert = ref({ show: false, type: 'info', message: '', timeRemaining: 0 })

const countdownAlertClass = computed(() => {
  if (!countdownAlert.value.show) return ''
  if (countdownAlert.value.type === 'error') return 'bg-red-100 text-red-800 border border-red-300'
  if (countdownAlert.value.type === 'warning') return 'bg-amber-100 text-amber-800 border border-amber-300'
  return 'bg-brand-100 text-brand-800 border border-brand-300'
})

function updateCountdownAlert() {
  // per-question urgency first
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatTime(Math.ceil(questionRemaining.value))}`
    return
  }

  // then overall quiz timer (use timeLeft from useQuizTimer)
  if (typeof timeLeft.value === 'number' && timeLeft.value <= 5 && timeLeft.value > 0 && quiz.value?.timer_seconds) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeLeft.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = timeLeft.value
    countdownAlert.value.message = `⏱️ Quiz time remaining: ${formatTime(timeLeft.value)}`
    return
  }

  countdownAlert.value.show = false
}

// Watch timers to update countdown alert
watch(() => questionRemaining.value, () => updateCountdownAlert())
watch(timeLeft, () => updateCountdownAlert(), { immediate: false })

// Selected option for the current question (derived from answers composable)
const selectedOption = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.id) return null
  return answers.value[q.id] ?? null
})

// Whether the current question has been answered
const answered = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.id) return false
  const val = answers.value[q.id]
  if (q.type === 'multi') return Array.isArray(val) && val.length > 0
  return val !== null && val !== undefined && val !== ''
})

// Determine per-question time limit (prefer question-specific, then quiz-level, then split overall)
function currentQuestionLimit() {
  const q = currentQuestion.value
  if (q?.time_limit_seconds) return q.time_limit_seconds
  if (quiz.value?.per_question_seconds) return quiz.value.per_question_seconds
  if (!quiz.value?.use_per_question_timer && quiz.value?.timer_seconds && totalQuestions.value) {
    const per = Math.floor(quiz.value.timer_seconds / Math.max(1, totalQuestions.value))
    return per > 0 ? per : null
  }
  return null
}

function initializeQuestionTimer() {
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
  const limit = currentQuestionLimit()
  if (limit) {
    startQuestionTimer(limit, undefined)
    schedulePerQuestionLimit(limit, () => {
      if (currentQuestionIndex.value < questions.value.length - 1) nextQuestion()
      else submitQuizAttempt()
    }, undefined)
  }
}

// Load quiz data
async function loadQuiz() {
  try {
    loading.value = true
    startTime.value = Date.now()
    
    // Fetch quiz details
    const quizRes = await api.get(`/api/quizzes?slug=${slug.value}`)
    if (!quizRes.ok) throw new Error('Failed to load quiz')
    
  const quizData = await quizRes.json()
  // Accept both single-quiz and paginated-list shapes from the API
  const quizDetail = quizData.quiz || (quizData.quizzes && (Array.isArray(quizData.quizzes.data) ? quizData.quizzes.data[0] : (Array.isArray(quizData.quizzes) ? quizData.quizzes[0] : null)))
    
    if (!quizDetail) throw new Error('Quiz not found')
    
    // Check if quiz is premium/paid
    if (quizDetail.is_paid) {
      premiumError.value = true
      loading.value = false
      return
    }
    
  quiz.value = quizDetail
    
    // Check if user has already taken this quiz
    const previousResult = guestQuizStore.getQuizResult(quizDetail.id)
    if (previousResult) {
      quizAttempt.value = previousResult
      quizCompleted.value = true
      loading.value = false
      return
    }
    
    // Set up timer if quiz has time limit
    if (quizDetail.timer_seconds && quizDetail.timer_seconds > 0) {
      hasTimeLimit.value = true
      // the useQuizTimer composable reads quiz.value to compute its timers; ensure quiz is set
      // start the composable timer
      try { startQuizTimer() } catch (e) {}
    }
    
    // Fetch questions
    const questionsRes = await api.get(`/api/quizzes/${quizDetail.id}/questions`)
    if (!questionsRes.ok) throw new Error('Failed to load questions')
    
    const questionsData = await questionsRes.json()
    
    // Check for premium quiz error response
    if (questionsData.code === 'PREMIUM_QUIZ') {
      premiumError.value = true
      loading.value = false
      return
    }
    
    // Normalise backend question shape to what the UI expects:
    // - question.text (frontend) <- question.body (backend)
    // - option.text <- option.text || option.body
    // - ensure option.id exists and option.is_correct is boolean (guests won't receive correct flags)
    const rawQuestions = questionsData.questions || questionsData.data || []
    const normalized = (rawQuestions || []).map(q => {
      const opts = Array.isArray(q.options) ? q.options.map(o => ({
        id: o.id ?? o._id ?? null,
        text: o.text ?? o.body ?? (typeof o === 'string' ? o : ''),
        // Guests should NEVER see correct answer flags - always set to false
        // Marking happens server-side after quiz submission
        is_correct: false
      })) : []

      return {
        id: q.id ?? q._id ?? null,
        type: q.type ?? null,
        // frontend templates reference `text` for question body
        text: q.body ?? q.text ?? '',
        explanation: q.explanation ?? null,
        marks: q.marks ?? 1,
        media_path: q.media_path ?? null,
        options: opts
      }
    })

    questions.value = normalized
  // Initialize answers object (ensures every question id exists as null or [])
  initializeAnswers()

  // Initialize per-question timer for the first question if applicable
  try { initializeQuestionTimer() } catch (e) {}

    if (!questions.value || questions.value.length === 0) {
      throw new Error('No questions available for this quiz')
    }
    
  } catch (error) {
    console.error('Error loading quiz:', error)
    await router.push(`/quizzes/${slug.value}`)
  } finally {
    loading.value = false
  }
}

// Select answer - just store it, no marking during quiz
// Select answer - use quiz answers composable, record time and auto-advance for mcq
function selectAnswer(option) {
  const q = currentQuestion.value
  if (!q || !q.id) return
  // prevent double selection while processing
  const existing = answers.value[q.id]
  if (existing !== null && existing !== undefined && !(Array.isArray(existing) && existing.length === 0)) return

  // store the raw option (keeps option object for UI)
  rawSelectMcq(q.id, option)
  // record per-question time
  try { recordQuestionTime(q.id) } catch (e) {}

  // auto advance for single choice
  setTimeout(() => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
    } else {
      completeQuiz()
    }
  }, 250)
}

function onQuestionSelect(val) {
  const q = currentQuestion.value
  if (!q || !q.id) return
  // set via answers v-model by child component - but ensure stored in answers object
  answers.value[q.id] = val
  // record per-question time
  try { recordQuestionTime(q.id) } catch (e) {}
  // auto-advance for mcq (single choice)
  if (q.type === 'mcq') {
    setTimeout(() => { if (currentQuestionIndex.value < questions.value.length - 1) nextQuestion(); else completeQuiz() }, 250)
  }
}

// Navigation
function nextQuestion() {
  // record time for current
  const qid = currentQuestion.value.id
  if (qid) recordQuestionTime(qid)

  // reset per-question timer and clear schedule
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}

  if (isLastQuestion.value) {
    completeQuiz()
  } else {
    currentQuestionIndex.value++
    // ensure question timer is started for new question
    const limit = currentQuestionLimit()
    if (limit) {
      startQuestionTimer(limit, undefined)
      schedulePerQuestionLimit(limit, () => {
        if (currentQuestionIndex.value < questions.value.length - 1) nextQuestion()
        else submitQuizAttempt()
      }, undefined)
    }
  }
}

function completeQuiz() {
  try { stopQuizTimer() } catch (e) {}
  try { stopQuestionTimer() } catch (e) {}
  submitQuizAttempt()
}

async function submitQuizAttempt() {
  if (submitting.value) return
  
  submitting.value = true
  try {
    const timeTaken = Math.floor((Date.now() - startTime.value) / 1000)

    // Ensure latest per-question time recorded
    try { recordQuestionTime(currentQuestion.value.id) } catch (e) {}

    // Build answers payload using central helper so unanswered questions are included
    const answersPayload = formatAnswersForSubmission(answers.value, questionTimes.value)

    // Get or generate guest identifier
    const guestId = guestQuizStore.getGuestIdentifier()

    const payload = {
      guest_identifier: guestId,
      time_taken: timeTaken,
      answers: answersPayload,
    }

    // Submit to backend for marking (do not defer marking for public path)
    const res = await api.postJson(`/api/quizzes/${quiz.value.id}/submit`, payload)
    
    if (!res.ok) {
      const errorData = await res.json()
      
      // Check if it's a premium quiz error
      if (errorData.code === 'PREMIUM_QUIZ') {
        premiumError.value = true
        return
      }
      
      throw new Error('Failed to submit quiz')
    }
    
    const data = await res.json()

    // server should return an attempt with results; save and show modal
    quizAttempt.value = data.attempt ?? data

  // Save result to guest store (localStorage) - used to gate free attempts
  try { guestQuizStore.saveQuizResult(quizAttempt.value) } catch (e) {}

    quizCompleted.value = true
    
  } catch (error) {
    console.error('Error submitting quiz:', error)
    // Show error toast
  } finally {
    submitting.value = false
  }
}

function retakeQuiz() {
  try { stopQuizTimer() } catch (e) {}
  currentQuestionIndex.value = 0
  // Clear selection and results for local retake
  try { clearSavedAnswers() } catch (e) {}
  questionTimes.value = {}
  quizCompleted.value = false

  // Clear this quiz's saved result from guest store to allow retake
  try { guestQuizStore.clearQuizResult(quiz.value.id) } catch (e) {}
  
  // Reset timer if quiz has time limit
  if (hasTimeLimit.value && quiz.value.timer_seconds) {
    try { startQuizTimer() } catch (e) {}
  }
}

function goBack() {
  router.push(`/quizzes/${slug.value}`)
}

// Note: overall timer is handled by `useQuizTimer` (startQuizTimer / stopQuizTimer)

// Option styling - simple selection only (no correctness shown during quiz)
// option helper functions removed — selection/rendering is handled by QuestionCard

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

// Load quiz on mount
onMounted(() => {
  loadQuiz()
})
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
