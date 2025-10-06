<template>
  <div v-if="variant === 'single-row'" class="flex gap-4 overflow-auto">
    <SkeletonCard v-for="i in count" :key="i" class="min-w-[280px] flex-shrink-0" />
  </div>
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <SkeletonCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup>
import SkeletonCard from './SkeletonCard.vue'
const props = defineProps({ count: { type: Number, default: 6 }, variant: { type: String, default: 'grid' } })
const { count, variant } = props
</script>
