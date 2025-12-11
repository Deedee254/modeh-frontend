<template>
  <ClientOnly>
    <QuizLayoutWrapper
      :title="`Tournament Qualification${tournament?.name ? ' — ' + tournament.name : ''}`"
      :current-question="currentQuestionIndex"
      :total-questions="totalQuestions"
      :show-timer="true"
      :timer-display="displayTime"
      :timer-color-class="timerColorClass"
      :timer-circumference="113"
      :timer-dash-offset="0"
      :show-meta="false"
      :show-previous="false"
      :show-next="!isLastQuestion"
      :disable-next="false"
      :show-submit="isLastQuestion"
      :submit-label="'Finish Qualifier'"
      :disable-submit="isSubmitting || timeRemaining <= 0 || connectionStatus !== 'connected'"
      :show-confirmation="showConfirmation"
      :confirm-title="'Finish Qualifier?'"
      :confirm-message="'Are you sure you want to submit your qualification attempt? You won\'t be able to change your answers.'"
      :confirm-button-label="'Submit Qualifier'"
      :is-submitting="isSubmitting"
      :alert-message="connectionStatus !== 'connected' ? (connectionStatus === 'disconnected' ? '❌ Connection lost' : '⚠️ Reconnecting...') : ''"
      :alert-class="connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'"
      @next="nextQuestion"
      @submit="finishQualifier"
      @cancel-confirm="showConfirmation = false"
      @confirm-submit="submitQualifier"
    >
      <template #content>
        <!-- Persistent countdown alert -->
        <div v-if="countdownAlert.show" :class="countdownClass" class="mb-4 rounded px-4 py-2 text-sm flex items-center gap-4 justify-between">
          <div class="flex items-center gap-2">
            <span v-if="countdownAlert.type === 'warning'" class="text-xl">⚠️</span>
            <span v-else-if="countdownAlert.type === 'error'" class="text-xl">⛔</span>
            <span v-else class="text-xl">⏱️</span>
            <div class="text-sm">{{ countdownAlert.message }}</div>
          </div>
          <div class="text-2xl font-mono font-bold countdown-number" aria-hidden="true">{{ countdownAlert.timeRemaining }}</div>
        </div>

        <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600 mb-4">{{ error }}</div>
          <button 
            @click="fetchTournament" 
            class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Try Again
          </button>
        </div>

        <div v-else-if="questions.length > 0" class="space-y-3 sm:space-y-6">
          <!-- Tournament Info & Score Breakdown -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            <div class="text-sm text-gray-600">
              <div class="text-xs">Question</div>
              <div class="font-medium text-lg">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</div>
            </div>
            <div class="text-sm text-gray-600">
              <div class="text-xs">Total Score</div>
              <div class="font-medium text-lg text-brand-600">{{ score }}</div>
            </div>
            <div class="text-sm text-gray-600">
              <div class="text-xs">This Question</div>
              <div class="font-medium text-lg" :class="currentQuestionPoints > 0 ? 'text-green-600' : 'text-gray-500'">
                <span v-if="questionPoints[currentQuestion.id] !== undefined">{{ currentQuestionPoints }}/{{ currentQuestionMaxMarks }}</span>
                <span v-else>0/{{ currentQuestionMaxMarks }}</span>
              </div>
            </div>
            <div v-if="myRank" class="text-sm text-gray-600">
              <div class="text-xs">Rank</div>
              <div class="font-medium text-lg text-brand-600">{{ myRank }}</div>
            </div>
          </div>

          <!-- Current Question -->
          <transition name="fade-slide" mode="out-in">
            <QuestionCard
              :key="currentQuestionIndex"
              :question="currentQuestion"
              v-model="answers[currentQuestion.id]"
              @select="onQuestionSelect"
              @toggle="(opt) => rawToggleMulti(currentQuestion.id, opt)"
              @request-next="handleRequestNext"
            />
          </transition>

          <!-- Difficulty Level Badge -->
          <div v-if="currentQuestion.difficulty" class="flex justify-center mb-3">
            <span 
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getDifficultyLevel(currentQuestion.difficulty) === 'easy' ? 'bg-green-100 text-green-700' :
                getDifficultyLevel(currentQuestion.difficulty) === 'hard' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              ]"
            >
              Difficulty: {{ getDifficultyText(currentQuestion.difficulty) }}
            </span>
          </div>

          <!-- Explanation & Correct Answer (Shows when answered) -->
          <transition name="fade-up">
            <div v-if="showingFeedback && currentQuestion" class="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <!-- Answer result header -->
              <div class="mb-4 pb-3 border-b border-blue-200">
                <div v-if="currentQuestionPoints > 0" class="font-semibold text-green-600 text-lg">
                  ✅ Correct! +{{ currentQuestionPoints }} point{{ currentQuestionPoints !== 1 ? 's' : '' }}
                </div>
                <div v-else class="font-semibold text-red-600 text-lg">
                  ❌ Incorrect (0 points)
                </div>
              </div>

              <!-- Show correct answer only if wrong -->
              <div v-if="currentQuestionPoints === 0 && currentQuestion.correct !== undefined" class="mb-4 pb-4 border-b border-blue-200">
                <div class="font-semibold text-red-600 mb-2">Correct Answer:</div>
                <div class="text-sm bg-white p-2 rounded border border-red-100">
                  {{ getCorrectAnswerDisplay() }}
                </div>
              </div>

              <!-- Explanation if exists -->
              <div v-if="currentQuestion.explanation">
                <div class="font-semibold text-blue-700 mb-2">💡 Explanation:</div>
                <div class="text-sm text-gray-700">{{ currentQuestion.explanation }}</div>
              </div>

              <!-- Auto-advance countdown -->
              <div class="text-xs text-gray-500 mt-3 text-center">
                Auto-advancing to next question...
              </div>
            </div>
          </transition>

          <!-- Progress Dots with Points Indicator -->
          <div class="space-y-2">
            <div class="flex justify-center items-center gap-1 sm:gap-2">
              <div
                v-for="(_, index) in questions"
                :key="index"
                class="relative group"
              >
                <!-- Dot -->
                <div
                  :class="[
                    'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors cursor-pointer',
                    index === currentQuestionIndex ? 'bg-brand-600 ring-2 ring-brand-300' :
                    index < currentQuestionIndex ? 'bg-gray-300' :
                    'bg-gray-200'
                  ]"
                />
                <!-- Tooltip showing points for answered questions -->
                <div v-if="questionPoints[questions[index]?.id] !== undefined" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  +{{ questionPoints[questions[index]?.id] }}
                </div>
              </div>
            </div>
            <!-- Question status summary -->
            <div class="text-center text-xs text-gray-500">
              {{ Object.keys(questionPoints).length }} answered • {{ Object.values(questionPoints).reduce((a, b) => a + b, 0) }} points earned
            </div>
          </div>
        </div>
      </template>
    </QuizLayoutWrapper>
  </ClientOnly>
