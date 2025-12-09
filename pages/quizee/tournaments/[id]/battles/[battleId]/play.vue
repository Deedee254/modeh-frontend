<template>
  <div class="bg-gray-50">
    <!-- Battle Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold text-gray-900">Tournament Battle</h1>
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

    <!-- Persistent countdown alert (shows near the top during final seconds) -->
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

    <!-- Battle Content -->
    <div class="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px]">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button 
          @click="fetchBattle" 
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

  <!-- Battle Progress -->
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
            <div class="mt-3 text-center">
              <div v-if="waitingForOpponent" class="text-yellow-600">Waiting for an opponent to join...</div>
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
            @click="finishBattle"
            :disabled="timeRemaining <= 0 || connectionStatus !== 'connected' || isSubmitting"
            :title="timeRemaining <= 0 ? 'Battle timeout - cannot submit' : connectionStatus !== 'connected' ? 'Connection required to submit' : ''"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ isSubmitting ? 'Submitting...' : 'Finish Battle' }}
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
            {{ confirmTitle }}
          </DialogTitle>
          <p class="text-gray-600 mb-6">
            {{ confirmMessage }}
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="showConfirmation = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              @click="submitBattle"
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
// Use the quizee layout
definePageMeta({ layout: 'quizee', hideTopBar: true })

import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useDisableUserActions from '~/composables/useDisableUserActions'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { QuestionCard } from '#components'
import { useAnswerStore } from '~/stores/answerStore'
import { useApi } from '~/composables/useApi'

// Types
interface Option {
  id: number | string
  content: string
}

interface Question {
  id: number | string
  type?: string
  content: string
  body?: string
  media_url?: string
  media?: string
  media_type?: string
  media_path?: string
  youtube_url?: string
  youtube?: string
  options: Option[]
  correct_option_id?: number | string
}

interface Battle {
  id: number | string
  questions: Question[]
  duration: number
  status?: string
}

type SelectedAnswers = Record<string | number, string | number>

const route = useRoute()
const router = useRouter()

// State
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const battle = ref<Battle | null>(null)
const questions = ref<Question[]>([])
const currentQuestionIndex = ref<number>(0)
const selectedAnswers = ref<SelectedAnswers>({})
const timeRemaining = ref<number>(0)
const answerSubmitted = ref<boolean>(false)
const showConfirmation = ref<boolean>(false)
// Dynamic confirmation dialog content (allows warning when some questions are unanswered)
const confirmTitle = ref<string>('Finish Battle?')
const confirmMessage = ref<string>("Are you sure you want to finish this battle? You won't be able to change your answers after submission.")
const score = ref<number>(0)
const isSubmitting = ref<boolean>(false)
const submissionMessage = ref<string>('')

// Connection status for realtime
const connectionStatus = ref<'connected'|'disconnected'|'reconnecting'>('connected')

// Timeout warning state - triggers when time < 30 seconds
const showTimeoutWarning = ref<boolean>(false)
const timeoutWarningShown = ref<boolean>(false)

// Per-question timer
// use shared question timer composable for countdown UI + scheduling expiry
const timePerQuestion = ref<number | null>(null)
const { questionRemaining, startTimer: startQuestionTimer, stopTimer: stopQuestionTimer, schedulePerQuestionLimit, clearPerQuestionLimit, recordAndReset } = useQuestionTimer()

// Local guards to avoid repeated announcements for every tick
const lastTotalAnnouncement = ref<number | null>(null)
const lastQuestionAnnouncement = ref<number | null>(null)

// Use persisted answer store
const answerStore = useAnswerStore()
const progressKey = computed(() => `tournament_battle_progress_${route.params.id}_${route.params.battleId}`)

// Timer
let timer: ReturnType<typeof setInterval> | undefined

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
const allQuestionsAnswered = computed<boolean>(() => {
  if (!questions.value || questions.value.length === 0) return false
  return questions.value.every(q => {
    const qid = Number(String((q as any).id))
    // Prefer persisted answers in the store (they may be saved from other tabs)
    const stored = answerStore.getAnswer(qid)
    const local = selectedAnswers.value[(q as any).id]
    const ans = (typeof stored !== 'undefined') ? stored : local
    return typeof ans !== 'undefined' && ans !== '' && ans !== null
  })
})

// Methods
const config = useRuntimeConfig()
const api = useApi()

