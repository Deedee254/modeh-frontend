<template>
  <div>
    <PageHero
      title="Topic Library"
      description="Manage topic-level content and create structured assessments. Organize topics to align with curriculum objectives and learning pathways."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Topic Management
      </template>

      <template #actions>
        <div class="flex items-center gap-3">
            <button 
            @click="router.push('/quiz-master/topics/create')"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Topic
          </button>
        </div>
      </template>
    </PageHero>

    <div class="min-h-[calc(100vh-240px)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <!-- Sticky Filter Bar -->
      <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 mb-6">
        <div class="max-w-7xl mx-auto">
          <div class="space-y-4">
            <!-- Mobile Filter Drawer -->
            <MobileFilterDrawer
              @apply="onApplyFilters"
              @clear="onClearFilters"
            >
              <FiltersSidebar
                :grade-options="grades"
                :subject-options="subjects"
                :grade="selectedGrade"
                :subject="selectedSubject"
                storageKey="filters:quiz-master-topics"
                @update:grade="onGradeChange"
                @update:subject="onSubjectChange"
                @apply="onApplyFilters"
                @clear="onClearFilters"
              />
            </MobileFilterDrawer>

            <!-- Desktop Filters -->
            <div class="hidden lg:block">
              <FiltersSidebar
                :grade-options="grades"
                :subject-options="subjects"
                :grade="selectedGrade"
                :subject="selectedSubject"
                storageKey="filters:quiz-master-topics"
                @update:grade="onGradeChange"
                @update:subject="onSubjectChange"
                @apply="onApplyFilters"
                @clear="onClearFilters"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <TopicCard
                  v-for="(topic, idx) in (Array.isArray(filteredTopics) ? filteredTopics.filter(Boolean) : [])"
                  :key="topic?.id || idx"
                  :title="topic?.name"
                  :image="topic?.image || topic?.cover_image || ''"
                  :grade="topic?.grade?.name || topic?.grade_name || topic?.grade || ''"
                  :subject="topic?.subject?.name || topic?.subject_name || ''"
                  :description="topic?.description || topic?.summary || ''"
                  :quizzesCount="topic?.quizzes_count || topic?.quizzesCount || 0"
                  :startLink="{
                    path: '/quiz-master/quizzes/create',
                    query: {
                      level_id: topic?.grade?.level_id || topic?.level_id,
                      grade_id: topic?.grade_id || topic?.gradeId,
                      subject_id: topic?.subject_id || topic?.subjectId,
                      topic_id: topic?.id,
                    }
                  }"
                  :startLabel="'Create Quiz'"
                  @click="topic && handleTopicClick(topic)"
                />

                <div v-if="filteredTopics.length === 0" class="col-span-full text-center py-16">
                  <div class="text-gray-400 mb-2">
                    <Icon name="heroicons:inbox-20-solid" class="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p class="text-gray-600 font-medium">No topics found</p>
                  <p class="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new topic.</p>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="topicsResponse?.topics?.meta && filteredTopics.length > 0" class="mt-8 pt-6 border-t border-slate-200">
                <Pagination 
                  :paginator="topicsResponse.topics" 
                  @change-page="handlePageChange"
                />
              </div>
            </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import Pagination from '~/components/Pagination.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import MobileFilterDrawer from '~/components/MobileFilterDrawer.vue'
import EnhancedInput from '~/components/ui/EnhancedInput.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'
import useApi from '~/composables/useApi'

definePageMeta({
  layout: 'quiz-master',
  title: 'Topic Library — Quiz Master | Modeh',
  meta: [
    { name: 'description', content: 'Manage topic-level content and create structured assessments. Organize topics to align with curriculum objectives and learning pathways.' },
    { name: 'robots', content: 'noindex, nofollow' },
    { property: 'og:title', content: 'Topic Library — Quiz Master | Modeh' },
    { property: 'og:description', content: 'Manage topic-level content and create structured assessments. Organize topics to align with curriculum objectives and learning pathways.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/social-share.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Topic Library — Quiz Master | Modeh' },
    { name: 'twitter:description', content: 'Manage topic-level content and create structured assessments. Organize topics to align with curriculum objectives and learning pathways.' }
  ]
})

const router = useRouter()
const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades, subjects, topics
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true
})

const searchQuery = ref('')
const selectedSubject = ref(null)
const selectedGrade = ref(null)
const isLoading = ref(false)

const page = ref(1)
const perPage = ref(12)

const subjects = computed(() => Array.isArray(store.subjects) ? store.subjects : [])
const grades = computed(() => Array.isArray(store.grades) ? store.grades : [])

const topicsResponse = ref(null)
const topics = computed(() => topicsResponse.value?.data || [])

onMounted(async () => {
  // Ensure levels are loaded so FiltersSidebar can derive grades/subjects reliably
  await store.fetchLevels()
  // Load the first page of topics
  await loadTopics()
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})

// Computed filtered topics based on search and filters
const filteredTopics = computed(() => {
  // client-side fallback filtering if server doesn't support filters
  return topics.value.filter(topic => {
    const matchesSearch = !searchQuery.value || (topic.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSubject = !selectedSubject.value || String(topic.subject_id || topic.subjectId || '') === String(selectedSubject.value)
    const matchesGrade = !selectedGrade.value || String(topic.grade_id || topic.gradeId || '') === String(selectedGrade.value)
    return matchesSearch && matchesSubject && matchesGrade
  })
})

async function loadTopics() {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', page.value)
    params.set('per_page', perPage.value)
    if (selectedSubject.value) params.set('subject_id', selectedSubject.value)
    if (selectedGrade.value) params.set('grade_id', selectedGrade.value)
    if (searchQuery.value) params.set('q', searchQuery.value)
    const api = useApi()
    const res = await api.get(`/api/topics?${params.toString()}`)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to fetch topics')
    const data = await res.json().catch(() => null)
    // normalize expected shape
    topicsResponse.value = data.topics || data.data || data
  } catch (e) {
    // ignore for now
  }
  isLoading.value = false
}

const handleTopicClick = (topic) => {
  router.push(`/quiz-master/topics/${topic.id}`)
}

async function handlePageChange(newPage) {
  page.value = newPage
  await loadTopics()
}

async function onServerSearch(q) {
  searchQuery.value = q
  page.value = 1
  await loadTopics()
}

async function onSearch() {
  page.value = 1
  await loadTopics()
}

function onGradeChange(val) {
  selectedGrade.value = val
}

function onSubjectChange(val) {
  selectedSubject.value = val
}

function onApplyFilters() {
  page.value = 1
  loadTopics()
}

function onClearFilters() {
  selectedGrade.value = null
  selectedSubject.value = null
  page.value = 1
  loadTopics()
}

function onFilterChange(type, val) {
  if (type === 'grade') selectedGrade.value = val
  if (type === 'subject') selectedSubject.value = val
  page.value = 1
  loadTopics()
}
</script>