<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Preparing the arena...</p>
    </div>

    <!-- Main Battle UI -->
    <div v-if="!loading" class="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6">
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
            :player="battle.opponent || { first_name: 'Opponent', profile: { avatar: '/avatars/default.png' } }"
            role="Opponent"
            :score="opponentScore"
            :is-active="false"
            :answered="useBot ? botAnswered : 0"
          />

          <div class="flex items-center justify-center mt-2">
            <button v-if="!battle.opponent && !useBot" @click="startWithBot" class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">Start with a bot</button>
            <div v-else-if="useBot" class="text-sm text-gray-500 flex items-center gap-2">
              <span>Playing against QuizBot</span>
              <span v-if="botThinking" class="text-xs text-gray-400 flex items-center">
                <span class="bot-dots mr-1"> </span>
                thinking...
              </span>
            </div>
          </div>
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
                <QuestionCard :question="currentQuestion" v-model="answers[currentQuestion.id]" @select="onQuestionSelect" @toggle="(opt) => rawToggleMulti(currentQuestion.id, opt)" />
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
        <UButton v-else-if="lastSubmitFailed" type="button" @click="submitBattle" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Retry</UButton>
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

// Countdown alerts for total timer and per-question timer
watch(totalTimeLeft, (val) => {
  if (typeof val === 'number' && val <= 10 && val > 0) {
    pushAlert({ message: `${val} second${val === 1 ? '' : 's'} remaining`, type: 'info' })
  }
})

watch(questionRemaining, (val) => {
  const secs = Math.ceil(Number(val || 0))
  if (secs > 0 && secs <= 10) {
    pushAlert({ message: `${secs} second${secs === 1 ? '' : 's'} left for this question`, type: 'info' })
  }
})

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
    const res = await api.get(`/api/battles/${id}`)
    if (res.ok) {
      const j = await res.json()
      const data = j.battle || j
      battle.value = data
      questions.value = battle.value.questions || []
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
    }
  } catch (e) {
    console.error(e)
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
</style>