const fetchBattle = async () => {
  try {
    loading.value = true
    const resp = await api.get(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}?with_questions=true`)
    const json = await resp.json().catch(() => null)
    const data = json?.data ?? json as Battle
    battle.value = data
    // Normalize questions for QuestionCard component
    const qList: any[] = []
    for (const qItem of (data.questions || [])) {
      const q = qItem as any
      qList.push({
        ...q,
        type: 'mcq', // Default to MCQ type
        body: q.content, // Map content to body for QuestionCard
        media: q.media_url, // Map media_url to media
        media_path: q.media_url // Also set media_path for compatibility
      })
    }

    // If backend provided per-question seconds, use it; otherwise derive from total seconds
    // (some admin UIs/setups set total seconds instead of per-question seconds)
    if (typeof (data as any).per_question_seconds === 'number') {
      timePerQuestion.value = (data as any).per_question_seconds
    } else if (typeof (data as any).time_per_question === 'number') {
      timePerQuestion.value = (data as any).time_per_question
    } else if (typeof (data as any).time_total_seconds === 'number' && Array.isArray(data.questions) && data.questions.length) {
      const per = Math.floor((data as any).time_total_seconds / data.questions.length)
      timePerQuestion.value = per > 0 ? per : null
    } else if (typeof (data as any).settings?.time_total_seconds === 'number' && Array.isArray(data.questions) && data.questions.length) {
      const per = Math.floor((data as any).settings.time_total_seconds / data.questions.length)
      timePerQuestion.value = per > 0 ? per : null
    } else {
      timePerQuestion.value = null
    }

    // If battle didn't include per-question seconds or question count, fetch tournament config and apply fallbacks
    let tournamentConfig: any = null
    if (timePerQuestion.value === null || !data.questions || data.questions.length === 0) {
      try {
        const tResp = await api.get(`/tournaments/${route.params.id}`)
        const tJson = await tResp.json().catch(() => null)
        tournamentConfig = tJson?.tournament ?? tJson
      } catch (e) {
        // ignore
      }
    }

    const configuredCount = (data as any).question_count ?? tournamentConfig?.battle_question_count ?? null
    const questionCount = configuredCount && Number.isFinite(Number(configuredCount)) ? Math.max(1, Number(configuredCount)) : qList.length
    questions.value = qList.slice(0, questionCount)

    if (timePerQuestion.value === null) {
      timePerQuestion.value = tournamentConfig?.battle_per_question_seconds ?? null
    }

    startTimer(data.duration * 60) // Convert minutes to seconds
    // If per-question timing is enabled, start the question countdown and schedule expiry
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) ? questionRemaining.value : undefined
      // start the composable interval so `questionRemaining` updates for UI
      startQuestionTimer(timePerQuestion.value, remainingForSchedule)
  // schedule the authoritative per-question expiry handler (use remaining if restoring)
  schedulePerQuestionLimit(timePerQuestion.value, () => {
        // If no answer, mark empty and persist
        if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
          answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
          selectedAnswers.value[currentQuestion.value.id] = ''
          persistProgress()
        }
        if (!isLastQuestion.value) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          nextQuestion()
        } else {
          // Auto-submit on last question per-question expiry
          submissionMessage.value = 'Time is over — submitting...'
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitBattle()
        }
      }, remainingForSchedule)
    }
    // Try to restore saved progress for this battle (answers, index, remaining time)
  restoreProgress()
    // If only one participant, start polling for an opponent
    if (data && (data as any).participants && Array.isArray((data as any).participants) && (data as any).participants.length <= 1) {
      waitingForOpponent.value = true
      startPollingForOpponent()
    } else {
      waitingForOpponent.value = false
    }
  } catch (error) {
    console.error('Error fetching battle:', error)
  } finally {
    loading.value = false
  }
}

const { push: pushAlert } = useAppAlert()

// Disable context menu, common shortcuts and text selection while this page is active
useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })

// Persistent countdown alert state and helpers (replaces per-second push alerts)
const countdownAlert = ref({ show: false, type: 'info', message: '', timeRemaining: 0 })

const countdownClass = computed(() => {
  if (!countdownAlert.value?.type) return 'bg-blue-50 text-blue-800 border border-blue-200'
  switch (countdownAlert.value.type) {
    case 'error': return 'bg-red-50 text-red-800 border border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    default: return 'bg-blue-50 text-blue-800 border border-blue-200'
  }
})

function formatSeconds(s: number) {
  const mins = Math.floor(s / 60)
  const secs = Math.max(0, Math.floor(s % 60))
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const updateCountdownAlert = () => {
  // per-question urgency first
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatSeconds(Math.ceil(questionRemaining.value))}`
    return
  }

  // then overall time
  if (typeof timeRemaining.value === 'number' && timeRemaining.value <= 5 && timeRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = timeRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(timeRemaining.value)
    countdownAlert.value.message = `⏱️ Battle time remaining: ${formatSeconds(Math.ceil(timeRemaining.value))}`
    return
  }

  countdownAlert.value.show = false
}

