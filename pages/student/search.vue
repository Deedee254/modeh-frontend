<script setup>
definePageMeta({ layout: 'student' })
import { ref, onMounted } from 'vue'
const route = useRoute()
const q = ref(route.query.q || '')
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">Search</h1>
    <p class="text-gray-600 mb-2">Query: <span class="font-medium">{{ q }}</span></p>
    <!-- TODO: implement student search results -->
    <div class="text-gray-400 text-sm">Results coming soon.</div>
  </div>
</template>