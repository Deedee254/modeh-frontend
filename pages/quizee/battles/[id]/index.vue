<template>
  <div class="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <!-- Header with Status -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Waiting Room</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Get ready for an epic battle! Code: {{ battle?.uuid }}</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="[
              battle.status === 'in-progress' ? 'bg-green-500 animate-pulse' :
              battle.status === 'completed' ? 'bg-gray-500' :
              'bg-yellow-500 animate-pulse'
            ]"></div>
            <span :class="[
              statusClass,
              'px-3 py-1 rounded-full text-sm font-medium capitalize'
            ]">{{ battle.status || 'waiting' }}</span>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Players Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Players</h3>
            
            <!-- Initiator Card -->
            <div v-if="battle.initiator" 
                 class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
                        rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img :src="battle.initiator.profile?.avatar || '/avatars/default.png'"
                       :alt="battle.initiator.first_name"
                       class="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">{{ battle.initiator.first_name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Creator</div>
                </div>
              </div>
            </div>

            <!-- Opponent Card -->
            <div v-if="battle.opponent && battle.opponent_id !== battle.initiator_id"
                 class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                        rounded-xl p-4 border border-purple-100 dark:border-purple-800">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img :src="battle.opponent.profile?.avatar || '/avatars/default.png'"
                       :alt="battle.opponent.first_name"
                       class="w-12 h-12 rounded-full object-cover border-2 border-purple-500" />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">{{ battle.opponent.first_name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Challenger</div>
                </div>
              </div>
            </div>

            <!-- Waiting for Opponent Placeholder -->
            <div v-if="!battle.opponent || battle.opponent_id === battle.initiator_id"
                 class="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Battle Info Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Battle Info</h3>
            <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ battle.settings?.question_count || 10 }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {{ battle.settings?.difficulty || 'Any' }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Grade</div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ getGradeName(battle.settings?.grade_id) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Subject</div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ getSubjectName(battle.settings?.subject_id) }}
                  </div>
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Topic</div>
                <div class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ getTopicName(battle.settings?.topic_id) }}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3">
              <button v-if="isInitiator && battle.status !== 'in-progress'" 
                      @click="cancelBattle"
                      class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                Cancel Battle
              </button>
              <button @click="copyLink"
                      class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Invite Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const { push: showAlert } = useAppAlert()

// Get taxonomy data for grade/subject/topic names
const { grades, subjects, topics, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

// Get battle UUID from route
const uuid = route.params.id

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
const polling = ref(false)
let intervalId = null

const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)

const statusClass = computed(() => {
  const s = battle.value.status
  if (s === 'waiting') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
  if (s === 'in-progress') return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  if (s === 'completed') return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
})

// Helper methods for getting names from IDs
function getGradeName(id) {
  return grades.value.find(g => g.id === id)?.name || 'Any'
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
      const data = await res.json()
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

    // If started, navigate to the battle play page
    if (battle.value.status === 'in-progress') {
      router.push(`/quizee/battles/${battle.value.uuid}/play`)
    }
  } catch (e) {
    console.error('Failed to fetch battle', e)
  }
}

async function startPolling() {
  if (polling.value) return
  polling.value = true
  await fetchBattle()
  intervalId = setInterval(fetchBattle, 3000)
}

function stopPolling() {
  polling.value = false
  if (intervalId) clearInterval(intervalId)
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
  if (!battle.value?.uuid) return
  const url = `${window.location.origin}/quizee/battles/${battle.value.uuid}`
  navigator.clipboard.writeText(url)
  showAlert({ type: 'success', message: 'Battle invite link copied to clipboard' })
}

onMounted(() => startPolling())
onUnmounted(() => stopPolling())
</script>
