<template>
  <div>
    <div v-if="!segments || !segments.length" class="text-sm text-slate-500">No segment data</div>
    <ul v-else class="space-y-2 text-sm">
      <li v-for="(s, i) in segments" :key="s.id ?? i" class="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3">
        <div class="text-slate-700">{{ s.label || s.name || 'Segment' }}</div>
        <div class="font-semibold text-slate-900">{{ s.average_score != null ? s.average_score + '%' : '—' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({ segments: { type: Array, default: () => [] } })
</script>