watch(questionRemaining, () => updateCountdownAlert(), { immediate: false })
watch(timeRemaining, (val) => {
  // keep critical timeout warning behaviour
  if (typeof val !== 'number') return
  const sec = Math.ceil(val)
  if (sec <= 30 && sec > 0 && !timeoutWarningShown.value) {
    showTimeoutWarning.value = true
    timeoutWarningShown.value = true
    pushAlert({ message: `⏰ CRITICAL: Only ${sec} seconds remaining!`, type: 'warning' })
  }
  if (sec <= 0) {
    showTimeoutWarning.value = false
    submissionMessage.value = 'Battle timeout - auto-submitting...'
    pushAlert({ message: 'Time expired - submitting automatically', type: 'error' })
    submitBattle()
    return
  }
  // update persistent countdown UI
  updateCountdownAlert()
}, { immediate: false })

const selectAnswer = async (optionId: string | number) => {
  if (answerSubmitted.value || !currentQuestion.value) return

  // Lock to prevent double submits locally
  answerSubmitted.value = true

  // Persist immediately to local answer store
  try {
  answerStore.setAnswer(Number(String(currentQuestion.value.id)), optionId as any)
    selectedAnswers.value[currentQuestion.value.id] = optionId
    persistProgress()
    // Trigger auto-save to backend after a short delay (only if connected)
    triggerAutoSave()
  } catch (e) {
    console.warn('Failed to persist answer locally', e)
  }

  // Optimistic local-only: do not require connection for per-question submits.
  // We'll submit all answers in bulk on `submitBattle()` so skip network call here.
  // Auto-advance to next question after a short delay
  setTimeout(() => {
    if (!isLastQuestion.value) {
      nextQuestion()
    }
    answerSubmitted.value = false
  }, 300)
}

// Auto-save state
let autoSaveTimeoutId: NodeJS.Timeout | null = null
let lastAutoSaveTime = 0

const triggerAutoSave = () => {
  // Clear any pending auto-save
  if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId)
  
  // Debounce: only auto-save every 5 seconds and if connected
  const now = Date.now()
  if (now - lastAutoSaveTime < 5000 || connectionStatus.value !== 'connected') {
    return
  }
  
  // Schedule auto-save after 2 seconds of inactivity
  autoSaveTimeoutId = setTimeout(() => {
    saveToBackend()
  }, 2000)
}

const saveToBackend = async () => {
  // Only save if connected and battle is in progress
  if (connectionStatus.value !== 'connected' || battle.value?.status !== 'in_progress') {
    return
  }

  try {
    const answersStoreArray = ((answerStore.allAnswers as any)?.value ?? []) as any[]
    const answersPayload: any[] = []
    for (const a of answersStoreArray) {
      answersPayload.push({ question_id: a.question_id, answer: a.answer })
    }

    await api.postJson(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}/draft`, {
      answers: answersPayload,
      current_question_index: currentQuestionIndex.value,
      time_remaining: timeRemaining.value
    })

    lastAutoSaveTime = Date.now()
  } catch (error) {
    console.warn('Auto-save failed (will retry):', error)
    // Fail silently - will retry on next trigger
  }
}

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    // Reset answer submitted state when changing questions
    answerSubmitted.value = false
    currentQuestionIndex.value--
    
    // Reset per-question timer if using one
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) ? questionRemaining.value : undefined
      startQuestionTimer(timePerQuestion.value, remainingForSchedule)
  schedulePerQuestionLimit(timePerQuestion.value, () => {
        if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
          answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
          selectedAnswers.value[currentQuestion.value.id] = ''
          persistProgress()
        }
        if (!isLastQuestion.value) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          nextQuestion()
        } else {
          submissionMessage.value = 'Time is over — submitting...'
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitBattle()
        }
      }, remainingForSchedule)
    }
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    // Reset answer submitted state when changing questions
    answerSubmitted.value = false
    currentQuestionIndex.value++
    
    // Reset per-question timer if using one
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) ? questionRemaining.value : undefined
      startQuestionTimer(timePerQuestion.value, remainingForSchedule)
  schedulePerQuestionLimit(timePerQuestion.value, () => {
        if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
          answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
          selectedAnswers.value[currentQuestion.value.id] = ''
          persistProgress()
        }
        if (!isLastQuestion.value) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          nextQuestion()
        } else {
          submissionMessage.value = 'Time is over — submitting...'
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitBattle()
        }
      }, remainingForSchedule)
    }

    // Pre-fetch next question's media if available
    const upcomingQuestion = questions.value[currentQuestionIndex.value]
    if (upcomingQuestion?.media_url) {
      const img = new Image()
      img.src = upcomingQuestion.media_url
    }
  }
}

const finishBattle = () => {
  // Enforce timeout and connection requirements
  if (timeRemaining.value <= 0) {
    pushAlert({ message: 'Battle timeout - cannot submit', type: 'error' })
    return
  }
  
  if (connectionStatus.value !== 'connected') {
    pushAlert({ message: 'Connection required to submit - please reconnect', type: 'error' })
    return
  }
  // Allow finishing even if some questions are unanswered. Prepare a contextual confirmation.
  const unanswered = questions.value.filter(q => {
    const qid = Number(String((q as any).id))
    const stored = answerStore.getAnswer(qid)
    const local = selectedAnswers.value[(q as any).id]
    const ans = (typeof stored !== 'undefined') ? stored : local
    return typeof ans === 'undefined' || ans === '' || ans === null
  })

  if (unanswered.length > 0) {
    confirmTitle.value = 'Finish Battle (Unanswered)'
    confirmMessage.value = `You have ${unanswered.length} unanswered question${unanswered.length === 1 ? '' : 's'}. Are you sure you want to submit now? You won't be able to change your answers.`
  } else {
    confirmTitle.value = 'Finish Battle?'
    confirmMessage.value = "Are you sure you want to finish this battle? You won't be able to change your answers after submission."
  }

  showConfirmation.value = true
}

