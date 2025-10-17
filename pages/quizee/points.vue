<template>
  <div>
    <PageHero
      title="My Points & Rewards"
      description="Track your points, see your rank, view your badges, and redeem your points for awesome rewards!"
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Points', current: true }]"
    />

    <div class="p-6 max-w-7xl mx-auto">
      <!-- Points Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Total Points</p>
          <p class="text-4xl font-bold text-indigo-600 mt-2">{{ userStats.total_points || 0 }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Current Rank</p>
          <p class="text-4xl font-bold text-gray-800 mt-2">#{{ userStats.rank || 'N/A' }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Quizzes Completed</p>
          <p class="text-4xl font-bold text-gray-800 mt-2">{{ userStats.quizzes_completed || 0 }}</p>
        </div>
      </div>

      <!-- Badges Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">My Badges</h2>
        <div v-if="loading" class="flex gap-4 overflow-x-auto pb-4">
          <UiSkeleton v-for="i in 4" :key="i" class="h-24 w-24 rounded-full flex-shrink-0" />
        </div>
        <div v-else-if="!badges.length" class="text-center py-8 text-gray-500">
          <p>No badges earned yet.</p>
          <p class="text-sm mt-1">Keep completing quizzes and challenges to earn them!</p>
        </div>
        <div v-else class="flex gap-4 overflow-x-auto pb-4">
          <div v-for="badge in badges" :key="badge.id" class="flex flex-col items-center text-center w-28 flex-shrink-0">
            <img :src="badge.icon_url || '/logo/badge-placeholder.svg'" :alt="badge.name" class="w-20 h-20 mb-2" />
            <p class="text-sm font-medium text-gray-800">{{ badge.name }}</p>
            <p class="text-xs text-gray-500">{{ new Date(badge.earned_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <!-- Redeem Points Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Redeem Points</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="reward in availableRewards" :key="reward.id" class="border rounded-lg p-4 flex flex-col items-center text-center">
            <div class="text-4xl mb-2">{{ reward.icon }}</div>
            <h3 class="font-semibold text-lg">{{ reward.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ reward.description }}</p>
            <div class="text-indigo-600 font-bold text-xl mb-4">{{ reward.points }} Points</div>
            <button 
              @click="redeem(reward)"
              :disabled="(userStats.total_points || 0) < reward.points"
              class="w-full mt-auto px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div v-if="loading" class="space-y-4">
          <UiSkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
        </div>
        <div v-else-if="!activity.length" class="text-center py-8 text-gray-500">
          <p>No recent activity to show.</p>
          <p class="text-sm mt-1">Complete quizzes and challenges to earn points!</p>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="item in activity" :key="item.id" class="py-4 flex justify-between items-center">
            <div>
              <p class="font-medium text-gray-800">{{ item.description }}</p>
              <p class="text-sm text-gray-500">{{ new Date(item.created_at).toLocaleString() }}</p>
            </div>
            <div class="text-lg font-semibold" :class="item.points > 0 ? 'text-green-600' : 'text-red-600'">
              {{ item.points > 0 ? '+' : '' }}{{ item.points }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quizee' })

const api = useApi()
const alert = useAppAlert()

const userStats = ref({})
const activity = ref([])
const badges = ref([])
const loading = ref(true)

const availableRewards = ref([
  { id: 1, name: 'Ksh 50 Airtime', description: 'Get a KES 50 airtime voucher for any network.', points: 500, icon: '📱' },
  { id: 2, name: 'Ksh 100 Airtime', description: 'Get a KES 100 airtime voucher for any network.', points: 950, icon: '📱' },
  { id: 3, name: 'Unlock a Premium Quiz', description: 'Use your points to access a special premium quiz.', points: 200, icon: '✨' },
])

onMounted(async () => {
  loading.value = true
  try {
    const [rewardsRes, badgesRes] = await Promise.all([
      api.get('/api/rewards/my'),
      api.get('/api/user/badges')
    ])
    
    userStats.value = rewardsRes.data?.stats || {}
    activity.value = rewardsRes.data?.activity || []
    badges.value = badgesRes.data?.badges || []

  } catch (error) {
    console.error("Failed to fetch points data:", error)
    alert.push({ type: 'error', message: 'Could not load your points and rewards.' })
  } finally {
    loading.value = false
  }
})

function redeem(reward) {
  // Optimistic UI: Show a success message.
  // In a real app, you would call an API endpoint here.
  alert.push({
    type: 'success',
    message: `You have successfully redeemed "${reward.name}"!`,
  })
}
</script>
