<template>
  <QuizLayoutWrapper
    :title="Q.title || 'Quiz'"
    :current-question="currentQuestionIndex"
    :total-questions="totalQuestions"
    :show-timer="hasTimeLimit"
    :timer-display="timeRemaining"
    :timer-color-class="qTimerColorClass"
    :timer-circumference="timerCircumference"
    :timer-dash-offset="timerDashOffset"
    :encouragement="encouragementMessage"
    :encouragement-class="encouragementStyle"
    :show-meta="true"
    :alert-message="countdownAlert.show ? countdownAlert.message : ''"
    :alert-class="countdownAlertClass"
    :show-previous="currentQuestionIndex > 0"
    :disable-previous="currentQuestionIndex === 0"
    :show-exit="false"
    :show-next="currentQuestionIndex < totalQuestions - 1"
    :disable-next="!answered"
    :show-submit="currentQuestionIndex === totalQuestions - 1"
    :submit-label="submitting ? 'Submitting...' : 'Complete Quiz'"
    :disable-submit="submitting || !answered"
    :is-submitting="submitting"
    :show-confirmation="false"
    @previous="previousQuestion"
    @next="nextQuestion"
    @submit="completeQuiz"
  >
    <template #meta-badges>
      <div v-if="Q.attempts_allowed" class="px-2 py-1 bg-gray-100 rounded text-xs">🔁 {{ Q.attempts_allowed === 'unlimited' ? 'Unlimited' : Q.attempts_allowed + ' attempts' }}</div>
      <div v-if="Q.shuffle_questions" class="px-2 py-1 bg-gray-100 rounded text-xs">🔀 Shuffled</div>
    </template>

    <template #content>
      <!-- Loading State -->
      <div v-if="loading"><UiSkeleton :count="5" /></div>

      <!-- Premium Quiz Error -->
      <div v-else-if="premiumError" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🔒
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Premium Quiz</h2>
        <p class="text-slate-600 mb-6"> This quiz requires authentication. Please create a free account or login to continue. </p>
        <div class="space-y-3">
          <NuxtLink to="/login" class="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"> Login to Your Account </NuxtLink>
          <NuxtLink to="/register" class="block w-full py-3 border border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"> Create Free Account </NuxtLink>
          <NuxtLink :to="`/quizzes/${slug}`" class="block w-full py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"> Back to Quiz Details </NuxtLink>
        </div>
      </div>

      <!-- Quiz Taking Interface -->
      <div v-else-if="!quizCompleted">
        <transition name="fade-slide" mode="out-in">
          <QuestionCard 
            :key="currentQuestionIndex" 
            :question="currentQuestion" 
            v-model="answers[currentQuestion?.id]" 
            @select="onQuestionSelect" 
            @toggle="(opt) => rawToggleMulti(currentQuestion.id, opt)" 
          />
        </transition>
      </div>

      <!-- Results Modal -->
      <div v-if="quizCompleted" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"> 🎉 </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p class="text-slate-600 mb-6"> You scored <span class="font-bold text-brand-600">{{ quizAttempt?.percentage || 0 }}%</span> </p>
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
            <span class="font-semibold text-slate-900">{{ formatTimeDisplay(quizAttempt?.time_taken || 0) }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <NuxtLink to="/register" class="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"> Create Free Account to Save </NuxtLink>
          <NuxtLink :to="`/quizzes/${quiz.slug}`" class="block w-full py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"> Back to Quiz Details </NuxtLink>
        </div>
        <p class="text-xs text-slate-500 mt-4"> 💡 Sign up to save your results and track progress. </p>
      </div>
    </template>
  </QuizLayoutWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import QuizLayoutWrapper from '~/components/QuizLayoutWrapper.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { formatAnswersForSubmission } from '~/composables/useAnswerNormalization'

definePageMeta({ 
  layout: 'default',
  hideBottomNav: true,
  hideTopBar: true,
})

const router = useRouter()
const route = useRoute()
const api = useApi()
const guestQuizStore = useGuestQuizStore()

// State
const quiz = ref({
  title: 'Loading...',
  questions: [],
  timer_seconds: null,
  attempts_allowed: null,
  shuffle_questions: false,
})

const Q = computed(() => quiz.value || {})
const questions = ref([])
const loading = ref(true)
const currentQuestionIndex = ref(0)
const quizCompleted = ref(false)
const submitting = ref(false)
const premiumError = ref(false)
const quizAttempt = ref(null)
const startTime = ref(null)

// Answers
const { answers, initializeAnswers, selectMcq: rawSelectMcq, toggleMulti: rawToggleMulti, clearSavedAnswers } = useQuizAnswers(computed(() => ({ questions: questions.value })), '')

// Logic
const slug = computed(() => route.params.slug)
const totalQuestions = computed(() => (questions.value || []).length)
const currentQuestion = computed(() => {
  const q = questions.value?.[currentQuestionIndex.value]
  if (!q) return { options: [] }
  return { ...q, options: Array.isArray(q.options) ? q.options : [] }
})

const answered = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.id) return false
  const val = answers.value[q.id]
  if (q.type === 'multi') return Array.isArray(val) && val.length > 0
  return val !== null && val !== undefined && val !== ''
})

