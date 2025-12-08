<template>
  <div class="bg-gray-50">
    <!-- Qualifier Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold text-gray-900">Tournament Qualification</h1>
            <div v-if="timeRemaining" class="flex items-center space-x-2 text-gray-600">
              <Icon name="mdi:clock-outline" class="w-5 h-5" />
              <span>{{ formatTime(timeRemaining) }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Question</span>
              <span class="font-medium">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Score</span>
              <span class="font-medium">{{ score }}</span>
            </div>
            <!-- My Position Indicator -->
            <div v-if="myRank" class="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <Icon name="mdi:trophy" class="w-5 h-5 text-blue-600" />
              <span class="text-sm font-medium text-blue-900">{{ myRank }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection status banner -->
    <div v-if="connectionStatus !== 'connected'" class="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
      <div :class="[
        'rounded-md p-3 text-sm',
        connectionStatus === 'disconnected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
      ]">
        <div v-if="connectionStatus === 'disconnected'">Connection lost — answers may not be saved. Reconnect to continue.</div>
        <div v-else-if="connectionStatus === 'reconnecting'">Reconnecting to realtime service…</div>
      </div>
    </div>

    <!-- Persistent countdown alert -->
    <div v-if="countdownAlert.show" class="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
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

    <!-- Qualifier Content -->
    <div class="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px]">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button 
          @click="fetchTournament" 
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>

      <template v-else>
        <!-- Current Question -->
        <QuestionCard 
          v-if="currentQuestion"
          :question="currentQuestion"
          :model-value="selectedAnswerId"
          @update:model-value="selectAnswer"
          @select="selectAnswer"
          class="mb-8"
        />

        <!-- Qualifier Progress -->
        <div class="flex justify-between items-center">
          <button
            v-if="!isFirstQuestion"
            @click="previousQuestion"
            :disabled="!canNavigate"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Icon name="mdi:chevron-left" class="w-5 h-5 mr-1" />
            Previous
          </button>

          <div class="flex-1 mx-8">
            <div class="flex items-center justify-center space-x-2">
              <div 
                v-for="(_, index) in questions"
                :key="index"
                :class="[
                  'w-2.5 h-2.5 rounded-full',
                  index === currentQuestionIndex ? 'bg-primary' :
                  index < currentQuestionIndex ? 'bg-gray-300' :
                  'bg-gray-200'
                ]"
              />
            </div>
          </div>

          <button
            v-if="!isLastQuestion"
            @click="nextQuestion"
            :disabled="!canNavigate"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            Next
            <Icon name="mdi:chevron-right" class="w-5 h-5 ml-1" />
          </button>

          <button
            v-else
            @click="finishQualifier"
            :disabled="!allQuestionsAnswered || timeRemaining <= 0 || connectionStatus !== 'connected' || isSubmitting"
            :title="timeRemaining <= 0 ? 'Qualifier timeout - cannot submit' : connectionStatus !== 'connected' ? 'Connection required to submit' : ''"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Qualifier' }}
          </button>
        </div>
      </template>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog :open="showConfirmation" @close="showConfirmation = false">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="mx-auto max-w-md rounded-lg bg-white p-6">
          <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
            Submit Qualifier?
          </DialogTitle>
          <p class="text-gray-600 mb-6">
            Are you sure you want to submit your qualification attempt? You won't be able to change your answers after submission.
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="showConfirmation = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              @click="submitQualifier"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
            >
              Submit
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'quizee', hideTopBar: true })

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useDisableUserActions from '~/composables/useDisableUserActions'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { QuestionCard } from '#components'
import { useAnswerStore } from '~/stores/answerStore'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useApi } from '~/composables/useApi'

interface Question {
  id: number | string
  type?: string
  body?: string
  content?: string
  media_url?: string
  media?: string
  options?: any[]
  correct_option_id?: number | string
  marks?: number
}

interface Tournament {
  id: number | string
  name: string
  questions: Question[]
  duration?: number
  start_date?: string
  end_date?: string
}

type SelectedAnswers = Record<string | number, string | number>

const route = useRoute()
const router = useRouter()

