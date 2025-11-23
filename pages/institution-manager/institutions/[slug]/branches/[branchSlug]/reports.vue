<script setup lang="ts">
import { useRoute } from 'vue-router'
definePageMeta({ layout: 'institution' as any })
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import PageHero from '~/components/institution/PageHero.vue'

const route = useRoute()
const api = useApi()
const appAlert = useAppAlert()

const institutionSlug = route.params.slug as string
const branchSlug = route.params.branchSlug as string
const reports = ref([] as any[])
const reportsMeta = ref({ total: 0, per_page: 10, current_page: 1, last_page: 1 })
const loading = ref(false)
const error = ref(null as any)
const generating = ref(false)

const showGenerateModal = ref(false)
const reportType = ref('performance')
const dateRange = ref('month')

async function loadReports(page = 1) {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(reportsMeta.value.per_page))

    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/reports?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    reports.value = json?.reports || []
    if (json?.meta) reportsMeta.value = json.meta
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

async function generateReport() {
  generating.value = true
  try {
    const resp = await api.postJson(`/api/institutions/${institutionSlug}/branches/${branchSlug}/reports`, {
      type: reportType.value,
      date_range: dateRange.value
    })
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      appAlert.push({ message: 'Report generated successfully', type: 'success' })
      showGenerateModal.value = false
      await loadReports(1)
    } else {
      appAlert.push({ message: json?.message || 'Failed to generate report', type: 'error' })
    }
  } catch (e: any) {
    appAlert.push({ message: 'Failed to generate report: ' + (e?.message ?? e), type: 'error' })
  } finally {
    generating.value = false
  }
}

function getTypeLabel(type: string) {
  const labels = {
    performance: 'Performance Report',
    attendance: 'Attendance Report',
    quiz_summary: 'Quiz Summary',
    member_progress: 'Member Progress'
  }
  return labels[type as keyof typeof labels] || type
}

function getStatusBadge(status: string) {
  const badges = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  }
  return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadReports()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <PageHero
      title="Branch Reports"
      description="Generate and view branch performance reports"
      theme="indigo"
      :actions="[
        {
          label: 'Generate Report',
          icon: '📄',
          onClick: () => showGenerateModal = true,
          variant: 'primary'
        }
      ]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <LoadingSpinner v-if="loading" />
        <ErrorAlert v-else-if="error" :error="error" />

        <div v-else-if="reports.length === 0" class="p-8 text-center text-gray-500">
          No reports generated yet. Create your first report to get started.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="report in reports" :key="report.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ getTypeLabel(report.type) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ report.date_range }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusBadge(report.status)]">
                    {{ report.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(report.created_at).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <a
                      v-if="report.status === 'completed' && report.file_url"
                      :href="report.file_url"
                      target="_blank"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      Download
                    </a>
                    <span v-else class="text-gray-400">-</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="reportsMeta.last_page > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="reportsMeta.current_page <= 1"
              @click="loadReports(reportsMeta.current_page - 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              :disabled="reportsMeta.current_page >= reportsMeta.last_page"
              @click="loadReports(reportsMeta.current_page + 1)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">{{ reportsMeta.current_page }}</span> of <span class="font-medium">{{ reportsMeta.last_page }}</span>
                ({{ reportsMeta.total }} total reports)
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  :disabled="reportsMeta.current_page <= 1"
                  @click="loadReports(reportsMeta.current_page - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  :disabled="reportsMeta.current_page >= reportsMeta.last_page"
                  @click="loadReports(reportsMeta.current_page + 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showGenerateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showGenerateModal = false">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Report Type</label>
              <select
                v-model="reportType"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="performance">Performance Report</option>
                <option value="attendance">Attendance Report</option>
                <option value="quiz_summary">Quiz Summary</option>
                <option value="member_progress">Member Progress</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                v-model="dateRange"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              @click="showGenerateModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              @click="generateReport"
              :disabled="generating"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto"
            >
              <span v-if="generating">Generating...</span>
              <span v-else>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
