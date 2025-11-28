<template>
  <div>
    <div v-if="!attempts || !attempts.length" class="text-sm text-slate-500">No recent attempts</div>
    <ul v-else class="space-y-2 text-sm">
      <li v-for="(a, i) in attempts" :key="a.id ?? i" class="flex items-center gap-3 rounded-2xl border border-slate-200/70 px-4 py-3">
        <div class="flex-1">
          <div class="text-sm text-slate-800">{{ a.user_name || a.user || 'Anonymous' }}</div>
          <div class="text-xs text-slate-500">{{ a.attempted_at ? new Date(a.attempted_at).toLocaleString() : '' }}</div>
        </div>
        <div class="text-sm font-semibold text-slate-900">{{ a.score != null ? a.score + '%' : '—' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({ attempts: { type: Array, default: () => [] } })
</script>

