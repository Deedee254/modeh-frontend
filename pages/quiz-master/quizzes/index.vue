<template>
  <div>
    <PageHero
      title="My Assessment Collection"
      description="Create, manage, and monitor your assessments. Track approval status and review learner engagement and performance." 
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Quiz Management
      </template>

      <template #actions>
        <div class="flex items-center gap-3">
          <button 
            @click="router.push('/quiz-master/quizzes/create')"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Your Stats</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ paginator?.meta?.total || paginator?.total || 0 }} quizzes</p>
          <p class="mt-2 text-sm text-white/70">Track your content creation journey.</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </template>
    </PageHero>

    <div class="min-h-[calc(100vh-240px)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <!-- Sticky Filter Bar -->
      <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 mb-6">
        <div class="max-w-7xl mx-auto">
          <div class="space-y-4">
            <!-- Mobile Filter Drawer -->
            <MobileFilterDrawer
              @apply="() => { page.value = 1; fetchItems() }"
              @clear="() => { gradeFilter.value = ''; subjectFilter.value = ''; topicId.value = ''; page.value = 1; fetchItems() }"
            >
              <FiltersSidebar
                :grade-options="grades"
                :subject-options="subjects"
                :topic-options="topics"
                :grade="gradeFilter"
                :subject="subjectFilter"
                storageKey="filters:quiz-master-quizzes"
                @update:grade="val => { gradeFilter.value = val }"
                @update:subject="val => { subjectFilter.value = val }"
                @update:topic="val => { topicId.value = val }"
                @apply="() => { page.value = 1; fetchItems() }"
                @clear="() => { gradeFilter.value = ''; subjectFilter.value = ''; topicId.value = ''; page.value = 1; fetchItems() }"
              />
            </MobileFilterDrawer>

            <!-- Desktop Filters -->
            <div class="hidden lg:block">
              <FiltersSidebar
                :grade-options="grades"
                :subject-options="subjects"
                :topic-options="topics"
                :grade="gradeFilter"
                :subject="subjectFilter"
                storageKey="filters:quiz-master-quizzes"
                @update:grade="val => { gradeFilter.value = val }"
                @update:subject="val => { subjectFilter.value = val }"
                @update:topic="val => { topicId.value = val }"
                @apply="() => { page.value = 1; fetchItems() }"
                @clear="() => { gradeFilter.value = ''; subjectFilter.value = ''; topicId.value = ''; page.value = 1; fetchItems() }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div class="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-end">
              <select 
                v-model.number="perPage" 
                @change="fetchItems" 
                class="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
              >
                <option :value="5">5 per page</option>
                <option :value="10">10 per page</option>
                <option :value="20">20 per page</option>
              </select>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <UiSkeleton :count="perPage" />
            </div>

            <div v-else>
              <div v-if="!normalizedQuizzes || normalizedQuizzes.length === 0" 
                class="text-center py-16">
                <div class="text-gray-400 mb-2">
                  <Icon name="heroicons:inbox-20-solid" class="w-12 h-12 mx-auto opacity-50" />
                </div>
                <p class="text-gray-600 font-medium">No quizzes found</p>
                <p class="text-gray-500 text-sm mt-1">Create your first quiz to get started.</p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <QuizCard
                  v-for="(quiz, idx) in normalizedQuizzes"
                  :key="quiz?.slug || idx"
                  :to="quiz.startLink"
                  :startLink="quiz.startLink"
                  :title="quiz.title"
                  :description="quiz.description"
                  :subject="quiz.subject"
                  :topic="quiz.topic"
                  :subjectId="quiz.subject_id"
                  :topicId="quiz.topic_id"
                  :grade="quiz.grade"
                  :questionsCount="quiz.questionsCount"
                  :likes="quiz.likes"
                  :quizId="quiz.id"
                  :attemptsCount="quiz.attemptsCount"
                  :show-approval="true"
                  :showEdit="true"
                  :editLink="quiz.editLink"
                  @approve="toggleApprove(quiz)"
                  @edit="() => router.push(`/quiz-master/quizzes/${quiz?.slug}/edit`)"
                />
              </div>

              <div v-if="normalizedQuizzes && normalizedQuizzes.length > 0" class="mt-8 pt-6 border-t border-slate-200">
                <Pagination :paginator="paginator" @change-page="onPageChange" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Manage your quizzes, drafts and published content as a quiz-master.' } ] })
import { ref, onMounted, computed } from 'vue'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import EnhancedInput from '~/components/ui/EnhancedInput.vue'
import Pagination from '~/components/Pagination.vue'
import FilterLayout from '~/components/layout/FilterLayout.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import MobileFilterDrawer from '~/components/MobileFilterDrawer.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const router = useRouter()
const alert = useAppAlert()
const api = useApi()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)