</template>

<script setup>
definePageMeta({ layout: 'quizee', hideTopBar: true, hideBottomNav: true })

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import QuizLayoutWrapper from '~/components/QuizLayoutWrapper.vue'
import useDisableUserActions from '~/composables/useDisableUserActions'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import useQuestionTimer from '~/composables/useQuestionTimer'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const { push: pushAlert } = useAppAlert()

const loading = ref(true)
const error = ref(null)
const tournament = ref(null)
const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const myRank = ref(null)
const showConfirmation = ref(false)
const isSubmitting = ref(false)
const connectionStatus = ref('connected')
const timeRemaining = ref(0)
const countdownAlert = ref({ show: false, type: 'info', message: '', timeRemaining: 0 })
const qualifierStartTime = ref(0)
const questionPoints = ref({}) // Track points earned per question
const showingFeedback = ref(false) // Show feedback with explanation
const feedbackDelay = ref(3000) // 3 second delay before auto-advance

const { answers, initializeAnswers, toggleMulti: rawToggleMulti } = useQuizAnswers(
  computed(() => ({ questions: questions.value })),
  route.params.id
)

// Initialize timer with default 30s per question (will be updated from tournament settings)
let timePerQuestion_ = ref(30)
const { timePerQuestion, questionRemaining, displayTime, timerColorClass, startTimer, stopTimer, resetTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(30)

useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {})
const totalQuestions = computed(() => questions.value.length)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
// Allow navigation to next question without requiring an answer (per requirements)
const canNavigate = computed(() => true)
const allQuestionsAnswered = computed(() => true) // Don't require all answered for qualifier
const currentQuestionPoints = computed(() => {
  const qId = currentQuestion.value?.id
  return qId ? (questionPoints.value[qId] ?? 0) : 0
})

