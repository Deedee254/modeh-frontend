<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-8">
          <button @click="$router.back()" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Back
          </button>
          <h1 class="text-3xl font-bold mb-2">Tournament Battles</h1>
          <p class="text-gray-600">{{ tournament?.name }}</p>
        </div>

        <!-- Battles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TournamentBattleCard
            v-for="battle in battles"
            :key="battle.id"
            :battle="battle"
            @start="startBattle(battle.id)"
            @view-results="viewResults(battle.id)"
            :can-participate="canParticipate(battle)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta({ layout: 'quizee' })
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTournamentRealtime } from '~/composables/useTournamentRealtime'
import { useApi } from '~/composables/useApi'
import type { Tournament, TournamentBattle } from '~/types/tournament'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const user = auth.user
const api = useApi()

const tournament = ref<Tournament | null>(null)
const battles = ref<TournamentBattle[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const { battleUpdates, isConnected } = useTournamentRealtime(route.params.id as string)

// Watch for real-time battle updates
watch(battleUpdates, (updates) => {
  updates.forEach(update => {
    const index = battles.value.findIndex(b => b.id === update.id)
    if (index !== -1) {
      battles.value[index] = { ...battles.value[index], ...update }
    }
  })
})

// Fetch tournament and battles
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null

    const [tournamentResponse, battlesResponse] = await Promise.all([
      api.get(`/api/tournaments/${route.params.id}`),
      api.get(`/api/tournaments/${route.params.id}/battles`)
    ])

    if (!tournamentResponse.ok) {
      throw new Error('Failed to load tournament data')
    }

    if (!battlesResponse.ok) {
      throw new Error('Failed to load battles data')
    }

    const [tournamentJson, battlesJson] = await Promise.all([
      tournamentResponse.json(),
      battlesResponse.json()
    ])

    // Handle tournament data
    const tournamentData = tournamentJson?.data ?? tournamentJson
    if (!tournamentData) {
      throw new Error('Failed to load tournament data')
    }
    tournament.value = tournamentData

    // Handle battles data
    const battlesData = battlesJson?.data ?? battlesJson ?? []
    battles.value = Array.isArray(battlesData) ? battlesData : []
  } catch (error) {
    console.error('Error fetching data:', error)
    error.value = error instanceof Error ? error.message : 'Failed to load battles'
  } finally {
    loading.value = false
  }
}

// Check if user can participate in battle
const canParticipate = (battle: TournamentBattle): boolean => {
  // Resolve user id whether `user` is a ref or a plain object
  const u: any = user as any
  const uid = u?.value?.id ?? u?.id ?? null
  if (!uid) return false

  return battle.player1_id === uid || battle.player2_id === uid
}

// Start battle
const startBattle = (battleId: number | string) => {
  router.push(`/quizee/tournaments/${route.params.id}/battles/${battleId}`)
}

// View battle results
const viewResults = (battleId: number | string) => {
  router.push(`/quizee/tournaments/${route.params.id}/battles/${battleId}/results`)
}

// Fetch data on component mount
onMounted(() => {
  fetchData()
})
</script>