// Timers
const { timePerQuestion, questionRemaining, displayTime: qDisplayTime, timerColorClass: qTimerColorClass, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)
const { timeLeft, displayTime: quizDisplayTime, startTimer: startQuizTimer, stopTimer: stopQuizTimer } = useQuizTimer(quiz, () => completeQuiz())

const hasTimeLimit = computed(() => !!(quiz.value?.timer_seconds && quiz.value.timer_seconds > 0))

const timeRemaining = computed(() => {
  if (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) return qDisplayTime.value
  return quizDisplayTime.value || '0:00'
})

// Timer Dash Offset (for SVG)
const timerCircleRadius = 18
const timerCircumference = computed(() => 2 * Math.PI * timerCircleRadius)
const timerDashOffset = computed(() => {
  const remaining = Math.max(0, Math.ceil(questionRemaining.value || 0))
  const limit = timePerQuestion.value || currentQuestionLimit() || 20
  const frac = limit ? (remaining / limit) : 0
  return timerCircumference.value * (1 - Math.max(0, Math.min(1, frac)))
})

// Enhancements
const { encouragementMessage, encouragementStyle } = useQuizEnhancements(quiz, computed(() => ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100), currentQuestionIndex, answers)

// Alerts
const countdownAlert = ref({ show: false, type: 'info', message: '' })
const countdownAlertClass = computed(() => {
  if (!countdownAlert.value.show) return ''
  if (countdownAlert.value.type === 'error') return 'bg-red-100 text-red-800 border border-red-300'
  if (countdownAlert.value.type === 'warning') return 'bg-amber-100 text-amber-800 border border-amber-300'
  return 'bg-brand-100 text-brand-800 border border-brand-300'
})

function updateCountdownAlert() {
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.message = `⏱️ Time for this question: ${Math.ceil(questionRemaining.value)}s`
  } else if (typeof timeLeft.value === 'number' && timeLeft.value <= 60 && timeLeft.value > 0 && hasTimeLimit.value) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeLeft.value <= 10 ? 'error' : 'warning'
    countdownAlert.value.message = `⏱️ Quiz time remaining: ${quizDisplayTime.value}`
  } else {
    countdownAlert.value.show = false
  }
}

watch(questionRemaining, updateCountdownAlert)
watch(timeLeft, updateCountdownAlert)

// Methods
function currentQuestionLimit() {
  const q = currentQuestion.value
  if (q?.time_limit_seconds) return q.time_limit_seconds
  if (quiz.value?.per_question_seconds) return quiz.value.per_question_seconds
  if (!quiz.value?.use_per_question_timer && quiz.value?.timer_seconds && totalQuestions.value) {
    return Math.floor(quiz.value.timer_seconds / totalQuestions.value)
  }
  return null
}

