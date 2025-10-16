<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ battle.name || 'Epic Battle' }}</h1>
            <p class="text-gray-600 mt-1">Answer questions and compete!</p>
          </div>
        </div>
        <div>
          <NuxtLink :to="`/quizee/battles/${route.params.id}`" class="text-sm text-indigo-600">Back</NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div v-else>
        <div v-if="waitingForOpponent" class="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-6 text-center">
          <div class="mb-2 font-semibold">Waiting for an opponent to join...</div>
          <div class="text-sm text-gray-700">You can wait or start immediately with a bot opponent.</div>
          <div class="mt-4">
                  <button @click="startWithBot" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Start with Bot</button>
                  <button v-if="isInitiator" @click="enableSoloMode" class="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg">Take Solo (subscription required)</button>
          </div>
        </div>

        <template v-else>
          <div v-if="questions.length === 0" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div>No questions available for this battle.</div>
          </div>

          <div v-else>
            <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="text-sm text-gray-600">Question <span class="font-bold">{{ currentIndex + 1 }}</span> / {{ questions.length }}</div>
                  <div class="ml-4 text-sm text-gray-600">Time: {{ displayTime }}</div>
                </div>
                <div class="text-sm font-medium text-gray-700">Score: {{ score }}</div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 class="text-lg font-semibold mb-4" v-html="currentQuestion.body"></h2>
              <div class="space-y-3">
                <label v-for="(opt, idx) in (currentQuestion.options || [])" :key="idx" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border cursor-pointer">
                  <input type="radio" :name="'q-'+currentQuestion.id" :value="opt" v-model="answers[currentQuestion.id]" @change="selectAnswer(currentQuestion.id)" />
                  <span v-html="opt"></span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button @click="prevQuestion" :disabled="currentIndex===0" class="px-4 py-2 bg-gray-100 rounded-lg">Previous</button>
              <div>
                <button v-if="currentIndex < questions.length - 1" @click="nextQuestion" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Next</button>
                <button v-else @click="finishBattle" :disabled="!allAnswered" class="px-4 py-2 bg-green-600 text-white rounded-lg">Finish</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const id = route.params.id

const loading = ref(true)
const battle = ref({})
const questions = ref([])
const currentIndex = ref(0)
const answers = ref({})
const score = ref(0)
const timePerQuestion = ref(20)
const questionRemaining = ref(0)
const questionStartTs = ref(0)
let timer = null
const submissionMessage = ref('')
let submissionInterval = null

const waitingForOpponent = ref(false)
const useBot = ref(false)
const useSolo = ref(false)
// payment handled via centralized checkout page
let pollTimer = null
let _echoChannel = null

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const displayTime = computed(() => {
  const sec = Math.max(0, Math.ceil(questionRemaining.value))
  const m = Math.floor(sec/60).toString().padStart(2,'0')
  const s = Math.floor(sec%60).toString().padStart(2,'0')
  return `${m}:${s}`
})
const allAnswered = computed(() => Object.keys(answers.value).length === questions.value.length)

const cfg = useRuntimeConfig()

function startTimer() {
  stopTimer()
  questionRemaining.value = timePerQuestion.value
  questionStartTs.value = Date.now()
  timer = setInterval(() => {
    const elapsed = (Date.now() - questionStartTs.value) / 1000
    questionRemaining.value = Math.max(0, timePerQuestion.value - elapsed)
    if (questionRemaining.value <= 0) {
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value += 1
        questionStartTs.value = Date.now()
      } else {
        stopTimer()
      }
    }
  }, 250)
}
function stopTimer() { if (timer) { clearInterval(timer); timer = null } }

function selectAnswer(qid) {
  // save selected answer; backend scoring happens on submit
  // keep score local if the backend returns immediate scores later
}

function prevQuestion() { if (currentIndex.value>0) currentIndex.value -=1 }
function nextQuestion() { if (currentIndex.value < questions.value.length -1) currentIndex.value +=1 }

function startPollingForOpponent() {
  stopPollingForOpponent()
  attachEchoForJoin()
  pollTimer = setInterval(async () => {
    try {
      const resp = await fetch(cfg.public.apiBase + `/api/battles/${id}`, { credentials: 'include' })
      const json = await resp.json()
      const parts = json?.participants || []
      const count = Array.isArray(parts) ? parts.length : Object.keys(parts || {}).length
      if (count > 1) {
        waitingForOpponent.value = false
        stopPollingForOpponent()
      }
    } catch (e) {}
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
      waitingForOpponent.value = false
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
      // show short saving message; defer marking to checkout
      submissionMessage.value = 'Saving answers...'
      const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: qid, selected: answers.value[qid] })), defer_marking: true }
      const res = await fetch(cfg.public.apiBase + `/api/battles/${id}/solo-complete`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Solo completion failed')
    const json = await res.json()
    // Check subscription before showing detailed results
    // check subscription; if inactive, show modal instead of redirect
    try {
      const { fetchSubscription, subscription } = await import('~/composables/useSubscription.js').then(m => m.useSubscription())
      await fetchSubscription(cfg)
      const sub = subscription.value
      const isActive = sub && (sub.status === 'active' || sub.status === 'paid')
      if (!isActive) {
        router.push(`/quizee/payments/checkout?type=battle&id=${id}`)
        return
      }
    } catch (e) {
      console.warn('Subscription check failed', e)
    }

  // stop saving message and redirect to checkout for marking/results
  if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
  submissionMessage.value = ''
  router.push(`/quizee/payments/checkout?type=battle&id=${id}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onPaid() {
  // re-check subscription and navigate to results when payment finishes
  const cfg = useRuntimeConfig()
    // payment handled on /quizee/payments/checkout
}
async function submitBattle() {
  try {
    loading.value = true
  // only show a short saving note; actual marking happens after checkout
  submissionMessage.value = 'Saving answers...'
  const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: qid, selected: answers.value[qid] })), defer_marking: true }
  await fetch(cfg.public.apiBase + `/api/battles/${id}/submit`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
    const qs = useBot.value ? '?bot=1' : ''
    // redirect to centralized checkout for marking/results
    if (submissionInterval) { clearInterval(submissionInterval); submissionInterval = null }
    submissionMessage.value = ''
    window.$toast?.info?.('Results are available for subscribed users. Please subscribe to view results.')
    router.push(`/quizee/payments/checkout?type=battle&id=${id}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch(cfg.public.apiBase + `/api/battles/${id}`, { credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      battle.value = j.battle || j
      questions.value = battle.value.questions || []
    }
    // start waiting/polling if only one participant
    const b = battle.value
    const parts = (b && b.participants) || []
    if (!Array.isArray(parts) || parts.length <= 1) {
      waitingForOpponent.value = true
      startPollingForOpponent()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    if (questions.value.length > 0) startTimer()
  }
})

onBeforeUnmount(() => {
  stopTimer(); stopPollingForOpponent()
  detachEchoForJoin()
})
</script>

<!-- Payment handled centrally on checkout page; no inline modal -->

