<template>
  <div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-gray-500">
          <svg class="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-lg">Loading results...</span>
        </div>
      </div>

      <div v-else-if="!result" class="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div v-if="errorMessage" class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2m6-4a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div v-else class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h3 v-if="errorMessage" class="text-xl font-medium text-red-900 mb-2">Unable to Load Results</h3>
        <h3 v-else class="text-xl font-medium text-gray-900 mb-2">Results Not Found</h3>
        <p v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</p>
        <p v-else class="text-gray-600">We couldn't load the results for this battle. It might still be in progress.</p>
        <div class="mt-6 flex gap-3 justify-center flex-wrap">
          <NuxtLink to="/quizee/battles" class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700">
            Back to Battles
          </NuxtLink>
          <button v-if="errorMessage && errorMessage.includes('subscription')" @click="() => { $router.push('/quizee/pricing') }" class="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div v-else>
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div class="text-center">
            <div class="text-5xl font-bold mb-2" :class="resultClass">{{ resultLabel }}</div>
            <p class="text-xl text-gray-600">Final Score: {{ myScore }} - {{ opponentScore }}</p>
          </div>
        </div>

        <!-- Achievements & Badges Earned -->
        <div v-if="awardedAchievements.length > 0" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-8 mb-8">
          <h2 class="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm7 4a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            Achievements Unlocked 🎉
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="achievement in awardedAchievements" :key="achievement.id" class="bg-white rounded-lg p-4 border border-amber-200 shadow-sm hover:shadow-md transition">
              <div class="flex items-start gap-3">
                <div class="text-3xl">{{ achievement.icon }}</div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ achievement.name }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ achievement.description }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-lg font-bold text-amber-600">+{{ achievement.points }}</span>
                    <span class="text-xs text-gray-500">points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <!-- Final Rankings (spans 2 columns on desktop) -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Final Rankings</h2>
              
              <div class="space-y-4">
                <!-- You -->
                <div class="flex items-center justify-between p-6 rounded-xl" :class="[myScore >= opponentScore ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border border-gray-200']">
                  <div class="flex items-center gap-4">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-white', myScore >= opponentScore ? 'bg-green-500' : 'bg-gray-400']">
                      {{ myScore >= opponentScore ? '1' : '2' }}
                    </div>
                    <img :src="meAvatar" alt="You" class="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ me?.name || 'You' }}</h4>
                      <p class="text-sm text-gray-500">Your Score</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">{{ myScore }}</div>
                    <p class="text-xs text-gray-500">points</p>
                  </div>
                </div>

                <!-- Opponent -->
                <div class="flex items-center justify-between p-6 rounded-xl" :class="[opponentScore >= myScore ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border border-gray-200']">
                  <div class="flex items-center gap-4">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-white', opponentScore >= myScore ? 'bg-green-500' : 'bg-gray-400']">
                      {{ opponentScore >= myScore ? '1' : '2' }}
                    </div>
                    <img :src="opponentAvatar" :alt="opponent?.name || 'Opponent'" class="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ opponent?.name || 'Opponent' }}</h4>
                      <p class="text-sm text-gray-500">Opponent Score</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">{{ opponentScore }}</div>
                    <p class="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar: Performance & Rewards -->
          <div class="space-y-8">
            <!-- Performance Stats -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Your Performance</h3>
              
              <div class="space-y-3">
                <!-- Score -->
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span class="text-sm font-medium text-gray-700">Total Score</span>
                  </div>
                  <span class="text-lg font-bold text-blue-600">{{ myScore }}</span>
                </div>

                <!-- Correct Answers -->
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="text-sm font-medium text-gray-700">Correct</span>
                  </div>
                  <span class="text-lg font-bold text-green-600">{{ correctAnswerCount }}/{{ (result.questions || []).length }}</span>
                </div>

                <!-- Win Status -->
                <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M7 12a5 5 0 1110 0M15 8h.01M9 12H8.01"></path></svg>
                    <span class="text-sm font-medium text-gray-700">Result</span>
                  </div>
                  <span class="text-lg font-bold" :class="[myScore >= opponentScore ? 'text-green-600' : 'text-red-600']">
                    {{ myScore >= opponentScore ? 'Won!' : 'Lost' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Rewards Earned -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Rewards Earned</h3>
              
              <div class="space-y-3">
                <!-- Battle Points -->
                <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-sm font-medium text-gray-700">Battle Points</span>
                  </div>
                  <span class="text-lg font-bold text-amber-600">+{{ myScore }}</span>
                </div>

                <!-- Streak -->
                <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span class="text-sm font-medium text-gray-700">Streak Bonus</span>
                  </div>
                  <span class="text-lg font-bold text-purple-600">+10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div class="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <NuxtLink to="/quizee/dashboard" class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition">
              ← Return Home
            </NuxtLink>
            <button class="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition">
              📤 Share Results
            </button>
            <button class="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition">
              🔄 Rematch
            </button>
          </div>
        </div>

        <!-- Detailed Answers -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Question Breakdown</h3>

          <!-- Grid: two questions per row on large screens -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="(q, index) in result.questions" :key="q.question_id" class="p-4 rounded-lg border bg-white">
              <div class="mb-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-sm">{{ index + 1 }}</div>
                  <p class="font-semibold text-gray-800">Question {{ index + 1 }}</p>
                </div>
                <div class="text-gray-700 text-base mb-3" v-html="q.body"></div>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <div>Marks: <span class="font-medium text-gray-900">{{ marksForQuestion(q) }}</span></div>
                  <div>You earned: <span class="font-medium text-green-700">{{ pointsForSide(q, mySide()) }}</span></div>
                  <div>Opponent: <span class="font-medium text-gray-900">{{ pointsForSide(q, mySide() === 'initiator' ? 'opponent' : 'initiator') }}</span></div>
                </div>
              </div>

              <!-- Answers: two columns underneath the question -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 rounded-lg" :class="myAnswerClass(q)">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold">Your Answer</div>
                    <div class="text-sm text-gray-500">{{ pointsForSide(q, mySide()) }} pts</div>
                  </div>
                  <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, myAnswer(q)?.selected) }}</div>
                  <div class="mt-1 text-xs" :class="(myAnswer(q) && myAnswer(q).correct_flag) ? 'text-green-700' : 'text-red-600'">{{ myAnswer(q) ? (myAnswer(q).correct_flag ? 'Correct' : 'Incorrect') : 'No answer' }}</div>
                </div>

                <div class="p-4 rounded-lg" :class="opponentAnswerClass(q)">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold">Opponent's Answer</div>
                    <div class="text-sm text-gray-500">{{ pointsForSide(q, mySide() === 'initiator' ? 'opponent' : 'initiator') }} pts</div>
                  </div>
                  <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, opponentAnswer(q)?.selected) }}</div>
                  <div class="mt-1 text-xs" :class="(opponentAnswer(q) && opponentAnswer(q).correct_flag) ? 'text-green-700' : 'text-red-600'">{{ opponentAnswer(q) ? (opponentAnswer(q).correct_flag ? 'Correct' : 'Incorrect') : 'No answer' }}</div>
                </div>
              </div>

              <!-- Correct Answer spans full width below -->
              <div class="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                <div class="font-semibold">✓ Correct Answer</div>
                <div class="mt-2 text-sm font-mono break-words">{{ formatSelected(q, q.correct) }}</div>
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
import { normalizeAnswer } from '~/composables/useAnswerNormalization'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAnswerStore } from '~/stores/answerStore'
import useApi from '~/composables/useApi'

