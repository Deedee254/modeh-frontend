<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
        <!-- Hero (using shared PageHero for consistent styling) -->
        <PageHero
          title="Daily Challenge"
          description="Test your knowledge with today's daily quiz challenge. Complete it to earn points and climb the leaderboard!"
          variant="gradient"
          align="center"
          padding="pt-12 pb-10"
        >
        <template #stats>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-3 text-white text-center">
            <p class="text-xs uppercase tracking-wide text-white/70">Points</p>
            <p class="mt-2 text-xl font-semibold">{{ challenge?.points_reward ?? '\u2014' }}</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-3 text-white text-center">
            <p class="text-xs uppercase tracking-wide text-white/70">Difficulty</p>
            <p class="mt-2 text-xl font-semibold">{{ challenge?.difficulty ?? '\u2014' }}</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-3 text-white text-center">
            <p class="text-xs uppercase tracking-wide text-white/70">Attempts</p>
            <p class="mt-2 text-xl font-semibold">{{ history?.length ?? 0 }}</p>
          </div>
        </template>

        <template #highlight-icon>
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </template>
        </PageHero>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main column -->
        <div class="lg:col-span-2">
          <!-- Header with timer & meta -->
          <div class="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 class="text-lg font-semibold">A new quiz every day. Test your knowledge and compete with others!</h3>
              <p class="text-sm text-gray-500">Today's Theme: <strong class="text-gray-700">{{ challenge?.theme_name || challenge?.subject?.name || 'General' }}</strong></p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <div class="text-xs text-gray-500">Time Remaining</div>
                <div class="text-lg font-mono font-semibold">{{ timeRemaining }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-500">Top Prize</div>
                <div class="text-lg font-semibold">{{ challenge?.top_prize || challenge?.points_reward || '—' }} Coins</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-500">Your Streak</div>
                <div class="text-lg font-semibold">{{ streak || 0 }} Days</div>
              </div>
            </div>
          </div>

          <!-- Daily Challenge Card -->
          <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3 text-gray-500">
          <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading daily challenge...</span>
        </div>
      </div>

      <div v-else-if="!challenge" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Daily Challenge Today</h3>
        <p class="text-gray-600">Check back tomorrow for a new challenge!</p>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ challenge.title }}</h2>
          <p class="text-gray-600 mb-4">{{ challenge.description }}</p>
          <div class="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ challenge.grade?.name }} • {{ challenge.subject?.name }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              {{ challenge.difficulty }} • {{ challenge.points_reward }} points
            </span>
          </div>
        </div>

        <!-- Completion Status -->
        <div v-if="completion" class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 class="text-lg font-semibold text-green-800">Challenge Completed!</h3>
          </div>
          <p class="text-green-700 mb-2">You scored {{ completion.score }}% on this challenge.</p>
          <p class="text-sm text-green-600">Completed on {{ new Date(completion.completed_at).toLocaleDateString() }}</p>
        </div>

        <!-- Start Challenge Button -->
        <div v-else class="text-center">
          <NuxtLink
            to="/quizee/daily-challenges/take"
            class="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-center"
          >
            Start Daily Challenge
          </NuxtLink>
          <p class="text-sm text-gray-500 mt-4">Complete this challenge to earn {{ challenge.points_reward }} points!</p>
        </div>
      </div>

          <!-- Previous Challenges Section -->
          <div class="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Your Challenge History</h3>
            <div v-if="!history || history.length === 0" class="text-center py-8">
              <p class="text-gray-600">No completed challenges yet. Start your first daily challenge!</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="item in (history || [])" :key="item && item.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 class="font-medium text-gray-900">{{ item.dailyChallenge.title }}</h4>
                  <p class="text-sm text-gray-600">Score: {{ item.score }}%  {{ new Date(item.completed_at).toLocaleDateString() }}</p>
                </div>
                <div class="text-right">
                  <span class="text-sm font-medium text-gray-900">{{ item.dailyChallenge.points_reward }} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aside / Right column -->
        <aside class="lg:col-span-1 space-y-6">
          <!-- Badges panel -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Daily Challenge Badges</h4>
              <NuxtLink to="/quizee/badges" class="text-sm text-indigo-600">View all</NuxtLink>
            </div>
            <div v-if="badgesLoading" class="text-sm text-gray-500">Loading badges...</div>
            <div v-else-if="!badges || badges.length === 0" class="text-sm text-gray-500">No badges configured for daily challenges.</div>
            <div v-else class="grid grid-cols-3 gap-3">
              <div v-for="b in (badges || [])" :key="b && b.id" class="flex flex-col items-center text-center p-2">
                <div class="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center mb-2">
                  <img v-if="b.icon_url" :src="b.icon_url" alt="badge" class="w-8 h-8" />
                  <svg v-else class="w-6 h-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div class="text-xs text-gray-700">{{ b.name }}</div>
              </div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Leaderboard</h4>
              <NuxtLink to="/quizee/daily-challenges/leaderboard" class="text-sm text-indigo-600">View all</NuxtLink>
            </div>
            <div v-if="!leaderboard || leaderboard.length === 0" class="text-sm text-gray-500">No leaderboard entries yet.</div>
            <div v-else class="space-y-3">
              <div v-for="(u, idx) in (leaderboard || []).slice(0,6)" :key="u && u.id || idx" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-sm font-semibold">{{ idx + 1 }}</div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ u.name || u.username || u.display_name }}</div>
                    <div class="text-xs text-gray-500">{{ u.score || u.points || 0 }} pts</div>
                  </div>
                </div>
                <div class="text-sm text-gray-500">{{ u.time || u.duration || '' }}</div>
              </div>
            </div>
          </div>

          <!-- Quick stats panel -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h4>
            <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Attempts</div>
                <div class="font-semibold text-gray-900">{{ history?.length ?? 0 }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Today Points</div>
                <div class="font-semibold text-gray-900">{{ challenge?.points_reward ?? '\u2014' }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Difficulty</div>
                <div class="font-semibold text-gray-900">{{ challenge?.difficulty ?? '\u2014' }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Leaderboard</div>
                <div class="font-semibold text-gray-900">Top</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the quizee layout for this page
definePageMeta({ layout: 'quizee' })
import PageHero from '~/components/ui/PageHero.vue'
import { ref, onMounted, computed } from 'vue'
const config = useRuntimeConfig()

// Data
const challenge = ref(null)
const completion = ref(null)
const history = ref([])
const loading = ref(true)

// Badges
const badges = ref([])
const badgesLoading = ref(true)

// Leaderboard & streak
const leaderboard = ref([])
const streak = ref(0)

// Countdown display (HH:MM:SS) until end of the UTC day or challenge expiry if present
const timeRemaining = ref('--:--:--')

const fetchLeaderboard = async () => {
  try {
    const res = await $fetch(config.public.apiBase + '/api/daily-challenges/leaderboard', { credentials: 'include' })
    leaderboard.value = res?.data || res || []
  } catch (e) {
    // ignore leaderboard errors
  }
}

function formatCountdown(ms) {
  if (!ms || ms <= 0) return '00:00:00'
  const total = Math.floor(ms / 1000)
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  return [hrs, mins, secs].map(n => String(n).padStart(2, '0')).join(':')
}

// Update countdown every second (local timezone)
let countdownInterval = null
function startCountdown() {
  // prefer challenge.expires_at if present, otherwise end of local day
  const getTarget = () => {
    if (challenge.value && challenge.value.expires_at) {
      // Parse expires_at and interpret as local time. If it's ISO with timezone, Date will handle it.
      const parsed = new Date(challenge.value.expires_at)
      if (!isNaN(parsed.getTime())) return parsed.getTime()
    }
    // end of local day (midnight next local calendar day)
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
    return end.getTime()
  }
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    const target = getTarget()
    const diff = target - Date.now()
    timeRemaining.value = formatCountdown(diff)
  }, 1000)
}

function computeStreakFromHistory() {
  try {
    if (!history.value || !history.value.length) {
      streak.value = 0
      return
    }
    // naive streak: count consecutive days ending today where history contains an entry
    const days = new Set(history.value.map(h => (new Date(h.completed_at)).toDateString()))
    let count = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (days.has(d.toDateString())) count++
      else break
    }
    streak.value = count
  } catch (e) {
    streak.value = 0
  }
}

