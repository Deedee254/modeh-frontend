<template>
  <div :class="['bg-white rounded-lg shadow-sm p-4', customClass]">
  <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({ customClass: { type: String, default: '' } })
</script>

<style scoped>
</style>