definePageMeta({ layout: 'quizee' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cfg = useRuntimeConfig()
const answerStore = useAnswerStore()
const api = useApi()

const loading = ref(true)
const result = ref(null)
const awardedAchievements = ref([])
const errorMessage = ref(null)

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
    const resp = await api.get(`/api/battles/${battleId}/result`)
    
    // Check for auth errors (401, 419)
    if (resp.status === 401 || resp.status === 419) {
      api.handleAuthStatus(resp)
      result.value = null
      loading.value = false
      return
    }
    
    // Parse the response to check for subscription/limit errors
    const res = await api.parseResponse(resp)
    
    // Check if we got a limit error (subscription reached, etc.)
    if (resp.status === 403 && res && res.code === 'limit_reached') {
      // User has hit subscription limit - show error message
      // Note: Limits should ideally be checked on checkout page before user reaches results
      console.error('Subscription limit reached:', res.message)
      errorMessage.value = res.message || 'You have reached your subscription limit. Please upgrade to view results.'
      return
    }
    
    // If response is not OK and not a limit error, throw
    if (!resp.ok) {
      throw new Error(`Failed to fetch battle results: ${resp.status} ${resp.statusText}`)
    }
    
    // Support two possible response shapes:
    // 1) { battle: {...}, questions: [...] } (older shape)
    // 2) { ok: true, result: { battle: {...}, questions: [...] } } (current shape)
    // 3) { ok: true, battle: {...}, awarded_achievements: [...] } (from /mark endpoint)
    if (res?.battle) {
      result.value = res
      // Capture awarded achievements from response
      if (Array.isArray(res?.awarded_achievements)) {
        awardedAchievements.value = res.awarded_achievements
      }
      // Cache the results for future use
      answerStore.storeAttemptForReview(battleId, res)
    } else if (res?.result) {
      // set result to the inner result object so template bindings like
      // result.battle and result.questions continue to work
      result.value = res.result
      // Capture awarded achievements from response
      if (Array.isArray(res?.awarded_achievements)) {
        awardedAchievements.value = res.awarded_achievements
      }
      answerStore.storeAttemptForReview(battleId, res.result)
    }
  } catch (error) {
    console.error("Failed to fetch battle results:", error)
    // Store the error message for display
    errorMessage.value = error?.message || 'Failed to load battle results. Please try again.'
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

// Match Podium.vue's resolvedAvatar pattern for consistency
function resolveAvatar(v) {
  try {
    // If an object is passed, pick the avatar fields in order (prioritize avatar_url)
    let val = null
    if (v && typeof v === 'object') {
      val = v.avatar_url || v.avatar || v.photo || v.profile_image || null
    } else {
      val = v
    }
    return resolveAssetUrl(val) || val || '/logo/avatar-placeholder.png'
  } catch {
    return (typeof v === 'string' ? v : null) || '/logo/avatar-placeholder.png'
  }
}

const meAvatar = computed(() => {
  return resolveAvatar(me.value)
})

const opponentAvatar = computed(() => {
  return resolveAvatar(opponent.value)
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

const correctAnswerCount = computed(() => {
  if (!result.value?.questions) return 0
  return result.value.questions.filter(q => {
    const answer = myAnswer(q)
    return answer && answer.correct_flag
  }).length
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
    if (selected === null || typeof selected === 'undefined' || selected === '') return 'Not answered'

    // find full question object (with options) from loaded battle.questions
    const fullQ = (result.value && result.value.battle && Array.isArray(result.value.battle.questions))
      ? result.value.battle.questions.find(x => x.id === (q.question_id || q.id))
      : null

    const optionObjs = (fullQ && Array.isArray(fullQ.options)) ? fullQ.options : null

    const mapOne = (val) => {
      // If option object was stored/returned, prefer readable fields
      if (val && typeof val === 'object') {
        return (val.body || val.text || val.label || String(val))
      }

      // numeric index (string or number) -> map to option text
      if (optionObjs && (typeof val === 'string' || typeof val === 'number') && String(val).match(/^\d+$/)) {
        const idx = Number(val)
        const opt = optionObjs[idx]
        return opt ? (opt.text || opt.body || opt.label || String(opt)) : String(val)
      }

      // string normalized: try to match an option by normalized text
      if (optionObjs && typeof val === 'string') {
        const norm = normalizeAnswer(val)
        const found = optionObjs.find(o => normalizeAnswer(o) === norm)
        if (found) return (found.text || found.body || found.label || String(found))
      }

      // otherwise return as-is
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

// helper to determine marks for a question from the full question object
function marksForQuestion(q) {
  const fullQ = (result.value && result.value.battle && Array.isArray(result.value.battle.questions))
    ? result.value.battle.questions.find(x => x.id === (q.question_id || q.id))
    : null
  return fullQ ? (fullQ.marks ?? fullQ.points ?? 1) : (q.marks ?? q.points ?? 1)
}

function pointsForSide(q, side = 'initiator') {
  const fullMarks = marksForQuestion(q)
  if (side === 'initiator') return (q.initiator && q.initiator.correct_flag) ? fullMarks : 0
  return (q.opponent && q.opponent.correct_flag) ? fullMarks : 0
}

function mySide() {
  if (!auth.user || !result.value?.battle) return 'initiator'
  const meId = auth.user.id
  if (result.value.battle.initiator_id === meId) return 'initiator'
  if (result.value.battle.opponent_id === meId) return 'opponent'
  return 'initiator'
}

useHead({
  title: 'Battle Results — Modeh'
})
</script>