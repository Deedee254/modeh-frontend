<template>
  <QuizLayoutWrapper
    :title="`Battle vs ${battle.opponent ? battle.opponent.first_name : useBot ? 'QuizBot' : 'Opponent'}`"
    :current-question="currentIndex"
    :total-questions="questions.length"
    :show-timer="true"
    :timer-display="displayTime"
    :timer-color-class="timerColorClass"
    :timer-circumference="113"
    :timer-dash-offset="0"
    :encouragement="encouragementMessage"
    :encouragement-class="encouragementStyle"
    :show-meta="false"
    :alert-message="connectionStatus !== 'connected' ? (connectionStatus === 'disconnected' ? '❌ Connection lost' : '⚠️ Reconnecting...') : ''"
    :alert-class="connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'"
    :show-previous="currentIndex > 0"
    :disable-previous="currentIndex === 0 || !canNavigate"
    :show-next="currentIndex < questions.length - 1"
    :disable-next="!canNavigate"
    :show-submit="currentIndex === questions.length - 1"
    :submit-label="'Finish Battle'"
    :disable-submit="!allAnswered || submitting"
    :is-submitting="submitting"
    :show-confirmation="showConfirm"
    :confirm-title="'Finish Battle?'"
    :confirm-message="'Are you sure you want to finish? You won\'t be able to change your answers.'"
    :confirm-button-label="'Submit Battle'"
    @previous="prevQuestion"
    @next="nextQuestion"
    @submit="confirmFinish"
    @cancel-confirm="showConfirm = false"
    @confirm-submit="submitBattle"
  >
    <template #content>
        <!-- Persistent countdown alert (shows near the top during final seconds) -->
        <div v-if="countdownAlert.show" :class="countdownClass" class="mb-4 rounded px-4 py-2 text-sm flex items-center gap-4 justify-between">
          <div class="flex items-center gap-2">
            <span v-if="countdownAlert.type === 'warning'" class="text-xl">⚠️</span>
            <span v-else-if="countdownAlert.type === 'error'" class="text-xl">⛔</span>
            <span v-else class="text-xl">⏱️</span>
            <div class="text-sm">{{ countdownAlert.message }}</div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-2xl font-mono font-bold countdown-number" aria-hidden="true">{{ countdownAlert.timeRemaining }}</div>
          </div>
        </div>
      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button 
          @click="fetchBattle" 
          class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          Try Again
        </button>
      </div>

      <div v-else-if="questions.length > 0" class="space-y-6">
        <!-- Player Cards -->
        <div class="grid grid-cols-3 items-start gap-2 sm:gap-4">
          <PlayerCard 
            :player="auth.user" 
            role="You"
            :score="score"
            :is-active="true"
            :answered="Object.keys(answers).length"
          />
          <div class="text-center text-sm text-gray-600">
            <div class="text-xs">vs</div>
            <div class="text-lg font-mono font-bold mt-1 text-brand-600">{{ score }} - {{ opponentScore }}</div>
          </div>
          <PlayerCard 
            :player="battle.opponent || botUser"
            :role="useBot ? 'QuizBot' : 'Opponent'"
            :score="opponentScore"
            :is-active="false"
            :answered="useBot ? botAnswered : 0"
          />
        </div>

        <!-- Question -->
        <transition name="fade-slide" mode="out-in">
          <QuestionCard :key="currentIndex" :question="currentQuestion" v-model="answers[currentQuestion.id]" @select="onQuestionSelect" @toggle="(opt) => rawToggleMulti(currentQuestion.id, opt)" />
        </transition>
      </div>
    </template>
  </QuizLayoutWrapper>
</template>

<script setup>
definePageMeta({ layout: 'quizee', hideTopBar: true })
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import QuizLayoutWrapper from '~/components/QuizLayoutWrapper.vue'
import useDisableUserActions from '~/composables/useDisableUserActions'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import { useQuizAnswers } from '~/composables/quiz/useQuizAnswers'
import { useQuizTimer } from '~/composables/quiz/useQuizTimer'
import { useQuizEnhancements } from '~/composables/quiz/useQuizEnhancements'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import useQuestionTimer from '~/composables/useQuestionTimer'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const auth = useAuthStore()
const api = useApi()