// State
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const tournament = ref<Tournament | null>(null)
const questions = ref<Question[]>([])
const currentQuestionIndex = ref<number>(0)
const selectedAnswers = ref<SelectedAnswers>({})
const timeRemaining = ref<number>(0)
const timePerQuestion = ref<number | null>(null)
const { questionRemaining, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer()
const answerSubmitted = ref<boolean>(false)
const showConfirmation = ref<boolean>(false)
const score = ref<number>(0)
const isSubmitting = ref<boolean>(false)
const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('connected')
const myRank = ref<string | null>(null)

// Countdown alert
const countdownAlert = ref({ show: false, type: 'info', message: '', timeRemaining: 0 })

const countdownClass = computed(() => {
  if (!countdownAlert.value?.type) return 'bg-blue-50 text-blue-800 border border-blue-200'
  switch (countdownAlert.value.type) {
    case 'error': return 'bg-red-50 text-red-800 border border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    default: return 'bg-blue-50 text-blue-800 border border-blue-200'
  }
})

const answerStore = useAnswerStore()
const { push: pushAlert } = useAppAlert()

useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })

// Computed
const currentQuestion = computed<Question | undefined>(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed<number>(() => questions.value.length)
const isFirstQuestion = computed<boolean>(() => currentQuestionIndex.value === 0)
const isLastQuestion = computed<boolean>(() => currentQuestionIndex.value === totalQuestions.value - 1)
const selectedAnswerId = computed<string | number | undefined>(() => {
  if (!currentQuestion.value) return undefined
  const stored = answerStore.getAnswer(Number(String(currentQuestion.value.id)))
  if (typeof stored !== 'undefined') return stored as any
  return selectedAnswers.value[currentQuestion.value.id]
})
const canNavigate = computed<boolean>(() => !!(currentQuestion.value && selectedAnswers.value[currentQuestion.value.id]))
const allQuestionsAnswered = computed<boolean>(() => 
  Object.keys(selectedAnswers.value).length === totalQuestions.value
)

const api = useApi()

const fetchTournament = async () => {
  try {
    loading.value = true
    const resp = await api.get(`/api/tournaments/${route.params.id}`)
    const json = await resp.json().catch(() => null)
    const data = json?.tournament ?? json as Tournament

    tournament.value = data
    
    const qList: any[] = []
    for (const q of (data.questions || [])) {
      qList.push({
        ...q,
        type: 'mcq',
        body: q.body || q.content,
        media: q.media_url,
        media_path: q.media_url
      })
    }
    // Apply configured qualifier question count if present
    const configuredCount = data?.qualifier_question_count ?? null
    const questionCount = configuredCount && Number.isFinite(Number(configuredCount)) ? Math.max(1, Number(configuredCount)) : qList.length
    questions.value = qList.slice(0, questionCount)

    // Use configured per-question seconds to compute total duration (fallback to 30s)
    timePerQuestion.value = data?.qualifier_per_question_seconds ?? 30
    const totalSeconds = (timePerQuestion.value ?? 30) * questions.value.length
    startTimer(totalSeconds)
    // Optionally start per-question timer UI (light-weight scheduling)
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      startQuestionTimer(timePerQuestion.value)
      // schedule per-question expiry to auto-advance
      schedulePerQuestionLimit(timePerQuestion.value, () => {
        if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
          // mark empty answer
          answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
          selectedAnswers.value[currentQuestion.value.id] = ''
        }
        if (!isLastQuestion.value) {
          nextQuestion()
        } else {
          submitQualifier()
        }
      })
    }
    
    // Fetch user's qualification status
    await fetchQualificationStatus()
  } catch (e) {
    console.error('Error fetching tournament:', e)
    error.value = 'Failed to load tournament qualifier'
  } finally {
    loading.value = false
  }
}

const fetchQualificationStatus = async () => {
  try {
    const resp = await api.get(`/api/tournaments/${route.params.id}/qualification-status`)
    const json = await resp.json().catch(() => null)
    
    if (json?.rank) {
      myRank.value = `#${json.rank}`
    }
  } catch (error) {
    console.warn('Failed to fetch qualification status:', error)
    // Non-fatal; user might not be authenticated or no attempt yet
  }
}

const selectAnswer = async (optionId: string | number) => {
  if (answerSubmitted.value || !currentQuestion.value) return

  answerSubmitted.value = true
  
  try {
    answerStore.setAnswer(Number(String(currentQuestion.value.id)), optionId as any)
    selectedAnswers.value[currentQuestion.value.id] = optionId
    persistProgress()
  } catch (e) {
    console.warn('Failed to persist answer locally', e)
  }

  setTimeout(() => {
    if (!isLastQuestion.value) {
      nextQuestion()
    }
    answerSubmitted.value = false
  }, 300)
}

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    answerSubmitted.value = false
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    answerSubmitted.value = false
    currentQuestionIndex.value++
  }
}

