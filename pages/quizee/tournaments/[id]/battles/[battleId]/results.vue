<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Battle Results</h1>
        <p class="text-gray-600">Here are the results for this battle.</p>
      </div>

      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
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
              <div class="text-3xl font-bold text-gray-900">{{ getScore(result) }}</div>
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
              <div class="flex items-center gap-3">
                <img 
                  :src="getParticipantAvatar(p)" 
                  :alt="p.name || (p.user && p.user.name) || 'Participant'" 
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div class="font-medium text-gray-900">{{ p.name || (p.user && p.user.name) || 'You' }}</div>
                  <div class="text-sm text-gray-600">{{ p.meta || p.description || '' }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold">{{ getScore(p) }}</div>
                <div class="text-sm text-gray-500">{{ p.correct }}/{{ p.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Questions for both participants when available -->
        <div v-if="result.questions && result.questions.length" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h3 class="text-xl font-semibold mb-4">Detailed Answers</h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="(q, idx) in result.questions" :key="q.question_id" class="p-4 rounded-lg border bg-white">
              <div class="mb-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-sm">{{ idx + 1 }}</div>
                  <p class="font-semibold text-gray-800">Question {{ idx + 1 }}</p>
                </div>
                <div class="text-gray-700 text-base mb-3" v-html="q.body"></div>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                  <div>Marks: <span class="font-medium text-gray-900">{{ marksForQuestion(q) }}</span></div>
                  <div>Your: <span class="font-medium text-primary-600">{{ pointsForSide(q, mySide()) }}</span></div>
                  <div>Opponent: <span class="font-medium text-gray-900">{{ pointsForSide(q, mySide() === 'initiator' ? 'opponent' : 'initiator') }}</span></div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 rounded-lg" :class="(mySide() === 'initiator' ? (q.initiator && q.initiator.correct_flag) : (q.opponent && q.opponent.correct_flag)) ? 'bg-primary-50 border border-primary-200 text-primary-800' : 'bg-red-50 border border-red-200 text-red-800'">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold">Your Answer</div>
                    <div class="text-sm text-gray-500">{{ pointsForSide(q, mySide()) }} pts</div>
                  </div>
                  <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, mySide() === 'initiator' ? (q.initiator && q.initiator.selected) : (q.opponent && q.opponent.selected)) }}</div>
                  <div class="mt-1 text-xs" :class="(mySide() === 'initiator' ? (q.initiator && q.initiator.correct_flag) : (q.opponent && q.opponent.correct_flag)) ? 'text-primary-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (q.initiator && q.initiator.correct_flag) : (q.opponent && q.opponent.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                </div>

                <div class="p-4 rounded-lg" :class="(mySide() === 'initiator' ? (q.opponent && q.opponent.correct_flag) : (q.initiator && q.initiator.correct_flag)) ? 'bg-primary-50 border border-primary-200 text-primary-800' : 'bg-red-50 border border-red-200 text-red-800'">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold">Opponent's Answer</div>
                    <div class="text-sm text-gray-500">{{ pointsForSide(q, mySide() === 'initiator' ? 'opponent' : 'initiator') }} pts</div>
                  </div>
                  <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, mySide() === 'initiator' ? (q.opponent && q.opponent.selected) : (q.initiator && q.initiator.selected)) }}</div>
                  <div class="mt-1 text-xs" :class="(mySide() === 'initiator' ? (q.opponent && q.opponent.correct_flag) : (q.initiator && q.initiator.correct_flag)) ? 'text-primary-600' : 'text-red-600'">{{ (mySide() === 'initiator' ? (q.opponent && q.opponent.correct_flag) : (q.initiator && q.initiator.correct_flag)) ? 'Correct' : 'Incorrect' }}</div>
                </div>
              </div>

              <div class="mt-4 p-4 rounded-lg bg-primary-50 border border-primary-200 text-primary-800">
                <div class="font-semibold">✓ Correct Answer</div>
                <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, q.correct) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <NuxtLink :to="`/quizee/tournaments/${route.params.id}/battles`" class="px-6 py-3 bg-gray-100 rounded-lg">Back to Battles</NuxtLink>
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
import { useApi } from '~/composables/useApi'
import { useAnswerStore } from '~/stores/answerStore'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'
import { resolveAssetUrl } from '~/composables/useAssets'
import { normalizeAnswer } from '~/composables/useAnswerNormalization'
const route = useRoute()
const answerStore = useAnswerStore()
const loading = ref(true)
const result = ref<any>(null)
const participants = ref<any[]>([])
const auth = useAuthStore()
const user = computed<any>(() => auth.user as any)
const cfg = useRuntimeConfig()
const api = useApi()

