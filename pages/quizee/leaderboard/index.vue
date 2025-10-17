<template>
  <div>
    <PageHero
      title="Leaderboard"
      description="See who's leading the pack in our global quiz rankings."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quizee/dashboard' }, { text: 'Leaderboard', current: true }]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Filter Options -->
      <div class="flex justify-center items-center gap-2 mb-8">
        <UButton @click="setTimeframe('all-time')" :variant="timeframe === 'all-time' ? 'solid' : 'outline'">All Time</UButton>
        <UButton @click="setTimeframe('monthly')" :variant="timeframe === 'monthly' ? 'solid' : 'outline'">Monthly</UButton>
        <UButton @click="setTimeframe('weekly')" :variant="timeframe === 'weekly' ? 'solid' : 'outline'">Weekly</UButton>
      </div>

      <div v-if="pending" class="text-center py-16">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p class="mt-2 text-gray-500">Loading leaderboard...</p>
      </div>
      <div v-else-if="error" class="text-center py-16 text-red-500">
        <p>Could not load the leaderboard. Please try again later.</p>
      </div>
      <div v-else class="space-y-8">
        <!-- Top 3 Podium -->
        <div v-if="topThree.length >= 3" class="flex items-end justify-center gap-4 sm:gap-8 text-center">
          <!-- 2nd Place -->
          <div class="w-1/3">
            <div class="flex flex-col items-center">
              <div class="relative">
                <img :src="topThree[1].avatar || '/logo/avatar-placeholder.png'" class="w-20 h-20 rounded-full border-4 border-gray-300 object-cover" />
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">2</div>
              </div>
              <h3 class="font-semibold mt-2 truncate">{{ topThree[1].name }}</h3>
              <p class="text-sm text-gray-500">{{ topThree[1].points }} pts</p>
              <div class="mt-2 h-24 bg-gray-200 rounded-t-lg w-full"></div>
            </div>
          </div>
          <!-- 1st Place -->
          <div class="w-1/3">
            <div class="flex flex-col items-center">
              <div class="relative">
                <Icon name="heroicons:trophy-solid" class="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-400" />
                <img :src="topThree[0].avatar || '/logo/avatar-placeholder.png'" class="w-28 h-28 rounded-full border-4 border-amber-400 object-cover" />
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold">1</div>
              </div>
              <h3 class="font-semibold text-lg mt-2 truncate">{{ topThree[0].name }}</h3>
              <p class="text-sm text-gray-500">{{ topThree[0].points }} pts</p>
              <div class="mt-2 h-36 bg-amber-300 rounded-t-lg w-full"></div>
            </div>
          </div>
          <!-- 3rd Place -->
          <div class="w-1/3">
            <div class="flex flex-col items-center">
              <div class="relative">
                <img :src="topThree[2].avatar || '/logo/avatar-placeholder.png'" class="w-16 h-16 rounded-full border-4 border-amber-600 object-cover" />
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              </div>
              <h3 class="font-semibold mt-2 truncate">{{ topThree[2].name }}</h3>
              <p class="text-sm text-gray-500">{{ topThree[2].points }} pts</p>
              <div class="mt-2 h-20 bg-amber-500 rounded-t-lg w-full"></div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Global Rankings</h2>
          </template>
          <div class="space-y-2">
            <div v-for="(user, index) in remainingUsers" :key="user.id" class="flex items-center p-3 rounded-lg" :class="index % 2 === 0 ? 'bg-gray-50' : ''">
              <div class="w-8 text-center font-semibold text-gray-500">{{ index + 4 }}</div>
              <div class="flex-1 flex items-center gap-3 ml-4">
                <img :src="user.avatar || '/logo/avatar-placeholder.png'" class="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div class="font-medium">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.country || 'Global' }}</div>
                </div>
              </div>
              <div class="w-24 text-right font-semibold">{{ user.points }} pts</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'

definePageMeta({
  layout: 'quizee',
  title: 'Leaderboard'
})

const timeframe = ref('all-time')

const config = useRuntimeConfig()

// state
const leaderboard = ref([])
const pending = ref(true)
const error = ref(null)

async function fetchLeaderboard() {
  pending.value = true
  error.value = null
  try {
    const res = await $fetch(config.public.apiBase + `/api/leaderboard?timeframe=${timeframe.value}`, { credentials: 'include' })
    // support multiple response shapes used across the app
    const raw = res?.users || res?.data || res || []
    // normalize entries to expected fields used in template
    leaderboard.value = (Array.isArray(raw) ? raw : []).map((u, idx) => ({
      id: u?.id ?? u?.user_id ?? `u${idx}`,
      name: u?.name || u?.display_name || u?.username || 'Unknown',
      avatar: u?.avatar || u?.photo || u?.profile_image || null,
      points: u?.points ?? u?.score ?? u?.pts ?? 0,
      country: u?.country || u?.location || null,
      // keep other fields available
      ...u
    }))
  } catch (e) {
    error.value = e
    console.error('Failed to fetch leaderboard:', e)
    leaderboard.value = []
  } finally {
    pending.value = false
  }
}

function setTimeframe(newTimeframe) {
  timeframe.value = newTimeframe
}

onMounted(() => {
  fetchLeaderboard()
})

// refetch when timeframe changes
watch(timeframe, () => {
  fetchLeaderboard()
})

const topThree = computed(() => (leaderboard.value || []).slice(0, 3))
const remainingUsers = computed(() => (leaderboard.value || []).slice(3))
</script>