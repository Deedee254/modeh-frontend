<template>
  <div class="space-y-8">
    <section class="rounded-4xl border border-border/60 bg-gradient-to-br from-emerald-600/90 via-emerald-700/80 to-slate-900/80 p-8 text-white shadow-2xl backdrop-blur">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="max-w-2xl space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-white/80">
            Quiz-master pulse
          </div>
          <h1 class="text-3xl font-semibold md:text-4xl">Analytics Overview</h1>
          <p class="max-w-xl text-sm text-white/80">
            Monitor quiz performance, completion trends, and audience engagement in one place. All data reflects your live stats from our analytics APIs.
          </p>
        </div>
        <div class="flex flex-col items-end gap-4 text-right">
          <div class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
            Live data powered by your analytics API
          </div>
          <div class="text-sm text-white/70">Last refreshed: <span class="font-semibold text-white">{{ lastUpdatedLabel }}</span></div>
          <button @click="refresh" class="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
            <Icon name="heroicons:arrow-path" class="h-4 w-4" /> Refresh data
          </button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="card in statCards"
        :key="card.label"
        v-bind="card"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <header class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-slate-900">Attempts trend</h3>
            <p class="text-sm text-slate-500">Last {{ seriesWindowLabel }} days of total attempts</p>
          </div>
          <button
            v-if="series.length"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700"
            @click="exportSeriesCsv"
          >
            <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" /> Export CSV
          </button>
        </header>
        <div class="mt-6">
          <AttemptsChart :series="series" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <header class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900">Score distribution</h3>
              <p class="text-sm text-slate-500">Share of attempts grouped by score range</p>
            </div>
          </header>
          <div class="mt-6 flex flex-col items-center">
            <DonutChart :distribution="distribution" />
            <ul class="mt-6 w-full space-y-3 text-sm">
              <li
                v-for="d in distribution"
                :key="d.label"
                class="flex items-center gap-3 rounded-2xl border border-slate-200/70 px-4 py-3"
              >
                <span :style="{ background: d.color }" class="h-3 w-3 rounded-full"></span>
                <span class="text-slate-600">{{ d.label }}</span>
                <span class="ml-auto font-semibold text-slate-800">{{ Number(d.value || 0).toLocaleString() }}%</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <header class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900">Top quizzes by engagement</h3>
              <p class="text-sm text-slate-500">Ranking provided directly from your analytics API</p>
            </div>
          </header>
          <TopQuizzesList :items="topQuizzes" />
        </div>
      </div>
    </section>

    <UAlert
      v-if="error"
      color="rose"
      variant="soft"
      class="rounded-3xl border border-rose-200/60 bg-rose-50/60 text-rose-700"
    >
      {{ error }}
    </UAlert>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { formatDistanceToNowStrict } from 'date-fns'
import StatCard from '~/components/analytics/StatCard.vue'
import AttemptsChart from '~/components/analytics/AttemptsChart.vue'
import DonutChart from '~/components/analytics/DonutChart.vue'
import TopQuizzesList from '~/components/analytics/TopQuizzesList.vue'
import UAlert from '~/components/ui/UAlert.vue'
import useApi from '~/composables/useApi'

definePageMeta({ layout: 'quiz-master', title: 'Analytics Overview' })

const api = useApi()
const loading = ref(false)
const error = ref(null)
const lastUpdated = ref(null)

const stats = ref({ totalQuizzes: 0, totalAttempts: 0, avgScore: 0, completionRate: 0 })
const series = ref([])
const distribution = ref([])
const topQuizzes = ref([])

const statCards = computed(() => [
  {
    label: 'Total quizzes',
    value: formatNumber(stats.value.totalQuizzes),
    trend: stats.value.totalQuizzesTrend,
    description: 'Published quizzes available to learners'
  },
  {
    label: 'Total attempts',
    value: formatNumber(stats.value.totalAttempts),
    trend: stats.value.totalAttemptsTrend,
    description: 'All quiz attempts recorded'
  },
  {
    label: 'Average score',
    value: stats.value.avgScore != null ? `${Number(stats.value.avgScore).toFixed(1)}%` : '—',
    trend: stats.value.avgScoreTrend,
    description: 'Across all quiz attempts'
  },
  {
    label: 'Completion rate',
    value: stats.value.completionRate != null ? `${Number(stats.value.completionRate).toFixed(1)}%` : '—',
    trend: stats.value.completionRateTrend,
    description: 'Share of learners finishing quizzes'
  }
])

const seriesWindowLabel = computed(() => {
  if (!Array.isArray(series.value) || !series.value.length) return '0'
  return series.value.length === 1 ? 'day' : series.value.length
})

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return 'never'
  try {
    return formatDistanceToNowStrict(lastUpdated.value, { addSuffix: true })
  } catch (err) {
    return lastUpdated.value.toLocaleString()
  }
})

function formatNumber(val) {
  if (val == null) return '—'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  if (num >= 1000) return Intl.NumberFormat().format(num)
  return String(num)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/api/quiz-master/analytics')
    if (!response.ok) throw new Error('Failed to load analytics overview')
    const body = await response.json()
    stats.value = body?.stats ?? stats.value
    series.value = Array.isArray(body?.series) ? body.series : []
    distribution.value = Array.isArray(body?.distribution) ? body.distribution : []
    topQuizzes.value = Array.isArray(body?.top_quizzes) ? body.top_quizzes : []
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('Analytics overview fetch failed', err)
    error.value = 'Unable to load analytics right now. Please try refreshing shortly.'
  } finally {
    loading.value = false
  }
}

function refresh() {
  if (!loading.value) load()
}

function exportSeriesCsv() {
  if (!series.value.length) return
  const rows = [['Date', 'Attempts'], ...series.value.map(item => [item.date, item.value])]
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'quiz-analytics-series.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>
