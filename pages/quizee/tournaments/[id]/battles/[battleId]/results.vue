<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Battle Results</h1>
        <p class="text-gray-600">Here are the results for this battle.</p>
      </div>

      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-4 text-lg text-gray-600">Loading results...</span>
        </div>
      </div>

      <div v-else-if="result">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ result.score }}</div>
              <div class="text-gray-600">Your Points</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ result.correct }}/{{ result.total }}</div>
              <div class="text-gray-600">Correct Answers</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ rankLabel }}</div>
              <div class="text-gray-600">Rank</div>
            </div>
          </div>
        </div>

        <!-- Opponents / Participants -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 class="text-lg font-semibold mb-4">Participants</h3>
          <div class="space-y-3">
            <div v-for="p in participants" :key="p.id || p.name" class="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div class="font-medium text-gray-900">{{ p.name || (p.user && p.user.name) || 'You' }}</div>
                <div class="text-sm text-gray-600">{{ p.meta || p.description || '' }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold">{{ p.score }}</div>
                <div class="text-sm text-gray-500">{{ p.correct }}/{{ p.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Questions for both participants when available -->
        <div v-if="result.questions && result.questions.length" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h3 class="text-xl font-semibold mb-4">Detailed Answers</h3>
          <div class="space-y-4">
            <div v-for="(q, idx) in result.questions" :key="q.question_id" class="p-4 border rounded-lg">
              <div class="font-medium text-gray-900">{{ idx + 1 }}. <span v-html="q.body"></span></div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div class="p-3 border rounded-lg">
                  <div class="text-sm font-medium">{{ mySide() === 'initiator' ? 'Your Answer' : 'Opponent Answer' }}</div>
                  <div class="mt-1 text-sm">{{ (mySide() === 'initiator' ? (q.initiator && q.initiator.selected) : (q.opponent && q.opponent.selected)) || 'No answer' }}</div>
                  <div class="mt-1 text-sm" :class="(mySide() === 'initiator' ? (q.initiator && q.initiator.correct_flag) : (q.opponent && q.opponent.correct_flag)) ? 'text-green-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (q.initiator && q.initiator.correct_flag) : (q.opponent && q.opponent.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                </div>

                <div class="p-3 border rounded-lg">
                  <div class="text-sm font-medium">{{ mySide() === 'initiator' ? 'Opponent Answer' : 'Your Answer' }}</div>
                  <div class="mt-1 text-sm">{{ (mySide() === 'initiator' ? (q.opponent && q.opponent.selected) : (q.initiator && q.initiator.selected)) || 'No answer' }}</div>
                  <div class="mt-1 text-sm" :class="(mySide() === 'initiator' ? (q.opponent && q.opponent.correct_flag) : (q.initiator && q.initiator.correct_flag)) ? 'text-green-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (q.opponent && q.opponent.correct_flag) : (q.initiator && q.initiator.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                </div>

                <div class="p-3 border rounded-lg bg-green-50">
                  <div class="text-sm font-medium">Correct Answer</div>
                  <div class="mt-1 text-sm">{{ q.correct }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <NuxtLink to="/quizee/tournaments/{{ route.params.id }}/battles" class="px-6 py-3 bg-gray-100 rounded-lg">Back to Battles</NuxtLink>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
        <p class="text-gray-600">Unable to load your battle results at this time.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'quizee' })
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'
const route = useRoute()
const loading = ref(true)
const result = ref<any>(null)
const participants = ref<any[]>([])
const auth = useAuthStore()
const user = computed<any>(() => auth.user as any)
const cfg = useRuntimeConfig()

function synthesizeBot(user: any) {
  // make a bot that scores slightly lower than the user
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
  const api = useApi()
  try {
    const q = route.query || {}
    // Try endpoint to fetch a result for tournament battle
    const tid = route.params.id
    const bid = route.params.battleId
    let fetched: any = null
      try {
        const res = await api.get(`/api/tournaments/${tid}/battles/${bid}/result`)
        if (api.handleAuthStatus(res)) return
        if (res && res.ok) fetched = await res.json()
      } catch (e) {
        // fallback to fetching the battle resource
        try {
          const res2 = await api.get(`/api/tournaments/${tid}/battles/${bid}`)
          if (api.handleAuthStatus(res2)) return
          if (res2 && res2.ok) fetched = await res2.json()
        } catch (e2) {
          // ignore
        }
      }

    const data = (fetched && (fetched.result || fetched.data || fetched)) || null
    if (data) {
      // normalize user result and participants
      const parts = (data.participants || data.participants_list || []) as any[]
      if (Array.isArray(parts) && parts.length) {
        participants.value = parts
        if (data.result && data.result.questions) {
          result.value = data.result
        } else {
          const me = parts.find((p: any) => p.is_me || p.user?.is_me || (user.value && p.user && p.user.id === user.value.id)) || parts[0]
          result.value = me
        }
      } else if (data.result) {
        result.value = data.result
      } else if (data.user_result) {
        result.value = data.user_result
      } else {
        result.value = data
      }
    }

    // If the query requests a bot, or if there are no other participants, synthesize one
    if (route.query.bot === '1' || (participants.value.length <= 1 && result.value)) {
      const bot = synthesizeBot(result.value)
      participants.value = [
        { id: result.value.id || 'me', name: 'You', score: result.value.score, correct: result.value.correct, total: result.value.total },
        bot
      ]
    }
  } catch (e) {
    console.error('Error fetching tournament battle results', e)
  } finally {
    loading.value = false
  }
})

const rankLabel = computed(() => {
  if (!participants.value.length || !result.value) return '-'
  const sorted = [...participants.value].sort((a, b) => (b.score || 0) - (a.score || 0))
  const meId = user.value?.id || (result.value as any).id || 'me'
  const idx = sorted.findIndex(p => p.id === meId || p.name === 'You' || (p.user && p.user.id === meId))
  return idx >= 0 ? `#${idx + 1}` : '-'
})

function mySide() {
  if (!user.value || !result.value) return 'initiator'
  const meId = user.value.id
  if ((result.value as any).battle) {
    if ((result.value as any).battle.initiator_id === meId) return 'initiator'
    if ((result.value as any).battle.opponent_id === meId) return 'opponent'
  }
  return 'initiator'
}
</script>