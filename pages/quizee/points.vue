<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee/dashboard" class="hover:text-brand-600">Dashboard</NuxtLink>
        <span class="mx-2">›</span>
        <span>Points</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Points & Rewards</h1>
      <p class="text-gray-600 mb-6">Track your points, see your rank, view your badges, and redeem your points for awesome rewards!</p>
    </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Level & Stats Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Left Column: Circular Level Progress -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border p-8 sticky top-6 h-fit">
            <div class="flex flex-col items-center">
              <!-- Circular Progress -->
              <div class="relative w-48 h-48 flex items-center justify-center mb-6">
                <!-- Background circle -->
                <svg class="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="8" />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    :stroke="userStats.level?.color_scheme || '#8B5CF6'"
                    stroke-width="8"
                    stroke-dasharray="565.48"
                    :stroke-dashoffset="`${565.48 * (1 - (userStats.level?.progress || 0) / 100)}`"
                    class="transition-all duration-500"
                    stroke-linecap="round"
                  />
                </svg>
                <!-- Center content -->
                <div class="text-center z-10">
                  <div class="text-5xl mb-2">{{ userStats.level?.icon || '🎯' }}</div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Level</p>
                  <p class="text-3xl font-bold text-gray-900">{{ userStats.level?.name || 'Novice' }}</p>
                </div>
              </div>
              
              <!-- Progress Text -->
              <div class="w-full text-center mb-4">
                <p class="text-sm font-semibold text-gray-900 mb-1">{{ userStats.level?.progress || 0 }}% Complete</p>
                <p class="text-xs text-gray-500">{{ userStats.next_level?.points_needed || 0 }} points to next level</p>
              </div>

              <!-- Level Description -->
              <p class="text-center text-sm text-gray-600 italic">{{ userStats.level?.description }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Stats Cards Grid (2x2) -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- Total Points Card -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Total Points</p>
                  <p class="text-4xl font-bold text-blue-600">{{ userStats.total_points || 0 }}</p>
                </div>
                <div class="text-4xl">⭐</div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">Lifetime earnings</p>
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <!-- Current Rank Card -->
            <div class="bg-gradient-to-br from-purple-50 to-purple-50 rounded-2xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Global Rank</p>
                  <p class="text-4xl font-bold text-purple-600">#{{ userStats.rank || 'N/A' }}</p>
                </div>
                <div class="text-4xl">🏆</div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">Among all quizees</p>
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <!-- Achievements Card -->
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Achievements</p>
                  <p class="text-4xl font-bold text-emerald-600">{{ userStats.unlocked_achievements || 0 }}<span class="text-2xl text-gray-400">/{{ userStats.total_achievements || 0 }}</span></p>
                </div>
                <div class="text-4xl">🎖️</div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">Badges unlocked</p>
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <!-- Streak/Stats Card (expandable for future use) -->
            <div class="bg-gradient-to-br from-amber-50 to-amber-50 rounded-2xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                  <p class="text-4xl font-bold text-amber-600">{{ userStats.streak || 0 }}<span class="text-2xl text-gray-400"> days</span></p>
                </div>
                <div class="text-4xl">🔥</div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">Keep it going!</p>
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">My Achievements</h2>
          <NuxtLink to="/quizee/badges" class="text-sm text-brand-600 hover:text-brand-700">View All Achievements →</NuxtLink>
        </div>

        <div v-if="loading" class="space-y-4">
          <UiSkeleton v-for="i in 3" :key="i" class="h-32" />
        </div>

        <div v-else-if="!achievements.length" class="text-center py-8 text-gray-500">
          <p>No achievements unlocked yet.</p>
          <p class="text-sm mt-1">Complete quizzes and take on challenges to earn achievements!</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Recently Unlocked -->
          <div v-if="recentAchievements.length" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recently Unlocked 🎉</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div v-for="achievement in recentAchievements" :key="achievement.id" 
                   class="bg-gradient-to-br from-brand-600/10 to-brand-950/10 rounded-xl p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-950 flex items-center justify-center text-xl text-white">
                  {{ achievement.icon }}
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ achievement.name }}</h4>
                  <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                  <p class="text-xs text-brand-600 mt-1">Earned {{ formatDate(achievement.completed_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Next Achievements -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Next Achievements to Unlock 🎯</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div v-for="achievement in nextAchievements" :key="achievement.id" 
                   class="border rounded-xl p-4">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {{ achievement.icon }}
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ achievement.name }}</h4>
                    <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                  </div>
                </div>
                <div class="mt-2">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-medium">{{ achievement.progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-brand-600 h-2 rounded-full transition-all" 
                         :style="{ width: `${achievement.progress}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Redeem Points Section -->
      <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Redeem Points</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div v-for="reward in availableRewards" :key="reward.id" class="border rounded-xl p-4 flex flex-col items-center text-center">
            <div class="text-4xl mb-2">{{ reward.icon }}</div>
            <h3 class="font-semibold text-lg">{{ reward.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ reward.description }}</p>
            <div class="text-brand-600 font-bold text-xl mb-4">{{ reward.points }} Points</div>
            <button 
              @click="redeem(reward)"
              :disabled="(userStats.total_points || 0) < reward.points"
              class="w-full mt-auto px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div v-if="loading" class="space-y-4">
          <UiSkeleton v-for="i in 1" :key="i" class="h-12 rounded-xl" />
        </div>
        <div v-else-if="!activity.length" class="text-center py-8 text-gray-500">
          <p>No recent activity to show.</p>
          <p class="text-sm mt-1">Complete quizzes and challenges to earn points!</p>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="item in activity" :key="item.id" class="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p class="font-medium text-gray-800">{{ item.description }}</p>
              <p class="text-sm text-gray-500">{{ new Date(item.created_at).toLocaleString() }}</p>
            </div>
            <div class="text-lg font-semibold" :class="item.points > 0 ? '' : 'text-red-600'" :style="item.points > 0 ? { color: '#891f21' } : {}">
              {{ item.points > 0 ? '+' : '' }}{{ item.points }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quizee' })

const api = useApi()
const alert = useAppAlert()

const userStats = ref({})
const activity = ref([])
const loading = ref(true)
const achievements = ref([])

const recentAchievements = computed(() => {
  if (!Array.isArray(achievements.value)) return []
  // Filter achievements that have been completed (have completed_at date)
  return achievements.value
    .filter(a => a?.completed_at)
    .sort((a, b) => new Date(b?.completed_at).getTime() - new Date(a?.completed_at).getTime())
    .slice(0, 3)
})

const nextAchievements = computed(() => {
  if (!Array.isArray(achievements.value)) return []
  // Filter achievements that haven't been completed yet
  return achievements.value
    .filter(a => !a?.completed_at)
    .slice(0, 3)
})

const availableRewards = ref([
  { id: 1, name: 'Ksh 50 Airtime', description: 'Get a KES 50 airtime voucher for any network.', points: 500, icon: '📱' },
  { id: 2, name: 'Ksh 100 Airtime', description: 'Get a KES 100 airtime voucher for any network.', points: 950, icon: '📱' },
  { id: 3, name: 'Unlock a Premium Quiz', description: 'Use your points to access a special premium quiz.', points: 200, icon: '✨' },
])

onMounted(async () => {
  loading.value = true
  try {
    // Fetch user stats which includes achievements count, activity, and all stats
    const userStatsRes = await api.get('/api/user/stats').then(res => res.ok ? res.json() : null)
    
    if (!userStatsRes) {
      throw new Error('Failed to load user stats')
    }

    // Set user stats from authoritative /api/user/stats endpoint
    const backendPoints = userStatsRes.points ?? 0
    const backendLevel = userStatsRes.level ?? null
    const backendNextLevel = userStatsRes.next_level ?? null

    userStats.value = {
      total_points: backendPoints,
      unlocked_achievements: userStatsRes.unlocked_achievements ?? 0,
      total_achievements: userStatsRes.total_achievements ?? 0,
      rank: userStatsRes.ranks?.global ?? 'N/A',
      level: backendLevel,
      next_level: backendNextLevel,
      streak: userStatsRes.streak ?? 0,
      best_streak: userStatsRes.best_streak ?? 0,
      total_quizzes_taken: userStatsRes.total_quizzes_taken ?? 0,
      average_score: userStatsRes.average_score ?? 0,
      last_activity: userStatsRes.last_activity ?? null
    }

    // Update activity from user stats
    activity.value = userStatsRes.activity || []
    
    // Initialize achievements array from API response
    // Full achievements data is available on /quizee/badges page
    // This page shows recent/next achievements summary
    if (Array.isArray(userStatsRes.achievements)) {
      achievements.value = userStatsRes.achievements
    } else if (Array.isArray(userStatsRes.unlocked_achievements)) {
      achievements.value = userStatsRes.unlocked_achievements
    } else {
      achievements.value = []
    }

  } catch (error) {
    console.error("Failed to fetch points data:", error)
    alert.push({ type: 'error', message: 'Could not load your points and achievements.' })
  } finally {
    loading.value = false
  }
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function redeem(reward) {
  try {
    const res = await api.postJson('/api/rewards/redeem', { id: reward.id })
    if (!res.ok) {
      throw new Error('Failed to redeem reward')
    }
    alert.push({
      type: 'success',
      message: `You have successfully redeemed "${reward.name}"!`,
    })
  } catch (error) {
    console.error("Failed to redeem reward:", error)
    alert.push({
      type: 'error',
      message: 'Failed to redeem reward. Please try again.',
    })
  }
}
</script>
