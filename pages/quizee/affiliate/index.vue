<template>
  <div class="min-h-screen bg-gray-50">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Affiliate Program</h1>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <AffiliateDashboard userType="quizee" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AffiliateDashboard from '~/components/AffiliateDashboard.vue'
</script>

<script>
// Define the layout to use
definePageMeta({
  layout: 'quizee'
})
</script>