<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Subjects</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Subjects & learning pathways</h1>
      <p class="text-gray-600 mb-6">Explore organized subject tracks and curated assessments. Use filters and search to locate learning pathways and resources aligned to your goals.</p>
    </div>

    <!-- Compact filters (replaces subject pills) -->
    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Sticky Filters at Top -->
        <div class="sticky top-0 z-40 bg-gray-50 -mx-4 px-4 sm:px-6 lg:px-8 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <FiltersSidebar storageKey="filters:subjects" :subject-options="subjectsForFilters" :topic-options="store.topics" :grade-options="allGrades" v-model:grade="gradeFilter" />
        </div>

        <div class="mt-6">
          <div class="flex items-center gap-3">
            <div class="inline-flex rounded-md shadow-sm" role="tablist" aria-label="subject-filters">
              <button @click="setFilter('')" :class="filterBtnClass('')" :aria-pressed="activeFilter === ''">All</button>
              <button @click="setFilter('top')" :class="filterBtnClass('top')" :aria-pressed="activeFilter === 'top'">Top</button>
              <button @click="setFilter('featured')" :class="filterBtnClass('featured')" :aria-pressed="activeFilter === 'featured'">Featured</button>
              <button @click="setFilter('new')" :class="filterBtnClass('new')" :aria-pressed="activeFilter === 'new'">New</button>
            </div>
            <div class="ml-auto text-sm text-gray-500">Showing {{ paginatedSubjects.length }} of {{ filtered.length }} subjects</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:gap-6 mt-6">
          <main class="w-full">
            <div v-if="pending" class="mt-6"><UiSkeleton :count="1" /></div>
            <div v-else-if="error" class="mt-6 text-red-600 dark:text-red-400">Failed to load subjects.</div>
            <div v-else class="mt-6">
              <div v-if="filtered.length === 0" class="p-6 border rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 rounded-xl shadow-sm border-slate-200 dark:border-slate-800">No subjects found.</div>
              <div v-else class="space-y-6">
                <!-- Subjects Grid - Horizontal on mobile, Vertical on desktop -->
                <div class="sm:hidden space-y-3">
                  <SubjectCard
                    v-for="s in paginatedSubjects"
                    :key="s.id"
                    :title="s.name"
                    :subtitle="`${s.quizzes_count || 0} quizzes available`"
                    :image="resolveIcon(s)"
                    :badgeText="(s.name || '').charAt(0).toUpperCase()"
                    :to="`/subjects/${encodeURIComponent(s.slug)}`"
                    :topicsCount="(s.topics_count ?? (Array.isArray(s.topics) ? s.topics.length : (s.topics?.data && Array.isArray(s.topics.data) ? s.topics.data.length : 0))) || 0"
                    :startLink="`/subjects/${encodeURIComponent(s.slug)}`"
                    :description="s.description || s.summary || ''"
                    :grade="s.grade?.name || s.grade_id || ''"
                    :quizzes_count="s.quizzes_count || 0"
                    startLabel="Explore Topics"
                    :isHorizontal="true"
                  />
                </div>

                <!-- Vertical Grid for tablet and desktop -->
                <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-3">
                  <SubjectCard
                    v-for="s in paginatedSubjects"
                    :key="s.id"
                    :title="s.name"
                    :subtitle="`${s.quizzes_count || 0} quizzes available`"
                    :image="resolveIcon(s)"
                    :badgeText="(s.name || '').charAt(0).toUpperCase()"
                    :to="`/subjects/${encodeURIComponent(s.slug)}`"
                    :topicsCount="(s.topics_count ?? (Array.isArray(s.topics) ? s.topics.length : (s.topics?.data && Array.isArray(s.topics.data) ? s.topics.data.length : 0))) || 0"
                    :startLink="`/subjects/${encodeURIComponent(s.slug)}`"
                    :description="s.description || s.summary || ''"
                    :grade="s.grade?.name || s.grade_id || ''"
                    startLabel="Explore Topics"
                  >
                    <div class="text-sm text-brand-600">
                      <span>Grades {{ Array.isArray(s.grades) ? s.grades.map(g => g.name || g.id).join(', ') : s.grade?.name || s.grade_id || 'All' }}</span>
                    </div>
                  </SubjectCard>
                </div>

                <!-- Pagination Controls -->
                <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8 pb-8">
                  <button 
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div class="flex items-center gap-1">
                    <button 
                      v-for="page in visiblePages"
                      :key="page"
                      @click="currentPage = page"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        page === currentPage
                          ? 'bg-[#800020] text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      ]"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button 
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
          </div>
        </main>
      </div>

      <!-- CTA -->
      <div class="mt-10">
        <div class="bg-brand-50 rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-brand-800">Want to help build content?</h3>
            <p class="text-sm text-brand-600/90">Create subjects and topics to organize your quizzes for Quizees worldwide.</p>
          </div>
          <NuxtLink to="/register/quiz-master" class="px-4 py-2 bg-brand-600 text-white rounded">Become a quiz-master</NuxtLink>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// HeroFilterBar removed — using PageHero search instead
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR: Pre-fetch taxonomy data on server and client (hydrated, no refetch)
const { data: taxonomyData } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true,
})

