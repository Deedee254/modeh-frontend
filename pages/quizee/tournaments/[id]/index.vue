<template>
  <div class="p-6">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <template v-else-if="tournament">
      <!-- Tournament Header -->
      <div class="relative mb-8">
        <img 
          :src="tournament.banner || '/images/tournament-default.jpg'" 
          alt="Tournament banner"
          class="w-full h-40 sm:h-64 object-cover rounded-xl"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
        <div class="absolute bottom-6 left-6 text-white">
          <h1 class="text-4xl font-bold mb-2">{{ tournament.name }}</h1>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <Icon name="mdi:calendar" />
              <span>{{ formatDate(tournament.start_date) }} - {{ formatDate(tournament.end_date) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:account-group" />
              <span>{{ tournament.participants_count }} participants</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="mdi:trophy" class="text-yellow-400" />
              <span>{{ formatPrize(tournament.prize_pool) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tournament Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">About this Tournament</h2>
            <p class="text-gray-600 whitespace-pre-line">{{ tournament.description }}</p>
          </div>

          <!-- Rules & Requirements -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Rules & Requirements</h2>
            <ul class="list-disc list-inside text-gray-600 space-y-2">
              <li v-for="rule in tournament.rules" :key="rule">{{ rule }}</li>
            </ul>
          </div>

          <!-- Timeline -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Tournament Timeline</h2>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div class="space-y-6">
                <div v-for="(phase, index) in tournament.timeline" :key="index" class="relative pl-10">
                  <div class="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-primary"></div>
                  <h3 class="font-medium">{{ phase.name }}</h3>
                  <p class="text-sm text-gray-600">{{ formatDate(phase.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Registration Status -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Registration</h2>
            <template v-if="!isRegistered">
              <p class="text-gray-600 mb-4">Join this tournament to compete with other participants!</p>
              <button 
                @click="registerForTournament"
                :disabled="loading || !canRegister"
                class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300"
              >
                Register Now
              </button>
            </template>
            <template v-else>
              <div class="text-green-600 font-medium mb-4">
                <Icon name="mdi:check-circle" class="inline-block mr-2" />
                You're registered!
              </div>
              <button 
                @click="viewBattles"
                class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
              >
                View Battles
              </button>
            </template>
          </div>

          <!-- Leaderboard Preview -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Top Players</h2>
              <button 
                @click="router.push(`/quizee/tournaments/${tournament.id}/leaderboard`)"
                class="text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div class="space-y-4">
              <div 
                v-for="(player, index) in topPlayers" 
                :key="player.id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div 
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center font-medium',
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <img 
                    :src="player.avatar" 
                    alt="Player avatar"
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <span class="font-medium">{{ player.name }}</span>
                </div>
                <span class="font-medium">{{ player.points }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta?.({ layout: 'quizee' })
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Types
type Tournament = {
  id: number
  banner?: string
  name: string
  start_date: string
  end_date: string
  participants_count: number
  prize_pool: number
  description: string
  rules: string[]
  timeline: { name: string; date: string }[]
  registration_end_date: string
  status: string
}

type Player = {
  id: number
  avatar: string
  name: string
  points: number
}

// State
const loading = ref(false)
const tournament = ref<Tournament | null>(null)
const isRegistered = ref(false)
const topPlayers = ref<Player[]>([])
const canRegister = ref(true)

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const config = useRuntimeConfig()

// Fetch tournament details
const fetchTournament = async () => {
  try {
    loading.value = true
    // Use $fetch with credentials to call the backend API
  const json: any = await $fetch(config.public.apiBase + `/api/tournaments/${route.params.id}`, { credentials: 'include' })

    // Defensive: backend may return the model directly or in different envelopes
    tournament.value = (json?.data ?? json) as Tournament || null

    await checkRegistrationStatus()
    await fetchLeaderboard()
  } catch (error) {
    console.error('Error fetching tournament:', error)
  } finally {
    loading.value = false
  }
}

// Check if user is registered
const checkRegistrationStatus = async () => {
  try {
  const json: any = await $fetch(config.public.apiBase + `/api/tournaments/${route.params.id}/registration-status`, { credentials: 'include' })
    // Accept { isRegistered: true } or { data: { isRegistered: true } }
    isRegistered.value = !!(json?.data?.isRegistered ?? json?.isRegistered)
  } catch (error) {
    console.error('Error checking registration status:', error)
  }
}

// Fetch leaderboard
const fetchLeaderboard = async () => {
  try {
  const json: any = await $fetch(config.public.apiBase + `/api/tournaments/${route.params.id}/leaderboard`, { credentials: 'include' })
    // Backend returns { tournament: {...}, leaderboard: [...] }
    const list = json?.leaderboard ?? json?.data ?? json ?? []
    topPlayers.value = Array.isArray(list) ? (list as Player[]).slice(0, 5) : []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
  }
}

// Register for tournament
const registerForTournament = async () => {
  try {
    loading.value = true
    // Use the server endpoint defined in backend: POST /api/tournaments/{tournament}/join
    const json = await $fetch(config.public.apiBase + `/api/tournaments/${route.params.id}/join`, { method: 'POST', credentials: 'include' })
    // If $fetch throws for non-2xx responses it will be caught; otherwise assume success
    isRegistered.value = true
    // Refresh details (server adds is_participant on show)
    await fetchTournament()
  } catch (error) {
    console.error('Error registering for tournament:', error)
  } finally {
    loading.value = false
  }
}

// View battles
const viewBattles = () => {
  router.push(`/quizee/tournaments/${tournament.value?.id}/battles`)
}

// Format helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatPrize = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Fetch data on component mount
onMounted(() => {
  fetchTournament()
})
</script>