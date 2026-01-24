<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee/dashboard" class="hover:text-brand-600">Dashboard</NuxtLink>
        <span class="mx-2">›</span>
        <span>Badges</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Achievements</h1>
      <p class="text-gray-600 mb-6">Track your progress and unlock special badges as you master quizzes!</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

     <!-- Stats Overview -->
     <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
       <StatCard
         label="Badges Earned"
         :value="`${unlockedCount} / ${totalBadges}`"
         description="Achievements unlocked"
         icon="heroicons:check-circle"
       />
       <StatCard
         label="Total Points"
         :value="totalPoints.toString()"
         description="Points from badges"
         icon="heroicons:bolt"
       />
       <StatCard
         label="Current Level"
         :value="currentLevel.toString()"
         description="Based on total points"
         icon="heroicons:chart-bar"
       />
     </div>

     <!-- Loading State -->
     <div v-if="loading" class="flex justify-center items-center py-12">
       <div class="flex items-center gap-3">
         <svg class="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <span class="text-lg text-slate-600">Loading badges...</span>
       </div>
     </div>

     <!-- Error State -->
     <div v-else-if="error" class="bg-red-50/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-red-200">
       <p class="text-red-600">{{ error }}</p>
     </div>

     <!-- Badges Grid by Category -->
     <div v-else class="space-y-8">
       <div v-if="badges.length === 0" class="text-center text-slate-600 py-12">
         <p>You haven't earned any badges yet. Keep going!</p>
       </div>

       <!-- Category Grid -->
       <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <button
           v-for="category in categories"
           :key="category"
           @click="selectedCategory = category"
           class="flex flex-col items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl px-4 py-6 border border-emerald-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
         >
           <div class="text-3xl mb-2">{{ getCategoryIcon(category) }}</div>
           <h2 class="font-bold text-slate-900 text-center text-sm">{{ formatCategory(category) }}</h2>
           <p class="text-xs text-slate-600 mt-1">{{ groupedBadges[category].length }} badges</p>
         </button>
       </div>
     </div>

     <!-- Badge Details Modal -->
     <Teleport to="body">
       <Transition name="modal">
         <div v-if="selectedCategory" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <!-- Modal Header -->
             <div class="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-4 flex items-center justify-between">
               <div class="flex items-center gap-3">
                 <span class="text-2xl">{{ getCategoryIcon(selectedCategory) }}</span>
                 <div>
                   <h2 class="font-bold text-slate-900">{{ formatCategory(selectedCategory) }}</h2>
                   <p class="text-xs text-slate-600">{{ groupedBadges[selectedCategory].length }} badges</p>
                 </div>
               </div>
               <button
                 @click="selectedCategory = null"
                 class="text-slate-500 hover:text-slate-700 transition"
               >
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                 </svg>
               </button>
             </div>

             <!-- Modal Body -->
             <div class="p-6">
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div
                   v-for="badge in groupedBadges[selectedCategory]"
                   :key="badge.id"
                   class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col"
                 >
                   <!-- Badge Icon -->
                   <div
                     :class="[
                       'w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4 mx-auto',
                       badge.unlocked ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                     ]"
                   >
                     {{ badge.icon }}
                   </div>

                   <!-- Badge Info -->
                   <h3 class="font-bold text-slate-900 text-center text-sm mb-2">{{ badge.name }}</h3>
                   <p class="text-xs text-slate-600 text-center mb-3 flex-1">{{ badge.description }}</p>

                   <!-- Points Badge -->
                   <span
                     :class="[
                       'text-xs px-2.5 py-1 rounded-full text-center mb-3 font-medium',
                       badge.unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                     ]"
                   >
                     {{ badge.points }} pts
                   </span>

                   <!-- Progress Bar -->
                   <div v-if="badge.progress !== undefined && !badge.unlocked" class="mb-3">
                     <div class="flex items-center justify-between text-xs mb-1">
                       <span class="text-slate-600">Progress</span>
                       <span class="font-medium text-slate-900">{{ badge.progress }}%</span>
                     </div>
                     <div class="w-full bg-slate-200 rounded-full h-2">
                       <div
                         class="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                         :style="{ width: `${badge.progress}%` }"
                       ></div>
                     </div>
                   </div>

                   <!-- Completion Date -->
                   <div v-if="badge.unlocked && badge.completed_at" class="flex items-center justify-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg py-2 px-2">
                     <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                     </svg>
                     <span>{{ formatDate(badge.completed_at) }}</span>
                   </div>

                   <!-- Locked State Indicator -->
                   <div v-else-if="!badge.unlocked" class="flex items-center justify-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg py-2 px-2">
                     <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 1C6.48 1 2 5.48 2 11v10h4V9c0-3.31 2.69-6 6-6s6 2.69 6 6v12h4V11c0-5.52-4.48-10-10-10z"></path>
                     </svg>
                     <span>Locked</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </Transition>
     </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatCard from '~/components/ui/StatCard.vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'

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
const selectedCategory = ref(null)

// Computed stats
const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)
const totalBadges = computed(() => badges.value.length)
const totalPoints = computed(() => badges.value.reduce((sum, badge) => sum + (badge.unlocked ? badge.points : 0), 0))
const currentLevel = computed(() => Math.floor(totalPoints.value / 1000) + 1)

// Group badges by the backend `type` field. Badges missing `type` are
// collected under 'uncategorized' so they appear in an "Other" tab.
const groupedBadges = computed(() => {
  const groups = {}
  badges.value.forEach(badge => {
    const cat = badge?.type || 'uncategorized'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(badge)
  })
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
    daily_challenge: 'Daily Challenge',
    streak: 'Streaks',
    score: 'Score',
    completion: 'Completion',
    uncategorized: 'Other'
  }
  if (formats[category]) return formats[category]
  // Fallback: make a friendlier label from the raw category string
  return category.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

// Get emoji icon for category
function getCategoryIcon(category) {
  const icons = {
    time: '⏱️',
    subject: '📚',
    improvement: '📈',
    weekend: '🎉',
    topic: '🎯',
    daily_challenge: '⭐',
    streak: '🔥',
    score: '🏆',
    completion: '✅',
    uncategorized: '🎖️'
  }
  return icons[category] || '🎖️'
}

// Fetch detailed achievements data
onMounted(async () => {
  try {
    // This page specifically needs full achievements data with all details
    const response = await api.get('/api/achievements/progress')
    if (api.handleAuthStatus(response)) return

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      const achievements = Array.isArray(data?.achievements) ? data.achievements : []
      badges.value = achievements.map(badge => ({
        ...badge,
        progress: calculateProgress(badge)
      }))
      // Don't auto-open any category with modal approach
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

// Modal close on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') selectedCategory.value = null
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}
</style>