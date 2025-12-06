<template>
  <div class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Hero (using shared PageHero for consistent styling) -->
      <PageHero
        title="Daily Challenge"
        description="Test your knowledge with today's daily quiz challenge. Complete it to earn points and climb the leaderboard!"
        variant="gradient"
        align="center"
        padding="py-8 sm:py-12"
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <!-- Main content -->
        <div class="lg:col-span-2">
          <!-- Header with stat cards -->
          <div class="mb-6">
            <div class="mb-4">
              <h3 class="text-xl font-semibold text-gray-800">A new quiz every day.</h3>
              <p class="text-sm text-gray-500">Today's Theme: <strong class="text-gray-700">{{ challenge?.theme_name || challenge?.subject?.name || 'General' }}</strong></p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <UCard>
                <div class="text-center">
                  <div class="text-xs text-gray-500">Time Remaining</div>
                  <div class="text-2xl font-mono font-bold text-gray-800">{{ timeRemaining }}</div>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <div class="text-xs text-gray-500">Top Prize</div>
                  <div class="text-2xl font-bold text-gray-800">
                    <Icon name="heroicons:trophy" class="w-5 h-5 inline-block mr-1 text-amber-500" />
                    {{ challenge?.top_prize || challenge?.points_reward || '—' }}
                  </div>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <div class="text-xs text-gray-500">Your Streak</div>
                  <div class="text-2xl font-bold text-gray-800">{{ streak || 0 }} Days</div>
                </div>
              </UCard>
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

          <div v-else-if="error" class="text-center py-12">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Unable to Load Daily Challenge</h3>
            <p class="text-gray-600 mb-6">{{ error }}</p>
            
            <!-- Debug Info Badges -->
            <div class="mb-6 flex justify-center gap-4 flex-wrap">
              <div class="px-4 py-3 bg-brand-50 border border-brand-100 rounded-lg">
                <p class="text-xs text-brand-600 font-semibold">GRADE</p>
                <p class="text-sm text-brand-900 font-bold">{{ debugInfo.grade || '❌ Not Set' }}</p>
              </div>
              <div class="px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p class="text-xs text-purple-600 font-semibold">LEVEL</p>
                <p class="text-sm text-purple-900 font-bold">{{ debugInfo.level || '❌ Not Set' }}</p>
              </div>
              <div class="px-4 py-3 border border-gray-200 rounded-lg" style="background-color: rgba(137, 31, 33, 0.05); border-color: rgba(137, 31, 33, 0.2)">
                <p class="text-xs font-semibold" style="color: #891f21">QUESTIONS</p>
                <p class="text-sm font-bold" style="color: #891f21">{{ debugInfo.questionCount > 0 ? `✅ ${debugInfo.questionCount}` : '❌ None' }}</p>
              </div>
              <div v-if="debugInfo.cacheId" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-xs text-gray-600 font-semibold">CACHE ID</p>
                <p class="text-xs text-gray-900 font-mono">{{ debugInfo.cacheId }}</p>
              </div>
            </div>
            
            <p class="text-sm text-gray-500 mb-4">
              <strong>Quick troubleshooting:</strong><br />
              <span v-if="!debugInfo.grade || !debugInfo.level" class="text-red-600">• ❌ Grade or Level missing - Update your profile</span>
              <span v-else style="color: #891f21">• ✅ Grade {{ debugInfo.grade }} and Level {{ debugInfo.level }} are set</span><br />
              <span v-if="debugInfo.questionCount === 0" class="text-red-600">• ❌ No questions available for Grade {{ debugInfo.grade }} / Level {{ debugInfo.level }}</span>
              <span v-else style="color: #891f21">• ✅ {{ debugInfo.questionCount }} questions loaded</span><br />
              <span v-if="error && error.includes('Insufficient')" class="text-red-600">• The system needs at least 5 questions to create a daily challenge</span>
              <br />• Contact support if the issue persists
            </p>
            <button 
              type="button" 
              @click="fetchDailyChallenge()" 
              class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Try Again
            </button>
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

          <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-brand-600 to-brand-950 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <div v-if="completion" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Challenge Completed!</h2>
                <p class="text-sm text-gray-500">{{ getScoreMessage(completion.score) }}</p>
              </div>

              <div class="flex justify-center mb-6">
                <div class="relative w-40 h-40">
                  <svg class="w-full h-full" viewBox="0 0 100 100">
                    <circle class="text-gray-200" stroke-width="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                      class="text-brand-600"
                      stroke-width="10"
                      :stroke-dasharray="283"
                      :stroke-dashoffset="283 - (completion.score / 100) * 283"
                      stroke-linecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      style="transform: rotate(-90deg); transform-origin: 50% 50%;"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold text-gray-800">{{ completion.score }}%</span>
                    <span class="text-sm text-gray-500">Your Score</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="heroicons:trophy" class="h-5 w-5 text-amber-500 mb-1" />
                  <span class="text-sm text-gray-500">Rank</span>
                  <span class="text-xl font-bold">#{{ completion.rank || 'N/A' }}</span>
                </div>
                <div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="heroicons:clock" class="h-5 w-5 text-brand-500 mb-1" />
                  <span class="text-sm text-gray-500">Time</span>
                  <span class="text-xl font-bold">{{ formatTime(completion.time_taken) }}</span>
                </div>
                <div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="heroicons:check-circle" class="h-5 w-5 mb-1" :style="{ color: '#891f21' }" />
                  <span class="text-sm text-gray-500">Correct</span>
                  <span class="text-xl font-bold">{{ completion.correct_answers || 'N/A' }}/{{ challenge.questions_count || 'N/A' }}</span>
                </div>
                <div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="heroicons:star" class="h-5 w-5 text-purple-500 mb-1" />
                  <span class="text-sm text-gray-500">Earned</span>
                  <span class="text-xl font-bold">+{{ completion.points_earned || 0 }} XP</span>
                </div>
              </div>

            </div>

            <!-- Start Challenge Button -->
            <div v-else class="text-center">
              <NuxtLink
                to="/quizee/daily-challenges/take"
                class="inline-block bg-gradient-to-r from-brand-600 to-brand-950 text-white font-semibold py-4 px-8 rounded-xl hover:from-brand-700 hover:to-brand-900 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Start Daily Challenge
              </NuxtLink>
              <p class="text-sm text-gray-500 mt-4">Complete this challenge to earn {{ challenge.points_reward }} points!</p>
            </div>
          </div>

          <!-- Previous Challenges Section -->
          <div class="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Your Challenge History</h3>
            <div v-if="!history || history.length === 0" class="text-center py-8">
              <p class="text-gray-600">No completed challenges yet. Start your first daily challenge!</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="item in (history || [])" :key="item && item.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 class="font-medium text-gray-900">{{ item.dailyChallenge.title }}</h4>
                  <p class="text-sm text-gray-600">Score: {{ item.score }}% — {{ new Date(item.completed_at).toLocaleDateString() }}</p>
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
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-4 xl:p-6 pb-2">
              <div class="font-semibold tracking-tight text-xl">Rewards &amp; Streaks</div>
            </div>
            <div class="xl:p-6 xl:pt-0 p-4">
              <div class="space-y-4">
                <div class="space-y-2">
                  <h3 class="text-sm font-medium flex items-center"><Icon name="heroicons:calendar" class="h-4 w-4 mr-2 text-brand-500" />Daily Streak</h3>
                  <div class="flex space-x-1">
                    <div v-for="day in 7" :key="day" :class="[
                      'relative flex items-center justify-center h-8 w-8 rounded-full border transition-all',
                      day <= streak
                        ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                        : 'bg-muted/30 border-muted text-gray-600'
                    ]">
                      <span class="text-xs font-medium">{{ day }}</span>
                      <div v-if="day === 7" class="absolute -top-1 -right-1">
                        <Icon name="heroicons:trophy" class="h-3 w-3 text-amber-500" />
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-muted-foreground">Current streak: {{ streak }} {{ streak === 1 ? 'day' : 'days' }}. Keep playing daily!</p>
                </div>

                <div class="space-y-2">
                  <h3 class="text-sm font-medium flex items-center"><Icon name="heroicons:trophy" class="h-4 w-4 mr-2 text-amber-500" />Streak Rewards</h3>
                  <div class="grid grid-cols-2 gap-2">
                    <div v-for="r in rewards" :key="r.days" :class="['border rounded-lg p-2 flex flex-col items-center text-center transition', rewardEarned(r.days) ? 'bg-brand-50 border-brand-200' : 'bg-gray-50 border-gray-200']">
                      <div :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-1', rewardEarned(r.days) ? 'bg-brand-600 text-white' : 'bg-white text-gray-700']">{{ r.days }} Days</div>
                      <span class="text-xs font-medium">{{ r.label }}</span>
                      <div v-if="rewardEarned(r.days)" class="text-xs text-green-600 mt-1 font-semibold">Earned</div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <h3 class="text-sm font-medium flex items-center"><Icon name="heroicons:trophy" class="h-4 w-4 mr-2 text-purple-500" />Daily Challenge Badges</h3>
                  <div class="grid grid-cols-3 gap-2">
                    <!-- Use badges fetched from the API when available. Fallback to static placeholders if not. -->
                    <template v-if="badges && badges.length">
                      <div v-for="b in badges" :key="b.id || b.name" :class="['border rounded-lg p-2 flex flex-col items-center text-center transition', badgeEarned(b) ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200']">
                        <div :class="['p-1 rounded-full mb-1', badgeEarned(b) ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600']">
                          <Icon :name="b.icon || 'heroicons:sparkles'" class="h-3 w-3" />
                        </div>
                        <span class="text-xs">{{ b.display_name || b.name || 'Badge' }}</span>
                        <div v-if="badgeEarned(b)" class="text-xs text-green-600 mt-1 font-semibold">Unlocked</div>
                      </div>
                    </template>
                    <template v-else>
                      <!-- fallback static placeholders -->
                      <div class="border rounded-lg p-2 flex flex-col items-center text-center"><div class="p-1 rounded-full mb-1" style="background-color: rgba(137, 31, 33, 0.1)"><Icon name="heroicons:sparkles" class="h-3 w-3" :style="{ color: '#891f21' }" /></div><span class="text-xs">First Try</span></div>
                      <div class="border rounded-lg p-2 flex flex-col items-center text-center"><div class="p-1 bg-brand-100 dark:bg-brand-900 rounded-full mb-1"><Icon name="heroicons:clock" class="h-3 w-3 text-brand-600 dark:text-brand-400" /></div><span class="text-xs">Speedster</span></div>
                      <div class="border rounded-lg p-2 flex flex-col items-center text-center"><div class="p-1 bg-purple-100 dark:bg-purple-900 rounded-full mb-1"><Icon name="heroicons:star" class="h-3 w-3 text-purple-600 dark:text-purple-400" /></div><span class="text-xs">Perfect</span></div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Leaderboard</h4>
              <NuxtLink to="/quizee/daily-challenges/leaderboard" class="text-sm text-brand-600">View all</NuxtLink>
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
                <div class="font-semibold text-gray-900">{{ statsAttempts }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Today Points</div>
                <div class="font-semibold text-gray-900">{{ statsTodayPoints }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Difficulty</div>
                <div class="font-semibold text-gray-900">{{ statsDifficulty }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <div class="text-xs">Leaderboard</div>
                <div class="font-semibold text-gray-900">
                  <span v-if="statsLeaderboardTopName !== '\u2014'">{{ statsLeaderboardTopName }}<span v-if="statsLeaderboardTopScore"> — {{ statsLeaderboardTopScore }} pts</span></span>
                  <span v-else>No entries</span>
                </div>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const auth = useAuthStore()

// Data
const challenge = ref(null)
const completion = ref(null)
const history = ref([])
const loading = ref(true)
const error = ref(null)

// Debug info - for tracking loaded grade, level, and questions
const debugInfo = ref({
  grade: null,
  level: null,
  questionCount: 0,
  cacheId: null
})

// Get user's profile info from auth store (fallback source)
const userProfileGrade = computed(() => {
  return auth.user?.quizeeProfile?.grade?.name || auth.user?.grade?.name || null
})

const userLevel = computed(() => {
  return auth.user?.quizeeProfile?.level?.name || auth.user?.level?.name || null
})

// Badges
const badges = ref([])
const badgesLoading = ref(true)

// Streak rewards configuration (days -> label shown in UI)
const rewards = [
  { days: 3, label: '+50 Coins' },
  { days: 5, label: '+100 Coins' },
  { days: 7, label: 'Special Badge' },
  { days: 14, label: 'Premium Theme' }
]

function rewardEarned(daysRequired) {
  try {
    return Number(streak.value) >= Number(daysRequired)
  } catch (e) { return false }
}

function badgeEarned(badge) {
  // Flexible checks depending on backend shape: look for common flags
  if (!badge) return false
  return Boolean(badge.awarded || badge.earned || badge.unlocked || badge.is_unlocked || badge.user_has_badge)
}

// Leaderboard & streak
const leaderboard = ref([])
const streak = ref(0)

// Quick stats computed helpers
const statsAttempts = computed(() => {
  try { return history.value ? history.value.length : 0 } catch (e) { return 0 }
})

const statsTodayPoints = computed(() => {
  try { return challenge.value?.points_reward ?? '\u2014' } catch (e) { return '\u2014' }
})

const statsDifficulty = computed(() => {
  try { return challenge.value?.difficulty ?? '\u2014' } catch (e) { return '\u2014' }
})

const statsLeaderboardTopName = computed(() => {
  try {
    if (!leaderboard.value || !leaderboard.value.length) return '\u2014'
    const top = leaderboard.value[0]
    return top?.name || top?.username || top?.display_name || '\u2014'
  } catch (e) { return '\u2014' }
})

const statsLeaderboardTopScore = computed(() => {
  try {
    if (!leaderboard.value || !leaderboard.value.length) return null
    const top = leaderboard.value[0]
    return top?.score ?? top?.points ?? null
  } catch (e) { return null }
})

// Countdown display (HH:MM:SS) until end of the UTC day or challenge expiry if present
const timeRemaining = ref('--:--:--')

const fetchLeaderboard = async () => {
  try {
    const res = await api.get('/api/daily-challenges/leaderboard')
    if (api.handleAuthStatus(res)) return

    // Use composable's parseResponse which handles content-type and structured errors
    const parsed = await api.parseResponse(res)

    // Normalize to an array: support both paginated { data: [...] } and raw array
    let list = []
    if (Array.isArray(parsed)) list = parsed
    else if (parsed && Array.isArray(parsed.data)) list = parsed.data
    else if (parsed && Array.isArray(parsed)) list = parsed

    leaderboard.value = list
  } catch (e) {
    // ignore leaderboard errors — keep previous value
    console.debug('fetchLeaderboard error', e)
  }
}

// Resolve numeric grade/level ids to human-friendly names using taxonomy store
const taxonomy = useTaxonomy()
async function resolveDebugNames() {
  try {
    const gradeId = debugInfo.value.grade
    const levelId = debugInfo.value.level
    const toFetch = []
    // If the server returned numeric ids, ensure taxonomy data is loaded
    if (gradeId && String(gradeId).match(/^\d+$/) && (!taxonomy.grades || taxonomy.grades.length === 0)) toFetch.push(taxonomy.fetchGrades())
    if (levelId && String(levelId).match(/^\d+$/) && (!taxonomy.levels || taxonomy.levels.length === 0)) toFetch.push(taxonomy.fetchLevels())
    if (toFetch.length) await Promise.all(toFetch)

    // Try to map grade id -> name
    if (gradeId) {
      const g = (taxonomy.grades || []).find(x => String(x.id) === String(gradeId) || String(x.name) === String(gradeId))
      if (g && g.name) debugInfo.value.grade = g.name
    }

    // Try to map level id -> name
    if (levelId) {
      const l = (taxonomy.levels || []).find(x => String(x.id) === String(levelId) || String(x.name) === String(levelId))
      if (l && l.name) debugInfo.value.level = l.name
    }
  } catch (e) {
    // ignore resolution errors; keep whatever debugInfo we have
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

function getScoreMessage(score) {
  if (score >= 90) return "Excellent work! You're a true master."
  if (score >= 70) return "Great job! You're on the right track."
  if (score >= 50) return "Good effort! Keep practicing."
  return "Nice try! There's room for improvement."
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return 'N/A'
  const s = Number(seconds)
  if (isNaN(s) || s < 0) return 'N/A'

  const minutes = Math.floor(s / 60)
  const remainingSeconds = Math.floor(s % 60)

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Fetch daily challenge
const fetchDailyChallenge = async () => {
  try {
    const res = await api.get('/api/daily-challenges/today')
    if (api.handleAuthStatus(res)) return

    // Parse body where possible so we can show useful debug info on error responses
    let data = null
    try {
      data = await res.json()
    } catch (e) {
      data = null
    }

    if (!res.ok) {
      const serverMessage = data?.error || data?.message || data?.data?.message || 'Failed to fetch daily challenge'

      // Use any grade/level info the backend returned; fall back to user profile
      debugInfo.value = {
        grade: data?.challenge?.grade?.name || data?.grade_name || data?.grade || userProfileGrade.value || null,
        level: data?.challenge?.level?.name || data?.level_name || data?.level || userLevel.value || null,
        questionCount: (data?.questions && Array.isArray(data.questions)) ? data.questions.length : (data?.question_count ?? 0),
        cacheId: data?.cache_id || null
      }

      // Attempt to resolve numeric ids to names (e.g., backend may return ids)
      try { await resolveDebugNames() } catch (e) { /* ignore */ }

      error.value = serverMessage
      challenge.value = null
      completion.value = null
      return
    }

    // Success path
    challenge.value = data?.challenge || data?.data?.challenge || data?.data || data || null
    completion.value = data?.completion || data?.data?.completion || null

    // If backend returned the full `questions` array but did not populate
    // `challenge.questions_count` (some endpoints omit it), populate it
    // from the returned array so the completion UI can show a proper denominator.
    if (data?.questions && Array.isArray(data.questions) && challenge.value) {
      // set questions_count if not present or falsy
      if (!challenge.value.questions_count) {
        challenge.value.questions_count = data.questions.length
      }
      // include the questions on the challenge object for convenient access
      if (!challenge.value.questions) {
        challenge.value.questions = data.questions
      }
    }

    // Extract debug info for display - prefer challenge object if present
    if (data?.challenge) {
      debugInfo.value = {
        grade: data.challenge.grade?.name || null,
        level: data.challenge.level?.name || null,
        questionCount: data.questions?.length || 0,
        cacheId: data.cache_id || null
      }
      try { await resolveDebugNames() } catch (e) { /* ignore */ }
    }

    error.value = null
  } catch (err) {
    console.error('Failed to fetch daily challenge:', err)
    error.value = err?.data?.error || err?.data?.message || err?.message || 'Unable to load daily challenge'
    challenge.value = null
    completion.value = null
    debugInfo.value = {
      grade: userProfileGrade.value || null,
      level: userLevel.value || null,
      questionCount: 0,
      cacheId: null
    }
  } finally {
    loading.value = false
  }
}

// Fetch challenge history
const fetchHistory = async () => {
  try {
    // Assuming there's an endpoint for user's daily challenge history
    const res = await api.get('/api/user/daily-challenges')
    if (api.handleAuthStatus(res)) return
    if (!res.ok) return
    const data = await res.json()
    history.value = data?.data || data || []
  } catch (error) {
    console.error('Failed to fetch challenge history:', error)
  }
}

const fetchBadges = async () => {
  try {
    const res = await api.get('/api/badges?for=daily_challenge')
    if (api.handleAuthStatus(res)) {
      badges.value = []
      return
    }
    if (!res.ok) {
      if (res.status === 404) {
        badges.value = []
      } else {
        console.error('Failed to fetch badges: status', res.status)
      }
      return
    }
    const data = await res.json()
    badges.value = data?.data || data || []
  } catch (error) {
    // $fetch throws on non-2xx responses. A 404 here simply means the backend
    // doesn't provide daily-challenge badges — treat as empty and avoid noisy logs.
    const status = error?.status || error?.response?.status || error?.data?.status || (typeof error?.message === 'string' && error.message.includes('404') ? 404 : null)
    if (status === 404) {
      badges.value = []
    } else {
      // only log unexpected errors
      console.error('Failed to fetch badges:', error)
    }
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

  // Listen for instant updates emitted by the `take.vue` submit flow
  const onLeaderboardUpdated = (e) => {
    try {
      const payload = e?.detail?.leaderboard
      if (Array.isArray(payload)) leaderboard.value = payload
    } catch (err) { /* ignore */ }
  }
  const onSubmitted = (e) => {
    try {
      const s = e?.detail?.streak
      if (typeof s !== 'undefined' && s !== null) streak.value = Number(s)
      // Optionally refresh leaderboard to ensure server ordering
      fetchLeaderboard()
      // Refresh badges so newly-awarded badges appear immediately
      try { fetchBadges() } catch (err) { /* ignore */ }
    } catch (err) { /* ignore */ }
  }

  window.addEventListener('daily-challenge:leaderboard:updated', onLeaderboardUpdated)
  window.addEventListener('daily-challenge:submitted', onSubmitted)

  // Hydrate from localStorage if available (fast path)
  try {
    const rawLb = localStorage.getItem('daily-challenge:leaderboard')
    if (rawLb) {
      const parsed = JSON.parse(rawLb)
      if (Array.isArray(parsed)) leaderboard.value = parsed
    }
    const rawSt = localStorage.getItem('daily-challenge:last-streak')
    if (rawSt) {
      const n = Number(rawSt)
      if (!Number.isNaN(n)) streak.value = n
    }
  } catch (err) { /* ignore localStorage errors */ }

  // store listeners so we can remove them on unmount
  window.__modeh_daily_challenge_listeners = { onLeaderboardUpdated, onSubmitted }
})

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  try {
  const listeners = window.__modeh_daily_challenge_listeners || {}
  if (listeners.onLeaderboardUpdated) window.removeEventListener('daily-challenge:leaderboard:updated', listeners.onLeaderboardUpdated)
  if (listeners.onSubmitted) window.removeEventListener('daily-challenge:submitted', listeners.onSubmitted)
  try { delete window.__modeh_daily_challenge_listeners } catch (e) { /* ignore */ }
  } catch (e) { /* ignore */ }
})
</script>