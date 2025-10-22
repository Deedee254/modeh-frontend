<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Preparing the arena...</p>
    </div>

    <!-- Waiting for Opponent Modal -->
    <UModal v-model="waitingForOpponent" prevent-close>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Waiting for Opponent</h3>
        </template>
        <div class="text-center py-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">The battle will begin once another player joins.</p>
          <div class="mt-3">
            <div v-if="countdownActive" class="text-sm text-gray-500">Auto-start in <span class="font-mono font-bold text-indigo-600">{{ waitingCountdown }}</span>s</div>
            <div v-else-if="forceStartEnabled" class="text-sm text-gray-500">You can start the battle now.</div>
          </div>
          <div class="mt-6 space-y-3">
            <UButton @click="startWithBot" block color="primary" variant="solid" label="Start with a Bot" />
            <UButton v-if="isInitiator" @click="enableSoloMode" block color="green" variant="outline" label="Take Solo (Subscription Required)" />
            <UButton v-if="isInitiator" @click="startBattle" :disabled="!canStart" block color="indigo" variant="solid" label="Start Battle" />
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Main Battle UI -->
    <div v-if="!loading && !waitingForOpponent" class="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6">
      <!-- Header: Players & Scores -->
      <header class="mb-4 sm:mb-6">
        <div class="grid grid-cols-3 items-start sm:items-center gap-2 sm:gap-4">
          <!-- Player 1 (You) -->
          <PlayerCard 
            :player="auth.user" 
            role="You"
            :score="score"
            :is-active="true"
            :answered="Object.keys(answers).length"
          />

          <!-- Timer & Question Count -->
          <div class="text-center pt-1 sm:pt-0">
            <div class="flex flex-col items-center gap-1">
              <div class="text-2xl sm:text-3xl font-mono font-bold" :class="timerColorClass">{{ displayTime }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Question Timer</div>
              <!-- big display above already shows per-question time (displayTime) -->
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Total Time</div>
              <div class="text-sm font-mono font-bold mt-1" :class="{'text-red-500': totalTimeLeft < 60, 'text-orange-500': totalTimeLeft < 180, 'text-indigo-500': totalTimeLeft >= 180}">
                {{ totalDisplayTime }}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Q {{ currentIndex + 1 }}/{{ questions.length }}</p>
            </div>
          </div>

          <!-- Player 2 (Opponent) -->
          <PlayerCard 
            :player="battle.value.opponent || { first_name: opponentName, profile: { avatar: opponentAvatar } }"
            role="Opponent"
            :score="opponentScore"
            :is-active="false"
            :answered="0"
          />
        </div>

        <!-- Progress Bar -->
        <div class="w-full space-y-2 mt-3">
          <!-- per-quiz question progress -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300" :style="{ width: progressPercentage }"></div>
          </div>
          <!-- total timer progress (composable) -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div :class="['h-2 rounded-full transition-all duration-300', totalTimerColorClass]" :style="{ width: `${totalTimerPercent}%` }"></div>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div>Remaining: <span class="font-mono">{{ totalDisplayTime }}</span></div>
            <div v-if="encouragementMessage" :class="['px-2 py-1 rounded-full text-sm font-semibold', encouragementStyle]">{{ encouragementMessage }} <span v-if="currentStreak > 1" class="ml-1">🔥 {{ currentStreak }}</span></div>
          </div>
        </div>
      </header>

      <!-- Question Area -->
      <main class="flex-1 flex flex-col justify-center">
        <template v-if="!loading && questions.length > 0">
          <transition name="fade-slide" mode="out-in">
            <div :key="currentIndex" class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h2 class="text-lg sm:text-xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100" v-html="currentQuestion.body"></h2>
              
              <div>
                <QuestionCard :question="currentQuestion" v-model="answers[currentQuestion.id]" @select="onQuestionSelect" />
              </div>
            </div>
          </transition>
        </template>
        <div v-else-if="loading" class="p-6"><UiSkeleton :count="5" /></div>
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No questions available for this battle.</p>
        </div>
      </main>

      <!-- Footer: Navigation -->
      <footer class="mt-6 flex items-center" :class="currentIndex > 0 ? 'justify-between' : 'justify-end'">
        <UButton v-if="currentIndex > 0" @click="prevQuestion" color="gray" variant="ghost" icon="i-heroicons-arrow-left" label="Previous" />
        
        <UButton 
          v-if="currentIndex < questions.length - 1" 
          @click="nextQuestion" 
          color="primary" 
          variant="solid" 
          trailing-icon="i-heroicons-arrow-right" 
          label="Next" 
        />
        <UButton 
          v-else-if="!showConfirm" 
          @click="confirmFinish" 
          :disabled="!allAnswered || submitting" 
          color="green" 
          variant="solid" 
          trailing-icon="i-heroicons-check-circle" 
          >
          <template #default>
            <svg v-if="submitting" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
            <span>{{ submitting ? 'Submitting…' : 'Finish Battle' }}</span>
          </template>
        </UButton>
        <UButton v-else type="button" v-if="lastSubmitFailed" @click="submitBattle" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Retry</UButton>
      </footer>

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
                <h3 class="text-lg font-semibold text-gray-900">Submit Battle</h3>
                <p class="text-sm text-gray-600">Are you sure you want to submit? You won't be able to change your answers.</p>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" @click="showConfirm = false" :disabled="submitting">Cancel</button>
              <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="submitBattle" :disabled="submitting">
                <svg v-if="submitting" class="w-4 h-4 inline-block mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                Submit Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'
// navigation composable not required here (we manage currentIndex locally)
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const loading = ref(true)
const battle = ref({})
const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)
const questions = ref([])
const currentIndex = ref(0)
// reuse quiz answers composable so battle answers have same shape and helpers
const { answers, initializeAnswers, clearSavedAnswers } = useQuizAnswers({ value: { questions: [] } }, id)
const score = ref(0)
const opponentScore = ref(0)
import useQuestionTimer from '~/composables/useQuestionTimer'
const { timePerQuestion, displayTime, timerColorClass, startTimer, stopTimer, resetTimer, recordAndReset, onTimeout } = useQuestionTimer(20)

