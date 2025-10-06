<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Battle Complete!</span>
        </h1>
        <p class="text-xl text-gray-600">Here's how you performed in this epic quiz battle</p>
      </div>

      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-4">
            <svg class="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-lg text-gray-600">Loading your results...</span>
          </div>
        </div>
      </div>

      <div v-else-if="result">
        <!-- Score Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div class="text-3xl font-bold text-gray-900 mb-2">{{ result.score }}</div>
            <div class="text-gray-600 font-medium">Total Points</div>
          </div>
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div class="text-3xl font-bold text-gray-900 mb-2">{{ result.initiator_correct }} / {{ result.total }}</div>
            <div class="text-gray-600 font-medium">Your Correct Answers</div>
          </div>
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div class="text-3xl font-bold text-gray-900 mb-2">{{ rankLabel }}</div>
            <div class="text-gray-600 font-medium">Your Rank</div>
          </div>
        </div>

        <!-- Participants -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 class="text-lg font-semibold mb-4">Participants</h3>
          <div class="space-y-3">
            <!-- Keep participants list for backward compatibility / bots -->
            <div v-for="p in participants" :key="p.id || p.name" class="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div class="font-medium text-gray-900">{{ p.name || (p.user && p.user.name) || 'You' }}</div>
                <div class="text-sm text-gray-600">{{ p.meta || '' }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold">{{ p.score }}</div>
                <div class="text-sm text-gray-500">{{ p.correct }}/{{ p.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Questions -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h3 class="text-2xl font-bold mb-4">Detailed Results</h3>
          <div class="space-y-4">
            <div v-for="(r, index) in result.questions || []" :key="r.question_id" class="border border-gray-200 rounded-xl p-6">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-500 text-white">
                    {{ index + 1 }}
                  </div>
                </div>

                <div class="flex-1">
                  <div class="font-semibold text-gray-900 mb-3" v-html="r.body"></div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-4 rounded-lg border">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-medium text-gray-900">{{ mySide() === 'initiator' ? 'Your Answer' : 'Opponent Answer' }}</span>
                      </div>
                      <p class="text-gray-700" v-html="(mySide() === 'initiator' ? (r.initiator && r.initiator.selected) : (r.opponent && r.opponent.selected)) || 'No answer'"></p>
                      <div class="text-sm mt-2" :class="(mySide() === 'initiator' ? (r.initiator && r.initiator.correct_flag) : (r.opponent && r.opponent.correct_flag)) ? 'text-green-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (r.initiator && r.initiator.correct_flag) : (r.opponent && r.opponent.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                    </div>

                    <div class="bg-white p-4 rounded-lg border">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-medium text-gray-900">{{ mySide() === 'initiator' ? 'Opponent Answer' : 'Your Answer' }}</span>
                      </div>
                      <p class="text-gray-700" v-html="(mySide() === 'initiator' ? (r.opponent && r.opponent.selected) : (r.initiator && r.initiator.selected)) || 'No answer'"></p>
                      <div class="text-sm mt-2" :class="(mySide() === 'initiator' ? (r.opponent && r.opponent.correct_flag) : (r.initiator && r.initiator.correct_flag)) ? 'text-green-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (r.opponent && r.opponent.correct_flag) : (r.initiator && r.initiator.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                    </div>

                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-medium text-gray-900">Correct Answer</span>
                      </div>
                      <p class="text-green-700 font-medium" v-html="r.correct"></p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-600">Your time: {{ (r.initiator && r.initiator.time_taken) ? r.initiator.time_taken + 's' : 'N/A' }}</span>
                      <span class="text-sm text-gray-600">Opponent time: {{ (r.opponent && r.opponent.time_taken) ? r.opponent.time_taken + 's' : 'N/A' }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-600">Points: <span class="font-bold">{{ (r.initiator && r.initiator.correct_flag) ? '+1' : '0' }}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/student/battles" class="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold">
            Back to Battles
          </NuxtLink>

          <button @click="playAgain" class="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105">
            Play Again
          </button>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.912-2.416"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
        <p class="text-gray-600">Unable to load your battle results at this time.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'student' })
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
const route = useRoute()
const router = useRouter()
const id = route.params.id
const result = ref(null)
const loading = ref(true)
const participants = ref([])
const auth = useAuthStore()
const cfg = useRuntimeConfig()

function synthesizeBot(user) {
  const userScore = Number(user?.score || 0)
  const delta = Math.max(1, Math.min(5, Math.floor(Math.random() * 5) + 1))
  const botScore = Math.max(0, userScore - delta)
  const botCorrect = Math.max(0, Number(user?.correct || 0) - Math.floor(delta / 1.5))
  const botTotal = Number(user?.total || 0)
  return {
    id: 'bot-1',
    name: 'QuizBot',
    score: botScore,
    correct: botCorrect,
    total: botTotal,
    meta: 'Autogenerated bot opponent'
  }
}

onMounted(async () => {
  try {
    const res = await fetch(cfg.public.apiBase + `/api/battles/${id}/result`, { credentials: 'include' })
    let data = null
    if (res.ok) {
      const j = await res.json()
      data = j.result || j
    }

    if (data) {
      // normalize
      if (data.participants && Array.isArray(data.participants) && data.participants.length) {
        participants.value = data.participants
        // If API provides initiator/opponent mapping on questions, preserve result as full result object
        if (data.result && data.result.questions) {
          result.value = data.result
        } else {
          const me = participants.value.find((p) => p.is_me || (p.user && p.user.is_me) || (auth.user && p.user && p.user.id === auth.user.id)) || participants.value[0]
          result.value = me
        }
      } else if (data.result) {
        result.value = data.result
      } else {
        result.value = data
      }
    }

    if (route.query.bot === '1' || (participants.value.length <= 1 && result.value)) {
      const bot = synthesizeBot(result.value)
      participants.value = [
        { id: result.value.id || 'me', name: 'You', score: result.value.score, correct: result.value.correct, total: result.value.total },
        bot
      ]
    }
  } catch (e) {
    console.error('Error fetching battle result', e)
  } finally {
    loading.value = false
  }
})

const rankLabel = computed(() => {
  if (!participants.value.length || !result.value) return '-'
  const sorted = [...participants.value].sort((a, b) => (b.score || 0) - (a.score || 0))
  const meId = auth.user?.id || result.value.id || 'me'
  const idx = sorted.findIndex(p => p.id === meId || p.name === 'You' || (p.user && p.user.id === meId))
  return idx >= 0 ? `#${idx + 1}` : '-'
})

// helper to determine which side (initiator/opponent) belongs to current user
function mySide() {
  if (!auth.user || !result.value) return 'initiator'
  const meId = auth.user.id
  // if result is full result with per-question initiator/opponent, try matching by battle user ids
  if (result.value.battle) {
    if (result.value.battle.initiator_id === meId) return 'initiator'
    if (result.value.battle.opponent_id === meId) return 'opponent'
  }
  // fallback: if result has initiator_correct/opponent_correct, assume initiator is 'you' when initiator_correct equals result.initiator_correct and result.value has an id
  return 'initiator'
}

function playAgain() {
  router.push('/student/battles')
}
</script>

<style scoped>
</style>
