<template>
  <div class="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-3xl mx-auto px-4">
      <div class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <!-- Header with Status -->
        <div class="flex flex-col sm:flex-row items-start justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{{ battle.name || 'Waiting Room' }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Get ready for an epic battle!</p>
          </div>
          <div class="flex items-center gap-2 mt-4 sm:mt-0">
            <div class="w-2.5 h-2.5 rounded-full" :class="statusIndicatorClass"></div>
            <span :class="[statusTextClass, 'px-3 py-1 rounded-full text-xs font-semibold capitalize']">
              {{ battle.status || 'waiting' }}
            </span>
          </div>
        </div>

        <!-- Players Section -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-8">
          <!-- Initiator Card -->
          <PlayerCard v-if="battle.initiator" :player="battle.initiator" role="Creator" />

          <div class="text-3xl font-black text-gray-300 dark:text-gray-600 my-2 sm:my-0">VS</div>

          <!-- Opponent Card -->
          <PlayerCard v-if="battle.opponent && battle.opponent_id !== battle.initiator_id" :player="battle.opponent" role="Challenger" />
          
          <!-- Waiting for Opponent Placeholder -->
          <div v-else class="w-full sm:w-64 h-32 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center">
            <div class="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-2">
              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div class="absolute inset-0 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-full animate-spin-slow"></div>
            </div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Waiting for opponent...</p>
          </div>
        </div>

        <!-- Battle Info & Actions -->
        <div class="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <!-- Battle Info Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Battle Details</h3>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
              <InfoItem icon="heroicon-o-question-mark-circle" label="Questions" :value="battle.settings?.question_count || 10" />
              <InfoItem icon="heroicon-o-chart-bar" label="Difficulty" :value="battle.settings?.difficulty || 'Any'" class="capitalize" />
              <InfoItem icon="heroicon-o-academic-cap" label="Grade" :value="getGradeName(battle.settings?.grade_id)" />
              <InfoItem icon="heroicon-o-book-open" label="Subject" :value="getSubjectName(battle.settings?.subject_id)" />
              <InfoItem icon="heroicon-o-tag" label="Topic" :value="getTopicName(battle.settings?.topic_id)" />
            </div>
          </div>

          <!-- Invite & Actions Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Invite & Actions</h3>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Share this link with a friend to invite them to the battle.</p>
              <div class="flex items-center gap-2">
                <input 
                  :value="inviteLink" 
                  readonly 
                  class="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button @click="copyLink" class="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button v-if="isInitiator && battle.status === 'waiting'" 
                      @click="cancelBattle"
                      class="w-full sm:w-auto flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Cancel Battle
              </button>
              <NuxtLink to="/quizee/battles" class="w-full sm:w-auto flex-1 text-center px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors">
                Leave Room
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useTaxonomy from '~/composables/useTaxonomy'
import PlayerCard from '~/components/quizee/battle/PlayerCard.vue'
import InfoItem from '~/components/quizee/battle/InfoItem.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const { push: showAlert } = useAppAlert()
const cfg = useRuntimeConfig()

// Get taxonomy data for grade/subject/topic names
const { grades, subjects, topics, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

// Get battle UUID from route
const uuid = route.params.id
const _echoChannel = ref(null)

// Page meta
definePageMeta({
  layout: 'quizee',
})

useHead({
  title: 'Battle Waiting Room — Modeh',
  meta: [
    { name: 'description', content: 'Get ready for an epic quiz battle! Join or create challenging quiz battles with other players.' },
    { property: 'og:title', content: 'Battle Waiting Room — Modeh' },
    { property: 'og:description', content: 'Get ready for an epic quiz battle! Join or create challenging quiz battles with other players.' }
  ]
})

const battle = ref({})

const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)

const inviteLink = computed(() => {
  if (typeof window === 'undefined' || !battle.value?.uuid) return ''
  return `${window.location.origin}/quizee/battles/${battle.value.uuid}/waiting`
})

const statusIndicatorClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-500 animate-pulse'
  if (s === 'in-progress') return 'bg-green-500 animate-pulse'
  if (s === 'completed') return 'bg-gray-500'
  return 'bg-blue-500'
})

const statusTextClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
  if (s === 'in-progress') return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  if (s === 'completed') return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
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
  try {
    const res = await api.get(`/api/battles/${uuid}`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      battle.value = data || {}
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
  }
}

function attachEchoListeners() {
  if (typeof window === 'undefined' || !window.Echo || !uuid) return
  try {
    _echoChannel.value = window.Echo.private(`battle.${uuid}`)
      .listen('.BattleParticipantJoined', (payload) => {
        console.log('Participant joined:', payload)
        if (payload.participant) {
          battle.value.opponent = payload.participant
        }
      })
      .listen('.BattleStatusUpdated', (payload) => {
        console.log('Status updated:', payload)
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

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
  showAlert({ type: 'success', message: 'Battle waiting room link copied to clipboard' })
}

watch(() => battle.value?.status, (newStatus) => {
  if (newStatus === 'in-progress') {
    showAlert({ type: 'info', message: 'Battle is starting! Redirecting...' })
    setTimeout(() => {
      router.push(`/quizee/battles/${uuid}/play`)
    }, 1500)
  }
})

onMounted(async () => {
  await fetchBattle()
  attachEchoListeners()
})
onUnmounted(() => detachEchoListeners())
</script>
