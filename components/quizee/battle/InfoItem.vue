<template>
  <div class="flex items-center gap-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
      <UIcon :name="normalizedIcon" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </div>
    <div class="flex-1">
      <div class="text-xs text-gray-500 dark:text-gray-400">{{ label }}</div>
      <div class="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true }
})

// Normalize legacy `heroicon-o-*` style names to the current `heroicons:` prefix
// Example: heroicon-o-question-mark-circle -> heroicons:question-mark-circle
const normalizedIcon = computed(() => {
  const icon = props.icon || ''
  if (icon.startsWith('heroicon-o-')) {
    return 'heroicons:' + icon.replace(/^heroicon-o-/, '')
  }
  // Also handle other common legacy prefixes if needed
  if (icon.startsWith('heroicon-s-')) {
    return 'heroicons:' + icon.replace(/^heroicon-s-/, '')
  }
  return icon
})
</script>
