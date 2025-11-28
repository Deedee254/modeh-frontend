<template>
  <div class="min-h-screen bg-gray-50">
    <PageHero
      title="My Points & Rewards"
      description="Track your points, see your rank, view your badges, and redeem your points for awesome rewards!"
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Points', current: true }]"
      padding="py-8 sm:py-12"
    />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Level Progress -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div class="flex items-center gap-4">
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              :style="{ backgroundColor: userStats.level?.color_scheme + '20', color: userStats.level?.color_scheme }"
            >
              {{ userStats.level?.icon || '🎯' }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Level {{ userStats.level?.name || 'Novice' }}</h2>
              <p class="text-gray-600">{{ userStats.level?.description }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Next Level</p>
            <p class="font-medium">{{ userStats.next_level?.points_needed || 0 }} points needed</p>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :style="{ 
              width: `${userStats.level?.progress || 0}%`,
              backgroundColor: userStats.level?.color_scheme 
            }"
          ></div>
        </div>
        <p class="text-sm text-gray-500 text-center">{{ userStats.level?.progress || 0 }}% to {{ userStats.next_level?.name || 'next level' }}</p>
      </div>

      <!-- Points Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Total Points</p>
          <p class="text-4xl font-bold text-brand-600 mt-2">{{ userStats.total_points || 0 }}</p>
          <p class="text-xs text-gray-500 mt-2">Lifetime earnings</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Current Rank</p>
          <p class="text-4xl font-bold text-gray-800 mt-2">#{{ userStats.rank || 'N/A' }}</p>
          <p class="text-xs text-gray-500 mt-2">Among all quizees</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p class="text-sm text-gray-500">Achievements</p>
          <p class="text-4xl font-bold text-emerald-600 mt-2">
            {{ userStats.unlocked_achievements || 0 }}/{{ userStats.total_achievements || 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-2">Badges unlocked</p>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="achievement in recentAchievements" :key="achievement.id" 
                   class="bg-gradient-to-br from-brand-600/10 to-brand-950/10 rounded-lg p-4 flex items-center gap-4">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="achievement in nextAchievements" :key="achievement.id" 
                   class="border rounded-lg p-4">
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
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Redeem Points</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="reward in availableRewards" :key="reward.id" class="border rounded-lg p-4 flex flex-col items-center text-center">
            <div class="text-4xl mb-2">{{ reward.icon }}</div>
            <h3 class="font-semibold text-lg">{{ reward.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ reward.description }}</p>
            <div class="text-brand-600 font-bold text-xl mb-4">{{ reward.points }} Points</div>
            <button 
              @click="redeem(reward)"
              :disabled="(userStats.total_points || 0) < reward.points"
              class="w-full mt-auto px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
const achievements = ref([])
const loading = ref(true)
const recentAchievements = ref([])
const nextAchievements = ref([])

const availableRewards = ref([
  { id: 1, name: 'Ksh 50 Airtime', description: 'Get a KES 50 airtime voucher for any network.', points: 500, icon: '📱' },
  { id: 2, name: 'Ksh 100 Airtime', description: 'Get a KES 100 airtime voucher for any network.', points: 950, icon: '📱' },
  { id: 3, name: 'Unlock a Premium Quiz', description: 'Use your points to access a special premium quiz.', points: 200, icon: '✨' },
])

onMounted(async () => {
  loading.value = true
  try {
    const [achievementsRes, rewardsRes, userStatsRes] = await Promise.all([
      api.get('/api/achievements/progress').then(res => res.ok ? res.json() : null),
      api.get('/api/rewards/my').then(res => res.ok ? res.json() : null),
      api.get('/api/user/stats').then(res => res.ok ? res.json() : null)
    ])
    
    if (!achievementsRes || !rewardsRes) {
      throw new Error('Failed to load data')
    }

    // Update achievements data
    achievements.value = achievementsRes.achievements || []

    // Process recent and next achievements
    recentAchievements.value = achievements.value
      .filter(a => a.unlocked && a.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 3)

    nextAchievements.value = achievements.value
      .filter(a => !a.unlocked)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)

    // Merge user stats: prefer authoritative user/stats endpoint for points/level info
    const backendPoints = userStatsRes?.points ?? null
    const backendLevel = userStatsRes?.level ?? null
    const backendNextLevel = userStatsRes?.next_level ?? null

    userStats.value = {
      // Prefer backend user-level points, fall back to achievements-derived points
      total_points: backendPoints ?? (achievementsRes.stats?.total_points ?? 0),
      unlocked_achievements: achievementsRes.stats?.unlocked_achievements ?? 0,
      total_achievements: achievementsRes.stats?.total_achievements ?? 0,
      // rank: prefer the dedicated user stats rank if present, otherwise fallback to rewards response
      rank: (userStatsRes?.ranks?.global ?? rewardsRes.stats?.rank) ?? 'N/A',
      // include level and next_level objects so the template can show color, icon, progress etc.
      level: backendLevel,
      next_level: backendNextLevel
    }

    // Update activity
    activity.value = rewardsRes.activity || []

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