// Bot synthesis removed from tournament results — bots belong in the standalone battle take flow.

onMounted(async () => {
  const api = useApi()
  try {
    const tid = route.params.id
    const bid = route.params.battleId
    
    // Check if we have cached results first to avoid redundant API calls
    if (answerStore.hasAttemptForReview(String(bid))) {
      const cached = answerStore.getAttemptForReview(String(bid))
      if (cached?.attempt) {
        result.value = cached.attempt
        loading.value = false
        // If participants are not in cache, we still might need to fetch them
        // but often the attempt object has what we need
        if (result.value.participants || result.value.participants_list) {
           participants.value = result.value.participants || result.value.participants_list
           return
        }
      }
    }

    const q = route.query || {}
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

      // Cache the result for future review
      if (result.value) {
        answerStore.storeAttemptForReview(String(bid), { attempt: result.value, participants: participants.value })
      }
    }

    // Do not synthesize bots for tournament battles. Tournament results should only show real participants.
  } catch (e) {
    console.error('Error fetching tournament battle results', e)
  } finally {
    loading.value = false
  }
})

  function getScore(item: any) {
    if (!item) return 0
    return item.score ?? item.points ?? item.points_earned ?? item.pointsEarned ?? item.total_points ?? 0
  }

  const rankLabel = computed(() => {
    if (!participants.value.length || !result.value) return '-'
    const sorted = [...participants.value].sort((a, b) => (getScore(b) || 0) - (getScore(a) || 0))
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

function getParticipantAvatar(participant: any): string {
  // Backend returns avatar_url (primary DB column) and avatar (accessor)
  const avatarUrl = participant?.avatar_url || participant?.avatar || null
  return resolveAssetUrl(avatarUrl) || '/logo/avatar-placeholder.png'
}

/**
 * Format a selected value into human readable text. Handles option objects, indices and normalized strings.
 */
function formatSelected(q: any, selected: any) {
  try {
    if (selected === null || typeof selected === 'undefined' || selected === '') return 'No answer'

    const optionObjs = (q && Array.isArray(q.options)) ? q.options : null

    const mapOne = (val: any) => {
      if (val && typeof val === 'object') return (val.body || val.text || val.label || String(val))
      if (optionObjs && (typeof val === 'string' || typeof val === 'number') && String(val).match(/^\d+$/)) {
        const idx = Number(val)
        const opt = optionObjs[idx]
        return opt ? (opt.text || opt.body || opt.label || String(opt)) : String(val)
      }
      if (optionObjs && typeof val === 'string') {
        const norm = normalizeAnswer(val)
        const found = optionObjs.find((o: any) => normalizeAnswer(o) === norm)
        if (found) return (found.text || found.body || found.label || String(found))
      }
      return String(val)
    }

    if (Array.isArray(selected)) return selected.map(s => mapOne(s)).join(', ')
    return mapOne(selected)
  } catch (e) {
    return Array.isArray(selected) ? selected.join(', ') : (selected?.toString() || 'No answer')
  }
}

function marksForQuestion(q: any) {
  return q?.marks ?? q?.points ?? 1
}

function pointsForSide(q: any, side: 'initiator' | 'opponent') {
  const fullMarks = marksForQuestion(q)
  if (side === 'initiator') return (q.initiator && q.initiator.correct_flag) ? fullMarks : 0
  return (q.opponent && q.opponent.correct_flag) ? fullMarks : 0
}
</script>