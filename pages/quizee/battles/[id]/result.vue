<template>
  <div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <PageHero
        v-if="result?.battle"
        :title="result.battle.name || 'Battle Results'"
        :description="`Review the outcome of your epic clash against ${opponent?.name || 'your opponent'}.`"
        :breadcrumbs="[
          { text: 'Dashboard', href: '/quizee/dashboard' },
          { text: 'Battles', href: '/quizee/battles' },
          { text: 'Result', current: true }
        ]"
      />

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-gray-500">
          <svg class="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-lg">Loading results...</span>
        </div>
      </div>

      <div v-else-if="!result" class="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">Results Not Found</h3>
        <p class="text-gray-600">We couldn't load the results for this battle. It might still be in progress.</p>
        <div class="mt-6">
          <NuxtLink to="/quizee/battles" class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700">
            Back to Battles
          </NuxtLink>
        </div>
      </div>

      <div v-else>
        <!-- Result Summary -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div class="text-center mb-6">
            <div class="text-4xl font-bold" :class="resultClass">{{ resultLabel }}</div>
            <p class="text-gray-600 mt-1">Final Score: {{ myScore }} - {{ opponentScore }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <!-- My Stats -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center justify-center gap-3 mb-2">
                      <img :src="meAvatar || '/images/default-avatar.png'" class="w-10 h-10 rounded-full" />
                <h3 class="text-lg font-semibold text-gray-800">{{ me?.name || 'You' }}</h3>
              </div>
              <div class="text-3xl font-bold text-gray-900">{{ myScore }}</div>
              <div class="text-sm text-gray-500">Points</div>
            </div>
            <!-- Opponent Stats -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center justify-center gap-3 mb-2">
                  <img :src="opponentAvatar || '/images/default-avatar.png'" class="w-10 h-10 rounded-full" />
                <h3 class="text-lg font-semibold text-gray-800">{{ opponent?.name || 'Opponent' }}</h3>
              </div>
              <div class="text-3xl font-bold text-gray-900">{{ opponentScore }}</div>
              <div class="text-sm text-gray-500">Points</div>
            </div>
          </div>
        </div>

        <!-- Detailed Answers -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Question Breakdown</h3>
          <div class="space-y-6">
            <div v-for="(q, index) in result.questions" :key="q.question_id" class="border-b border-gray-200 pb-6 last:border-b-0">
              <div class="mb-4">
                <p class="font-semibold text-gray-800">Question {{ index + 1 }}</p>
                <div class="text-gray-700" v-html="q.body"></div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <!-- Your Answer -->
                <div class="p-4 rounded-lg" :class="myAnswerClass(q)">
                  <p class="font-semibold mb-1">Your Answer</p>
                  <p class="font-mono">{{ formatSelected(q, myAnswer(q)?.selected) }}</p>
                </div>
                <!-- Opponent's Answer -->
                <div class="p-4 rounded-lg" :class="opponentAnswerClass(q)">
                  <p class="font-semibold mb-1">Opponent's Answer</p>
                  <p class="font-mono">{{ formatSelected(q, opponentAnswer(q)?.selected) }}</p>
                </div>
                <!-- Correct Answer -->
                <div class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                  <p class="font-semibold mb-1">Correct Answer</p>
                  <p class="font-mono">{{ formatSelected(q, q.correct) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import resolveAssetUrl from '~/composables/useAssets'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAnswerStore } from '~/stores/answerStore'
import PageHero from '~/components/ui/PageHero.vue'

definePageMeta({ layout: 'quizee' })

const route = useRoute()
const auth = useAuthStore()
const cfg = useRuntimeConfig()
const answerStore = useAnswerStore()

const loading = ref(true)
const result = ref(null)

const battleId = route.params.id

onMounted(async () => {
  // Check if we have cached results first
  if (answerStore.hasAttemptForReview(battleId)) {
    const cached = answerStore.getAttemptForReview(battleId)
    if (cached?.result) {
      result.value = cached.result
    }
  }

  try {
    const res = await $fetch(`/api/battles/${battleId}/result`, {
      baseURL: cfg.public.apiBase,
      credentials: 'include'
    })
    // $fetch automatically unwraps the response
    // Support two possible response shapes:
    // 1) { battle: {...}, questions: [...] } (older shape)
    // 2) { ok: true, result: { battle: {...}, questions: [...] } } (current shape)
    if (res?.battle) {
      result.value = res
      // Cache the results for future use
      answerStore.storeAttemptForReview(battleId, res)
    } else if (res?.result) {
      // set result to the inner result object so template bindings like
      // result.battle and result.questions continue to work
      result.value = res.result
      answerStore.storeAttemptForReview(battleId, res.result)
    }
  } catch (error) {
    console.error("Failed to fetch battle results:", error)
    // Show the error state
    result.value = null
  } finally {
    loading.value = false
  }
})

const me = computed(() => {
  if (!auth.user || !result.value?.battle) return null
  const battle = result.value.battle
  if (battle.initiator_id === auth.user.id) return battle.initiator
  if (battle.opponent_id === auth.user.id) return battle.opponent
  return null
})

const opponent = computed(() => {
  if (!auth.user || !result.value?.battle) return null
  const battle = result.value.battle
  if (battle.initiator_id === auth.user.id) return battle.opponent
  if (battle.opponent_id === auth.user.id) return battle.initiator
  return null
})

const myScore = computed(() => {
  if (!auth.user || !result.value?.battle) return '?'
  const battle = result.value.battle
  return battle.initiator_id === auth.user.id ? battle.initiator_points : battle.opponent_points
})

const opponentScore = computed(() => {
  if (!auth.user || !result.value?.battle) return '?'
  const battle = result.value.battle
  return battle.initiator_id === auth.user.id ? battle.opponent_points : battle.initiator_points
})

const meAvatar = computed(() => {
  try { return resolveAssetUrl(me.value?.avatar) || me.value?.avatar || null } catch { return me.value?.avatar || null }
})

const opponentAvatar = computed(() => {
  try { return resolveAssetUrl(opponent.value?.avatar) || opponent.value?.avatar || null } catch { return opponent.value?.avatar || null }
})

const resultLabel = computed(() => {
  if (!result.value?.battle) return 'In Progress'
  const battle = result.value.battle
  if (battle.status !== 'completed') return 'In Progress'
  if (battle.winner_id === null) return 'It\'s a Tie!'
  return battle.winner_id === auth.user?.id ? 'Victory!' : 'Defeat'
})

const resultClass = computed(() => {
  if (!result.value?.battle || result.value.battle.status !== 'completed') return 'text-gray-700'
  if (result.value.battle.winner_id === null) return 'text-yellow-500'
  return result.value.battle.winner_id === auth.user?.id ? 'text-green-500' : 'text-red-500'
})

const myAnswer = (q) => {
  if (!auth.user || !result.value?.battle) return null
  return result.value.battle.initiator_id === auth.user.id ? q.initiator : q.opponent
}

const opponentAnswer = (q) => {
  if (!auth.user || !result.value?.battle) return null
  return result.value.battle.initiator_id === auth.user.id ? q.opponent : q.initiator
}

const myAnswerClass = (q) => {
  const answer = myAnswer(q)
  if (!answer) return 'bg-gray-50 border border-gray-200 text-gray-700'
  return answer.correct_flag
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800'
}

const opponentAnswerClass = (q) => {
  const answer = opponentAnswer(q)
  if (!answer) return 'bg-gray-50 border border-gray-200 text-gray-700'
  return answer.correct_flag
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800'
}

/**
 * Format a selected value (index or text) into a human readable string using
 * the question options when possible. Handles arrays of indices, single index
 * strings/numbers, or raw text answers.
 */
const formatSelected = (q, selected) => {
  try {
    if (!selected) return 'Not answered'

    // find full question object (with options) from loaded battle.questions
    const fullQ = (result.value && result.value.battle && Array.isArray(result.value.battle.questions))
      ? result.value.battle.questions.find(x => x.id === (q.question_id || q.id))
      : null

    const optionTexts = (fullQ && Array.isArray(fullQ.options)) ? fullQ.options.map(o => o.text) : null

    const mapOne = (val) => {
      // numeric index (string or number) -> map to option text
      if (optionTexts && (typeof val === 'string' || typeof val === 'number') && String(val).match(/^\d+$/)) {
        const idx = Number(val)
        return optionTexts[idx] ?? String(val)
      }
      // otherwise return as string
      return String(val)
    }

    if (Array.isArray(selected)) {
      return selected.map(s => mapOne(s)).join(', ')
    }
    return mapOne(selected)
  } catch (e) {
    return Array.isArray(selected) ? selected.join(', ') : (selected?.toString() || 'Not answered')
  }
}

useHead({
  title: 'Battle Results — Modeh'
})
</script>