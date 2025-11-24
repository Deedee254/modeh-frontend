<script setup>
definePageMeta({ layout: 'quizee' })
import { ref, onMounted } from 'vue'
const route = useRoute()
const q = ref(route.query.q || '')
</script>

<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <h1 class="text-2xl font-semibold mb-4 text-slate-900">Search Results</h1>
      <p class="text-gray-600 mb-6">Query: <span class="font-medium">{{ q }}</span></p>
      <!-- TODO: implement quizee search results -->
      <div class="text-gray-400 text-sm">Results coming soon.</div>
    </div>
  </div>
</template>