const loading = ref(true)
const battle = ref({})
const questions = ref([])
const currentIndex = ref(0)
const useBot = ref(false)
const botAnswered = ref(0)
const botInterval = ref(null)
const botAccuracy = ref(0.6)
const botThinking = ref(false)
const { answers, initializeAnswers, clearSavedAnswers, toggleMulti: rawToggleMulti } = useQuizAnswers(computed(() => ({ questions: questions.value })), id)
const score = ref(0)
const opponentScore = ref(0)

const botUser = {
  first_name: 'QuizBot',
  profile: { avatar: '/avatars/bot.png' }
}

const { timePerQuestion, questionRemaining, displayTime, timerColorClass, startTimer, stopTimer, resetTimer, recordAndReset, schedulePerQuestionLimit, clearPerQuestionLimit } = useQuestionTimer(20)

const submitting = ref(false)
const lastSubmitFailed = ref(false)
const submissionMessage = ref('')
const showConfirm = ref(false)

const battleAdapter = computed(() => ({
  questions: questions.value,
  timer_seconds: battle.value?.settings?.time_total_seconds || battle.value?.time_total_seconds || null,
}))

// Disable context menu, common shortcuts and text selection while this page is active
useDisableUserActions({ contextmenu: true, shortcuts: true, selection: true })

const { timeLeft: totalTimeLeft, displayTime: totalDisplayTime, timerPercent: totalTimerPercent, timerColorClass: totalTimerColorClass, startTimer: startTotalTimer, stopTimer: stopTotalTimer } = useQuizTimer(battleAdapter, () => finishBattle())

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const progressPercentage = computed(() => {
  if (!questions.value.length) return '0%'
  return `${((currentIndex.value + 1) / questions.value.length) * 100}%`
})

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

const { currentStreak, encouragementMessage, encouragementStyle, calculateAchievements } = useQuizEnhancements(battleAdapter, answeredPercent, computed(() => currentQuestion.value), answers)

const allAnswered = computed(() => questions.value.length > 0 && Object.keys(answers.value).length === questions.value.length && Object.values(answers.value).every(v => v !== null && v !== undefined))

const { push: pushAlert } = useAppAlert()

// Persistent countdown alert state (shows a single countdown instead of firing many alerts)
const countdownAlert = ref({
  show: false,
  type: 'info', // 'info' | 'warning' | 'error'
  message: '',
  timeRemaining: 0
})

// CSS class computed for alert styling based on type
const countdownClass = computed(() => {
  if (!countdownAlert.value?.type) return 'bg-blue-50 text-blue-800 border border-blue-200'
  switch (countdownAlert.value.type) {
    case 'error':
      return 'bg-red-50 text-red-800 border border-red-200'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    default:
      return 'bg-blue-50 text-blue-800 border border-blue-200'
  }
})

// small helper to format seconds -> M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.max(0, Math.floor(seconds % 60))
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Update countdown alert based on which timer is most urgent
const updateCountdownAlert = () => {
  // Per-question timer is more urgent: show when <= 5 seconds
  if (typeof questionRemaining.value === 'number' && questionRemaining.value <= 5 && questionRemaining.value > 0) {
    countdownAlert.value.show = true
    countdownAlert.value.type = questionRemaining.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(questionRemaining.value)
    countdownAlert.value.message = `⏱️ Time for this question: ${formatTime(Math.ceil(questionRemaining.value))}`
    return
  }

  // Otherwise check overall timer (show when <= 5s)
  if (typeof totalTimeLeft.value === 'number' && totalTimeLeft.value <= 5 && totalTimeLeft.value > 0 && battle.value?.settings?.time_total_seconds) {
    countdownAlert.value.show = true
    countdownAlert.value.type = totalTimeLeft.value <= 2 ? 'error' : 'warning'
    countdownAlert.value.timeRemaining = Math.ceil(totalTimeLeft.value)
    countdownAlert.value.message = `⏱️ Quiz time remaining: ${formatTime(Math.ceil(totalTimeLeft.value))}`
    return
  }

  // otherwise hide
  countdownAlert.value.show = false
}

// Watch timers and update the single countdown alert (avoids per-second pushAlert spam)
watch(totalTimeLeft, () => updateCountdownAlert(), { immediate: false })
watch(questionRemaining, () => updateCountdownAlert(), { immediate: false })

