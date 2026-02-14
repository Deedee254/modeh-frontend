<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Preparing the arena...</p>
    </div>

    <!-- Main Content -->
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- New Integrated Hero Section -->
      <div class="mb-6">
        <button @click="router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back
        </button>
        <div class="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700">
          <!-- Overlay Content -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6 text-white">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-500/90 text-white border-0 capitalize">
                Battle Arena
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
                {{ battle.settings?.question_count || 10 }} Questions
              </span>
              <span v-if="battle.settings?.difficulty" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/80 text-white capitalize">
                {{ battle.settings?.difficulty }}
              </span>
            </div>
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">{{ battle.name || 'Epic Battle' }}</h1>
            <div class="flex flex-wrap gap-x-4 gap-y-2 text-white/90 text-sm">
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>{{ battle.settings?.question_count || 10 }} questions</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{{ battle.settings?.time_total_seconds ? Math.floor(battle.settings.time_total_seconds / 60) + 'm' : 'No time limit' }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span>10 points per question</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Enhanced Tabs Section -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- New Unified Tab Style -->
            <div class="p-2 sm:p-4">
              <div role="tablist" class="grid w-full grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1 text-gray-500">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  role="tab"
                  :aria-selected="activeTab === tab.id"
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  :class="activeTab === tab.id ? 'bg-white text-brand-700 shadow-sm' : 'hover:bg-white/50'"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>

            <!-- Tab content -->
            <div class="p-6">
              <!-- Overview -->
              <div v-if="activeTab === 'overview'" class="prose max-w-none">
                <div>Get ready for an epic battle! Test your knowledge against another player in this competitive quiz challenge.</div>
              </div>

              <!-- Requirements -->
              <div v-else-if="activeTab === 'requirements'" class="space-y-4">
                <div class="prose max-w-none">
                  <h3 class="text-lg font-medium">Before you start</h3>
                  <ul>
                    <li>Make sure you have a stable internet connection</li>
                    <li>You'll need {{ battle.settings?.time_total_seconds ? Math.floor(battle.settings.time_total_seconds / 60) + ' minutes' : 'sufficient time' }} to complete the battle</li>
                    <li>Have paper and pen ready for calculations if needed</li>
                  </ul>
                </div>
              </div>

              <!-- Instructions -->
              <div v-else-if="activeTab === 'instructions'" class="space-y-4">
                <div class="prose max-w-none">
                  <h3 class="text-lg font-medium">How the battle works</h3>
                  <ul>
                    <li>Both players answer questions simultaneously</li>
                    <li>You can't return to previous questions once answered</li>
                    <li>Your progress is saved automatically</li>
                    <li>The player with the most correct answers wins</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Battle Details -->
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Battle Details</h3>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 space-y-3">
              <InfoItem icon="heroicon-o-question-mark-circle" label="Question Count" :value="battle.settings?.question_count || 10" />
              <InfoItem icon="heroicon-o-chart-bar" label="Difficulty" :value="battle.settings?.difficulty || 'Any'" class="capitalize" />
              <InfoItem icon="heroicon-o-academic-cap" label="Grade" :value="getGradeName(battle.settings?.grade_id)" />
              <InfoItem icon="heroicon-o-book-open" label="Subject" :value="getSubjectName(battle.settings?.subject_id)" />
              <InfoItem icon="heroicon-o-tag" label="Topic" :value="getTopicName(battle.settings?.topic_id)" />
            </div>
          </div>

          <!-- Invite & Actions Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Invite & Actions</h3>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Share this battle with others to invite them to compete.</p>
                <AffiliateShareButton 
                  item-type="Battle" 
                  :item-id="battle.uuid"
                  :base-url="battleBaseUrl"
                />
              </div>

              <!-- Action Buttons -->
              <div class="border-t pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button v-if="isParticipant && soloModeAvailable && battle.status === 'waiting'"
                        @click="startSoloBattle"
                        class="w-full sm:flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Start Solo Battle
                </button>
                <button v-if="isInitiator && battle.status === 'waiting'"
                        @click="cancelBattle"
                        class="w-full sm:flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Cancel Battle
                </button>
                <NuxtLink to="/quizee/battles" class="w-full sm:flex-1 text-center px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors">
                  Leave Room
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Action Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <div class="space-y-6">
              <!-- Status Section -->
              <div class="border-b pb-4">
                <div class="text-sm text-gray-500">Battle Status</div>
                <div class="mt-1 flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" :class="statusIndicatorClass"></div>
                  <span :class="[statusTextClass, 'px-3 py-1 rounded-full text-xs font-semibold capitalize']">
                    {{ battle.status || 'waiting' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2" v-if="!countdownTime && !soloModeAvailable">Get ready for an epic battle!</p>
                <p class="text-sm text-red-600 dark:text-red-400 mt-2 font-semibold" v-else-if="countdownTime">Battle starting in {{ countdownTime }} seconds!</p>
                <p class="text-sm text-amber-600 dark:text-amber-400 mt-2 font-semibold" v-else-if="!soloModeAvailable && isParticipant">Solo mode available in {{ soloCountdownTime }}s</p>
              </div>

              <!-- Players Section -->
              <div class="space-y-4">
                <h3 class="text-base font-semibold text-gray-900">Players</h3>
                <div class="grid grid-cols-1 gap-3">
                  <!-- Initiator Card -->
                  <PlayerCard v-if="battle.initiator" :player="battle.initiator" role="Creator" />

                  <!-- Opponent Card -->
                  <PlayerCard v-if="battle.opponent && battle.opponent_id !== battle.initiator_id" :player="battle.opponent" role="Challenger" />

                  <!-- Waiting for Opponent Placeholder -->
                  <div v-else class="w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center">
                    <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-2">
                      <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div class="absolute inset-0 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-full animate-spin-slow"></div>
                    </div>
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Waiting for opponent...</p>
                  </div>
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
definePageMeta({
  layout: 'quizee',
})

import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useTaxonomy from '~/composables/useTaxonomy'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import InfoItem from '~/components/quizee/battle/InfoItem.vue'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'

const router = useRouter()
const route = useRoute()

const api = useApi()
const auth = useAuthStore()
const { push: showAlert } = useAppAlert()
const cfg = useRuntimeConfig()

// Get taxonomy data for grade/subject/topic names
const { grades, subjects, topics, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

// Get battle UUID from route
const uuid = route.params.id
const _echoChannel = ref(null)

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'requirements', name: 'Requirements' },
  { id: 'instructions', name: 'Instructions' }
]
const activeTab = ref('overview')

useHead({
  title: 'Battle Waiting Room — Modeh',
  meta: [
    { name: 'description', content: 'Get ready for an epic quiz battle! Join or create challenging quiz battles with other players.' },
    { property: 'og:title', content: 'Battle Waiting Room — Modeh' },
    { property: 'og:description', content: 'Get ready for an epic quiz battle! Join or create challenging quiz battles with other players.' }
  ]
})

const battle = ref({})
const initialized = ref(false)
const loading = ref(true)
const countdown = ref(null)
const countdownTime = ref(0)
const soloCountdown = ref(null)
const soloCountdownTime = ref(10)
const soloModeAvailable = ref(false)

const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)
const isParticipant = computed(() => auth.user && (battle.value.initiator_id === auth.user.id || battle.value.opponent_id === auth.user.id))

const battleBaseUrl = computed(() => {
  const base = cfg.public?.baseUrl || ''
  if (!base) return '/quizee/battles'
  return `${base}/quizee/battles`
})

const statusIndicatorClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-500 animate-pulse'
  if (s === 'in-progress') return 'bg-green-500 animate-pulse'
  if (s === 'completed') return 'bg-gray-500'
  return 'bg-brand-500'
})

const statusTextClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
  if (s === 'in-progress') return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  if (s === 'completed') return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
  return 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
})

// Helper methods for getting names from IDs
function getGradeName(id) {
  if (!id || !grades.value.length) return 'Any'
  return grades.value.find(g => g.id == id)?.name || 'Any'
}

function getSubjectName(id) {
  return subjects.value.find(s => s.id === id)?.name || 'Any'
}

function getTopicName(id) {
  return topics.value.find(t => t.id === id)?.name || 'Any'
}

async function fetchBattle() {
  loading.value = true
  try {
    // Explicitly request battle data WITHOUT questions for the waiting room
    const res = await api.get(`/api/battles/${uuid}?with_questions=false`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      // API may return full battle with questions. Only copy minimal metadata here.
      const data = await res.json().catch(() => ({}))
      const d = data?.battle || data || {}
      battle.value = {
        id: d.id,
        uuid: d.uuid,
        initiator_id: d.initiator_id,
        opponent_id: d.opponent_id,
        status: d.status,
        settings: d.settings,
        name: d.name,
        initiator: d.initiator,
        opponent: d.opponent,
        // Explicitly exclude questions from the battle object
        questions: undefined,
      }
    }
    
    // Fetch taxonomy data if we have settings
    if (battle.value?.settings) {
      if (!grades.value.length) {
        await fetchGrades()
      }
      if (battle.value.settings.grade_id && !subjects.value.length) {
        await fetchSubjectsByGrade(battle.value.settings.grade_id)
      }
      if (battle.value.settings.subject_id && !topics.value.length) {
        await fetchTopicsBySubject(battle.value.settings.subject_id)
      }
    }
  } catch (e) {
    console.error('Failed to fetch battle', e)
    showAlert({ type: 'error', message: 'Could not load battle details.' })
    router.push('/quizee/battles')
  } finally {
    loading.value = false
  }
}