function initializeQuestionTimer() {
  stopQuestionTimer()
  clearPerQuestionLimit()
  const limit = currentQuestionLimit()
  if (limit) {
    startQuestionTimer(limit)
    schedulePerQuestionLimit(limit, () => {
      if (currentQuestionIndex.value < questions.value.length - 1) nextQuestion()
      else completeQuiz()
    })
  }
}

async function loadQuiz() {
  try {
    loading.value = true
    startTime.value = Date.now()
    const res = await api.get(`/api/quizzes?slug=${slug.value}`)
    if (!res.ok) throw new Error('Failed to load quiz')
    const data = await res.json()
    const quizDetail = data.quiz || (data.quizzes?.data?.[0]) || (data.quizzes?.[0])
    if (!quizDetail) throw new Error('Quiz not found')
    if (quizDetail.is_paid) { premiumError.value = true; return }
    
    quiz.value = quizDetail
    
    const previousResult = guestQuizStore.getQuizResult(quizDetail.id)
    if (previousResult) {
      quizAttempt.value = previousResult
      quizCompleted.value = true
      return
    }

    if (hasTimeLimit.value) startQuizTimer()

    const qRes = await api.get(`/api/quizzes/${quizDetail.id}/questions`)
    if (!qRes.ok) throw new Error('Failed to load questions')
    const qData = await qRes.json()
    if (qData.code === 'PREMIUM_QUIZ') { premiumError.value = true; return }

    const rawQuestions = qData.questions || qData.data || []
    questions.value = rawQuestions.map(q => ({
      id: q.id ?? q._id,
      type: q.type,
      text: q.body ?? q.text,
      explanation: q.explanation,
      options: (q.options || []).map(o => ({
        id: o.id ?? o._id,
        text: o.text ?? o.body ?? (typeof o === 'string' ? o : ''),
        is_correct: false
      }))
    }))

    initializeAnswers()
    initializeQuestionTimer()
  } catch (e) {
    console.error(e)
    router.push(`/quizzes/${slug.value}`)
  } finally {
    loading.value = false
  }
}

function onQuestionSelect(val) {
  const q = currentQuestion.value
  if (!q || !q.id) return
  answers.value[q.id] = val
  recordAndReset()
  if (q.type === 'mcq') {
    setTimeout(() => {
      if (currentQuestionIndex.value < totalQuestions.value - 1) nextQuestion()
      else completeQuiz()
    }, 250)
  }
}

function nextQuestion() {
  recordAndReset()
  stopQuestionTimer()
  clearPerQuestionLimit()
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
    initializeQuestionTimer()
  } else {
    completeQuiz()
  }
}

function previousQuestion() {
  recordAndReset()
  stopQuestionTimer()
  clearPerQuestionLimit()
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    initializeQuestionTimer()
  }
}

const questionTimes = ref({})
async function completeQuiz() {
  if (submitting.value) return
  submitting.value = true
  stopQuizTimer()
  stopQuestionTimer()
  try {
    const timeTaken = Math.floor((Date.now() - startTime.value) / 1000)
    const answersPayload = formatAnswersForSubmission(answers.value, questionTimes.value)
    const guestId = guestQuizStore.getGuestIdentifier()

    const res = await api.postJson(`/api/quizzes/${quiz.value.id}/submit`, {
      guest_identifier: guestId,
      time_taken: timeTaken,
      answers: answersPayload,
    })

    if (res.ok) {
      const data = await res.json()
      quizAttempt.value = data.attempt ?? data
      guestQuizStore.saveQuizResult(quizAttempt.value)
      quizCompleted.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

function formatTimeDisplay(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

onMounted(() => {
  guestQuizStore.initializeStore()
  loadQuiz()
})
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.995);
}
</style>