function onQuestionSelect(val) {
  const q = currentQuestion.value
  if (!q || !q.id) return
  answers.value[q.id] = val
  try { const elapsed = recordAndReset(); questionTimes.value[q.id] = elapsed } catch(e) {}
  try { persistProgress() } catch (e) {}
  if (q.type === 'mcq') {
    setTimeout(() => { if (currentIndex.value < questions.value.length - 1) nextQuestion() }, 250)
  }
}

function prevQuestion() { if (currentIndex.value>0) currentIndex.value -=1 }
function nextQuestion(force = false) { 
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1
  } else if (force) {
    finishBattle()
  }
}
watch(currentIndex, () => {
  resetTimer(timePerQuestion.value)
  startTimer()
  try { stopTimer(); clearPerQuestionLimit() } catch (e) {}
  if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
    const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < timePerQuestion.value) ? questionRemaining.value : undefined
    // start per-question UI interval with any restored remaining seconds
    startTimer(timePerQuestion.value, remainingForSchedule)
    schedulePerQuestionLimit(timePerQuestion.value, () => {
      if (currentIndex.value < questions.value.length - 1) {
        pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
        nextQuestion(true)
      } else {
        submissionMessage.value = 'Time is over — submitting...'
        pushAlert({ message: 'Time is over — submitting...', type: 'info' })
        finishBattle()
      }
    }, remainingForSchedule)
  }
})

function finishBattle() {
  if (!allAnswered.value) return
  submitBattle()
}

function startWithBot() {
  // Initialize a local bot opponent for solo compete
  useBot.value = true
  botAnswered.value = 0
  opponentScore.value = 0
  // Ensure battle.opponent is set so UI renders correctly
  battle.value = { ...battle.value, opponent: botUser }

  // Start simulating bot answers with an initial delay and per-question jitter
  const startDelay = 800 + Math.floor(Math.random() * 1800) // 0.8s-2.6s
  if (botInterval.value) { clearTimeout(botInterval.value); botInterval.value = null }

  const simulateNext = () => {
    // If bot has answered all questions, stop
    if (botAnswered.value >= questions.value.length) {
      if (botInterval.value) { clearTimeout(botInterval.value); botInterval.value = null }
      botThinking.value = false
      return
    }

    // Bot 'thinks' before answering
    botThinking.value = true
    const thinkingTime = 400 + Math.floor(Math.random() * 1100) // 0.4s-1.5s
    botInterval.value = setTimeout(() => {
      botThinking.value = false
      const q = questions.value[botAnswered.value]
      // Decide correctness based on botAccuracy; if question has correct_option_id, prefer that
      const willBeCorrect = Math.random() < (botAccuracy.value || 0.5)
      if (willBeCorrect) {
        opponentScore.value += (q?.points ?? 1)
      }
      botAnswered.value += 1

      // Schedule next answer with jitter relative to timePerQuestion
      const per = Math.max(3, timePerQuestion.value || 8)
      const jitterFactor = 0.6 + Math.random() * 0.8 // 0.6 - 1.4
      const nextDelay = Math.floor(per * 1000 * jitterFactor)
      botInterval.value = setTimeout(simulateNext, nextDelay)
    }, thinkingTime)
  }

  // kick off after initial startDelay
  botThinking.value = true
  botInterval.value = setTimeout(() => { botThinking.value = false; simulateNext() }, startDelay)
}

async function submitBattle() {
  try {
    loading.value = true
    submitting.value = true
    lastSubmitFailed.value = false
    submissionMessage.value = 'Saving answers...'
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
    try {
      const body = await res.json().catch(() => ({}))
      if (body?.user) {
        auth.setUser(body.user)
      } else if (body?.awarded_achievements && body.awarded_achievements.length) {
        await auth.fetchUser()
      }
      clearSavedAnswers()
    } catch (e) {
    }

    submissionMessage.value = ''
    submitting.value = false
    lastSubmitFailed.value = false

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
    const res = await api.get(`/api/battles/${id}?with_questions=true`)
    if (!res.ok) {
      pushAlert({ message: 'Failed to load battle', type: 'error' })
      loading.value = false
      return
    }

    const j = await res.json()
    const data = j.battle || j
    battle.value = data
    questions.value = battle.value.questions || []
    
    // Validate questions are loaded
    if (!questions.value || questions.value.length === 0) {
      pushAlert({ 
        message: 'No questions available for this battle. Please contact support.',
        type: 'error'
      })
      loading.value = false
      return
    }
    
    initializeAnswers()
    
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
  } catch (e) {
    console.error('Failed to load battle:', e)
    pushAlert({ message: 'Error loading battle', type: 'error' })
    loading.value = false
    return
  } finally {
    loading.value = false
    if (questions.value.length > 0) {
      // If we restored progress, restoreProgress() will start the per-question timer with remaining seconds
      try { restoreProgress() } catch (e) {}
      // Fallback: start per-question interval normally if restore didn't start it
      if (typeof questionRemaining.value !== 'number') startTimer()
      try { startTotalTimer() } catch (e) {}
    }
  }
})