function attachEchoListeners() {
  if (typeof window === 'undefined' || !window.Echo || !uuid) return
  try {
    _echoChannel.value = window.Echo.private(`battle.${uuid}`)
      .listen('.BattleParticipantJoined', (payload) => {
        if (payload.participant) {
          battle.value.opponent = payload.participant
        }
      })
      .listen('.BattleStatusUpdated', (payload) => {
        if (payload.status) {
          battle.value.status = payload.status
        }
      })
  } catch (e) {
    console.error("Could not attach Echo listeners:", e)
  }
}

function detachEchoListeners() {
  try {
    if (_echoChannel.value) {
      window.Echo.leave(`battle.${uuid}`)
      _echoChannel.value = null
    }
  } catch (e) {
    console.error("Could not detach Echo listeners:", e)
  }
}

async function cancelBattle() {
  try {
    const res = await api.delete(`/api/battles/${battle.value.uuid}`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      showAlert({ type: 'success', message: 'Battle cancelled' })
      router.push('/quizee/battles')
    } else {
      showAlert({ type: 'error', message: 'Failed to cancel battle' })
    }
  } catch (e) {
    showAlert({ type: 'error', message: 'Failed to cancel battle' })
  }
}

watch(() => battle.value?.status, (newStatus) => {
  // don't auto-redirect on initial load if the battle was already in-progress
  if (!initialized.value) return
  if (newStatus === 'in-progress') {
    startCountdown()
  }
  // If battle is already in progress when loading the waiting room, redirect immediately
  if (newStatus === 'in-progress' && initialized.value) {
    router.push(`/quizee/battles/${uuid}/play`)
  }
})

function startCountdown() {
  countdownTime.value = 10
  showAlert({ type: 'info', message: 'Battle is starting in 10 seconds!' })

  countdown.value = setInterval(() => {
    countdownTime.value--
    if (countdownTime.value <= 0) {
      clearInterval(countdown.value)
      countdown.value = null
      router.push(`/quizee/battles/${uuid}/play`)
    }
  }, 1000)
}

function startSoloCountdown() {
  if (!isParticipant.value) return
  
  soloCountdownTime.value = 10
  soloCountdown.value = setInterval(() => {
    soloCountdownTime.value--
    if (soloCountdownTime.value <= 0) {
      clearInterval(soloCountdown.value)
      soloCountdown.value = null
      soloModeAvailable.value = true
      showAlert({ type: 'info', message: 'You can now start the battle as a solo challenge!' })
    }
  }, 1000)
}

async function startSoloBattle() {
  try {
    const res = await api.postJson(`/api/battles/${battle.value.uuid}/start-solo`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      showAlert({ type: 'success', message: 'Battle started in solo mode!' })
      // Clear any existing countdowns
      if (soloCountdown.value) {
        clearInterval(soloCountdown.value)
        soloCountdown.value = null
      }
      // The status will be updated via Echo listener, but we can also redirect directly
      setTimeout(() => {
        router.push(`/quizee/battles/${uuid}/play`)
      }, 500)
    } else {
      showAlert({ type: 'error', message: 'Failed to start solo battle' })
    }
  } catch (e) {
    console.error('Failed to start solo battle', e)
    showAlert({ type: 'error', message: 'Failed to start solo battle' })
  }
}

onMounted(async () => {
  await fetchBattle()
  // mark page as initialized after initial fetch to avoid immediate redirects
  initialized.value = true

  // Always start countdown when page loads
  startCountdown()

  attachEchoListeners()
  
  // Start solo countdown if user is a participant
  if (isParticipant.value) {
    startSoloCountdown()
  }
})
onUnmounted(() => {
  detachEchoListeners()
  if (countdown.value) {
    clearInterval(countdown.value)
    countdown.value = null
  }
  if (soloCountdown.value) {
    clearInterval(soloCountdown.value)
    soloCountdown.value = null
  }
})
</script>