const submitBattle = async () => {
  try {
    // ENFORCE: Check timeout before submitting
    if (timeRemaining.value <= 0) {
      error.value = 'Battle timeout - submission rejected'
      pushAlert({ message: 'Battle timeout - submission rejected', type: 'error' })
      return
    }
    
    // ENFORCE: Check connection status before submitting
    if (connectionStatus.value !== 'connected') {
      error.value = 'Connection lost - cannot submit. Please reconnect and try again.'
      pushAlert({ message: 'Connection required for submission', type: 'error' })
      return
    }
    
    // Ensure we're online before attempting final submit
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      error.value = 'You must be online to submit the battle.'
      pushAlert({ message: 'No internet connection', type: 'error' })
      return
    }

    isSubmitting.value = true
    loading.value = true

    // Build answers payload from persisted answers
    // Build answers payload from persisted answers (avoid implicit-any map)
    const answersStoreArray = ((answerStore.allAnswers as any)?.value ?? []) as any[]
    const answersPayload: any[] = []
    for (const a of answersStoreArray) {
      answersPayload.push({ question_id: a.question_id, answer: a.answer })
    }

    // Compute a best-effort score locally if possible (backend trusts score param)
    let computedScore = 0
    try {
      for (const q of questions.value) {
        const ansEntry = answersPayload.find((x: any) => String(x.question_id) === String((q as any).id))
        if (ansEntry && ansEntry.answer !== '' && typeof (q as any)['correct_option_id'] !== 'undefined') {
          if (String(ansEntry.answer) === String((q as any).correct_option_id)) {
            computedScore += (q as any).points ?? 1
          }
        }
      }
    } catch (e) {
      // fallback: computedScore stays 0
    }

    // Post final answers and score to backend using API composable
    await api.postJson(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}/submit`, {
      answers: answersPayload,
      score: computedScore
    })

  router.push(`/quizee/tournaments/${route.params.id}/battles/${route.params.battleId}/results`)
  } catch (error) {
    console.error('Error submitting battle:', error)
  } finally {
    loading.value = false
    isSubmitting.value = false
    showConfirmation.value = false
  }
}

// Per-question timing is managed via the `useQuestionTimer` composable
// (start/stop/schedule/clear) so the old manual timeout helpers were removed.

const startTimer = (seconds: number) => {
  timeRemaining.value = seconds
  timer = setInterval(() => {
    if (timeRemaining.value !== null && timeRemaining.value > 0) {
      timeRemaining.value--
      // persist every 5 seconds
      if (timeRemaining.value % 5 === 0) persistProgress()
    } else {
      if (timer) clearInterval(timer)
      submitBattle()
    }
  }, 1000)
}

// Persist/restore progress helpers
function persistProgress() {
  try {
    const meta = {
      currentQuestionIndex: currentQuestionIndex.value,
      timeRemaining: timeRemaining.value,
      questionRemaining: (typeof questionRemaining.value === 'number') ? questionRemaining.value : null,
  // Persist answers array for local restore (avoid implicit-any map)
  answers: ((answerStore.allAnswers as any)?.value ?? []).map((a: any) => [a.question_id, a.answer])
    }
    localStorage.setItem(progressKey.value, JSON.stringify(meta))
  } catch (e) {}
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(progressKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.answers && Array.isArray(parsed.answers)) {
      answerStore.loadAnswers(parsed.answers, Number(route.params.battleId))
      parsed.answers.forEach(([qid, ans]: any) => {
        selectedAnswers.value[qid] = ans
      })
    }
    if (typeof parsed.currentQuestionIndex === 'number') currentQuestionIndex.value = parsed.currentQuestionIndex
  if (typeof parsed.timeRemaining === 'number' && parsed.timeRemaining > 0) timeRemaining.value = parsed.timeRemaining
  if (typeof parsed.questionRemaining === 'number' && parsed.questionRemaining > 0) questionRemaining.value = parsed.questionRemaining
  // Start per-question timer for restored question (only when numeric)
    try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0) ? questionRemaining.value : undefined
      startQuestionTimer(timePerQuestion.value, remainingForSchedule)
  schedulePerQuestionLimit(timePerQuestion.value, () => {
        if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
          answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
          selectedAnswers.value[currentQuestion.value.id] = ''
          persistProgress()
        }
        if (!isLastQuestion.value) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          nextQuestion()
        } else {
          submissionMessage.value = 'Time is over — submitting...'
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          submitBattle()
        }
      })
    }
  } catch (e) {
    // ignore malformed data
  }
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  fetchBattle()
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { connectionStatus.value = 'reconnecting' })
    window.addEventListener('offline', () => { connectionStatus.value = 'disconnected' })
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
  stopPollingForOpponent()
  detachEchoForJoin()
  try { stopQuestionTimer(); clearPerQuestionLimit() } catch (e) {}
})

// Polling for opponent
const waitingForOpponent = ref<boolean>(false)
const started = ref<boolean>(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let _echoChannel: any = null

function startPollingForOpponent() {
  stopPollingForOpponent()
  attachEchoForJoin()
  pollTimer = setInterval(async () => {
    try {
      const resp = await api.get(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}?with_questions=true`)
      const data: any = await resp.json().catch(() => null)
      const parts = data?.participants ?? []
      const count = Array.isArray(parts) ? parts.length : Object.keys(parts || {}).length
      if (count > 1) {
        // opponent joined, stop waiting and start
        waitingForOpponent.value = false
        started.value = true
        stopPollingForOpponent()
      }
    } catch (e) {
      // ignore transient errors
    }
  }, 3000)
}

