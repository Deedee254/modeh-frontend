<template>
  <div class="p-6">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-8">
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
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta({ layout: 'quizee' })
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTournamentRealtime } from '~/composables/useTournamentRealtime'
import type { Tournament, TournamentBattle } from '~/types/tournament'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const user = auth.user

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

    const api = useApi()
    const [tournamentResponse, battlesResponse] = await Promise.all([
      api.get(`/tournaments/${route.params.id}`),
      api.get(`/tournaments/${route.params.id}/battles`)
    ])

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