// Submission state (parity with quiz page)
const submitting = ref(false)
const lastSubmitFailed = ref(false)
const submissionMessage = ref('')
const showConfirm = ref(false)

// We'll use the shared quiz total-timer composable so battles behave like quizzes
// Create an adapter that looks like a 'quiz' object to the composable
const battleAdapter = computed(() => ({
  questions: questions.value,
  // prefer explicit battle.time_per_question or settings.time_total_seconds
  timer_seconds: battle.value?.settings?.time_total_seconds || battle.value?.time_total_seconds || null,
}))

// useQuizTimer provides unified total timer, displayTime, percent and auto-submit callback
const { timeLeft: totalTimeLeft, displayTime: totalDisplayTime, timerPercent: totalTimerPercent, timerColorClass: totalTimerColorClass, startTimer: startTotalTimer, stopTimer: stopTotalTimer } = useQuizTimer(battleAdapter, () => finishBattle())

const waitingForOpponent = ref(false)
const useBot = ref(false)
const useSolo = ref(false)
let pollTimer = null
let _echoChannel = null

// Waiting room countdown (10s) and start control
const waitingCountdown = ref(10)
const countdownActive = ref(false)
const forceStartEnabled = ref(false)
let waitingInterval = null

const canStart = computed(() => {
  // Initiator can start when countdown ended or an opponent is present
  const hasOpponent = !!(battle.value?.opponent || useBot.value || useSolo.value)
  return isInitiator.value && (hasOpponent || forceStartEnabled.value)
})

function startWaitingCountdown(seconds = 10) {
  clearWaitingCountdown()
  waitingCountdown.value = seconds
  countdownActive.value = true
  forceStartEnabled.value = false
  waitingInterval = setInterval(() => {
    if (waitingCountdown.value > 0) waitingCountdown.value--
    if (waitingCountdown.value <= 0) {
      // countdown finished — allow initiator to force-start
      forceStartEnabled.value = true
      countdownActive.value = false
      clearWaitingCountdown()
    }
  }, 1000)
}

function clearWaitingCountdown() {
  if (waitingInterval) { clearInterval(waitingInterval); waitingInterval = null }
}

async function startBattle() {
  if (!isInitiator.value) return
  try {
    loading.value = true
    // Call backend start endpoint — some backends expose /api/battles/{id}/start
    const res = await api.postJson(`/api/battles/${id}/start`, {})
    if (api.handleAuthStatus(res)) { loading.value = false; return }
    if (!res.ok) {
      // fallback: try to transition locally (opponent must be present)
      console.error('start battle failed', await res.json().catch(() => ({})))
      loading.value = false
      return
    }
    // refresh battle state and close waiting modal
    const body = await res.json()
    battle.value = body.battle || body
    waitingForOpponent.value = false
    stopTotalTimerIfNeeded()
    // start the battle timers
    startTimer()
    startTotalTimer()
  } catch (e) {
    console.error('startBattle error', e)
  } finally {
    loading.value = false
  }
}