// SSR hydration: pre-fetch grades, subjects, topics
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true
})

const paginator = ref(null)
const subjects = computed(() => Array.isArray(store.subjects) ? store.subjects : [])
const grades = computed(() => Array.isArray(store.grades) ? store.grades : [])
const topics = computed(() => Array.isArray(store.topics) ? store.topics : [])
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const topicId = ref(0)
const gradeFilter = ref(0)
const subjectFilter = ref(0)

const normalizedQuizzes = computed(() => {
  // Support both paginated responses ({ data: [...], meta: {...}, links: {...} }) and direct array responses
  if (!paginator.value) return []
  
  // Extract the data array from paginated response
  const raw = Array.isArray(paginator.value?.data) ? paginator.value.data : (Array.isArray(paginator.value) ? paginator.value : [])
  const quizzes = Array.isArray(raw) ? raw : []
  
  return quizzes
    .filter(q => q && q.slug)
    .map(quiz => ({
      ...quiz,
      id: quiz.id,
      title: quiz.title || quiz.name || 'Untitled Quiz',
      description: quiz.description || quiz.summary || '',
      subject: quiz.subject?.name || quiz.subject_name || 'N/A',
      topic: quiz.topic?.name || quiz.topic_name || 'N/A',
      subject_id: quiz.subject?.id || quiz.subject_id,
      topic_id: quiz.topic?.id || quiz.topic_id,
      grade: quiz.grade?.name || quiz.grade_name || quiz.grade_id || 'N/A',
      level: quiz.level?.name || quiz.level_name || quiz.level_id || '',
      questionsCount: quiz.questions_count ?? quiz.questions?.length ?? 0,
      attemptsCount: quiz.attempts_count ?? 0,
      likes: quiz.likes_count ?? quiz.likes ?? 0,
      startLink: `/quiz-master/quizzes/${quiz.slug}`,
      editLink: `/quiz-master/quizzes/${quiz.slug}/edit`,
    }))
})

function onServerSearch(search) {
  q.value = search || ''
  page.value = 1
  fetchItems()
}

onMounted(async () => {
  // Parallelize taxonomy loading and items fetching
  await Promise.all([
    store.fetchLevels(),
    fetchItems()
  ])
  
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (topicId.value) params.set('topic_id', topicId.value)
    if (subjectFilter.value) params.set('subject_id', subjectFilter.value)
    if (gradeFilter.value) params.set('grade_id', gradeFilter.value)
    params.set('per_page', perPage.value)
    params.set('page', page.value)
      // When on the quiz-master management page, request only quizzes
      // created by the authenticated user so the API can filter server-side
      // and avoid returning other creators' quizzes.
      params.set('mine', 1)
    const res = await api.get('/api/quizzes?' + params.toString())
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.quizzes || json.data || json
    } else {
      alert.push({ type: 'error', message: 'Failed to load quizzes', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
  alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

async function toggleApprove(item) {
  if (!item || !item.id) return
  if (isAdmin.value) {
    const prev = item.is_approved
    item.is_approved = !prev
    try {
      const res = await api.postJson(`/api/quizzes/${item.id}/approve`, {})
      if (api.handleAuthStatus(res)) { item.is_approved = prev; alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }
      if (!res.ok) { item.is_approved = prev; alert.push({ type: 'error', message: 'Failed to change approve status', icon: 'heroicons:exclamation-circle' }) }
      else alert.push({ type: 'success', message: 'Approval status updated', icon: 'heroicons:check-circle' })
    } catch (e) { item.is_approved = prev; alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' }) }
  } else {
    // Optimistic: mark as requested locally immediately, revert on failure
    const prevRequested = item.approval_requested_at
    item.approval_requested_at = new Date().toISOString()
    try {
      const res = await api.postJson(`/api/quizzes/${item.id}/request-approval`, {})
      if (api.handleAuthStatus(res)) { item.approval_requested_at = prevRequested; alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }
      if (res.ok) {
        alert.push({ type: 'success', message: 'Approval requested', icon: 'heroicons:check-circle' })
      } else {
        item.approval_requested_at = prevRequested
        alert.push({ type: 'error', message: 'Failed to request approval', icon: 'heroicons:exclamation-circle' })
      }
    } catch (e) {
      item.approval_requested_at = prevRequested
      alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
    }
  }
}

function onPageChange(p) { page.value = p; fetchItems() }
</script>

<style scoped></style>