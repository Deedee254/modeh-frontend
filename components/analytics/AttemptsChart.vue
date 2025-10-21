<template>
  <div class="w-full">
    <canvas v-if="hasSeries" ref="canvas" />
    <div v-else class="text-sm text-slate-500">No series data</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({ series: { type: Array, default: () => [] } })
const canvas = ref(null)
let chart = null

const hasSeries = computed(() => Array.isArray(props.series) && props.series.length > 0)

function renderChart() {
  if (!canvas.value) return
  if (chart) chart.destroy()
  const labels = props.series.map(s => s.date)
  const data = props.series.map(s => Number(s.value || 0))

  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{ data, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.35 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  })
}

onMounted(() => { if (hasSeries.value) renderChart() })
watch(() => props.series, () => { if (hasSeries.value) renderChart(); else if (chart) { chart.destroy(); chart = null } }, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<style scoped>
canvas { width: 100%; height: 220px; }
</style>
