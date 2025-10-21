<template>
  <StatCard v-bind="$attrs">
    <slot />
  </StatCard>
</template>

<script setup>
import StatCard from '~/components/ui/StatCard.vue'
</script>
