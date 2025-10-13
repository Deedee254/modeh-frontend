<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Battle Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ battle.name || 'Epic Battle' }}</h1>
              <p class="text-gray-600 mt-1">Test your knowledge in this competitive quiz battle!</p>
            </div>
          </div>

          <!-- Live Status -->
            <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="font-medium">Live Battle</span>
            </div>
            <button @click="enterBattle" class="ml-3 inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg">Enter Battle</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-4">
            <svg class="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-lg text-gray-600">Loading battle questions...</span>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Questions Tab (kept simple for now) -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div v-if="questions.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
            <p class="text-gray-600">This battle doesn't have any questions yet.</p>
          </div>

          <div v-else>
            <!-- Progress Header -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-4">
                <div class="text-sm text-gray-600">
                  Question <span class="font-bold text-indigo-600">{{ currentIndex + 1 }}</span> of {{ questions.length }}
                </div>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-mono font-semibold">{{ displayTime }}</span>
                </div>
                <div class="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-semibold">{{ score }} points</span>
                </div>
              </div>
            </div>

            <!-- Question Card -->
            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 mb-8">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold">{{ currentIndex + 1 }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-4" v-html="currentQuestion.body"></h3>

                  <div class="space-y-3">
                    <div v-for="(opt, i) in (currentQuestion.options || [])" :key="i" class="group">
                      <label class="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 cursor-pointer transition-all duration-200 hover:shadow-md">
                        <input type="radio" :name="'q-'+currentQuestion.id" :value="opt" v-model="answers[currentQuestion.id]" @change="selectAnswer(currentQuestion.id)" class="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-gray-700 font-medium group-hover:text-indigo-700 transition-colors" v-html="opt"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between">
              <button @click="prevQuestion" :disabled="currentIndex === 0" class="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>

              <div class="flex items-center gap-3">
                <button v-if="currentIndex < questions.length - 1" @click="nextQuestion" class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  Next
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>

                <button v-else @click="submitAnswers" class="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Submit Battle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// page meta and quizee layout
definePageMeta({ layout: 'quizee' })
useHead({
  title: 'Battle Room — Modeh',
  meta: [
    { name: 'description', content: 'Enter the battle room and answer questions against opponents. Good luck!' },
    { property: 'og:title', content: 'Battle Room — Modeh' },
    { property: 'og:description', content: 'Enter the battle room and answer questions against opponents. Good luck!' }
  ]
})
const route = useRoute()
const router = useRouter()
const id = route.params.id
const questions = ref([])
const loading = ref(true)
const answers = ref({})
const battle = ref({})
const cfg = useRuntimeConfig()

// UI tabs (kept minimal for now)
const activeTab = ref('questions')

// local score tracking and timers
const score = ref(0)
const currentIndex = ref(0)
const timePerQuestion = ref(20)
const questionRemaining = ref(0)
const timer = ref(null)
const questionStartTs = ref(null)
const perQuestionTimings = ref({})

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const displayTime = computed(() => {
  const sec = Math.max(0, Math.ceil(questionRemaining.value))
  const m = Math.floor(sec/60).toString().padStart(2,'0')
  const s = Math.floor(sec%60).toString().padStart(2,'0')
  return `${m}:${s}`
})

onMounted(async () => {
  try {
    const res = await fetch(cfg.public.apiBase + `/api/battles/${id}`, { credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      battle.value = j.battle || j
      if (battle.value.questions && Array.isArray(battle.value.questions) && battle.value.questions.length > 0) {
        questions.value = battle.value.questions
      } else {
        const s = battle.value.settings || {}
        const params = new URLSearchParams()
        params.set('random', '1')
        params.set('per_page', s.per_page || 10)
        if (s.topic) params.set('topic', s.topic)
        if (s.subject) params.set('subject', s.subject)
        if (s.difficulty) params.set('difficulty', s.difficulty)
        if (s.grade) params.set('grade', s.grade)
        const qb = await fetch(cfg.public.apiBase + '/api/question-bank?' + params.toString(), { credentials: 'include' })
        if (qb.ok) { const qbj = await qb.json(); questions.value = qbj.questions || qbj || [] }
      }
    }
  } catch (e) { }
  loading.value = false
  if (questions.value.length > 0) startTimer()
})

function startTimer() {
  stopTimer()
  questionRemaining.value = timePerQuestion.value
  questionStartTs.value = Date.now()
  timer.value = setInterval(() => {
    const elapsed = (Date.now() - questionStartTs.value) / 1000
    questionRemaining.value = Math.max(0, timePerQuestion.value - elapsed)
    if (questionRemaining.value <= 0) {
      recordTimingForQuestion(currentQuestion.value.id, timePerQuestion.value)
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value += 1
        questionStartTs.value = Date.now()
        questionRemaining.value = timePerQuestion.value
      } else {
        stopTimer()
      }
    }
  }, 250)
}

function stopTimer() { if (timer.value) { clearInterval(timer.value); timer.value = null } }
function recordTimingForQuestion(qid, seconds) { perQuestionTimings.value = { ...perQuestionTimings.value, [qid]: seconds } }

function selectAnswer(qid) {
  const elapsed = Math.max(0, (Date.now() - questionStartTs.value) / 1000)
  recordTimingForQuestion(qid, Math.min(elapsed, timePerQuestion.value))
  answers.value[qid] = answers.value[qid] || null
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    recordTimingForQuestion(currentQuestion.value.id, Math.max(0, (Date.now() - questionStartTs.value) / 1000))
    currentIndex.value -= 1
    questionStartTs.value = Date.now()
    questionRemaining.value = timePerQuestion.value
  }
}

function nextQuestion() {
  recordTimingForQuestion(currentQuestion.value.id, Math.max(0, (Date.now() - questionStartTs.value) / 1000))
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1
    questionStartTs.value = Date.now()
    questionRemaining.value = timePerQuestion.value
  }
}

onUnmounted(() => { stopTimer() })

watch(questions, (q) => {
  if (q && q.length > 0) {
    q.forEach(qq => { answers.value[qq.id] = null })
    score.value = 0
    currentIndex.value = 0
    questionRemaining.value = timePerQuestion.value
    questionStartTs.value = Date.now()
    startTimer()
  }
})

const auth = useAuthStore()
function ensureAuthRedirect(redirectTo) {
  if (!auth.user) {
    window.location.href = `/login?next=${encodeURIComponent(redirectTo || window.location.pathname)}`
    return false
  }
  return true
}

async function enterBattle() {
  if (!ensureAuthRedirect(`/quizee/battles/${id}/play`)) return
  try {
    await fetch(cfg.public.apiBase + `/api/battles/${id}/join`, { method: 'POST', credentials: 'include' })
  } catch (e) {}
  router.push(`/quizee/battles/${id}/play`)
}

async function submitAnswers() {
  if (!ensureAuthRedirect(`/quizee/battles/${id}`)) return
  try {
    const payload = { answers: Object.keys(answers.value).map(qid => ({ question_id: qid, selected: answers.value[qid], time_taken: perQuestionTimings.value[qid] || null })), meta: { score: score.value } }
    const res = await fetch(cfg.public.apiBase + `/api/battles/${id}/submit`, { method: 'POST', credentials: 'include', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) { router.push(`/quizee/battles/${id}/result`) }
  } catch (e) { console.error(e) }
}

</script>
