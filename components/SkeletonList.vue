<template>
  <div class="space-y-3">
    <div v-for="i in count" :key="i" class="p-3 bg-white rounded animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ count: { type: Number, default: 6 } })
</script>

