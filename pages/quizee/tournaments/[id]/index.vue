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
            <div class="mt-3">
              <div v-if="nextRoundAt" class="inline-flex items-center gap-2 px-3 py-1 bg-black/40 text-white rounded">
                <Icon name="mdi:clock-outline" />
                <span>Next round: {{ formatDate(nextRoundAt) }}</span>
              </div>
            </div>
            <div v-if="tournament.winner" class="ml-4 flex items-center gap-3">
              <Icon name="mdi:trophy-outline" class="text-yellow-300" />
              <img :src="tournament.winner.avatar" alt="winner avatar" class="w-10 h-10 rounded-full object-cover" />
              <div class="text-sm">
                <div class="font-semibold">Winner</div>
                <div class="text-sm">{{ tournament.winner.name }}</div>
              </div>
            </div>
          </div>
          <!-- Share button -->
          <div class="absolute right-6 bottom-6">
            <AffiliateShareButton
              itemType="Tournament"
              :itemId="tournament.id"
              :baseUrl="baseUrl"
            />
          </div>
        </div>
      </div>

      <!-- Tournament Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- User Battle / Taking Area -->
          <div v-if="currentBattle" class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Your Battle — Round {{ currentBattle.round }}</h2>

            <template v-if="isTaking">
              <p class="text-gray-600 mb-4">You have an active battle. Answer the questions below to complete your match.</p>
              <div v-if="currentBattle.question">
                <QuestionCard :question="currentBattle.question" />
                <div class="mt-4">
                  <button @click="router.push(`/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`)" class="bg-primary text-white px-4 py-2 rounded">Open Battle Details</button>
                </div>
              </div>
              <div v-else class="text-gray-600">Questions for this battle are not yet available. <button @click="viewBattles" class="text-primary underline">Go to Battles</button></div>
            </template>

            <template v-else>
              <p class="text-gray-600 mb-4">You are scheduled to play in this round.</p>
              <div class="flex gap-3">
                <button @click="viewBattles" class="bg-primary text-white px-4 py-2 rounded">View Battle</button>
                <button @click="router.push(`/quizee/tournaments/${tournament.id}/battles/${currentBattle.id}`)" class="border px-4 py-2 rounded">Battle Details</button>
              </div>
            </template>

          </div>
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
definePageMeta({ layout: 'quizee' })
import { ref, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import QuestionCard from '~/components/quizee/questions/QuestionCard.vue'
import useApi from '~/composables/useApi'
import AffiliateShareButton from '~/components/AffiliateShareButton.vue'
const api = useApi()
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const baseUrl = computed(() => `${config.public.baseUrl}/tournaments`)

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
  // optional winner object may be attached by the API envelope
  winner?: { avatar?: string; name?: string } | null
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
const battles = ref<any[]>([])
const nextRoundAt = ref<string | null>(null)
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
    // Use useApi composable for authenticated API call
    const response = await api.get(`/api/tournaments/${route.params.id}`)
    const json: any = await response.json()

    // Defensive: backend may return the model directly or in different envelopes
    const data = json?.data ?? json
    tournament.value = data ? {
      id: data.id,
      banner: data.banner,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      participants_count: data.participants_count,
      prize_pool: data.prize_pool,
      description: data.description,
      rules: data.rules || [],
      timeline: data.timeline || [],
      registration_end_date: data.registration_end_date,
      status: data.status,
      winner: data.winner
    } as Tournament : null

    // compute next scheduled round time if battles are present
    try {
      const _battles = (json?.battles ?? json?.data?.battles) || []
      battles.value = Array.isArray(_battles) ? _battles : []
      if (Array.isArray(battles) && battles.length) {
        const scheduled = battles.value.filter((b: any) => b.status === 'scheduled' && b.scheduled_at)
        if (scheduled.length) {
          scheduled.sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
          nextRoundAt.value = scheduled[0].scheduled_at
        }
      }
    } catch (e) { /* ignore */ }

    await checkRegistrationStatus()
    await fetchLeaderboard()
  } catch (error) {
    console.error('Error fetching tournament:', error)
  } finally {
    loading.value = false
  }
}

// computed: current battle for logged-in user
const currentBattle = computed(() => {
  try {
    const userId = (auth.user as any)?.id
    if (!userId || !battles.value || !battles.value.length) return null
    return battles.value.find((b: any) => (b.player1_id === userId || b.player2_id === userId) && b.status !== 'completed') || null
  } catch (e) { return null }
})

const isTaking = computed(() => {
  return !!(currentBattle.value && ['active', 'in_progress', 'started'].includes((currentBattle.value.status || '').toString()))
})

// Check if user is registered
const checkRegistrationStatus = async () => {
  try {
    const response = await api.get(`/api/tournaments/${route.params.id}/registration-status`)
    const json: any = await response.json()
    // Accept { isRegistered: true } or { data: { isRegistered: true } }
    isRegistered.value = !!(json?.data?.isRegistered ?? json?.isRegistered)
  } catch (error) {
    console.error('Error checking registration status:', error)
  }
}

// Fetch leaderboard
const fetchLeaderboard = async () => {
  try {
    const response = await api.get(`/api/tournaments/${route.params.id}/leaderboard`)
    const json: any = await response.json()
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
    const res = await api.postJson(`/api/tournaments/${route.params.id}/join`, {})
    if (api.handleAuthStatus(res)) return

    // If registration succeeded
    if (res.ok) {
      isRegistered.value = true
      await fetchTournament()
      return
    }

    // Try to parse structured JSON response for special cases
    let body = null
    try { body = await res.json() } catch (e) { body = null }

    // Backend indicates the user must pay an entry fee to join
    if (res.status === 402 && body && body.code === 'payment_required') {
      // Redirect to checkout page with type=tournament and id so user can pay once for the whole tournament
      const qs: Record<string, string> = { type: 'tournament', id: String(route.params.id) }
      // include amount when available so checkout can pre-fill price
      if (body.amount) qs['amount'] = String(body.amount)
      router.push({ path: '/quizee/payments/checkout', query: qs })
      return
    }

    // Handle known structured errors like limit_reached (403) if present
    if (res.status === 403 && body && body.code === 'limit_reached') {
      const qs = new URLSearchParams({ reason: 'limit', type: body.limit?.type || 'unknown', value: String(body.limit?.value || '') })
      router.push('/quizee/subscription?' + qs.toString())
      return
    }

    // Fallback: log and show generic error
    console.error('Registration failed', res.status, body)
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