<template>
  <div>
    <div v-if="!items || !items.length" class="text-sm text-slate-500">No question statistics</div>
    <ul v-else class="space-y-3 text-sm">
      <li v-for="(q, idx) in items" :key="q.id ?? idx" class="flex items-center gap-3 rounded-2xl border border-slate-200/70 px-4 py-3">
        <div class="flex-1">
          <div class="text-sm font-medium text-slate-800">{{ q.label || q.text || `Question ${idx + 1}` }}</div>
          <div class="text-xs text-slate-500">Difficulty: {{ q.difficulty ?? '—' }} • Accuracy: {{ q.accuracy != null ? q.accuracy + '%' : '—' }}</div>
        </div>
        <div class="text-sm font-semibold text-slate-900">{{ q.avg_score != null ? q.avg_score + '%' : '' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({ items: { type: Array, default: () => [] } })
</script>