// Persist/restore progress helpers (include questionRemaining)
function persistProgress() {
  try {
    const meta = {
      currentQuestionIndex: currentIndex.value,
      questionRemaining: (typeof questionRemaining.value === 'number') ? questionRemaining.value : null,
      answers: answers.value
    }
    localStorage.setItem(`battle:progress:${id}`, JSON.stringify(meta))
  } catch (e) {}
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(`battle:progress:${id}`)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.answers && typeof parsed.answers === 'object') {
      Object.keys(parsed.answers).forEach(k => { answers.value[k] = parsed.answers[k] })
    }
    if (typeof parsed.currentQuestionIndex === 'number') currentIndex.value = parsed.currentQuestionIndex
    if (typeof parsed.questionRemaining === 'number' && parsed.questionRemaining > 0) questionRemaining.value = parsed.questionRemaining
    // If a per-question limit is configured, start the interval and schedule authoritative expiry using the restored remaining
    try { stopTimer(); clearPerQuestionLimit() } catch (e) {}
    if (typeof timePerQuestion.value === 'number' && Number.isFinite(timePerQuestion.value) && timePerQuestion.value > 0) {
      const remainingForSchedule = (typeof questionRemaining.value === 'number' && questionRemaining.value > 0 && questionRemaining.value < timePerQuestion.value) ? questionRemaining.value : undefined
      startTimer(timePerQuestion.value, remainingForSchedule)
      schedulePerQuestionLimit(timePerQuestion.value, () => {
        if (currentIndex.value < questions.value.length - 1) {
          pushAlert({ message: 'Time is up — moving to the next question', type: 'info' })
          nextQuestion(true)
        } else {
          submissionMessage.value = 'Time is over — submitting...'
          pushAlert({ message: 'Time is over — submitting...', type: 'info' })
          finishBattle()
        }
      }, remainingForSchedule)
    }
  } catch (e) {}
}

onBeforeUnmount(() => {
  stopTimer()
  try { stopTotalTimer() } catch (e) {}
  try { clearPerQuestionLimit() } catch (e) {}
  try { if (botInterval && botInterval.value) { clearInterval(botInterval.value); botInterval.value = null } } catch (e) {}
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

/* Simple animated dots for bot thinking */
.bot-dots {
  display: inline-block;
  width: 18px;
  height: 6px;
  position: relative;
}
.bot-dots::before, .bot-dots::after, .bot-dots span {
  content: '';
}
.bot-dots::before, .bot-dots::after {
  position: absolute;
  top: 0;
  width: 4px;
  height: 4px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bot-dot 1s infinite linear;
}
.bot-dots::before { left: 0; animation-delay: 0s }
.bot-dots::after { left: 7px; animation-delay: 0.15s }
.bot-dots span { position: absolute; left: 14px; top: 0; width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: bot-dot 1s infinite linear; animation-delay: 0.3s }

@keyframes bot-dot {
  0% { opacity: 0.2; transform: translateY(0) }
  50% { opacity: 1; transform: translateY(-4px) }
  100% { opacity: 0.2; transform: translateY(0) }
}

/* Countdown number pulse animation */
.countdown-number {
  animation: countdown-pulse 1s infinite linear;
}
@keyframes countdown-pulse {
  0% { transform: scale(1); opacity: 1 }
  50% { transform: scale(1.08); opacity: 0.95 }
  100% { transform: scale(1); opacity: 1 }
}
</style>