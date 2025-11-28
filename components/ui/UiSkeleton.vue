<template>
  <SkeletonGrid v-if="useGrid" :count="count" :variant="gridVariant" />
  <USkeleton v-else :variant="variant" :count="count" />
</template>

<script setup>
import SkeletonGrid from '~/components/SkeletonGrid.vue'
const props = defineProps({ count: { type: Number, default: 6 }, variant: { type: String, default: 'grid' } })
const { count, variant } = props

// Map some UI variants to our SkeletonGrid single-row for less crowding
const useGrid = ['grid','list','avatar','single-row'].includes(variant)
const gridVariant = variant === 'avatar' ? 'single-row' : (variant === 'list' ? 'single-row' : variant)
</script>

