<template>
  <div class="flex flex-col">
    <label v-if="label" :class="labelClass" class="mb-1">{{ label }}</label>
    <div><slot /></div>
  </div>
</template>

<script setup>
const props = defineProps({ label: { type: String, default: '' }, labelClass: { type: String, default: '' } })
</script>

<style scoped></style>