function stopTotalTimerIfNeeded() {
  try { stopTotalTimer() } catch (e) {}
}

const auth = useAuthStore()
const cfg = useRuntimeConfig()
import useApi from '~/composables/useApi'
const api = useApi()

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

// displayTime and timerColorClass are provided by the composable

const progressPercentage = computed(() => {
  if (!questions.value.length) return '0%'
  return `${((currentIndex.value + 1) / questions.value.length) * 100}%`
})

// answered percent (0-100) used by enhancements
const answeredPercent = computed(() => {
  const total = questions.value.length || 0
  if (!total) return 0
  let answered = 0
  for (const q of questions.value) {
    const val = answers.value[q.id]
    if (val === null || val === undefined) continue
    if (typeof val === 'string' && val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    answered++
  }
  return Math.round((answered / total) * 100)
})

// enhancements (streaks/encouragement) to match quiz UI
const { currentStreak, encouragementMessage, encouragementStyle, calculateAchievements } = useQuizEnhancements(battleAdapter, answeredPercent, computed(() => currentQuestion.value), answers)

const allAnswered = computed(() => questions.value.length > 0 && Object.keys(answers.value).length === questions.value.length && Object.values(answers.value).every(v => v !== null && v !== undefined))

const opponentName = computed(() => {
  if (useBot.value) return 'Bot Player'
  return battle.value?.opponent?.first_name || 'Opponent'
})

const opponentAvatar = computed(() => {
  if (useBot.value) return '/avatars/bot.png'
  return battle.value?.opponent?.profile?.avatar || '/avatars/default.png'
})

function getOptionClass(option) {
  const isSelected = answers.value[currentQuestion.value.id] === option
  if (isSelected) {
    return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500'
  }
  return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
}

// wire composable timeout to auto-advance

onTimeout(() => nextQuestion(true))

function selectAnswer(qid) {
  // save selected answer; backend scoring happens on submit
  // For gamification, we could add a small score for speed, but since marking is deferred, we'll keep it simple.
}

function onQuestionSelect(val) {
  const q = currentQuestion.value
  if (!q || !q.id) return
  answers.value[q.id] = val
  // record per-question timing
  try { const elapsed = recordAndReset(); questionTimes.value[q.id] = elapsed } catch(e) {}
  if (['mcq','image_mcq','audio_mcq','video_mcq'].includes(q.type)) {
    setTimeout(() => { if (currentIndex.value < questions.value.length - 1) nextQuestion() }, 250)
  }
}

function prevQuestion() { if (currentIndex.value>0) currentIndex.value -=1 }
function nextQuestion(force = false) { 
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1
  } else if (force) {
    // If it's the last question and timer runs out, finish the battle
    finishBattle()
  }
}
watch(currentIndex, () => {
  // reset composable timer for new question
  resetTimer(timePerQuestion.value)
  startTimer()
})
function startPollingForOpponent() {
  stopPollingForOpponent()
  attachEchoForJoin()
  pollTimer = setInterval(async () => {
    try {
      const resp = await fetch(cfg.public.apiBase + `/api/battles/${id}`, { credentials: 'include' })
      const json = await resp.json()
      const data = json?.battle || json
      // participants may be an array or an object, some endpoints use `players` or `participants`
      const parts = data?.participants || data?.players || []
      const count = Array.isArray(parts) ? parts.length : Object.keys(parts || {}).length
      if (count > 1 || data?.opponent) {
        battle.value = data // Update battle object with opponent
        stopPollingForOpponent()
      }
    } catch (e) {
      // swallow network/parse errors but keep polling
      // console.debug('poll error', e)
    }
  }, 3000)
}
function stopPollingForOpponent() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }

