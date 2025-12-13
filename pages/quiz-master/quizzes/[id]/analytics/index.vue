<template>
  <div class="container mx-auto p-6">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-2xl font-semibold">Quiz Analytics</h1>
        <p class="mt-2 text-sm text-slate-600">Analytics for quiz <strong>{{ quizId }}</strong>.</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton size="sm" variant="outline" @click="$router.back()">Back</UButton>
        <UButton size="sm" @click="refresh">Refresh</UButton>
      </div>
    </div>

    <div v-if="error" class="mt-4">
      <div class="rounded p-3 bg-red-50 text-red-700">{{ error }}</div>
    </div>

  <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- KPIs -->
      <div class="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded shadow-sm">
          <div class="text-xs font-semibold text-slate-500">Attempts</div>
          <div class="mt-2 text-2xl font-bold">{{ analytics.attempts_count ?? 0 }}</div>
          <div class="text-xs text-slate-400">Total attempts</div>
        </div>
        <div class="bg-white p-4 rounded shadow-sm">
          <div class="text-xs font-semibold text-slate-500">Completions</div>
          <div class="mt-2 text-2xl font-bold">{{ analytics.completions ?? 0 }}</div>
          <div class="text-xs text-slate-400">Finished attempts</div>
        </div>
        <div class="bg-white p-4 rounded shadow-sm">
          <div class="text-xs font-semibold text-slate-500">Avg Score</div>
          <div class="mt-2 text-2xl font-bold">{{ analytics.avg_score ?? 0 }}%</div>
          <div class="text-xs text-slate-400">Average score (completed)</div>
        </div>
      </div>

      <!-- Trend + distribution -->
      <div class="col-span-1 bg-white p-4 rounded shadow-sm">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold">Attempts (last 30 days)</div>
          <div class="text-xs text-slate-400">sparkline</div>
        </div>
        <div class="mt-3 h-24">
          <canvas ref="trendCanvas" class="w-full h-full"></canvas>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold">Score distribution</div>
            <div class="flex items-center gap-2">
                    <UButton size="xs" variant="outline" :disabled="exportLoading" @click="downloadCSV">Export CSV</UButton>
                    <UButton size="xs" variant="soft" :disabled="exportLoading" @click="downloadPDF">Export PDF</UButton>
            </div>
          </div>
          <div class="mt-2 space-y-1">
            <canvas ref="distCanvas" class="w-full h-36"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-2 bg-white p-4 rounded shadow-sm">
        <div class="text-lg font-semibold">Per-question breakdown</div>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-slate-500">
                <th class="p-2">Question</th>
                <th class="p-2 w-36">Attempts</th>
                <th class="p-2 w-36">Correct</th>
                <th class="p-2 w-36">Correct %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in analytics.per_question || []" :key="q.question_id" class="border-t">
                <td class="p-2 align-top max-w-xl truncate">{{ q.body }}</td>
                <td class="p-2 align-top">{{ q.attempts_count ?? 0 }}</td>
                <td class="p-2 align-top">{{ q.correct_count ?? 0 }}</td>
                <td class="p-2 align-top">{{ q.correct_rate !== null ? (Math.round(q.correct_rate * 1000)/10) + '%' : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="col-span-1 bg-white p-4 rounded shadow-sm">
        <div class="text-lg font-semibold">Top missed questions</div>
        <div class="mt-3 space-y-3">
          <div v-for="q in analytics.top_missed_questions || []" :key="q.question_id" class="p-2 border rounded">
            <div class="text-sm font-medium truncate">{{ q.body }}</div>
            <div class="text-xs text-slate-500">Correct: {{ q.correct_rate !== null ? Math.round(q.correct_rate*100) + '%' : '—' }} • Attempts: {{ q.attempts_count ?? 0 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liked by section -->
    <div class="mt-6 bg-white p-4 rounded shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div class="text-lg font-semibold">❤️ Liked by</div>
        <span class="text-sm text-slate-500">{{ likedByUsers.length }} user(s) have liked this quiz</span>
      </div>
      <div v-if="likedByLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
      <div v-else-if="likedByUsers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="user in likedByUsers" :key="user.id" class="p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
          <div class="flex items-center gap-3">
            <div v-if="user.avatar_url || user.avatar" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img :src="user.avatar_url || user.avatar" :alt="user.name" class="w-full h-full object-cover">
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <p>No likes yet. Be the first to like this quiz!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from '#imports'
import useApi from '~/composables/useApi'
import { Chart, registerables } from 'chart.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
Chart.register(...registerables)
// consolidated imports above; removed duplicate vue imports

definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Analytics for this quiz — performance, attempts and insights.' } ] })
const route = useRoute()
const quizId = route.params.id || route.params?.id || ''

const api = useApi()
const loading = ref(false)
const error = ref(null)
const analytics = ref({})
const exportLoading = ref(false)
const likedByLoading = ref(false)
const likedByUsers = ref([])

const trendCanvas = ref(null)
const distCanvas = ref(null)
let trendChart = null
let distChart = null

async function fetchAnalytics() {
  if (!quizId) return
  loading.value = true
  try {
    const res = await api.get(`/api/quizzes/${quizId}/analytics`)
    if (api.handleAuthStatus(res)) return
    // parseResponse handles JSON or returns the raw Response for non-JSON
    const data = await api.parseResponse(res)
    if (!res.ok) {
      // Try to extract a helpful message from the body
      const message = (data && (data.message || data.error)) ? (data.message || data.error) : `Failed to load analytics (status ${res.status})`
      throw new Error(message)
    }

    // Backend returns a plain object of analytics fields; some endpoints may wrap under `data` or `analytics`
    analytics.value = (data && (data.analytics || data.data)) ? (data.analytics || data.data) : (data || {})
  } catch (err) {
    console.error('Error loading quiz analytics', err)
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function refresh() { 
  fetchAnalytics()
  fetchLikedByUsers()
}

async function fetchLikedByUsers() {
  if (!quizId) return
  likedByLoading.value = true
  try {
    const res = await api.get(`/api/quizzes/${quizId}/likers`)
    if (api.handleAuthStatus(res)) return
    
    const data = await api.parseResponse(res)
    if (res.ok) {
      // Handle both paginated and direct array responses
      const users = data?.data || data || []
      likedByUsers.value = Array.isArray(users) ? users : []
    }
  } catch (err) {
    console.warn('Error loading liked users', err)
    // Don't show error, just leave the section empty
    likedByUsers.value = []
  } finally {
    likedByLoading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
  fetchLikedByUsers()
})

// Sparkline helpers
const trendViewBox = computed(() => {
  const w = 300; const h = 50; return `0 0 ${w} ${h}`
})
const trendPoints = computed(() => {
  const vals = analytics.value.attempts_trend || []
  const w = 300; const h = 50
  if (!vals.length) return ''
  const max = Math.max(...vals) || 1
  const step = w / Math.max(1, vals.length - 1)
  return vals.map((v, i) => `${i*step},${h - Math.round((v/max) * (h-4))}`).join(' ')
})

function distributionPercent(idx) {
  const dist = analytics.value.score_distribution || []
  const total = (dist || []).reduce((s, n) => s + (n||0), 0) || 0
  if (!total) return 0
  return Math.round(((dist[idx]||0) / total) * 100)
}

function bucketLabel(idx) {
  if (idx === 10) return '100'
  const start = idx*10; const end = start+9
  return `${start}-${end}`
}

function renderTrendChart() {
  if (!trendCanvas.value) return
  const ctx = trendCanvas.value.getContext('2d')
  const labels = (analytics.value.attempts_trend || []).map((_, i) => i+1)
  const data = (analytics.value.attempts_trend || [])
  if (trendChart) trendChart.destroy()
  trendChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Attempts', data, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)', fill: true, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
  })
}

function renderDistChart() {
  if (!distCanvas.value) return
  const ctx = distCanvas.value.getContext('2d')
  const labels = (analytics.value.score_distribution || []).map((_, idx) => bucketLabel(idx))
  const data = (analytics.value.score_distribution || [])
  if (distChart) distChart.destroy()
  distChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Count', data, backgroundColor: '#7c3aed' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 0 } }, y: { beginAtZero: true } } }
  })
}

async function downloadCSV() {
  if (!quizId) return
  exportLoading.value = true
  try {
    const res = await api.get(`/api/quizzes/${quizId}/export/csv`)
    if (!res.ok) {
      if (res.status === 429) throw new Error('Rate limit exceeded. Try again later.')
      throw new Error('Failed to download CSV')
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-${quizId}-per-question.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('CSV export error', err)
    // lightweight user feedback
    alert(err.message || 'Error downloading CSV')
  } finally {
    exportLoading.value = false
  }
}

async function downloadPDF() {
  if (!quizId) return
  exportLoading.value = true
  try {
    const res = await api.get(`/api/quizzes/${quizId}/export/pdf`)
    if (!res.ok) {
      if (res.status === 429) throw new Error('Rate limit exceeded. Try again later.')
      throw new Error('Failed to download PDF')
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-${quizId}-analytics.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('PDF export error', err)
    alert(err.message || 'Error downloading PDF')
  } finally {
    exportLoading.value = false
  }
}

// Re-render charts when analytics updates
watch(analytics, () => { renderTrendChart(); renderDistChart() })
</script>

<style scoped>
</style>
