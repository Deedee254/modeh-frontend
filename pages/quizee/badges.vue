<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'

const badges = ref([])
const loading = ref(true)

// Fetch badges on mount
onMounted(async () => {
  try {
    const res = await $fetch('/api/user/badges', { credentials: 'include' })
    badges.value = res.badges || []
  } catch (e) {
    console.error('Failed to fetch badges:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold mb-6">My Badges</h1>
    
    <div v-if="loading" class="text-gray-600">Loading badges...</div>
    
    <div v-else-if="!badges.length" class="text-gray-600">
      No badges earned yet. Keep practicing to earn badges!
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="badge in badges" :key="badge.id" 
           class="bg-white shadow rounded-lg p-6 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <img v-if="badge.icon" :src="badge.icon" :alt="badge.title" class="w-8 h-8">
          <span v-else class="text-2xl text-indigo-600">🏆</span>
        </div>
        
        <h3 class="font-semibold text-lg mb-2">{{ badge.title }}</h3>
        <p class="text-sm text-gray-600">{{ badge.description }}</p>
        
        <div class="mt-4 text-xs text-gray-500">
          Earned on {{ new Date(badge.awarded_at || badge.created_at).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>