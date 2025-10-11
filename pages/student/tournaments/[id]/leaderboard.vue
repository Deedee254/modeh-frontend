<template>
  <div class="p-6">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Tournament Leaderboard</h1>
        <p class="text-gray-600">{{ tournament?.name }}</p>
      </div>

      <!-- Top 3 Players -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Second Place -->
        <div class="md:order-1 md:mt-8">
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="relative inline-block">
              <img 
                :src="topPlayers[1]?.avatar || '/images/default-avatar.png'"
                alt="Second place"
                class="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
              >
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold">
                2
              </div>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ topPlayers[1]?.name || 'TBD' }}</h3>
            <p class="text-gray-600">{{ topPlayers[1]?.points || 0 }} points</p>
          </div>
        </div>

        <!-- First Place -->
        <div class="md:order-2">
          <div class="bg-gradient-to-b from-yellow-50 to-white rounded-xl shadow-sm p-6 text-center">
            <div class="relative inline-block">
              <img 
                :src="topPlayers[0]?.avatar || '/images/default-avatar.png'"
                alt="First place"
                class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-yellow-400"
              >
              <div class="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
            </div>
            <h3 class="font-bold text-xl mb-1">{{ topPlayers[0]?.name || 'TBD' }}</h3>
            <p class="text-gray-600 text-lg">{{ topPlayers[0]?.points || 0 }} points</p>
          </div>
        </div>

        <!-- Third Place -->
        <div class="md:order-3 md:mt-16">
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="relative inline-block">
              <img 
                :src="topPlayers[2]?.avatar || '/images/default-avatar.png'"
                alt="Third place"
                class="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-orange-200"
              >
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold">
                3
              </div>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ topPlayers[2]?.name || 'TBD' }}</h3>
            <p class="text-gray-600">{{ topPlayers[2]?.points || 0 }} points</p>
          </div>
        </div>
      </div>

      <!-- Full Leaderboard -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Rank</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Player</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Battles Won</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Total Points</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Win Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="(player, index) in leaderboard" 
                :key="player.id"
                :class="{'bg-gray-50': index % 2 === 0}"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span 
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center font-medium',
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'text-gray-500'
                      ]"
                    >
                      {{ index + 1 }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="player.avatar" 
                      alt="Player avatar"
                      class="w-8 h-8 rounded-full object-cover"
                    >
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">{{ player.name }}</div>
                      <div class="text-sm text-gray-500">{{ player.title || 'Player' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                  {{ player.battles_won }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ player.points }}</div>
                  <div class="text-sm text-gray-500">points</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div 
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium inline-block',
                      player.win_rate >= 70 ? 'bg-green-100 text-green-700' :
                      player.win_rate >= 40 ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ player.win_rate }}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta?.({ layout: 'quizee' })
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Define interfaces for tournament and player
interface Tournament {
  id: number | string
  name: string
  // Add other tournament fields if needed
}

interface Player {
  id: number | string
  name: string
  avatar: string
  title?: string
  battles_won: number
  points: number
  win_rate: number
}

const route = useRoute()
const auth = useAuthStore()

const tournament = ref<Tournament | null>(null)
const leaderboard = ref<Player[]>([])
const loading = ref(true)

// Computed top 3 players
const topPlayers = computed(() => {
  return leaderboard.value.slice(0, 3)
})

// Fetch tournament and leaderboard data
const fetchData = async () => {
  try {
    loading.value = true
    const [tournamentResponse, leaderboardResponse] = await Promise.all([
      useFetch(`/api/tournaments/${route.params.id}`),
      useFetch(`/api/tournaments/${route.params.id}/leaderboard`)
    ])

    // tournamentResponse may return the tournament directly or inside an envelope
    const tdata: any = tournamentResponse?.data?.value ?? null
    tournament.value = (tdata?.tournament ?? tdata) as Tournament

    // leaderboardResponse may return { leaderboard: [...] } or an array directly
    const ldata: any = leaderboardResponse?.data?.value ?? null
    if (Array.isArray(ldata)) {
      leaderboard.value = ldata as Player[]
    } else if (ldata && Array.isArray(ldata.leaderboard)) {
      leaderboard.value = ldata.leaderboard as Player[]
    } else if (ldata && Array.isArray(ldata.data)) {
      leaderboard.value = ldata.data as Player[]
    } else {
      leaderboard.value = []
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchData()
})
</script>