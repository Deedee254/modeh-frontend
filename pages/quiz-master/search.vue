<script setup>
definePageMeta({ layout: 'quiz-master' })

import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const q = ref(route.query.q || '')
const results = ref({ quizzes: [], topics: [], subjects: [], questions: [] })
const loading = ref(false)
const error = ref(null)

watchEffect(() => {
  const term = (route.query.q || '').trim()
  q.value = term
  if (!term) {
    results.value = { quizzes: [], topics: [], subjects: [], questions: [] }
    return
  }
  loading.value = true
  error.value = null
  // call a simple API endpoint to search across resources. If backend doesn't have one,
  // this will fall back to client-side search or show a friendly message.
  axios.get(`/api/search`, { params: { q: term } })
    .then(resp => {
      results.value = resp.data || results.value
    })
    .catch(() => {
      error.value = 'Could not fetch search results. Try again later.'
    })
    .finally(() => loading.value = false)
})

function openItem(type, id) {
  router.push(`/quiz-master/${type}/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold mb-4">Search results for "{{ q }}"</h1>

      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <section v-if="results.quizzes?.length">
        <h2 class="text-xl font-medium mt-4">Quizzes</h2>
        <ul class="mt-2 space-y-2">
    <li v-for="(quiz, idx) in (Array.isArray(results.quizzes) ? results.quizzes.filter(Boolean) : [])" :key="quiz?.id || idx" class="p-3 border rounded hover:bg-gray-50 cursor-pointer" @click="openItem('quizzes', quiz?.id)">
            <div class="font-medium">{{ quiz.title }}</div>
            <div class="text-sm text-gray-500">{{ quiz.description }}</div>
          </li>
        </ul>
      </section>

      <section v-if="results.questions?.length">
        <h2 class="text-xl font-medium mt-4">Questions</h2>
        <ul class="mt-2 space-y-2">
    <li v-for="(qItem, idx) in (Array.isArray(results.questions) ? results.questions.filter(Boolean) : [])" :key="qItem?.id || idx" class="p-3 border rounded hover:bg-gray-50 cursor-pointer" @click="openItem('questions', qItem?.id)">
            <div class="font-medium">{{ qItem.text }}</div>
          </li>
        </ul>
      </section>

      <section v-if="!loading && !results.quizzes.length && !results.questions.length && !results.topics.length && !results.subjects.length">
        <div class="text-gray-500 mt-4">No results found.</div>
      </section>
    </div>
  </div>
</template>
