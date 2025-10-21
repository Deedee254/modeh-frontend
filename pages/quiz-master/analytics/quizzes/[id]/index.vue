<template>
  <div class="space-y-8">
    <section class="rounded-4xl border border-border/60 bg-gradient-to-br from-emerald-600/90 via-emerald-700/80 to-slate-900/80 p-8 text-white shadow-2xl backdrop-blur">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="max-w-2xl space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-white/80">
            Quiz insight report
          </div>
          <h1 class="text-3xl font-semibold md:text-4xl">Quiz: {{ quizDetails?.title || `#${quizId}` }}</h1>
          <p class="max-w-xl text-sm text-white/80">
            Live analytics for this quiz including attempts, performance and completion behaviour, powered entirely by your quiz analytics API.
          </p>
        </div>
        <div class="flex flex-col items-end gap-4 text-right">
          <div class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
            Live API data
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

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <header class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Attempts trend</h2>
            <p class="text-sm text-slate-500">Last {{ seriesWindowLabel }} days</p>
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
              <h2 class="text-base font-semibold text-slate-900">Completion summary</h2>
              <p class="text-sm text-slate-500">Pass rates and abandon points</p>
            </div>
          </header>
          <CompletionSummary :data="completion" />
        </div>

        <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <header class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Question performance</h2>
              <p class="text-sm text-slate-500">Difficulty and accuracy per question</p>
            </div>
          </header>
          <QuestionPerformanceList :items="questionStats" />
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <header class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Audience segments</h2>
            <p class="text-sm text-slate-500">Performance by grade or group</p>
          </div>
        </header>
        <SegmentBreakdown :segments="segments" />
      </div>

      <div class="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <header class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Recent attempts</h2>
            <p class="text-sm text-slate-500">Most recent learners and their scores</p>
          </div>
        </header>
        <RecentAttemptsList :attempts="recentAttempts" />
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
import { useRoute } from '#imports'
import { formatDistanceToNowStrict } from 'date-fns'
import StatCard from '~/components/analytics/StatCard.vue'
import AttemptsChart from '~/components/analytics/AttemptsChart.vue'
import CompletionSummary from '~/components/analytics/CompletionSummary.vue'
import QuestionPerformanceList from '~/components/analytics/QuestionPerformanceList.vue'
import SegmentBreakdown from '~/components/analytics/SegmentBreakdown.vue'
import RecentAttemptsList from '~/components/analytics/RecentAttemptsList.vue'
import UAlert from '~/components/ui/UAlert.vue'
import useApi from '~/composables/useApi'

const route = useRoute()
const quizId = route.params.id || route.params?.id || ''
const api = useApi()

const loading = ref(false)
const error = ref(null)
const lastUpdated = ref(null)

const quizDetails = ref(null)
const stats = ref({})
const series = ref([])
const completion = ref(null)
const questionStats = ref([])
const segments = ref([])
const recentAttempts = ref([])

const statCards = computed(() => {
  const value = stats.value || {}
  return [
    {
      label: 'Total attempts',
      value: formatNumber(value.totalAttempts),
      trend: value.totalAttemptsTrend,
      description: 'Learners who started this quiz'
    },
    {
      label: 'Completion rate',
      value: value.completionRate != null ? `${Number(value.completionRate).toFixed(1)}%` : '—',
      trend: value.completionRateTrend,
      description: 'Fully completed attempts'
    },
    {
      label: 'Average score',
      value: value.averageScore != null ? `${Number(value.averageScore).toFixed(1)}%` : '—',
      trend: value.averageScoreTrend,
      description: 'Average across all completed attempts'
    },
    {
      label: 'Median time to complete',
      value: formatDuration(value.medianCompletionSeconds),
      description: 'Median duration recorded for finishers'
    }
  ]
})

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

function formatDuration(seconds) {
  if (seconds == null) return '—'
  const value = Number(seconds)
  if (Number.isNaN(value) || value < 0) return '—'
  if (value < 60) return `${Math.round(value)}s`
  const mins = Math.floor(value / 60)
  const secs = Math.round(value % 60)
  return secs ? `${mins}m ${secs}s` : `${mins}m`
}

async function load() {
  if (!quizId) return
  loading.value = true
  error.value = null
  try {
    const response = await api.get(`/api/quiz-master/analytics/quizzes/${quizId}`)
    if (!response.ok) throw new Error('Failed to load quiz analytics')
    const body = await response.json()
    quizDetails.value = body?.quiz || quizDetails.value
    stats.value = body?.stats || stats.value
    series.value = Array.isArray(body?.series) ? body.series : []
    completion.value = body?.completion || null
    questionStats.value = Array.isArray(body?.questions) ? body.questions : []
    segments.value = Array.isArray(body?.segments) ? body.segments : []
    recentAttempts.value = Array.isArray(body?.recent_attempts) ? body.recent_attempts : []
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('Per-quiz analytics fetch failed', err)
    error.value = 'Unable to load quiz analytics right now. Please try again shortly.'
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
  link.setAttribute('download', `quiz-${quizId}-analytics-series.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>
