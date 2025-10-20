<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Your Achievements</h1>
        <p class="mt-2 text-lg text-gray-600">Track your progress and unlock special badges as you master quizzes!</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Badges Earned</p>
              <p class="text-2xl font-bold text-gray-900">{{ unlockedCount }} / {{ totalBadges }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Points</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalPoints }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Current Level</p>
              <p class="text-2xl font-bold text-gray-900">{{ currentLevel }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges Grid -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-lg text-gray-600">Loading badges...</span>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 rounded-xl p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Category Tabs -->
        <div class="mb-8">
          <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a category</label>
            <select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" @change="activeTab = $event.target.value">
              <option v-for="category in categories" :key="category" :value="category" :selected="category === activeTab">{{ formatCategory(category) }}</option>
            </select>
          </div>
          <div class="hidden sm:block">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button v-for="category in categories" :key="category" @click="activeTab = category" :class="[
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === category ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]">
                  {{ formatCategory(category) }}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <!-- Badges Grid -->
        <div v-for="category in categories" :key="category" v-show="activeTab === category">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="badge in groupedBadges[category]" :key="badge.id"
                     class="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                    <div class="flex items-start gap-4">
                      <!-- Badge Icon -->
                      <div :class="[
                        'w-16 h-16 rounded-xl flex items-center justify-center text-2xl',
                        badge.unlocked ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-400'
                      ]">
                        {{ badge.icon }}
                      </div>

                      <!-- Badge Details -->
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <h3 class="font-bold text-gray-900">{{ badge.name }}</h3>
                          <span :class="[
                            'text-sm px-2 py-1 rounded-full',
                            badge.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          ]">
                            {{ badge.points }} pts
                          </span>
                        </div>

                        <p class="mt-1 text-sm text-gray-600">{{ badge.description }}</p>

                        <!-- Progress Bar -->
                        <div v-if="badge.progress !== undefined" class="mt-4">
                          <div class="flex items-center justify-between text-sm mb-1">
                            <span class="text-gray-600">Progress</span>
                            <span class="font-medium text-gray-900">{{ badge.progress }}%</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                 :style="{ width: `${badge.progress}%` }"></div>
                          </div>
                        </div>

                        <!-- Completion Date -->
                        <div v-if="badge.unlocked && badge.completed_at" class="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span>Earned {{ formatDate(badge.completed_at) }}</span>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Page meta
definePageMeta({ layout: 'quizee' })
useHead({
  title: 'Your Achievements — Modeh',
  meta: [
    { name: 'description', content: 'View your earned badges and track your progress in mastering quizzes!' },
    { property: 'og:title', content: 'Your Achievements — Modeh' },
    { property: 'og:description', content: 'View your earned badges and track your progress in mastering quizzes!' }
  ]
})

// State
const badges = ref([])
const loading = ref(true)
const error = ref(null)
const auth = useAuthStore()
const api = useApi()
const activeTab = ref(null)

// Computed stats
const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)
const totalBadges = computed(() => badges.value.length)
const totalPoints = computed(() => badges.value.reduce((sum, badge) => sum + (badge.unlocked ? badge.points : 0), 0))
const currentLevel = computed(() => Math.floor(totalPoints.value / 1000) + 1)

// Group badges by category
const groupedBadges = computed(() => {
  const groups = {
    time: [],
    subject: [],
    improvement: [],
    weekend: [],
    topic: [],
    daily_challenge: []
  }
  
  badges.value.forEach(badge => {
    if (groups[badge.category]) {
      groups[badge.category].push(badge)
    }
  })
  
  // Filter out empty categories
  for (const category in groups) {
    if (groups[category].length === 0) {
      delete groups[category]
    }
  }
  
  return groups
})

const categories = computed(() => Object.keys(groupedBadges.value))

// Format category names for display
function formatCategory(category) {
  const formats = {
    time: 'Time-based',
    subject: 'Subject',
    improvement: 'Improvement',
    weekend: 'Weekend Warrior',
    topic: 'Topic',
    daily_challenge: 'Daily Challenge'
  }
  return formats[category] || category
}

// Fetch badges data
onMounted(async () => {
  try {
    const response = await api.get('/api/achievements/progress')
    if (api.handleAuthStatus(response)) return
    
    if (response.ok) {
      const data = await response.json()
      badges.value = data.achievements.map(badge => ({
        ...badge,
        progress: calculateProgress(badge)
      }))
      if (categories.value.length > 0) {
        activeTab.value = categories.value[0]
      }
    } else {
      error.value = 'Failed to load achievements'
    }
  } catch (e) {
    error.value = 'An error occurred while loading achievements'
    console.error(e)
  } finally {
    loading.value = false
  }
})

// Helper functions
function calculateProgress(badge) {
  if (badge.unlocked) return 100
  if (!badge.progress || !badge.criteria_value) return 0
  return Math.min(100, Math.round((badge.progress / badge.criteria_value) * 100))
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>