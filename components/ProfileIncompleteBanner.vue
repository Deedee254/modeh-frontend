<template>
  <div v-if="show" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex items-start justify-between">
    <div class="mr-4">
      <p class="text-yellow-800 font-medium">Complete your profile to get a tailored experience.</p>
      <p class="text-sm text-yellow-700">Complete your profile to receive personalized recommendations and content.</p>
    </div>
    <div class="flex items-center space-x-2">
      <NuxtLink to="/onboarding" class="px-3 py-1 bg-yellow-600 text-white rounded">Complete profile</NuxtLink>
      <button @click="dismiss" class="text-yellow-700 underline">Dismiss</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const STORAGE_KEY = 'profile_incomplete_banner_dismissed_v1'
const dismissed = ref(false)

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    dismissed.value = localStorage.getItem(STORAGE_KEY) === 'true'
  }
})

const route = useRoute()

const isIncomplete = computed(() => {
  const u = auth.user as any
  return !!u && (u.is_profile_completed === false || u.isProfileCompleted === false)
})

// Only show on specific dashboard routes
const dashboardPaths = [
  '/quizee/dashboard',
  '/quiz-master/dashboard',
  '/parent/dashboard',
  '/institution-manager/dashboard'
]

const isOnDashboard = computed(() => {
  const p = String(route.path || '').toLowerCase()
  return dashboardPaths.some(dp => p === dp || p.startsWith(dp + '/'))
})

const show = computed(() => isIncomplete.value && !dismissed.value && isOnDashboard.value)

function dismiss() {
  dismissed.value = true
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, 'true')
}
</script>

<style scoped>
/* Minimal styling; layout uses utility classes */
</style>
