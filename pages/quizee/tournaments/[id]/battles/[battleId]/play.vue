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

    <!-- Battle Content -->
    <div class="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <template v-else>
        <!-- Current Question -->
        <div v-if="currentQuestion" class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div class="p-6">
            <!-- Question Content -->
            <div class="mb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                {{ currentQuestion.content }}
              </h2>

              <!-- Question Media -->
              <div v-if="currentQuestion.media_url" class="mb-4">
                <img 
                  v-if="currentQuestion.media_type === 'image'"
                  :src="currentQuestion.media_url" 
                  :alt="currentQuestion.content"
                  class="max-w-full h-auto rounded-lg"
                >
                <!-- Add video/audio support if needed -->
              </div>
            </div>

            <!-- Answer Options -->
            <div class="space-y-3">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="option.id"
                @click="selectAnswer(option.id)"
                :disabled="answerSubmitted"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-colors duration-200',
                  answerSubmitted && option.id === currentQuestion.correct_option_id ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  answerSubmitted && option.id === selectedAnswerId ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                  selectedAnswerId === option.id ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                  'bg-gray-50 text-gray-700 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center">
                  <div 
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center mr-3 border',
                      answerSubmitted && option.id === currentQuestion.correct_option_id ? 'border-green-500 text-green-500' :
                      answerSubmitted && option.id === selectedAnswerId ? 'border-red-500 text-red-500' :
                      selectedAnswerId === option.id ? 'border-blue-500 text-blue-500' :
                      'border-gray-300 text-gray-500'
                    ]"
                  >
                    {{ ['A', 'B', 'C', 'D'][index] }}
                  </div>
                  <span>{{ option.content }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

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
              <div v-if="waitingForOpponent" class="text-yellow-600">Waiting for an opponent to join... or <button class="underline" @click="startWithBot">start with a bot</button></div>
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

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

// Types
type Option = {
  id: number | string
  content: string
}

type Question = {
  id: number | string
  content: string
  media_url?: string
  media_type?: string
  options: Option[]
  correct_option_id?: number | string
}

type Battle = {
  id: number | string
  questions: Question[]
  duration: number
}

type SelectedAnswers = Record<string | number, string | number>

const route = useRoute()
const router = useRouter()

// State
const loading = ref<boolean>(true)
const battle = ref<Battle | null>(null)
const questions = ref<Question[]>([])
const currentQuestionIndex = ref<number>(0)
const selectedAnswers = ref<SelectedAnswers>({})
const timeRemaining = ref<number>(0)
const answerSubmitted = ref<boolean>(false)
const showConfirmation = ref<boolean>(false)
const score = ref<number>(0)

// Timer
let timer: ReturnType<typeof setInterval> | undefined

// Computed
const currentQuestion = computed<Question | undefined>(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed<number>(() => questions.value.length)
const isFirstQuestion = computed<boolean>(() => currentQuestionIndex.value === 0)
const isLastQuestion = computed<boolean>(() => currentQuestionIndex.value === totalQuestions.value - 1)
const selectedAnswerId = computed<string | number | undefined>(() => currentQuestion.value ? selectedAnswers.value[currentQuestion.value.id] : undefined)
const canNavigate = computed<boolean>(() => !!(currentQuestion.value && selectedAnswers.value[currentQuestion.value.id]))
const allQuestionsAnswered = computed<boolean>(() => 
  Object.keys(selectedAnswers.value).length === totalQuestions.value
)

// Methods
const config = useRuntimeConfig()

const fetchBattle = async () => {
  try {
    loading.value = true
    const response = await useFetch(config.public.apiBase + `/api/tournaments/${route.params.id}/battles/${route.params.battleId}`, { credentials: 'include' })
    const data = response.data.value as Battle
    battle.value = data
    questions.value = data.questions
    startTimer(data.duration * 60) // Convert minutes to seconds
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

  selectedAnswers.value[currentQuestion.value.id] = optionId
  answerSubmitted.value = true

  // Submit answer to backend
  try {
    const response = await useFetch(
      config.public.apiBase + `/api/tournaments/${route.params.id}/battles/${route.params.battleId}/questions/${currentQuestion.value.id}/answer`,
      {
        method: 'POST',
        body: { option_id: optionId },
        credentials: 'include'
      }
    )
    
    // Update score if available in response
    const respData = response.data.value as { score?: number }
    if (respData?.score !== undefined) {
      score.value = respData.score
    }

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (!isLastQuestion.value) {
        nextQuestion()
      }
      answerSubmitted.value = false
    }, 1500)
  } catch (error) {
    console.error('Error submitting answer:', error)
  }
}

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

const finishBattle = () => {
  if (allQuestionsAnswered.value) {
    showConfirmation.value = true
  }
}

const submitBattle = async () => {
  try {
    loading.value = true
    await useFetch(
      config.public.apiBase + `/api/tournaments/${route.params.id}/battles/${route.params.battleId}/submit`,
      { method: 'POST', credentials: 'include' }
    )
    const qs = useBot.value ? '?bot=1' : ''
    router.push(`/quizee/tournaments/${route.params.id}/battles/${route.params.battleId}/results${qs}`)
  } catch (error) {
    console.error('Error submitting battle:', error)
  } finally {
    loading.value = false
    showConfirmation.value = false
  }
}

function startWithBot() {
  useBot.value = true
  waitingForOpponent.value = false
  // mark started so UI proceeds
  started.value = true
}

const startTimer = (seconds: number) => {
  timeRemaining.value = seconds
  timer = setInterval(() => {
    if (timeRemaining.value !== null && timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      if (timer) clearInterval(timer)
      submitBattle()
    }
  }, 1000)
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  fetchBattle()
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
  stopPollingForOpponent()
  detachEchoForJoin()
})

// Polling for opponent
const waitingForOpponent = ref<boolean>(false)
const useBot = ref<boolean>(false)
const started = ref<boolean>(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let _echoChannel: any = null

function startPollingForOpponent() {
  stopPollingForOpponent()
  attachEchoForJoin()
  pollTimer = setInterval(async () => {
    try {
  const data: any = await $fetch(config.public.apiBase + `/api/tournaments/${route.params.id}/battles/${route.params.battleId}`, { credentials: 'include' })
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
