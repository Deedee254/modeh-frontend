<template>
  <div>
    <PageHero
      title="Find topic-aligned assessments"
      description="Target specific skills with short, focused assessments aligned to individual topics. Practice deliberately and measure your progress against clear objectives."
      :showSearch="true"
      :flush="true"
      @search="onSearch"
      :breadcrumbs="[{ text: 'Home', href: '/' }, { text: 'Topics', current: true }]"
    >
      <template #eyebrow>
        Topics
      </template>

      <template #actions>
        <div class="flex flex-col gap-4">
          <div class="max-w-2xl">
              <!-- Search is handled by PageHero's built-in search input -->
          </div>
          <!-- topic stats moved to the stats slot to render in the right-hand panel -->
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Explore all topics</p>
          <p class="mt-1 text-2xl font-semibold text-white">Master specific skills</p>
          <p class="mt-2 text-sm text-white/70">Short, focused quizzes aligned to each topic</p>
        </div>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Topics</p>
          <p class="mt-2 text-xl font-semibold">{{ topics.length || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Subjects</p>
          <p class="mt-2 text-xl font-semibold">{{ SUBJECTS.length || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Quizzes</p>
          <p class="mt-2 text-xl font-semibold">{{ totalQuizzes || 0 }}</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </template>


    </PageHero>

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
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-3">
                  <TopicCard
                  v-for="t in filtered"
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
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
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
