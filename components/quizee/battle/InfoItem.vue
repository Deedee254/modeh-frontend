<template>
  <div class="flex items-center gap-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
      <UIcon :name="icon" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </div>
    <div class="flex-1">
      <div class="text-xs text-gray-500 dark:text-gray-400">{{ label }}</div>
      <div class="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true }
})
</script>