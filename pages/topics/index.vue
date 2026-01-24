<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Topics</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Find topic-aligned assessments</h1>
      <p class="text-gray-600 mb-6">Target specific skills with short, focused assessments aligned to individual topics. Practice deliberately and measure your progress against clear objectives.</p>
    </div>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Sticky Filters at Top -->
        <div class="sticky top-0 z-40 bg-gray-50 -mx-4 px-4 sm:px-6 lg:px-8 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <FiltersSidebar
            :subject-options="SUBJECTS"
            :topic-options="topics"
            :showTopic="false"
            :grade-options="GRADES"
            :subject="subjectFilter"
            :grade="gradeFilter"
            storageKey="filters:topics"
            @update:subject="val => subjectFilter.value = val"
            @update:grade="val => gradeFilter.value = val"
          />
        </div>

        <!-- Quick action tabs: New / Top / Featured -->
        <div class="mt-6 flex gap-2 items-center">
          <button @click="sortBy = 'popular'" :class="sortBy === 'popular' ? 'px-3 py-2 rounded bg-brand-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">New</button>
          <button @click="sortBy = 'az'" :class="sortBy === 'az' ? 'px-3 py-2 rounded bg-brand-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Top</button>
          <button @click="sortBy = 'za'" :class="sortBy === 'za' ? 'px-3 py-2 rounded bg-brand-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Featured</button>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:gap-6">
          <main class="w-full">
            <div v-if="pending" class="mt-6"><SkeletonGrid :count="1" /></div>
            <div v-else>
              <div v-if="(!filtered || filtered.length === 0)" class="p-6 border rounded-lg text-sm text-gray-600 bg-white rounded-xl shadow-sm">0 results returned</div>
              <div v-else>
                <div class="flex items-center gap-3 mb-6">
                  <div class="text-sm text-gray-500">Showing {{ paginatedTopics.length }} of {{ filtered.length }} topics</div>
                </div>
                
                <!-- Horizontal on mobile -->
                <div class="sm:hidden space-y-3">
                  <TopicCard
                    v-for="t in paginatedTopics"
                    :key="t.id"
                    :title="t.name"
                    :image="t.image || t.cover_image || ''"
                    :grade="t.grade?.name || t.grade_name || ''"
                    :subject="t.subject?.name || t.subject_name || ''"
                    :description="t.description || t.summary || ''"
                    :quizzesCount="t.quizzes_count || 0"
                    :startLink="`/topics/${t.slug}`"
                    :to="`/topics/${encodeURIComponent(t.slug)}`"
                    startLabel="View Assessments"
                    :isHorizontal="true"
                  />
                </div>

                <!-- Vertical grid on tablet and desktop -->
                <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-3">
                  <TopicCard
                    v-for="t in paginatedTopics"
                    :key="t.id"
                    :title="t.name"
                    :image="t.image || t.cover_image || ''"
                    :grade="t.grade?.name || t.grade_name || ''"
                    :subject="t.subject?.name || t.subject_name || ''"
                    :description="t.description || t.summary || ''"
                    :quizzesCount="t.quizzes_count || 0"
                    :startLink="`/topics/${t.slug}`"
                    :to="`/topics/${encodeURIComponent(t.slug)}`"
                    startLabel="View Assessments"
                  />
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
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades, subjects, topics
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true
})

// Compute topics array with safe handling
const topics = computed(() => {
  const result = Array.isArray(store.topics) ? store.topics : []
  return result
})

const pending = computed(() => !store.topics.length)

// SEO: page title + description (use topics count if available)
useHead({
  title: `${topics.value.length || 0} Topics • Find topic-aligned quizzes | Modeh`,
  meta: [{ name: 'description', content: 'Explore topics and micro-skills. Find short, focused quizzes aligned to each topic to practice and improve.' }]
})

const query = ref('')
const sortBy = ref('popular')
const sortOptions = [
  { label: 'Most quizzes', value: 'popular' },
  { label: 'A → Z', value: 'az' },
  { label: 'Z → A', value: 'za' },
]

// Subject and grade filters for the sidebar
const subjectFilter = ref('')
const gradeFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

const filtered = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  let list = topics.value || []
  if (q) list = list.filter(s => String(s.name || '').toLowerCase().includes(q))
  if (subjectFilter.value) list = list.filter(t => String(t.subject_id || t.subject || '') === String(subjectFilter.value))
  if (gradeFilter.value) list = list.filter(t => String(t.grade || t.grade_id || '') === String(gradeFilter.value))
  if (sortBy.value === 'az') list = [...list].sort((a,b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'za') list = [...list].sort((a,b) => b.name.localeCompare(a.name))
  else list = [...list].sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0))
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage))

const paginatedTopics = computed(() => {
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

// Small helper to pick a pastel gradient class by id (used for fallback avatars)
function pickPaletteClass(id) {
  const palettes = [
    'bg-gradient-to-br from-brand-600/30 via-brand-600/20 to-brand-950/10 text-brand-600',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-brand-600/20 via-brand-600/15 to-brand-950/10 text-brand-600'
  ]
  return palettes[(id || 0) % palettes.length]
}

// Server-side search handler
async function onServerSearch(q) {
  const api = useApi()
  try {
    const res = await api.get(`/api/topics?query=${encodeURIComponent(q)}`)
    if (!res.ok) return
    const data = await res.json()
    const items = data?.topics?.data || data?.topics || data?.data || []
    if (Array.isArray(items)) {
      // Update store topics with search results
      store.topics.length = 0
      store.topics.push(...items)
    }
  } catch (e) {
    // ignore errors
  }
}

function onServerSubmit(q) { onServerSearch(q) }

// Local handler used by PageHero
function onSearch(q) { query.value = q; onServerSearch(q) }

// Top topics to show as pills (popular by quizzes_count)
const topTopics = computed(() => {
  const all = topics.value || []
  return all.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
})

function selectTopic(v) { query.value = '' }

function clear() { query.value = '' }

// Use store to provide subjects/grades for the sidebar
const SUBJECTS = computed(() => Array.isArray(store.subjects) ? store.subjects.map(s => ({ id: s.id, name: s.name, slug: s.slug || s.id, grade_id: s.grade_id || s.grade })) : [])
const GRADES = computed(() => Array.isArray(store.grades) ? store.grades.slice() : [])

// fetch quizzes meta for totals
let totalQuizzes = 0
const api = useApi()
try {
  const res = await api.get('/api/quizzes?per_page=1')
  if (res.ok) {
    const data = await res.json()
    totalQuizzes = data?.quizzes?.total || data?.total || 0
  }
} catch (e) { totalQuizzes = 0 }

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