const finishQualifier = () => {
  if (timeRemaining.value <= 0) {
    pushAlert({ message: 'Qualifier timeout - cannot submit', type: 'error' })
    return
  }
  
  if (connectionStatus.value !== 'connected') {
    pushAlert({ message: 'Connection required to submit - please reconnect', type: 'error' })
    return
  }
  
  if (!allQuestionsAnswered.value) {
    pushAlert({ message: 'Please answer all questions before submitting', type: 'warning' })
    return
  }
  
  showConfirmation.value = true
}

const submitQualifier = async () => {
  try {
    if (timeRemaining.value <= 0) {
      error.value = 'Qualifier timeout - submission rejected'
      pushAlert({ message: 'Qualifier timeout - submission rejected', type: 'error' })
      return
    }
    
    if (connectionStatus.value !== 'connected') {
      error.value = 'Connection lost - cannot submit. Please reconnect and try again.'
      pushAlert({ message: 'Connection required for submission', type: 'error' })
      return
    }

    isSubmitting.value = true
    loading.value = true

    // Build answers payload from persisted answers
    const answersStoreArray = ((answerStore.allAnswers as any)?.value ?? []) as any[]
    const answersPayload: any[] = []
    for (const a of answersStoreArray) {
      answersPayload.push({ question_id: a.question_id, answer: a.answer })
    }

    // Calculate time taken
    const tournamentStart = tournament.value?.duration ? (tournament.value.duration * 60) : 1800
    const durationSeconds = tournamentStart - timeRemaining.value

    // Submit to backend
    await api.postJson(`/api/tournaments/${route.params.id}/qualify/submit`, {
      answers: answersPayload,
      duration_seconds: durationSeconds
    })

    // Refresh qualification status to get updated rank
    await fetchQualificationStatus()

    pushAlert({ message: 'Qualification submitted successfully!', type: 'success' })
    router.push(`/quizee/tournaments/${route.params.id}`)
  } catch (e) {
    console.error('Error submitting qualifier:', e)
    error.value = 'Failed to submit qualifier attempt'
    pushAlert({ message: 'Failed to submit qualifier attempt', type: 'error' })
  } finally {
    loading.value = false
    isSubmitting.value = false
    showConfirmation.value = false
  }
}

const startTimer = (seconds: number) => {
  timeRemaining.value = seconds
  let timer: ReturnType<typeof setInterval> | undefined = setInterval(() => {
    if (timeRemaining.value && timeRemaining.value > 0) {
      timeRemaining.value--
      
      // Update countdown alert
      if (timeRemaining.value <= 5 && timeRemaining.value > 0) {
        countdownAlert.value.show = true
        countdownAlert.value.type = timeRemaining.value <= 2 ? 'error' : 'warning'
        countdownAlert.value.timeRemaining = Math.ceil(timeRemaining.value)
        countdownAlert.value.message = `⏱️ Time remaining: ${formatTime(Math.ceil(timeRemaining.value))}`
      }
      
      if (timeRemaining.value % 5 === 0) persistProgress()
    } else {
      if (timer) clearInterval(timer)
      submitQualifier()
    }
  }, 1000)
  
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.max(0, Math.floor(seconds % 60))
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const persistProgress = () => {
  try {
    const meta = {
      currentQuestionIndex: currentQuestionIndex.value,
      timeRemaining: timeRemaining.value,
      answers: ((answerStore.allAnswers as any)?.value ?? []).map((a: any) => [a.question_id, a.answer])
    }
    localStorage.setItem(`qualifier_progress_${route.params.id}`, JSON.stringify(meta))
  } catch (e) {
    console.warn('Failed to persist progress', e)
  }
}

const restoreProgress = () => {
  try {
    const stored = localStorage.getItem(`qualifier_progress_${route.params.id}`)
    if (!stored) return
    
    const meta = JSON.parse(stored)
    if (meta.currentQuestionIndex) currentQuestionIndex.value = meta.currentQuestionIndex
    if (meta.answers && Array.isArray(meta.answers)) {
      for (const [qId, ans] of meta.answers) {
        answerStore.setAnswer(Number(qId), ans)
        selectedAnswers.value[qId] = ans
      }
    }
  } catch (e) {
    console.warn('Failed to restore progress', e)
  }
}

onMounted(() => {
  fetchTournament()
  restoreProgress()
})
</script>