// Fetch daily challenge
const fetchDailyChallenge = async () => {
  try {
    const res = await $fetch(config.public.apiBase + '/api/daily-challenges/today', { credentials: 'include' })
    // support multiple response shapes
    challenge.value = res?.challenge || res?.data?.challenge || res?.data || res || null
    completion.value = res?.completion || res?.data?.completion || null
  } catch (error) {
    console.error('Failed to fetch daily challenge:', error)
  } finally {
    loading.value = false
  }
}

// Fetch challenge history
const fetchHistory = async () => {
  try {
    // Assuming there's an endpoint for user's daily challenge history
    const res = await $fetch(config.public.apiBase + '/api/user/daily-challenges', { credentials: 'include' })
    history.value = res?.data || res || []
  } catch (error) {
    console.error('Failed to fetch challenge history:', error)
  }
}

const fetchBadges = async () => {
  try {
    const res = await $fetch(config.public.apiBase + '/api/badges?for=daily_challenge', { credentials: 'include' })
    badges.value = res?.data || res || []
  } catch (error) {
    console.error('Failed to fetch badges:', error)
  } finally {
    badgesLoading.value = false
  }
}

// On mount
onMounted(async () => {
  await Promise.all([fetchDailyChallenge(), fetchHistory(), fetchBadges()])
  // compute streak from history
  computeStreakFromHistory()
  // start countdown and fetch leaderboard
  startCountdown()
  fetchLeaderboard()
})

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>