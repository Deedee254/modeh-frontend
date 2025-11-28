<template>
  <div>
    <div v-if="!data" class="text-sm text-slate-500">No completion data</div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-slate-500">Pass rate</div>
          <div class="text-2xl font-bold text-slate-900">{{ formatPercent(data.pass_rate) }}</div>
        </div>
        <div class="text-sm text-slate-500 text-right">
          <div>Abandon rate: <span class="font-semibold text-slate-800">{{ formatPercent(data.abandon_rate) }}</span></div>
          <div class="mt-1">Finishers: <span class="font-semibold">{{ formatNumber(data.finishers) }}</span></div>
        </div>
      </div>

      <div v-if="Array.isArray(data.abandon_points) && data.abandon_points.length">
        <h4 class="text-sm font-medium text-slate-800">Top abandon points</h4>
        <ul class="mt-2 space-y-2 text-sm text-slate-600">
          <li v-for="(p, i) in data.abandon_points" :key="i" class="flex items-center justify-between">
            <span>Question {{ p.question_index ?? p.question_id }}</span>
            <span class="font-semibold">{{ formatPercent(p.percent) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ data: { type: Object, default: null } })

function formatPercent(val) {
  if (val == null) return '—'
  const n = Number(val)
  if (Number.isNaN(n)) return String(val)
  return `${n}%`
}

function formatNumber(val) {
  if (val == null) return '—'
  const n = Number(val)
  if (Number.isNaN(n)) return String(val)
  return Intl.NumberFormat().format(n)
}
</script>

