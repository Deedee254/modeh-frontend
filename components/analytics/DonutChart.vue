<template>
  <div class="w-full flex items-center justify-center">
    <canvas v-if="hasData" ref="canvas" />
    <div v-else class="text-sm text-slate-500">No distribution data</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({ distribution: { type: Array, default: () => [] } })
const canvas = ref(null)
let chart = null

const hasData = computed(() => Array.isArray(props.distribution) && props.distribution.length > 0)

function renderChart() {
  if (!canvas.value) return
  if (chart) chart.destroy()
  const labels = props.distribution.map(d => d.label || '')
  const data = props.distribution.map(d => Number(d.value || 0))
  const colors = props.distribution.map(d => d.color || '#CBD5E1')

  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  })
}

onMounted(() => { if (hasData.value) renderChart() })
watch(() => props.distribution, () => { if (hasData.value) renderChart(); else if (chart) { chart.destroy(); chart = null } }, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<style scoped>
canvas { width: 160px; height: 160px; }
</style>