const currentQuestionMaxMarks = computed(() => {
  const marks = currentQuestion.value?.marks
  return typeof marks !== 'undefined' && marks !== null ? parseFloat(marks) : 1
})

const countdownClass = computed(() => {
  if (!countdownAlert.value?.type) return 'bg-blue-50 text-blue-800 border border-blue-200'
  switch (countdownAlert.value.type) {
    case 'error': return 'bg-red-50 text-red-800 border border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    default: return 'bg-blue-50 text-blue-800 border border-blue-200'
  }
})

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.max(0, Math.floor(seconds % 60))
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const updateCountdownAlert = () => {
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatTime(Math.ceil(questionRemaining.value))}`
    return
  }

  if (typeof timeRemaining.value === 'number' && timeRemaining.value <= 5 && timeRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(timeRemaining.value)
    countdownAlert.value.message = `⏱️ Quiz time remaining: ${formatTime(Math.ceil(timeRemaining.value))}`
    return
  }

  countdownAlert.value.show = false
}

watch(timeRemaining, () => updateCountdownAlert(), { immediate: false })
watch(questionRemaining, () => updateCountdownAlert(), { immediate: false })

// Watch for timeout and auto-submit
watch(timeRemaining, (val) => {
  if (val <= 0 && !isSubmitting.value && questions.value.length > 0 && !showConfirmation.value) {
    // Auto-submit immediately when time runs out
    submitQualifier()
  }
})

// Persist progress to localStorage whenever state changes
function persistProgress() {
  try {
    const progressData = {
      currentQuestionIndex: currentQuestionIndex.value,
      timeRemaining: timeRemaining.value,
      answers: Object.fromEntries(Object.entries(answers.value)),
      lastSavedAt: Date.now()
    }
    localStorage.setItem(`qualifier_progress_${route.params.id}`, JSON.stringify(progressData))
  } catch (e) {
    console.warn('Failed to persist progress', e)
  }
}

// Restore progress from localStorage
function restoreProgress() {
  try {
    const stored = localStorage.getItem(`qualifier_progress_${route.params.id}`)
    if (!stored) return

    const progressData = JSON.parse(stored)
    // Restore position and answers if saved
    if (typeof progressData.currentQuestionIndex === 'number' && progressData.currentQuestionIndex < questions.value.length) {
      currentQuestionIndex.value = progressData.currentQuestionIndex
    }
    if (progressData.answers && typeof progressData.answers === 'object') {
      Object.assign(answers.value, progressData.answers)
    }
  } catch (e) {
    console.warn('Failed to restore progress', e)
  }
}

// Methods
async function fetchTournament() {
  try {
    loading.value = true
    error.value = null
    const res = await api.get(`/api/tournaments/${route.params.id}`)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      error.value = data?.message || `Failed to load tournament (status ${res.status})`
      return
    }
    
    const data = await res.json()
    tournament.value = data.tournament || data
    questions.value = tournament.value?.questions || []
    
    if (questions.value.length === 0) {
      error.value = 'No questions available for this qualifier'
      return
    }

    // Read configuration from tournament settings
    const perQuestionSeconds = tournament.value?.qualifier_per_question_seconds ?? 30
    const configuredQuestionCount = tournament.value?.qualifier_question_count ?? questions.value.length
    
    // Limit questions to configured count
    const questionCount = Math.min(configuredQuestionCount, questions.value.length)
    questions.value = questions.value.slice(0, questionCount)

    // Initialize answers for all questions
    initializeAnswers(questions.value)
    
    // Calculate total duration based on per-question timer and question count
    const totalDuration = perQuestionSeconds * questions.value.length
    timeRemaining.value = totalDuration
    timePerQuestion_.value = perQuestionSeconds
    qualifierStartTime.value = Date.now()
    
    // Start the global timer
    recordAndReset()
    startTimer(() => {
      timeRemaining.value -= 0.1
      // Persist every 5 seconds
      if (Math.floor(timeRemaining.value) % 5 === 0) {
        persistProgress()
      }
    })

    // Restore any previous progress from this session
    restoreProgress()
    
    // Fetch user's qualification status (rank, previous score)
    await fetchQualificationStatus()
    
    // Schedule per-question timer to auto-advance
    schedulePerQuestionLimit(perQuestionSeconds, () => {
      if (!isLastQuestion.value) {
        nextQuestion()
      } else {
        // Auto-submit on last question timeout
        finishQualifier()
      }
    })
  } catch (err) {
    error.value = err?.message || 'Failed to load tournament'
    console.error('Fetch tournament error:', err)
  } finally {
    loading.value = false
  }
}

async function fetchQualificationStatus() {
  try {
    const res = await api.get(`/api/tournaments/${route.params.id}/qualification-status`)
    if (!res.ok) return

    const data = await res.json()
    if (data?.rank) {
      myRank.value = data.rank
    }
  } catch (e) {
    console.warn('Failed to fetch qualification status:', e)
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
    clearPerQuestionLimit()
    persistProgress()
    // Re-schedule per-question timer for new question with configured time
    const perQuestionSeconds = tournament.value?.qualifier_per_question_seconds ?? 30
    schedulePerQuestionLimit(perQuestionSeconds, () => {
      // Auto-advance when per-question time is up
      if (!isLastQuestion.value) {
        nextQuestion()
      } else {
        // On last question, auto-submit
        finishQualifier()
      }
    })
  } else if (isLastQuestion.value) {
    // Already on last question, no more to advance to
    finishQualifier()
  }
}

// No previous button allowed per requirements
function previousQuestion() {
  // Disabled - users cannot go back
}

function onQuestionSelect(answer) {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = answer
    // Mark answer immediately (calculate points)
    markAnswer(currentQuestion.value, answer)
    persistProgress()
  }
}

// Mark answer and calculate score immediately
function markAnswer(question, answer) {
  if (!question) return
  
  // Don't re-mark if already marked
  if (questionPoints.value[question.id] !== undefined) {
    return
  }
  
  // Use marks from question, default to 1 if not specified
  const maxPoints = question.marks ?? 1
  let points = 0
  let isCorrect = false
  
  // Handle MCQ
  if (question.type === 'mcq') {
    if (!is_null(question.correct) && String(question.correct) === String(answer)) {
      isCorrect = true
      points = maxPoints
    } else if (typeof answer === 'string') {
      // Try matching by option text
      const correctIdx = findOptionIndexByText(question, answer)
      if (!is_null(correctIdx) && String(correctIdx) === String(question.correct)) {
        isCorrect = true
        points = maxPoints
      }
    }
  }
  // Handle multi-select
  else if (question.type === 'multi') {
    const givenArr = Array.isArray(answer) ? answer : (typeof answer === 'string' ? JSON.parse(answer).catch(() => []) : [])
    const correctsArr = Array.isArray(question.corrects) ? question.corrects : []
    
    if (Array.isArray(givenArr) && Array.isArray(correctsArr)) {
      const corrects = correctsArr.map(String).sort()
      const given = givenArr.map(String).sort()
      if (JSON.stringify(corrects) === JSON.stringify(given)) {
        isCorrect = true
        points = maxPoints
      }
    }
  }
  // Handle numeric/text/fill-blank
  else {
    const expectedAnswers = question.answers || []
    if (Array.isArray(expectedAnswers) && expectedAnswers.includes(String(answer))) {
      isCorrect = true
      points = maxPoints
    }
  }
  
  // Store points for this question
  questionPoints.value[question.id] = points
  
  // Update total score
  score.value = Math.max(0, (score.value || 0) + points)
  
  // Note: Feedback is shown via the showingFeedback panel below,
  // so we don't need separate alerts here to reduce UI clutter
  
  // Show answer feedback with explanation and delay before auto-advance
  showingFeedback.value = true
  
  // Auto-advance after delay if not on last question
  setTimeout(() => {
    if (!isLastQuestion.value) {
      nextQuestion()
      showingFeedback.value = false
    } else {
      // On last question, just clear the flag
      showingFeedback.value = false
    }
  }, feedbackDelay.value)
}

// Helper to find option index by text
function findOptionIndexByText(question, text) {
  if (!question.options || !Array.isArray(question.options)) return null
  const idx = question.options.findIndex(opt => {
    const optText = typeof opt === 'string' ? opt : opt.text || opt.label || ''
    return String(optText).toLowerCase() === String(text).toLowerCase()
  })
  return idx >= 0 ? idx : null
}

// Display correct answer based on question type
function getCorrectAnswerDisplay() {
  const q = currentQuestion.value
  if (!q) return 'N/A'
  
  if (q.type === 'mcq') {
    // For MCQ, show the correct option text
    if (q.options && Array.isArray(q.options) && q.correct !== undefined) {
      const option = q.options[q.correct]
      return typeof option === 'string' ? option : option?.text || option?.label || `Option ${parseInt(q.correct) + 1}`
    }
    return `Option ${parseInt(q.correct) + 1}`
  } else if (q.type === 'multi') {
    // For multi-select, show all correct options
    if (q.options && Array.isArray(q.options) && q.corrects && Array.isArray(q.corrects)) {
      return q.corrects.map(idx => {
        const option = q.options[idx]
        return typeof option === 'string' ? option : option?.text || option?.label || `Option ${parseInt(idx) + 1}`
      }).join(', ')
    }
    return q.corrects?.join(', ') || 'N/A'
  } else {
    // For text/numeric/fill-blank, show expected answers
    if (q.answers && Array.isArray(q.answers)) {
      return q.answers.join(' / ')
    }
    return q.answers || 'N/A'
  }
}

// Null check helper
function is_null(val) {
  return val === null || val === undefined
}

function handleRequestNext() {
  // Enter key pressed on input - advance to next question or finish if last
  if (!isLastQuestion.value) {
    nextQuestion()
  } else {
    // On last question, show confirmation to submit
    finishQualifier()
  }
}

function finishQualifier() {
  showConfirmation.value = true
}

async function submitQualifier() {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    stopTimer()
    clearPerQuestionLimit()
    
    // Calculate actual duration taken
    const durationSeconds = Math.max(0, Date.now() - qualifierStartTime.value) / 1000
    
    // Build answers payload - include all answered questions, even if some were skipped
    const submitData = {
      answers: Object.entries(answers.value)
        .filter(([_, answer]) => answer !== null && answer !== undefined)
        .map(([qId, answer]) => ({
          question_id: parseInt(qId),
          answer: answer ?? null
        })),
      duration_seconds: Math.round(durationSeconds)
    }
    
    const res = await api.postJson(`/api/tournaments/${route.params.id}/qualify/submit`, submitData)
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      pushAlert({ 
        type: 'error', 
        title: 'Submission failed', 
        message: data?.message || 'Please try again' 
      })
      isSubmitting.value = false
      showConfirmation.value = false
      return
    }
    
    const data = await res.json()
    score.value = data?.attempt?.score || 0
    myRank.value = data?.rank || null
    
    // Clear persisted progress on successful submission
    try {
      localStorage.removeItem(`qualifier_progress_${route.params.id}`)
    } catch (e) {
      console.warn('Failed to clear progress', e)
    }
    
    pushAlert({ 
      type: 'success', 
      title: 'Qualifier completed!', 
      message: `Score: ${score.value}` 
    })
    
    // Redirect to tournament details page after delay
    setTimeout(() => {
      router.push(`/quizee/tournaments/${route.params.id}`)
    }, 2000)
  } catch (err) {
    pushAlert({ 
      type: 'error', 
      title: 'Submission failed', 
      message: err?.message || 'Please try again' 
    })
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchTournament()
})

onBeforeUnmount(() => {
  stopTimer()
  persistProgress() // Save state before leaving
})

// Helper function to convert difficulty number to text
function getDifficultyText(difficulty) {
  if (typeof difficulty === 'string') return difficulty
  switch(Number(difficulty)) {
    case 1: return 'Easy'
    case 2: return 'Medium'
    case 3: return 'Hard'
    default: return 'Medium'
  }
}

// Helper function to get difficulty level for styling
function getDifficultyLevel(difficulty) {
  if (typeof difficulty === 'string') return difficulty.toLowerCase()
  switch(Number(difficulty)) {
    case 1: return 'easy'
    case 2: return 'medium'
    case 3: return 'hard'
    default: return 'medium'
  }
}
</script>

