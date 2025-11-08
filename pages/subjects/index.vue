<template>
  <div>
    <PageHero
      title="Subjects & learning pathways"
      description="Explore organized subject tracks and curated assessments. Use filters and search to locate learning pathways and resources aligned to your goals."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Subject library
      </template>

      <template #actions>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex-1 max-w-2xl">
                <!-- Search is handled by PageHero's built-in search input -->
            </div>
            <div class="flex items-center gap-3">
              <NuxtLink
                to="/topics"
                class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Explore topics
              </NuxtLink>
              <NuxtLink
                to="/register?role=quiz-master"
                class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Create a subject
              </NuxtLink>
            </div>
          </div>
          <!-- stats removed per request -->
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Curated pathways</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ subjectsCount }} subjects ready to explore</p>
          <p class="mt-2 text-sm text-white/70">Use the search box to jump directly into a learning path.</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h12M4 18h8" />
        </svg>
      </template>

      <!-- stats slot intentionally removed for this page -->
    </PageHero>

    <!-- Compact filters (replaces subject pills) -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="mt-6">
      <div class="flex items-center gap-3">
  <div class="inline-flex rounded-md shadow-sm" role="tablist" aria-label="subject-filters">
          <button @click="setFilter('')" :class="filterBtnClass('')" :aria-pressed="activeFilter === ''">All</button>
          <button @click="setFilter('top')" :class="filterBtnClass('top')" :aria-pressed="activeFilter === 'top'">Top</button>
          <button @click="setFilter('featured')" :class="filterBtnClass('featured')" :aria-pressed="activeFilter === 'featured'">Featured</button>
          <button @click="setFilter('new')" :class="filterBtnClass('new')" :aria-pressed="activeFilter === 'new'">New</button>
        </div>
        <div class="ml-auto text-sm text-gray-500">Showing {{ filtered.length }} subjects</div>
      </div>
    </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
        <aside class="lg:col-span-1">
          <FiltersSidebar storageKey="filters:subjects" :subject-options="subjectsForFilters" :topic-options="taxTopics.value" :grade-options="allGrades" :grade="gradeFilter" @update:grade="val => gradeFilter.value = val" />
        </aside>
        <main class="lg:col-span-3">
          <div v-if="pending" class="mt-6"><UiSkeleton :count="6" /></div>
          <div v-else-if="error" class="mt-6 text-red-600 dark:text-red-400">Failed to load subjects.</div>
          <div v-else class="mt-6">
            <div v-if="filtered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">No subjects found.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mt-3">
              <SubjectCard
                v-for="s in filtered"
                :key="s.id"
                :title="s.name"
                :subtitle="`${s.quizzes_count} quizzes available`"
                :image="resolveIcon(s)"
                :badgeText="(s.name || '').charAt(0).toUpperCase()"
                :topicsCount="s.topics_count || s.topics?.length || 0"
                :startLink="`/subjects/${encodeURIComponent(s.slug || s.id)}`"
                :description="s.description || s.summary || ''"
                :grade="s.grade?.name || s.grade_id || ''"
                startLabel="Explore Topics"
              >
                <div class="text-sm text-indigo-600">
                  <span>Grades {{ Array.isArray(s.grades) ? s.grades.map(g => g.name || g.id).join(', ') : s.grade?.name || s.grade_id || 'All' }}</span>
                </div>
              </SubjectCard>
            </div>
          </div>
        </main>
      </div>

    <!-- CTA -->
    <div class="mt-10">
      <div class="bg-indigo-50 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-indigo-800">Want to help build content?</h3>
          <p class="text-sm text-indigo-700/90">Create subjects and topics to organize your quizzes for learners worldwide.</p>
        </div>
        <NuxtLink to="/register?role=quiz-master" class="px-4 py-2 bg-indigo-600 text-white rounded">Become a quiz-master</NuxtLink>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
// HeroFilterBar removed — using PageHero search instead
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import { ref, computed, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'

const config = useRuntimeConfig()

// Use taxonomy composable for subjects and grades
const { fetchGrades, fetchAllSubjects, fetchAllTopics, grades: taxGrades, subjects: taxSubjects, topics: taxTopics, loadingSubjects, loadingGrades, fetchLevels, loadingLevels } = useTaxonomy()
const pending = loadingSubjects
const error = null

// use the taxonomy composable's `subjects` ref directly to avoid SSR unwrap bugs
const subjectsCount = computed(() => (taxSubjects.value || []).length)
const subjectsForFilters = computed(() => (taxSubjects.value || []).map(s => ({
  id: s.id,
  name: s.name,
  slug: s.slug || s.id,
  grade_id: s.grade_id || s.grade || (Array.isArray(s.grades) && s.grades.length ? s.grades[0].id : null)
})))

const query = ref('')
const gradeFilter = ref('')
const subjectFilter = ref('')

const allGrades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value.slice() : [])

onMounted(async () => {
  // Load levels first so grades/subjects can be derived and avoid duplicate
  // network calls. Then fetch topics if needed.
  await fetchLevels()
  await fetchAllTopics()
})

const gradesCount = computed(() => allGrades.value.length)

// topics count provided by taxonomy composable (fetchAllTopics called in onMounted)
const topicsCount = computed(() => Array.isArray(taxSubjects.value) ? (taxSubjects.value.reduce((acc, s) => acc + (s.topics_count || 0), 0)) : 0)

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
  let list = taxSubjects.value || []
  if (q) list = list.filter(s => (s.name || '').toLowerCase().includes(q))
  if (gradeFilter.value) list = list.filter(s => {
    if (s.grade || s.grade_id) return String(s.grade || s.grade_id) === String(gradeFilter.value)
    if (Array.isArray(s.grades) && s.grades.length) return s.grades.some(g => String(g.id || g) === String(gradeFilter.value))
    return false
  })
  if (subjectFilter.value) list = list.filter(s => String(s.id) === String(subjectFilter.value) || String(s.slug || s.id) === String(subjectFilter.value))
  return list
})

async function onServerSearch(q) {
  const api = useApi()
  try {
    const res = await api.get(`/api/subjects?query=${encodeURIComponent(q)}`)
    if (!res.ok) return
    const data = await res.json()
    const items = data?.subjects?.data || data?.subjects || data?.data || []
    if (Array.isArray(items)) {
      taxSubjects.value.length = 0
      taxSubjects.value.push(...items)
    }
  } catch (e) {
    // ignore network errors
  }
}

function filterBtnClass(v) {
  const active = activeFilter.value === v
  const base = 'px-3 py-1.5 text-sm first:rounded-l-md last:rounded-r-md border'
  return `${base} ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`
}

const activeFilter = ref('')

function setFilter(v) {
  if (activeFilter.value === v) activeFilter.value = ''
  else activeFilter.value = v

    if (activeFilter.value === 'top') {
    taxSubjects.value.sort((a, b) => (b.quizzes_count || 0) - (a.quizzes_count || 0))
  } else if (activeFilter.value === 'featured') {
    taxSubjects.value.sort((a, b) => ((b.is_featured || b.featured || 0) - (a.is_featured || a.featured || 0)))
  } else if (activeFilter.value === 'new') {
    taxSubjects.value.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
  }
}

function resolveIcon(s) {
  if (!s) return '/images/subject-icon.svg'
  return s.icon || s.image || s.cover_image || '/images/subject-icon.svg'
}

useHead({
  title: `Subjects • Browse learning pathways | Modeh`,
  meta: [{ name: 'description', content: 'Browse subjects and curated learning pathways. Find quizzes organized by subject and skill level.' }]
})
</script>
