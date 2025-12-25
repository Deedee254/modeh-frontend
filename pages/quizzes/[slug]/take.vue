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
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-slate-600">Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</span>
                <!-- Timer -->
                <div v-if="hasTimeLimit" :class="['flex items-center gap-2 px-3 py-1 rounded-lg font-semibold', timeWarning ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700']">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ timeRemaining }}</span>
                </div>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-brand-600 transition-all duration-300" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Current Question -->
        <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <!-- Question Text -->
          <h3 class="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-tight">
            {{ currentQuestion.text }}
          </h3>

          <!-- Answer Options -->
          <div class="space-y-3">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="option.id"
              @click="selectAnswer(option)"
              :disabled="answered"
              class="w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group"
              :class="[getOptionClass(option), { 'scale-105 transform': showVerdictAnim && option.id === selectedOption?.id }]"
            >
              <div class="flex items-center gap-3 flex-1">
                <div 
                  class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="getOptionIndicatorClass(option)"
                >
                  <span v-if="answered && option.id === selectedOption?.id" class="text-sm font-bold">
                    {{ currentAnswer?.isCorrect ? '✓' : '✗' }}
                  </span>
                  <span v-else class="text-xs font-semibold text-slate-400">{{ String.fromCharCode(65 + idx) }}</span>
                </div>
                <span class="font-medium" :class="getOptionTextClass(option)">{{ option.text }}</span>
              </div>
              <svg v-if="answered && option.id === selectedOption?.id && currentAnswer?.isCorrect" class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Feedback -->
          <div v-if="answered && showFeedback" class="mt-6 p-4 rounded-xl" :class="feedbackClass">
            <p class="font-semibold mb-2" :class="feedbackTextClass">
              {{ isCorrect ? '✓ Correct!' : '✗ Incorrect' }}
            </p>
            <p v-if="currentQuestion.explanation" class="text-sm" :class="feedbackTextClass">
              {{ currentQuestion.explanation }}
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3 justify-between">
          <button 
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
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

    <!-- Quiz Completed Screen -->
    <div v-else class="flex items-center justify-center min-h-screen py-6 px-4">
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
          <div v-if="quizAttempt?.skipped_count > 0" class="flex justify-between text-sm">
            <span class="text-slate-600">Skipped:</span>
            <span class="font-semibold text-slate-600">{{ quizAttempt?.skipped_count }}/{{ totalQuestions }}</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span class="text-slate-600">Time taken:</span>
            <span class="font-semibold text-slate-900">{{ formatTime(quizAttempt?.time_taken || 0) }}</span>
          </div>
        </div>

        <!-- Detailed Results -->
        <div v-if="quizAttempt?.results" class="mb-6 max-h-48 overflow-y-auto text-left bg-slate-50 rounded-lg p-4 space-y-3">
          <div v-for="(result, idx) in quizAttempt.results" :key="idx" class="text-xs">
            <div class="flex items-start gap-2 mb-1">
              <span :class="['flex-shrink-0 text-sm font-bold', result.is_correct ? 'text-green-600' : 'text-red-600']">
                {{ result.is_correct ? '✓' : '✗' }}
              </span>
              <span class="font-medium text-slate-900 flex-1">{{ result.question_text }}</span>
            </div>
            <div class="ml-6 space-y-1 text-slate-600">
              <p v-if="!result.skipped">Your answer: <span class="font-medium">{{ result.selected_option_text || 'Not answered' }}</span></p>
              <p v-if="!result.is_correct" class="text-green-700">Correct answer: <span class="font-medium">{{ result.correct_option_text }}</span></p>
            </div>
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
          💡 Note: You've completed this quiz. Sign up to save your results and retake quizzes.
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

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import useApi from '~/composables/useApi'
import { useGuestQuizStore } from '~/composables/useGuestQuizStore'

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
const selectedOption = ref(null)
const answered = ref(false)
const quizCompleted = ref(false)
const correctCount = ref(0)
const userAnswers = ref([])
const showVerdictAnim = ref(false)
const timer = ref(0)
const timerInterval = ref(null)
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
const isCorrect = computed(() => {
  const ans = userAnswers.value[currentQuestionIndex.value]
  if (ans && typeof ans.isCorrect !== 'undefined') return ans.isCorrect
  return selectedOption.value?.is_correct || false
})
const showFeedback = computed(() => answered.value)

