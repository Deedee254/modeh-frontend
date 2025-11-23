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
const quizzes = ref([] as any[])
const quizzesMeta = ref({ total: 0, per_page: 10, current_page: 1, last_page: 1 })
const loading = ref(false)
const error = ref(null as any)

async function loadQuizzes(page = 1) {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(quizzesMeta.value.per_page))

    const resp = await api.get(`/api/institutions/${institutionSlug}/branches/${branchSlug}/quizzes?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    quizzes.value = json?.quizzes || []
    if (json?.meta) quizzesMeta.value = json.meta
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function getStatusBadge(status: string) {
  const badges = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    archived: 'bg-red-100 text-red-800'
  }
  return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadQuizzes()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <PageHero
      title="Branch Quizzes"
      description="View and manage quizzes assigned to this branch"
      theme="emerald"
      :actions="[]"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <LoadingSpinner v-if="loading" />
        <ErrorAlert v-else-if="error" :error="error" />

        <div v-else-if="quizzes.length === 0" class="p-8 text-center text-gray-500">
          No quizzes found for this branch.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="quiz in quizzes" :key="quiz.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ quiz.title }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ quiz.subject?.name || quiz.subject_name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ quiz.questions_count || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusBadge(quiz.status)]">
                    {{ quiz.status || 'draft' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ quiz.attempts_count || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(quiz.created_at).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="quizzesMeta.last_page > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="quizzesMeta.current_page <= 1"
              @click="loadQuizzes(quizzesMeta.current_page - 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              :disabled="quizzesMeta.current_page >= quizzesMeta.last_page"
              @click="loadQuizzes(quizzesMeta.current_page + 1)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">{{ quizzesMeta.current_page }}</span> of <span class="font-medium">{{ quizzesMeta.last_page }}</span>
                ({{ quizzesMeta.total }} total quizzes)
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  :disabled="quizzesMeta.current_page <= 1"
                  @click="loadQuizzes(quizzesMeta.current_page - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  :disabled="quizzesMeta.current_page >= quizzesMeta.last_page"
                  @click="loadQuizzes(quizzesMeta.current_page + 1)"
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
  </div>
</template>

<style scoped>
</style>
