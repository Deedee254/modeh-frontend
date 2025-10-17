<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHero
        title="Battle Arena"
        description="Challenge friends or random players to real-time quiz battles. Create a new battle or join an existing one."
        :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Battles', current: true }]"
        align="center"
      />

      <div class="max-w-4xl mx-auto">
        <!-- New Battle Creation Component -->
        <div class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div class="bg-gray-100 dark:bg-gray-900/70 rounded-lg p-1 flex space-x-1">
            <button
              @click="creationMode = '1v1'"
              :class="[
                'flex-1 py-2.5 px-4 text-sm font-semibold text-center transition-all duration-300 rounded-md flex items-center justify-center gap-2',
                creationMode === '1v1' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>
              1 vs 1 Battle
            </button>
            <button
              @click="creationMode = 'group'"
              :class="[
                'flex-1 py-2.5 px-4 text-sm font-semibold text-center transition-all duration-300 rounded-md flex items-center justify-center gap-2',
                creationMode === 'group' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50'
              ]"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Group Battle
            </button>
          </div>

          <div class="pt-6">
            <div v-if="creationMode === '1v1'">
              <CreateBattle @battleCreated="handleBattleCreated" />
            </div>
            <CreateGroupBattle v-if="creationMode === 'group'" @battleCreated="handleBattleCreated" />
          </div>
        </div>

        <div class="mt-12 mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="activeTab = tab.name"
              :class="[
                activeTab === tab.name ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Join Battle Tab -->
        <div v-show="activeTab === 'join'">
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Loading battles...</span>
            </div>
          </div>
          <div v-else-if="!battles || battles.length === 0" class="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Active Battles</h3>
            <p class="text-gray-600 dark:text-gray-400">Be the first to create a battle and start the competition!</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            <div v-for="b in battles" :key="b.id" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 group">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ b.name || 'Epic Battle' }}</h3>
                  <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg> {{ b.players?.length || 1 }} players</span>
                    <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Live</span>
                  </div>
                </div>
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 text-sm mb-6">Join this intense battle and showcase your knowledge!</p>
              <button @click="() => joinBattle(b.id)" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-center block">Join Battle</button>
            </div>
          </div>
        </div>

        <!-- My Battles Tab -->
        <div v-show="activeTab === 'history'">
          <div v-if="historyLoading" class="flex items-center justify-center py-12">
            <div class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Loading your battle history...</span>
            </div>
          </div>
          <div v-else-if="!battleHistory || battleHistory.length === 0" class="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Battle History</h3>
            <p class="text-gray-600 dark:text-gray-400">You haven't participated in any battles yet. Create or join one!</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="b in battleHistory" :key="b.id" class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 dark:text-gray-100 text-lg">{{ b.name || 'Past Battle' }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ new Date(b.created_at).toLocaleString() }}
                  </p>
                </div>
                <div class="flex items-center gap-4 text-sm w-full sm:w-auto">
                  <div class="flex-1 text-center">
                    <div class="font-bold text-lg" :class="getScoreClass(b, auth.user.id)">{{ getMyScore(b, auth.user.id) }} - {{ getOpponentScore(b, auth.user.id) }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ getResultLabel(b, auth.user.id) }}</div>
                  </div>
                  <NuxtLink :to="`/quizee/battles/${b.id}/result`" class="flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center">
                    View Result
                  </NuxtLink>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import CreateBattle from '~/components/quizee/battle/CreateBattle.vue'
import CreateGroupBattle from '~/components/quizee/battle/CreateGroupBattle.vue'
import PageHero from '~/components/ui/PageHero.vue'

// Page meta — use quizee layout so quizee sidebar/topbar are shown when authenticated
definePageMeta({ layout: 'quizee' })
useHead({
  title: 'Battle Arena — Modeh',
  meta: [
    { name: 'description', content: 'Challenge your knowledge in fast-paced quiz battles. Create custom battles or jump into quick matches.' },
    { property: 'og:title', content: 'Battle Arena — Modeh' },
    { property: 'og:description', content: 'Challenge your knowledge in fast-paced quiz battles. Create custom battles or jump into quick matches.' }
  ]
})

const router = useRouter()
const battles = ref([])
const loading = ref(true)
const activeTab = ref('join')
const battleHistory = ref([])
const historyLoading = ref(false)
const creationMode = ref('1v1') // '1v1' or 'group'

const tabs = [
  { name: 'join', label: 'Join Battle' },
  { name: 'history', label: 'My Battles' }
]

const cfg = useRuntimeConfig()
const api = useApi()
const auth = useAuthStore()
const { push } = useAppAlert()

async function fetchActiveBattles() {
  loading.value = true
  try {
    const res = await api.get('/api/battles')
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const j = await res.json()
      battles.value = j.battles || j || []
    }
  } catch (e) {
    console.error("Failed to fetch active battles", e)
  } finally {
    loading.value = false
  }
}

async function fetchMyBattles() {
  if (!auth.user) return;
  historyLoading.value = true
  try {
    const res = await api.get('/api/me/battles')
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const j = await res.json()
      battleHistory.value = j.data || j || []
    }
  } catch (e) { console.error("Failed to fetch battle history", e) }
  historyLoading.value = false
}

onMounted(() => {
  fetchActiveBattles()
  if (auth.user) {
    fetchMyBattles()
  }
})

async function handleBattleCreated(battle) {
  if (battle?.error) {
    push({ type: 'error', message: battle.error })
    return
  }

  // Refresh active battles and switch to join tab
  await fetchActiveBattles()
  activeTab.value = 'join'
  // If API returned an id, navigate to waiting room
  if (battle && battle.id) {
    router.push(`/quizee/battles/${battle.id}`)
  }
}

function ensureAuthRedirect(redirectTo) {
  if (!auth.user) {
    // preserve intended target so user can be redirected after login
    router.push({ path: '/login', query: { next: redirectTo || window.location.pathname }})
    return false
  }
  return true
}

watch(activeTab, (newTab) => {
  if (newTab === 'join' && battles.value.length === 0) fetchActiveBattles()
  if (newTab === 'history' && battleHistory.value.length === 0) fetchMyBattles()
})

watch(() => auth.user, (newUser) => { if (newUser && battleHistory.value.length === 0) fetchMyBattles() })

function joinBattle(id) {
  if (!ensureAuthRedirect(`/quizee/battles/${id}`)) return
  router.push(`/quizee/battles/${id}`)
}

function getMyScore(battle, userId) {
  if (battle.initiator_id === userId) return battle.initiator_points ?? '?'
  if (battle.opponent_id === userId) return battle.opponent_points ?? '?'
  return '?'
}

function getOpponentScore(battle, userId) {
  if (battle.initiator_id === userId) return battle.opponent_points ?? '?'
  if (battle.opponent_id === userId) return battle.initiator_points ?? '?'
  return '?'
}

function getResultLabel(battle, userId) {
  if (battle.status !== 'completed') return battle.status
  if (battle.winner_id === null) return 'Tie'
  return battle.winner_id === userId ? 'Victory' : 'Defeat'
}

function getScoreClass(battle, userId) {
  if (battle.status !== 'completed') return 'text-gray-700 dark:text-gray-300'
  if (battle.winner_id === null) return 'text-yellow-500'
  return battle.winner_id === userId ? 'text-green-500' : 'text-red-500'
}

</script>
