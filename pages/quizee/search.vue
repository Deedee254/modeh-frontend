<script setup lang="ts">
definePageMeta({ layout: 'quizee' })

import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAnalytics } from '~/composables/useAnalytics'
import QuizCard from '~/components/ui/QuizCard.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import Pagination from '~/components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const { trackSearch, trackEvent, trackError } = useAnalytics()

interface SearchResult {
  quizzes: Record<string, any>[]
  topics: Record<string, any>[]
  subjects: Record<string, any>[]
}

interface Totals {
  quizzes: number
  topics: number
  subjects: number
  questions: number
}

const q = ref(String(route.query.q || ''))
const searchInput = ref(q.value)
const loading = ref(false)
const error = ref('')
const results = ref<SearchResult>({ quizzes: [], topics: [], subjects: [] })
const totals = ref<Totals>({ quizzes: 0, topics: 0, subjects: 0, questions: 0 })
const page = ref(Math.max(1, Number(route.query.page) || 1))
const perPage = ref(Math.max(1, Number(route.query.per_page) || 12))
let debounceId: ReturnType<typeof setTimeout> | null = null

function normalizeList(list: any[]): any[] {
  return Array.isArray(list) ? list.filter(Boolean) : []
}

watch(() => route.query.q, async (next) => {
  const term = String(next || '').trim()
  q.value = term
  if (searchInput.value !== term) {
    searchInput.value = term
  }

  const queryPage = Math.max(1, Number(route.query.page) || 1)
  const queryPerPage = Math.max(1, Number(route.query.per_page) || 12)
  if (page.value !== queryPage) page.value = queryPage
  if (perPage.value !== queryPerPage) perPage.value = queryPerPage

  if (!term) {
    results.value = { quizzes: [], topics: [], subjects: [] }
    totals.value = { quizzes: 0, topics: 0, subjects: 0, questions: 0 }
    error.value = ''
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await api.get(`/api/search?q=${encodeURIComponent(term)}&page=${page.value}&per_page=${perPage.value}`)
    if (!res.ok) {
      error.value = 'Could not fetch search results. Try again later.'
      results.value = { quizzes: [], topics: [], subjects: [] }
      totals.value = { quizzes: 0, topics: 0, subjects: 0, questions: 0 }
      trackError('search_failed', `search_api_${res.status}`)
      return
    }
    const data = await api.parseResponse(res)
    const normalized = {
      quizzes: normalizeList(data?.quizzes),
      topics: normalizeList(data?.topics),
      subjects: normalizeList(data?.subjects)
    }
    results.value = normalized
    totals.value = {
      quizzes: Number(data?.totals?.quizzes || 0),
      topics: Number(data?.totals?.topics || 0),
      subjects: Number(data?.totals?.subjects || 0),
      questions: Number(data?.totals?.questions || 0)
    }
    const totalResults = normalized.quizzes.length + normalized.topics.length + normalized.subjects.length
    trackSearch(term, totalResults)
    trackEvent('search_results', {
      search_term: term,
      total_results: totalResults,
      quizzes: normalized.quizzes.length,
      topics: normalized.topics.length,
      subjects: normalized.subjects.length
    })
  } catch (e) {
    error.value = 'Could not fetch search results. Try again later.'
    results.value = { quizzes: [], topics: [], subjects: [] }
    trackError('search_failed', 'search_api_error')
  } finally {
    loading.value = false
  }
}, { immediate: true })

watch(searchInput, (val) => {
  const term = String(val || '').trim()
  if (debounceId) clearTimeout(debounceId)
  debounceId = setTimeout(() => {
    const current = String(route.query.q || '').trim()
    if (term === current) return
    const query = { ...route.query }
    if (term) query.q = term
    else delete query.q
    query.page = '1'
    query.per_page = String(perPage.value || 12)
    router.replace({ path: route.path, query })
  }, 400)
})

watch([page, perPage], ([p, pp]) => {
  const query = { ...route.query }
  query.page = String(p || 1)
  query.per_page = String(pp || 12)
  router.replace({ path: route.path, query })
})

const paginator = computed(() => {
  const maxTotal = Math.max(totals.value.quizzes, totals.value.topics, totals.value.subjects, totals.value.questions, 0)
  const lastPage = Math.max(1, Math.ceil(maxTotal / (perPage.value || 1)))
  return {
    current_page: page.value,
    last_page: lastPage,
    total: maxTotal,
    per_page: perPage.value
  }
})

function onPageChange(p: number) {
  if (!p || p < 1 || p === page.value) return
  page.value = p
}
</script>

<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <h1 class="text-2xl font-semibold mb-2 text-slate-900">Search Results</h1>
      <p class="text-gray-600 mb-4">Query: <span class="font-medium">{{ q || '...' }}</span></p>
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          v-model="searchInput"
          type="search"
          placeholder="Search quizzes, topics, and subjects..."
          class="w-full md:max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
        />
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Per page</label>
          <select v-model.number="perPage" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option :value="6">6</option>
            <option :value="12">12</option>
            <option :value="18">18</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <template v-else>
        <section v-if="results.quizzes.length" class="mb-10">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Quizzes</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuizCard
              v-for="quiz in results.quizzes"
              :key="quiz.slug || quiz.id"
              :quiz-id="quiz.id"
              :title="quiz.title || quiz.name || 'Quiz'"
              :description="quiz.description"
              :likes="quiz.likes_count"
              :questions-count="quiz.questions_count"
              :difficulty="quiz.difficulty"
              :cover="quiz.cover_image"
              :to="`/quizee/quizzes/${quiz.slug || quiz.id}`"
              :quiz="quiz"
            />
          </div>
        </section>

        <section v-if="results.topics.length" class="mb-10">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Topics</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TopicCard
              v-for="topic in results.topics"
              :key="topic.slug || topic.id"
              :title="topic.name || topic.title || 'Topic'"
              :image="topic.image || topic.cover_image"
              :grade="topic.grade?.name || topic.grade_name"
              :subject="topic.subject?.name || topic.subject_name"
              :description="topic.description || topic.summary"
              :quizzesCount="topic.quizzes_count || 0"
              :to="`/quizee/topics/${topic.slug || topic.id}`"
              :topic="topic"
            />
          </div>
        </section>

        <section v-if="results.subjects.length" class="mb-10">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Subjects</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SubjectCard
              v-for="subject in results.subjects"
              :key="subject.slug || subject.id"
              :title="subject.name || subject.title || 'Subject'"
              :description="subject.description || subject.summary"
              :image="subject.image || subject.cover_image"
              :grade="subject.grade?.name || subject.grade_name || subject.grade_id"
              :topicsCount="subject.topics_count || 0"
              :quizzes_count="subject.quizzes_count || 0"
              :to="`/quizee/subjects/${subject.slug || subject.id}`"
              :subject="subject"
            />
          </div>
        </section>

        <div v-if="!results.quizzes.length && !results.topics.length && !results.subjects.length" class="text-gray-500">
          No results found.
        </div>
        <div v-if="paginator.last_page > 1" class="mt-10">
          <Pagination :paginator="paginator" @change-page="onPageChange" />
        </div>
      </template>
    </div>
  </div>
</template>
