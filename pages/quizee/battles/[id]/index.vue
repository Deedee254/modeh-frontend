<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Loading battle details...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-6">
      <!-- Back Button -->
      <div class="mb-6">
        <button @click="router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Left Column - Battle Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Hero Section -->
          <div class="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700">
            <!-- Overlay Content -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6 text-white">
              <div class="flex flex-wrap gap-2 mb-3">
                <div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-500/90 text-white border-0 capitalize">
                  Battle
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
                  {{ battle.settings?.question_count || 10 }} Questions
                </span>
                <span v-if="battle.settings?.difficulty" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/80 text-white capitalize">
                  {{ battle.settings?.difficulty }}
                </span>
              </div>
              <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">{{ battle.name || 'Epic Battle' }}</h1>
              <p class="text-white/80">Code: {{ battle.uuid }}</p>
            </div>
          </div>

          <!-- Battle Details Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Battle Details</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Questions</div>
                  <div class="text-2xl font-bold text-brand-600">{{ battle.settings?.question_count || 10 }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Difficulty</div>
                  <div class="text-2xl font-bold text-purple-600 capitalize">{{ battle.settings?.difficulty || 'Any' }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Grade</div>
                  <div class="text-lg font-bold text-brand-600">{{ getGradeName(battle.settings?.grade_id) }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject</div>
                  <div class="text-lg font-bold text-green-600">{{ getSubjectName(battle.settings?.subject_id) }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Topic</div>
                  <div class="text-lg font-bold text-orange-600">{{ getTopicName(battle.settings?.topic_id) }}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Limit</div>
                  <div class="text-lg font-bold text-red-600">{{ battle.settings?.time_total_seconds ? Math.floor(battle.settings.time_total_seconds / 60) + 'm' : 'None' }}</div>
                </div>
              </div>
            </div>

            <!-- Battle Description -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">About This Battle</h3>
              <div class="space-y-4 text-gray-600 dark:text-gray-400">
                <p>This is a competitive quiz battle where you'll answer {{ battle.settings?.question_count || 10 }} questions on {{ getSubjectName(battle.settings?.subject_id) }}. The player with the most correct answers wins!</p>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Both players answer simultaneously</li>
                  <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Can't return to previous questions</li>
                  <li class="flex items-center gap-2"><span class="text-green-600">✓</span> Progress saves automatically</li>
                  <li class="flex items-center gap-2"><span class="text-green-600">✓</span> 10 points per correct answer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Status & Actions -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
            <div class="space-y-4">
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Battle Status</div>
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" :class="statusIndicatorClass"></div>
                  <span :class="[statusTextClass, 'px-3 py-1 rounded-full text-xs font-semibold capitalize']">
                    {{ battle.status || 'waiting' }}
                  </span>
                </div>
              </div>

              <!-- Players Section -->
              <div class="border-t pt-4">
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Players</h3>
                <div class="space-y-3">
                  <!-- Initiator Card -->
                  <div v-if="battle.initiator" class="bg-gradient-to-br from-brand-50 to-brand-50 dark:from-brand-900/20 dark:to-brand-900/20 rounded-lg p-4 border border-brand-100 dark:border-brand-800">
                    <div class="flex items-center gap-3">
                      <img :src="battle.initiator.profile?.avatar || '/avatars/default.png'"
                           :alt="battle.initiator.first_name"
                           class="w-10 h-10 rounded-full object-cover border-2 border-brand-500" />
                      <div>
                        <div class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ battle.initiator.first_name }}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">Creator</div>
                      </div>
                    </div>
                  </div>

                  <!-- Opponent Card -->
                  <div v-if="battle.opponent && battle.opponent_id !== battle.initiator_id" class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div class="flex items-center gap-3">
                      <img :src="battle.opponent.profile?.avatar || '/avatars/default.png'"
                           :alt="battle.opponent.first_name"
                           class="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
                      <div>
                        <div class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ battle.opponent.first_name }}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">Challenger</div>
                      </div>
                    </div>
                  </div>

                  <!-- Waiting for Opponent -->
                  <div v-else class="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Waiting for opponent...</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="border-t pt-4 space-y-3">
                <!-- Join Battle Button -->
                <NuxtLink 
                  :to="`/quizee/battles/${battle.uuid}/waiting`"
                  class="block w-full px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Join Battle
                </NuxtLink>

                <!-- Cancel Battle (for initiator only) -->
                <button v-if="isInitiator && battle.status === 'waiting'"
                        @click="cancelBattle"
                        class="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Cancel Battle
                </button>

                <!-- Leave Battles List -->
                <NuxtLink 
                  to="/quizee/battles"
                  class="block w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors text-center"
                >
                  Back to Battles
                </NuxtLink>
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

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useTaxonomy from '~/composables/useTaxonomy'

const router = useRouter()
const route = useRoute()

const api = useApi()
const auth = useAuthStore()
const { push: showAlert } = useAppAlert()

// Get taxonomy data for grade/subject/topic names
const { grades, subjects, topics, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()

// Get battle UUID from route
const uuid = route.params.id

useHead({
  title: 'Battle Details — Modeh',
  meta: [
    { name: 'description', content: 'View battle details before joining.' },
    { property: 'og:title', content: 'Battle Details — Modeh' },
    { property: 'og:description', content: 'View battle details before joining.' }
  ]
})

const battle = ref({})
const loading = ref(true)

const isInitiator = computed(() => auth.user && battle.value.initiator_id === auth.user.id)

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
    // Request WITHOUT questions
    const res = await api.get(`/api/battles/${uuid}?with_questions=false`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      const d = data?.battle || data || {}
      battle.value = {
        id: d.id,
        uuid: d.uuid,
        name: d.name,
        initiator_id: d.initiator_id,
        opponent_id: d.opponent_id,
        status: d.status,
        settings: d.settings,
        initiator: d.initiator,
        opponent: d.opponent,
      }
    }
    
    // Fetch taxonomy data
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

onMounted(async () => {
  await fetchBattle()
})
</script>
