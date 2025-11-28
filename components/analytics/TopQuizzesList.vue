<template>
  <div class="w-full">
    <ul class="space-y-2">
      <li v-if="!items || !items.length" class="text-sm text-slate-500">No quizzes</li>
      <li v-for="(it, idx) in items" :key="it.id || idx" class="flex items-center gap-3">
        <div class="flex-1">
          <div class="text-sm font-medium text-slate-800">{{ it.title || it.name || 'Untitled quiz' }}</div>
          <div class="text-xs text-slate-500">{{ it.attempts ? `${it.attempts} attempts` : '' }}</div>
        </div>
        <div class="text-sm font-semibold text-slate-900">{{ it.score ? `${it.score}%` : '' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({ items: { type: Array, default: () => [] } })
</script>

