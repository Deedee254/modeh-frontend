<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'

const attempts = ref([])
const loading = ref(true)

import useApi from '~/composables/useApi'

const api = useApi()
// Fetch attempts on mount
onMounted(async () => {
  try {
    const res = await api.get('/api/quiz-attempts')
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const j = await res.json()
      attempts.value = j.attempts || []
    }
  } catch (e) {
    console.error('Failed to fetch attempts:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
    <h1 class="text-2xl font-bold mb-6">My Quiz Attempts</h1>
    
    <div v-if="loading" class="text-gray-600">Loading attempts...</div>
    
    <div v-else-if="!attempts.length" class="text-gray-600">
      No attempts yet. <NuxtLink to="/quizzes" class="text-brand-600 hover:underline">Start a quiz</NuxtLink>
    </div>
    
    <div v-else class="space-y-4 sm:space-y-6">
      <div v-for="attempt in attempts" :key="attempt.id" class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 class="font-semibold text-lg">{{ attempt.quiz?.title || 'Untitled Quiz' }}</h3>
            <div class="text-sm text-gray-600 mt-1">
              Attempted on {{ new Date(attempt.created_at).toLocaleDateString() }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold">
              {{ attempt.score || 0 }}/{{ attempt.total_questions || 0 }}
            </div>
            <div class="text-sm text-gray-600">
              {{ Math.round(((attempt.score || 0) / (attempt.total_questions || 1)) * 100) }}%
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex gap-4">
          <NuxtLink 
            :to="`/quizee/quizzes/${attempt.quiz_id}/attempts/${attempt.id}`"
            class="text-sm text-brand-600 hover:text-brand-500">
            View Details
          </NuxtLink>
          <NuxtLink 
            :to="`/quizee/quizzes/${attempt.quiz_id}`"
            class="text-sm text-brand-600 hover:text-brand-500">
            Retry Quiz
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>