function stopPollingForOpponent() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

function attachEchoForJoin() {
  try {
    // Fix: use only id, or check for uuid with optional chaining
    if (typeof window === 'undefined' || !(window as any).Echo) return
    const chId = (battle.value && ((battle.value as any).uuid || battle.value.id)) || route.params.battleId
    _echoChannel = (window as any).Echo.private('battle.' + chId)
    _echoChannel.listen('.BattleParticipantJoined', (payload: any) => {
      waitingForOpponent.value = false
      started.value = true
      stopPollingForOpponent()
    })
    // Try to bind to underlying pusher connection events for status
    try {
      const pusher = (window as any).Echo?.connector?.pusher
      if (pusher && pusher.connection && typeof pusher.connection.bind === 'function') {
        pusher.connection.bind('connected', () => {
          connectionStatus.value = 'connected'
          // Reconcile state after reconnect
          fetchBattle()
        })
        pusher.connection.bind('disconnected', () => {
          connectionStatus.value = 'disconnected'
        })
        pusher.connection.bind('connecting_in', () => {
          connectionStatus.value = 'reconnecting'
        })
      }
    } catch (e) {
      // ignore binding errors
    }
  } catch (e) {
    // ignore
  }
}

function detachEchoForJoin() {
  try {
    if (_echoChannel && typeof _echoChannel.stopListening === 'function') {
      _echoChannel.stopListening('.BattleParticipantJoined')
      if (typeof _echoChannel.leave === 'function') _echoChannel.leave()
    }
    _echoChannel = null
  } catch (e) {}
}
</script>

<!-- @ts-ignore for window.Echo -->
<!-- Or declare global -->
<!-- @ts-ignore -->
<!-- eslint-disable-next-line -->
declare global {
  interface Window { Echo: any }
}
