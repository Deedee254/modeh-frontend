<template>
  <div class="mb-4">
    <div class="flex items-center justify-between">
      <div class="text-sm text-slate-300">Questions ({{ (questions || []).length }})</div>
      <div class="text-xs text-slate-400">Summary</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ questions: { type: Array, default: () => [] } })
</script>

<style scoped></style>