const pending = computed(() => store.loadingSubjects || store.loadingGrades)
const error = null

const subjectsCount = computed(() => (store.subjects || []).length)
const subjectsForFilters = computed(() => (store.subjects || []).map(s => ({
  id: s.id,
  name: s.name,
  slug: s.slug || s.id,
  grade_id: s.grade_id || s.grade || (Array.isArray(s.grades) && s.grades.length ? s.grades[0].id : null)
})))

const query = ref('')
const gradeFilter = ref('')
const subjectFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

const allGrades = computed(() => Array.isArray(store.grades) ? store.grades.slice() : [])

const gradesCount = computed(() => allGrades.value.length)
const topicsCount = computed(() => Array.isArray(store.subjects) ? (store.subjects.reduce((acc, s) => acc + (s.topics_count || 0), 0)) : 0)

const api = useApi()
let totalQuizzes = 0
    try {
      const res = await api.get('/api/quizzes?per_page=1')
      if (res.ok) {
        const data = await res.json()
        totalQuizzes = data?.quizzes?.total || data?.total || 0
      }
    } catch (e) { totalQuizzes = 0 }

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = store.subjects || []
  if (q) list = list.filter(s => (s.name || '').toLowerCase().includes(q))
  if (gradeFilter.value) list = list.filter(s => {
    if (s.grade || s.grade_id) return String(s.grade || s.grade_id) === String(gradeFilter.value)
    if (Array.isArray(s.grades) && s.grades.length) return s.grades.some(g => String(g.id || g) === String(gradeFilter.value))
    return false
  })
  if (subjectFilter.value) list = list.filter(s => String(s.id) === String(subjectFilter.value) || String(s.slug || s.id) === String(subjectFilter.value))
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage))

const paginatedSubjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)
  
  let startPage = Math.max(1, currentPage.value - halfVisible)
  let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

// Dev: Print cache metrics after a short delay
onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      printMetrics()
    }, 2000)
  }
})

async function onServerSearch(q) {
  const api = useApi()
    try {
      const res = await api.get(`/api/subjects?query=${encodeURIComponent(q)}`)
      if (!res.ok) return
      const data = await res.json()
      const items = data?.subjects?.data || data?.subjects || data?.data || []
      if (Array.isArray(items)) {
        // Update the shared store subjects array with search results
        store.subjects.length = 0
        store.subjects.push(...items)
      }
    } catch (e) {
      // ignore network errors
    }
}

function filterBtnClass(v) {
  const active = activeFilter.value === v
  const base = 'px-3 py-1.5 text-sm first:rounded-l-md last:rounded-r-md border'
  return `${base} ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200'}`
}

const activeFilter = ref('')

function setFilter(v) {
  if (activeFilter.value === v) activeFilter.value = ''
  else activeFilter.value = v

    if (activeFilter.value === 'top') {
      store.subjects.sort((a, b) => (b.quizzes_count || 0) - (a.quizzes_count || 0))
    } else if (activeFilter.value === 'featured') {
      store.subjects.sort((a, b) => ((b.is_featured || b.featured || 0) - (a.is_featured || a.featured || 0)))
    } else if (activeFilter.value === 'new') {
      store.subjects.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
    }
}

function resolveIcon(s) {
  if (!s) return '/images/subject.png'
  return s.image || s.cover_image || '/images/subject.png'
}

useHead({
  title: `Subjects • Browse learning pathways | Modeh`,
  meta: [{ name: 'description', content: 'Browse subjects and curated learning pathways. Find quizzes organized by subject and skill level.' }]
})
</script>
