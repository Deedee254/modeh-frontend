<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Affiliate Program</h1>
      <AffiliateDashboard userType="quizee" />
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