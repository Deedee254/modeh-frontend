<template>
  <div>
    <PageHero
      title="My Quiz Collection"
      description="Create, manage and track your quizzes. Monitor approval status and engage with learners."
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
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Your Stats</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ paginator?.total || 0 }} quizzes</p>
          <p class="mt-2 text-sm text-white/70">Track your content creation journey.</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside class="lg:col-span-1 order-2 lg:order-1">
          <div class="sticky top-6">
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
        </aside>

        <main class="lg:col-span-3 order-1 lg:order-2">
          <div class="mt-4 flex flex-wrap gap-4 items-center">
            <div class="flex-1 min-w-[200px]">
              <input 
                v-model="q" 
                @keyup.enter="fetchItems" 
                placeholder="Search quizzes..." 
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <select 
              v-model.number="perPage" 
              @change="fetchItems" 
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
            >
              <option :value="5">5 per page</option>
              <option :value="10">10 per page</option>
              <option :value="20">20 per page</option>
            </select>
          </div>

          <div class="mt-6">
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UiSkeleton :count="perPage" />
            </div>

            <div v-else>
              <div v-if="!paginator?.data || paginator.data.length === 0" 
                class="text-center py-12 text-gray-500">
                No quizzes found. Create your first quiz to get started.
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuizCard
                  v-for="(quiz, idx) in (Array.isArray(normalizedQuizzes) ? normalizedQuizzes.filter(Boolean) : [])"
                  :key="quiz?.id || idx"
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
                  :show-approval="true"
                  :showEdit="true"
                  :editLink="quiz.editLink"
                  @approve="toggleApprove(quiz)"
                  @edit="() => router.push(`/quiz-master/quizzes/${quiz?.id || ''}/edit`)"
                />
              </div>

              <div class="mt-4"><Pagination :paginator="paginator" @change-page="onPageChange" /></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })
import { ref, onMounted, computed } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import Pagination from '~/components/Pagination.vue'
import FilterLayout from '~/components/layout/FilterLayout.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'

const router = useRouter()
const alert = useAppAlert()
const api = useApi()
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const isAdmin = computed(() => !!auth.user?.is_admin)

const paginator = ref(null)
const topics = ref([])
const { fetchAllTopics, fetchGrades, fetchAllSubjects, grades: taxGrades, subjects: taxSubjects, topics: taxTopics } = useTaxonomy()
const subjects = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value : [])
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])
const loading = ref(false)
const q = ref('')
const perPage = ref(10)
const page = ref(1)
const topicId = ref(0)
const gradeFilter = ref(0)
const subjectFilter = ref(0)

const normalizedQuizzes = computed(() => {
  const quizzes = paginator.value?.data || []
  return quizzes
    .filter(q => q && q.id) // Ensure quiz and quiz.id exist
    .map(quiz => ({
      ...quiz, // Pass through original properties like is_approved
      id: quiz.id,
      title: quiz.title || quiz.name || 'Untitled Quiz',
      description: quiz.description || quiz.summary || '',
      subject: quiz.subject?.name || quiz.subject_name || 'N/A',
      topic: quiz.topic?.name || quiz.topic_name || 'N/A',
      subject_id: quiz.subject?.id || quiz.subject_id,
      topic_id: quiz.topic?.id || quiz.topic_id,
      grade: quiz.grade?.name || quiz.grade_name || quiz.grade_id || 'N/A',
      questionsCount: quiz.questions_count ?? quiz.questions?.length ?? 0,
      likes: quiz.likes_count ?? quiz.likes ?? 0,
      startLink: `/quiz-master/quizzes/${quiz.id}`,
      editLink: `/quiz-master/quizzes/${quiz.id}/edit`,
    }))
})

function onServerSearch(search) {
  q.value = search || ''
  page.value = 1
  fetchItems()
}

onMounted(async () => {
  // load taxonomy first, then items
  await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics()])
  await fetchTopics()
  topics.value = Array.isArray(taxTopics.value) ? taxTopics.value : topics.value
  await fetchItems()
})

async function fetchTopics() {
  try {
    const res = await api.get('/api/topics?approved=1')
    if (res.ok) {
      const json = await res.json()
      const rawTopics = json.topics || json.data || []
      topics.value = Array.isArray(rawTopics) ? rawTopics.filter(t => t) : []
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load topics.', icon: 'heroicons:x-circle' })
  }
}

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