const feedbackClass = computed(() => {
  return isCorrect.value 
    ? 'bg-green-50 border border-green-100' 
    : 'bg-red-50 border border-red-100'
})

const feedbackTextClass = computed(() => {
  return isCorrect.value ? 'text-green-800' : 'text-red-800'
})

const timeRemaining = computed(() => {
  const remaining = Math.max(0, timer.value)
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const timeWarning = computed(() => {
  return timer.value < 60 && hasTimeLimit.value
})

const currentAnswer = computed(() => userAnswers.value[currentQuestionIndex.value] || null)

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
      timer.value = quizDetail.timer_seconds
      startTimer()
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
        // guests should not get is_correct from backend; default to false
        is_correct: !!(o.is_correct ?? false)
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
    // Restore any in-progress verdicts so resuming mid-quiz shows server verdicts
    const partial = guestQuizStore.getPartialResult(quizDetail.id)
    if (partial && partial.answers) {
      // Build userAnswers array from saved map
      const answersArr = []
      for (const qIndex in questions.value) {
        const q = questions.value[qIndex]
        const saved = partial.answers[q.id]
        if (saved) {
          answersArr[qIndex] = {
            questionId: q.id,
            selectedOptionId: saved.selectedOptionId,
            isCorrect: !!saved.isCorrect
          }
          if (saved.isCorrect) correctCount.value++
        }
      }
      userAnswers.value = answersArr
      // If there's an unanswered question, jump to it; else stay at last
      const firstUnanswered = questions.value.findIndex((_, i) => !userAnswers.value[i])
      currentQuestionIndex.value = firstUnanswered === -1 ? Math.max(0, questions.value.length - 1) : firstUnanswered
      // set selectedOption for current question if answered
      const cur = userAnswers.value[currentQuestionIndex.value]
      if (cur) {
        selectedOption.value = questions.value[currentQuestionIndex.value].options.find(o => o.id === cur.selectedOptionId) || null
        answered.value = true
      }
    }

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

// Select answer
async function selectAnswer(option) {
  if (answered.value) return

  selectedOption.value = option
  answered.value = true

  // Optimistically record selection; correctness will come from the server
  userAnswers.value[currentQuestionIndex.value] = {
    questionId: currentQuestion.value.id,
    selectedOptionId: option.id,
    isCorrect: false
  }

  try {
    const guestId = guestQuizStore.getGuestIdentifier()
    const res = await api.postJson(`/api/quizzes/${quiz.value.id}/mark`, {
      question_id: currentQuestion.value.id,
      selected: option.id ?? option,
      guest_identifier: guestId
    })

    if (!res.ok) {
      console.warn('Marking request failed for question', currentQuestion.value.id)
      return
    }

    const data = await res.json()
    const correct = !!data.correct

    // Update stored answer with server verdict
    userAnswers.value[currentQuestionIndex.value].isCorrect = correct

    if (correct) correctCount.value++

    // Attach explanation to the question for UI display
    const idx = currentQuestionIndex.value
    if (questions.value[idx]) questions.value[idx].explanation = data.explanation ?? questions.value[idx].explanation

    // Persist per-question verdict so resuming will restore server verdicts
    try {
      guestQuizStore.saveQuestionVerdict(quiz.value.id, {
        questionId: currentQuestion.value.id,
        selectedOptionId: option.id,
        isCorrect: correct,
        explanation: data.explanation ?? null
      })
    } catch (e) {}

    // Animate verdict briefly
    showVerdictAnim.value = true
    setTimeout(() => { showVerdictAnim.value = false }, 700)

  } catch (e) {
    console.error('Error marking question:', e)
  }
}

// Navigation
function nextQuestion() {
  if (!answered.value) return
  
  if (isLastQuestion.value) {
    completeQuiz()
  } else {
    currentQuestionIndex.value++
    resetQuestionState()
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    resetQuestionState()
  }
}

function resetQuestionState() {
  const prevAnswer = userAnswers.value[currentQuestionIndex.value]
  selectedOption.value = prevAnswer ? 
    currentQuestion.value.options.find(o => o.id === prevAnswer.selectedOptionId) : 
    null
  answered.value = !!prevAnswer
}

function completeQuiz() {
  stopTimer()
  submitQuizAttempt()
}

async function submitQuizAttempt() {
  if (submitting.value) return
  
  submitting.value = true
  try {
    const timeTaken = Math.floor((Date.now() - startTime.value) / 1000)
    
    // Get or generate guest identifier
    const guestId = guestQuizStore.getGuestIdentifier()
    
    // Format answers for submission
    const formattedAnswers = userAnswers.value.map(answer => ({
      question_id: answer.questionId,
      selected: answer.selectedOptionId
    }))
    
    // Submit to backend for marking
    const res = await api.postJson(`/api/quizzes/${quiz.value.id}/submit`, {
      guest_identifier: guestId,
      time_taken: timeTaken,
      answers: formattedAnswers
    })
    
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

    // Enrich server attempt results with selected and correct option texts from local state
    if (data.attempt && Array.isArray(data.attempt.results)) {
      data.attempt.results = data.attempt.results.map(r => {
        const selected = (formattedAnswers || []).find(a => a.question_id === r.question_id)
        const qIndex = questions.value.findIndex(q => q.id === r.question_id)
        const q = questions.value[qIndex]
        let selected_text = null
        if (selected && q) {
          const opt = q.options.find(o => o.id == selected.selected)
          selected_text = opt ? opt.text : null
        }
        return {
          ...r,
          // include the selected option id so the guest's exact choice is preserved
          selected_option_id: selected ? selected.selected : null,
          selected_option_text: selected_text,
          correct_option_text: r.correct_answer ?? null
        }
      })
    }

    quizAttempt.value = data.attempt

    // Save result to guest store (localStorage)
    guestQuizStore.saveQuizResult(data.attempt)
    // Clear any in-progress partial for this quiz
    guestQuizStore.clearPartialResult(quiz.value.id)

    quizCompleted.value = true
    
  } catch (error) {
    console.error('Error submitting quiz:', error)
    // Show error toast
  } finally {
    submitting.value = false
  }
}

function retakeQuiz() {
  stopTimer()
  currentQuestionIndex.value = 0
  selectedOption.value = null
  answered.value = false
  quizCompleted.value = false
  correctCount.value = 0
  userAnswers.value = []
  
  // Clear this quiz's result from store to allow retake
  guestQuizStore.clearQuizResult(quiz.value.id)
  
  // Reset timer if quiz has time limit
  if (hasTimeLimit.value && quiz.value.timer_seconds) {
    timer.value = quiz.value.timer_seconds
    startTimer()
  }
}

function goBack() {
  router.push(`/quizzes/${slug.value}`)
}

function startTimer() {
  if (timerInterval.value) clearInterval(timerInterval.value)
  
  timerInterval.value = setInterval(() => {
    timer.value--
    
    // Time's up
    if (timer.value <= 0) {
      clearInterval(timerInterval.value)
      completeQuiz()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
}

// Option styling
function getOptionClass(option) {
  if (!answered.value) {
    return 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer'
  }
  
  // Answered state
  const ans = userAnswers.value[currentQuestionIndex.value]

  if (option.id === selectedOption.value?.id) {
    return ans?.isCorrect 
      ? 'bg-green-50 border-green-500' 
      : 'bg-red-50 border-red-500'
  }

  // Do not reveal correct options to guests; keep others neutral
  return 'bg-slate-50 border-slate-200 opacity-50'
}

function getOptionIndicatorClass(option) {
  if (!answered.value) {
    return 'border-slate-300'
  }
  
  const ans = userAnswers.value[currentQuestionIndex.value]
  if (option.id === selectedOption.value?.id) {
    return ans?.isCorrect
      ? 'border-green-500 bg-green-500 text-white'
      : 'border-red-500 bg-red-500 text-white'
  }

  return 'border-slate-300'
}

function getOptionTextClass(option) {
  if (!answered.value) return 'text-slate-700'
  
  const ans = userAnswers.value[currentQuestionIndex.value]
  if (option.id === selectedOption.value?.id) {
    return ans?.isCorrect ? 'text-green-900' : 'text-red-900'
  }

  return 'text-slate-500'
}

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
