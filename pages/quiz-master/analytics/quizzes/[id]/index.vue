<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold">Quiz Analytics</h1>
    <p class="mt-2 text-sm text-slate-600">Analytics for quiz <strong>{{ quizId }}</strong>.</p>

    <div class="mt-6 bg-white p-4 rounded shadow-sm">
      <p class="text-sm text-slate-700">This is a placeholder page. Replace with the real per-quiz analytics dashboard (views, completion rate, question breakdown, etc.).</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from '#imports'
const route = useRoute()
const quizId = route.params.id || route.params?.id || ''
</script>

<style scoped>
</style>
