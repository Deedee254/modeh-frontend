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
        <div 
          v-for="battle in battles" 
          :key="battle.id"
          class="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">Round {{ battle.round }}</h3>
              <div 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  battle.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  battle.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  battle.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                ]"
              >
                {{ battle.status.charAt(0).toUpperCase() + battle.status.slice(1) }}
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <!-- Battle Info -->
              <div class="flex items-center justify-between text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:clock" />
                  <span>{{ formatDuration(battle.duration) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="mdi:star" />
                  <span>{{ battle.points }} points</span>
                </div>
              </div>

              <!-- Participants -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img 
                    :src="battle.participant1?.avatar || '/images/default-avatar.png'" 
                    alt="Participant 1"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                  <div>
                    <div class="font-medium">{{ battle.participant1?.name || 'TBD' }}</div>
                    <div class="text-sm text-gray-600">{{ battle.participant1?.score || '-' }} points</div>
                  </div>
                </div>
                <div class="font-bold text-lg">VS</div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <div class="font-medium">{{ battle.participant2?.name || 'TBD' }}</div>
                    <div class="text-sm text-gray-600">{{ battle.participant2?.score || '-' }} points</div>
                  </div>
                  <img 
                    :src="battle.participant2?.avatar || '/images/default-avatar.png'" 
                    alt="Participant 2"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button 
              v-if="battle.status === 'ongoing' && canParticipate(battle)"
              @click="startBattle(battle.id)"
              class="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark"
            >
              Start Battle
            </button>
            <button 
              v-else-if="battle.status === 'completed'"
              @click="viewResults(battle.id)"
              class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              View Results
            </button>
            <div 
              v-else
              class="w-full px-4 py-2 text-center text-sm text-gray-600"
            >
              {{ getBattleStatusMessage(battle) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Ensure this page uses the quizee layout when rendered
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Type definitions
type Participant = {
  user_id: number
  name: string
  avatar?: string
  score?: number
}

type Battle = {
  id: number
  round: number
  status: 'upcoming' | 'ongoing' | 'completed' | string
  duration: number
  points: number
  participant1?: Participant
  participant2?: Participant
  participants: Participant[]
}

type Tournament = {
  name: string
  // add other tournament fields as needed
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const user = auth.user

const tournament = ref<Tournament | null>(null)
const battles = ref<Battle[]>([])
const loading = ref(true)

// Use credentialed fetches and defensive parsing for API responses.

// Fetch tournament and battles
const fetchData = async () => {
  try {
    loading.value = true

    // Fetch tournament show and battles list in parallel, include credentials for auth
    const [tResp, bResp] = await Promise.all([
      fetch(`/api/tournaments/${route.params.id}`, { credentials: 'include' }),
      fetch(`/api/tournaments/${route.params.id}/battles`, { credentials: 'include' })
    ])

    const [tJson, bJson] = await Promise.all([tResp.json(), bResp.json()])

    // Defensive assignments supporting multiple envelopes
    tournament.value = (tJson?.data ?? tJson) as Tournament || tournament.value

    const battleItems = bJson?.data ?? bJson ?? []
    battles.value = Array.isArray(battleItems) ? (battleItems as Battle[]) : []
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

// Check if user can participate in battle
const canParticipate = (battle: Battle): boolean => {
  // Resolve user id whether `user` is a ref or a plain object
  const u: any = user as any
  const uid = u?.value?.id ?? u?.id ?? null
  if (!uid) return false

  const participantsArr = Array.isArray(battle.participants)
    ? battle.participants
    : (battle.participants ? Object.values(battle.participants) as Participant[] : [])

  return participantsArr.some((p: Participant) => p.user_id === uid)
}

// Start battle
const startBattle = (battleId: number) => {
  router.push(`/quizee/tournaments/${route.params.id}/battles/${battleId}`)
}

// View battle results
const viewResults = (battleId: number) => {
  router.push(`/quizee/tournaments/${route.params.id}/battles/${battleId}/results`)
}

// Get battle status message
const getBattleStatusMessage = (battle: Battle): string => {
  if (battle.status === 'upcoming') return 'Battle starts soon'
  if (battle.status === 'ongoing' && !canParticipate(battle)) return 'Not your battle'
  return 'Battle ended'
}

// Format duration helper
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Fetch data on component mount
onMounted(() => {
  fetchData()
})
</script>