function attachEchoForJoin() {
  try {
    if (typeof window === 'undefined' || !window.Echo) return
    // choose channel name by uuid if available
    const chId = (battle.value && (battle.value.uuid || id)) || id
    _echoChannel = window.Echo.private('battle.' + chId)
    _echoChannel.listen('.BattleParticipantJoined', (payload) => {
      battle.value.opponent = payload.participant;
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

watch(() => battle.value?.opponent, (newOpponent) => {
  if (newOpponent || useBot.value || useSolo.value) {
    waitingForOpponent.value = false;
  }
})
// start countdown when waiting modal opens
watch(waitingForOpponent, (val) => {
  if (val) {
    startWaitingCountdown(10)
  } else {
    clearWaitingCountdown()
  }
})
function startWithBot() { useBot.value = true; waitingForOpponent.value = false }

function enableSoloMode() { useSolo.value = true; waitingForOpponent.value = false }

function finishBattle() {
  if (!allAnswered.value) return
  if (useSolo.value) return soloComplete()
  submitBattle()
}

async function soloComplete() {
  try {
    loading.value = true
    const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: parseInt(qid, 10) || 0, selected: answers.value[qid] })), defer_marking: true }
    const res = await api.postJson(`/api/battles/${id}/solo-complete`, payload)
    if (api.handleAuthStatus(res)) { loading.value = false; return }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('solo-complete failed', err)
      throw new Error('Solo completion failed')
    }
    const json = await res.json().catch(() => ({}))
    
      // If backend returned an attempt id, redirect to centralized checkout so user can see results after checkout
      // Redirect to checkout with battle id — checkout expects `id` for battles
      router.push(`/quizee/payments/checkout?type=battle&id=${id}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
async function submitBattle() {
  try {
    loading.value = true
    submitting.value = true
    lastSubmitFailed.value = false
    submissionMessage.value = 'Saving answers...'
    // Calculate achievements before submitting (parity with quiz submit flow)
    try { calculateAchievements() } catch (e) { console.warn('calculateAchievements failed', e) }
    stopTimer()
    const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: parseInt(qid, 10) || 0, selected: answers.value[qid] })), defer_marking: true }
    const res = await api.postJson(`/api/battles/${id}/submit`, payload)
    if (api.handleAuthStatus(res)) { loading.value = false; return }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('submit failed', err)
      submissionMessage.value = ''
      lastSubmitFailed.value = true
      submitting.value = false
      loading.value = false
      return
    }
    // Update auth store if server returned updated user or awarded achievements
    try {
      const body = await res.json().catch(() => ({}))
      if (body?.user) {
        auth.setUser(body.user)
      } else if (body?.awarded_achievements && body.awarded_achievements.length) {
        // refresh user to pick up awarded badges/points
        await auth.fetchUser()
      }
      // clear saved answers after successful submit
      clearSavedAnswers()
    } catch (e) {
      // ignore
    }

    // reset submission state
    submissionMessage.value = ''
    submitting.value = false
    lastSubmitFailed.value = false

      // If backend returned an attempt id, redirect to centralized checkout so user can see results after checkout
      // Redirect to checkout with battle id — checkout expects `id` for battles
      router.push(`/quizee/payments/checkout?type=battle&id=${id}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    submitting.value = false
    showConfirm.value = false
  }
}

function confirmFinish() {
  showConfirm.value = true
}

onMounted(async () => {
  try {
    const res = await api.get(`/api/battles/${id}`)
    if (res.ok) {
      const j = await res.json()
      const data = j.battle || j
      battle.value = data
      questions.value = battle.value.questions || []
      // initialize answers structure for questions
      initializeAnswers()
      // Prefer top-level convenience field, then settings.time_per_question.
      // If neither is present but a total battle time exists, compute per-question by dividing.
      // Set up timers based on battle settings
      if (battle.value.settings?.time_total_seconds) {
        totalTimeRemaining.value = battle.value.settings.time_total_seconds
      }
      
      if (battle.value.time_per_question) {
        timePerQuestion.value = battle.value.time_per_question
      } else if (battle.value.settings?.time_per_question) {
        timePerQuestion.value = battle.value.settings.time_per_question
      } else if (battle.value.settings?.time_total_seconds && questions.value.length) {
        const per = Math.floor(battle.value.settings.time_total_seconds / questions.value.length)
        timePerQuestion.value = per > 0 ? per : 20
      } else {
        timePerQuestion.value = 20
      }

      // start waiting/polling if only one participant
      const b = battle.value
      const parts = (b && (b.participants || b.players || (b.opponent ? [b.initiator, b.opponent] : [b.initiator]))) || []
      if (!Array.isArray(parts) || parts.length <= 1) {
        waitingForOpponent.value = true
        startPollingForOpponent()
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    if (questions.value.length > 0 && !waitingForOpponent.value) {
      // restart/initialize per-question timer and total timer
      startTimer()
      try { startTotalTimer() } catch (e) {}
    }
  }
})

onBeforeUnmount(() => {
  stopTimer()
  stopPollingForOpponent()
  detachEchoForJoin()
  if (pollTimer) clearInterval(pollTimer)
  try { stopTotalTimer() } catch (e) {}
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
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
