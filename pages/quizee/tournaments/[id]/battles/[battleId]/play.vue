<template>
  <div class="min-h-screen bg-gray-50">
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
            :disabled="!allQuestionsAnswered"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            Finish Battle
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
            Finish Battle?
          </DialogTitle>
          <p class="text-gray-600 mb-6">
            Are you sure you want to finish this battle? You won't be able to change your answers after submission.
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
definePageMeta({ layout: 'quizee' })

import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
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
const score = ref<number>(0)
const isSubmitting = ref<boolean>(false)

// Connection status for realtime
const connectionStatus = ref<'connected'|'disconnected'|'reconnecting'>('connected')

// Per-question timer
let questionTimer: ReturnType<typeof setTimeout> | undefined
const timePerQuestion = ref<number | null>(null)

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
const allQuestionsAnswered = computed<boolean>(() => 
  Object.keys(selectedAnswers.value).length === totalQuestions.value
)

// Methods
const config = useRuntimeConfig()
const api = useApi()

const fetchBattle = async () => {
  try {
    loading.value = true
    const resp = await api.get(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}`)
    const json = await resp.json().catch(() => null)
    const data = json?.data ?? json as Battle
    battle.value = data
    // Normalize questions for QuestionCard component
    // Normalize questions for QuestionCard component without anonymous callback typing
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
    questions.value = qList
  startTimer(data.duration * 60) // Convert minutes to seconds
  // Use per-question timing if provided by battle payload
  timePerQuestion.value = (data as any).per_question_seconds ?? null
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

const selectAnswer = async (optionId: string | number) => {
  if (answerSubmitted.value || !currentQuestion.value) return

  // Lock to prevent double submits locally
  answerSubmitted.value = true

  // Persist immediately to local answer store
  try {
  answerStore.setAnswer(Number(String(currentQuestion.value.id)), optionId as any)
    selectedAnswers.value[currentQuestion.value.id] = optionId
    persistProgress()
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

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    // Reset answer submitted state when changing questions
    answerSubmitted.value = false
    currentQuestionIndex.value--
    
    // Reset per-question timer if using one
    startQuestionTimer(timePerQuestion.value)
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    // Reset answer submitted state when changing questions
    answerSubmitted.value = false
    currentQuestionIndex.value++
    
    // Reset per-question timer if using one
    startQuestionTimer(timePerQuestion.value)

    // Pre-fetch next question's media if available
    const nextQuestion = questions.value[currentQuestionIndex.value]
    if (nextQuestion?.media_url) {
      const img = new Image()
      img.src = nextQuestion.media_url
    }
  }
}

const finishBattle = () => {
  if (allQuestionsAnswered.value) {
    showConfirmation.value = true
  }
}

const submitBattle = async () => {
  try {
    // Ensure we're online before attempting final submit
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      error.value = 'You must be online to submit the battle.'
      return
    }

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
    showConfirmation.value = false
  }
}


function startQuestionTimer(seconds: number | null) {
  if (questionTimer) clearTimeout(questionTimer)
  if (!seconds || seconds <= 0) return
  questionTimer = setTimeout(() => {
    // If no answer, mark empty and persist
    if (currentQuestion.value && typeof selectedAnswerId.value === 'undefined') {
  answerStore.setAnswer(Number(String(currentQuestion.value.id)), '' as any)
      selectedAnswers.value[currentQuestion.value.id] = ''
      persistProgress()
    }
    if (!isLastQuestion.value) {
      nextQuestion()
    } else {
      // Auto-submit on last question per-question expiry
      submitBattle()
    }
  }, seconds * 1000)
}

function clearQuestionTimer() {
  if (questionTimer) { clearTimeout(questionTimer); questionTimer = undefined }
}

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
    // Start per-question timer for restored question
    startQuestionTimer(timePerQuestion.value)
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
  clearQuestionTimer()
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
      const resp = await api.get(`/api/tournaments/${route.params.id}/battles/${route.params.battleId}`)
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
