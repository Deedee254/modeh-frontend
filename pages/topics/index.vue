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

    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Quick action tabs: New / Top / Featured -->
      <div class="mt-6 flex gap-2 items-center">
      <button @click="sortBy = 'popular'" :class="sortBy === 'popular' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">New</button>
      <button @click="sortBy = 'az'" :class="sortBy === 'az' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Top</button>
      <button @click="sortBy = 'za'" :class="sortBy === 'za' ? 'px-3 py-2 rounded bg-indigo-600 text-white text-sm' : 'px-3 py-2 rounded bg-white border text-sm'">Featured</button>
    </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
      <aside class="lg:col-span-1">
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
      </aside>

      <main class="lg:col-span-3">
        <div v-if="pending" class="mt-6"><SkeletonGrid :count="3" /></div>
        <div v-else>
          <div v-if="(!filtered || filtered.length === 0)" class="p-6 border rounded-md text-sm text-gray-600 bg-white border-gray-200">0 results returned</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mt-3">
              <TopicCard
                v-for="t in filtered"
                :key="t.id"
                :title="t.name"
                :image="t.image || t.cover_image || ''"
                :grade="t.grade?.name || t.grade_name || ''"
                :subject="t.subject?.name || t.subject_name || ''"
                :description="t.description || t.summary || ''"
                :quizzesCount="t.quizzes_count || 0"
                :startLink="`/topics/${t.id}`"
                startLabel="View Assessments"
              >
              </TopicCard>
          </div>
        </div>
      </main>
    </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
// HeroFilterBar removed — PageHero provides a single search input
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import { ref, computed, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { getHeroClass } from '~/utils/heroPalettes'

// Ensure runtime config is available in this setup script
const config = useRuntimeConfig()

const { fetchGrades, fetchAllSubjects, fetchAllTopics, grades: taxGrades, subjects: taxSubjects, topics: taxTopics, loadingTopics } = useTaxonomy()

const pending = loadingTopics
// derive a safe, reactive array from the taxonomy topics ref
const topics = computed(() => safeArray(taxTopics.value))

// SEO: page title + description (use topics count if available)
useHead({
  title: `${topics.value.length || 0} Topics • Find topic-aligned quizzes | Modeh`,
  meta: [{ name: 'description', content: 'Explore topics and micro-skills. Find short, focused quizzes aligned to each topic to practice and improve.' }]
})

// Helper to coerce API responses into arrays (defensive: handles HTML error pages or wrapped shapes)
function safeArray(v) {
  if (Array.isArray(v)) return v
  if (v == null) return []
  if (typeof v === 'object') {
    if (Array.isArray(v.data)) return v.data
    if (Array.isArray(v.items)) return v.items
    if (Array.isArray(v.topics)) return v.topics
    if (typeof (v.length) === 'number') return Array.from(v)
    return []
  }
  if (typeof v === 'string') {
    const raw = v.trim()
    const s = raw.toLowerCase()
    if (s.startsWith('<!doctype') || s.startsWith('<html')) {
      try {
        const isDev = typeof import.meta !== 'undefined' ? !!import.meta.env?.DEV : (process && process.env && process.env.NODE_ENV !== 'production')
        if (isDev) {
          const snippet = raw.replace(/\s+/g, ' ').slice(0, 800)
          // eslint-disable-next-line no-console
          console.warn('safeArray: received HTML string instead of JSON array — returning empty array', { snippet, endpoint: config?.public?.apiBase || 'unknown' })
        }
      } catch (e) {
        // ignore logging failures
      }
      return []
    }
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      return []
    }
  }
  return []
}

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
    'bg-gradient-to-br from-indigo-200 via-indigo-100 to-sky-100 text-indigo-800',
    'bg-gradient-to-br from-rose-200 via-rose-100 to-pink-100 text-rose-800',
    'bg-gradient-to-br from-emerald-200 via-emerald-100 to-lime-100 text-emerald-800',
    'bg-gradient-to-br from-yellow-200 via-amber-100 to-amber-50 text-amber-800',
    'bg-gradient-to-br from-fuchsia-200 via-fuchsia-100 to-pink-50 text-fuchsia-800',
    'bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-50 text-sky-800'
  ]
  return palettes[(id || 0) % palettes.length]
}

// Server-side search handler (debounced by UiSearch)
  async function onServerSearch(q) {
    try {
    const res = await $fetch(config.public.apiBase + '/api/topics', { params: { query: q }, credentials: 'include' })
    const items = res?.topics?.data || res?.topics || res?.data || []
    if (Array.isArray(items)) {
      taxTopics.value.length = 0
      taxTopics.value.push(...items)
    }
  } catch (e) {
    // ignore errors
  }
}

function onServerSubmit(q) { onServerSearch(q) }

// Local handler used by HeroFilterBar
function onSearch(q) { query.value = q; onServerSearch(q) }

// Top topics to show as pills (popular by quizzes_count)
const topTopics = computed(() => {
  const all = topics.value || []
  return all.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
})

function selectTopic(v) { query.value = '' /* keep search cleared */; /* optionally set a topic filter */ }

function clear() { query.value = '' }

// Use taxonomy composable to provide subjects/grades for the sidebar
const SUBJECTS = computed(() => Array.isArray(taxSubjects.value) ? taxSubjects.value.map(s => ({ id: s.id, name: s.name, slug: s.slug || s.id, grade_id: s.grade_id || s.grade })) : [])
const GRADES = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value.slice() : [])

onMounted(async () => {
  // initialize taxonomy lists
  // Prefer fetching levels first to let useTaxonomy derive grades/subjects and
  // avoid redundant API calls. Topics still fetched explicitly.
  await fetchLevels()
  await fetchAllTopics()
})

// fetch quizzes meta for totals
const { data: quizzesData } = await useFetch(config.public.apiBase + '/api/quizzes?per_page=1', { credentials: 'include' })
let totalQuizzes = 0
try { totalQuizzes = quizzesData?.value?.quizzes?.total || quizzesData?.value?.total || 0 } catch (e) { totalQuizzes = 0 }
</script>
