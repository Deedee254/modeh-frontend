<template>
  <div class="space-y-8">
    <PageHero
      eyebrow="Quiz-master pulse"
      title="Analytics Overview"
      description="Monitor quiz performance, completion trends, and audience engagement in one place. All data reflects your live stats from our analytics APIs."
      variant="gradient"
      :bgClass="'bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900'"
      padding="py-8 sm:py-12"
    >
      <template #highlight>
        <div class="flex items-center gap-2">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
            <span class="inline-flex h-2 w-2 rounded-full bg-white/50"></span>
            Live data powered by your analytics API
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex flex-col items-end gap-4">
          <div class="text-sm text-white/70">Last refreshed: <span class="font-semibold text-white">{{ lastUpdatedLabel }}</span></div>
          <button @click="refresh" class="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
            <Icon name="heroicons:arrow-path" class="h-4 w-4" /> Refresh data
          </button>
        </div>
      </template>
    </PageHero>

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
        
            <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur mt-6">
              <header class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-base font-semibold text-slate-900">Top quizzes by engagement</h3>
                  <p class="text-sm text-slate-500">Ranking provided directly from your analytics API</p>
                </div>
              </header>
              <div class="mt-6">
                <TopQuizzesList :items="topQuizzes" />
              </div>
            </div>
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
import PageHero from '~/components/ui/PageHero.vue'
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
    description: 'Published quizzes available to Quizees'
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
    description: 'Share of Quizees finishing quizzes'
  }
])

const seriesWindowLabel = computed(() => {
  // Return the number of days represented by the series (used in UI as a count)
  if (!Array.isArray(series.value) || !series.value.length) return 0
  return series.value.length
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
    if (api.handleAuthStatus(response)) return
    const body = await api.parseResponse(response)
    if (!response.ok) {
      const msg = (body && (body.message || body.error)) ? (body.message || body.error) : `Failed to load analytics overview (status ${response.status})`
      throw new Error(msg)
    }

  // Support payloads that may be wrapped under `data` or returned directly.
  // Prefer `body.data` when present, otherwise treat the response body as the payload.
  let payload = {}
  if (!body) payload = {}
  else if (body.data != null) payload = body.data
  else payload = body

  // stats may be provided as a `stats` object or directly as top-level fields.
    stats.value = payload?.stats ?? payload ?? stats.value

    // Normalize common percentage fields: backend may return decimals (0.85) or percents (85)
    try {
      const s = stats.value || {}
      const mapKeys = (k1, k2) => {
        if (s[k1] == null && s[k2] != null) s[k1] = s[k2]
      }
      // support snake_case fallbacks
      mapKeys('avgScore', 'avg_score')
      mapKeys('completionRate', 'completion_rate')

      if (s.avgScore != null) {
        let v = Number(s.avgScore)
        if (!Number.isNaN(v)) {
          if (v > 0 && v <= 1) v = v * 100
          s.avgScore = v
        }
      }
      if (s.completionRate != null) {
        let v = Number(s.completionRate)
        if (!Number.isNaN(v)) {
          if (v > 0 && v <= 1) v = v * 100
          s.completionRate = v
        }
      }
      stats.value = s
    } catch (e) {
      // ignore normalization errors
    }

  // Ensure series values are numeric and normalized
  series.value = Array.isArray(payload?.series) ? payload.series.map(it => ({ date: it.date, value: Number(it.value || 0) })) : []

  // Normalize distribution: backend may return raw counts; convert to percent for UI display
  const rawDist = Array.isArray(payload?.distribution) ? payload.distribution : []
  const totalCount = rawDist.reduce((s, it) => s + (Number(it?.value || 0)), 0)
  distribution.value = rawDist.map(d => ({ ...d, value: totalCount ? Number(((Number(d.value || 0) / totalCount) * 100).toFixed(1)) : 0 }))

  topQuizzes.value = Array.isArray(payload?.top_quizzes) ? payload.top_quizzes.map(q => ({ ...q, attempts: Number(q.attempts || q.count || 0) })) : []
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('Analytics overview fetch failed', err)
    // Surface backend message when available
    try {
      error.value = (err && err.message) ? err.message : 'Unable to load analytics right now. Please try refreshing shortly.'
    } catch (e) {
      error.value = 'Unable to load analytics right now. Please try refreshing shortly.'
    }
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
