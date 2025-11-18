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
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Topic
          </button>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside class="lg:col-span-1 order-2 lg:order-1">
          <div class="sticky top-6">
            <FiltersSidebar
              :grade-options="grades"
              :subject-options="subjects"
              :grade="selectedGrade"
              :subject="selectedSubject"
              storageKey="filters:quiz-master-topics"
              @update:grade="val => { selectedGrade.value = val }"
              @update:subject="val => { selectedSubject.value = val }"
              @apply="() => { page.value = 1; loadTopics() }"
              @clear="() => { selectedGrade.value = ''; selectedSubject.value = ''; page.value = 1; loadTopics() }"
            />
            <div class="mt-4">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search topics..." 
                @keyup.enter="onSearch"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </aside>

        <main class="lg:col-span-3 order-1 lg:order-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <TopicCard
              v-for="(topic, idx) in (Array.isArray(filteredTopics) ? filteredTopics.filter(Boolean) : [])"
              :key="topic?.id || idx"
              :title="topic?.name"
              :image="topic?.image || topic?.cover_image || ''"
              :grade="topic?.grade?.name || topic?.grade_name || topic?.grade || ''"
              :subject="topic?.subject?.name || topic?.subject_name || ''"
              :description="topic?.description || topic?.summary || ''"
              :quizzesCount="topic?.quizzes_count || topic?.quizzesCount || 0"
              :startLink="`/quiz-master/quizzes/create?topic_id=${topic?.id}&subject_id=${topic?.subject_id || topic?.subject?.id || ''}`"
              :startLabel="'Create Quiz'"
              @click="topic && handleTopicClick(topic)"
            />

            <div v-if="filteredTopics.length === 0" class="col-span-full text-center py-12 text-gray-500">
              No topics found. Try adjusting your filters or create a new topic.
            </div>
          </div>

          <div v-if="topicsResponse?.topics?.meta" class="mt-6">
            <Pagination 
              :paginator="topicsResponse.topics" 
              @change-page="handlePageChange"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
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
const searchQuery = ref('')
const selectedSubject = ref('')
const selectedGrade = ref('')
const isLoading = ref(true)

const page = ref(1)
const perPage = ref(12)

import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
const { fetchLevels, fetchGrades, fetchAllSubjects, fetchAllTopics, grades: taxGrades, subjects: taxSubjects, topics: taxTopics } = useTaxonomy()

const subjects = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value : [])
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])

const topicsResponse = ref(null)
const topics = computed(() => topicsResponse.value?.data || [])

onMounted(async () => {
  // Ensure levels are loaded first so FiltersSidebar can derive grades/subjects reliably
  await fetchLevels()
  await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics()])
  await loadTopics()
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

function onFilterChange(type, val) {
  if (type === 'grade') selectedGrade.value = val
  if (type === 'subject') selectedSubject.value = val
  page.value = 1
  loadTopics()
}

// Mark loading as finished because top-level awaited fetches have completed
isLoading.value = false
</script>