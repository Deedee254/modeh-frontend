<template>
  <div>
  <PageHero
      title="Explore quizzes"
      description="Find and take quizzes across many topics and grades. Filter by difficulty, time, and popularity."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
      :breadcrumbs="[{ text: 'Home', href: '/' }, { text: 'Quizzes', current: true }]"
    >
      <template #eyebrow>
        Quizzes
      </template>

      <template #actions>
        <div class="flex flex-col gap-4">
          <!-- Search is handled by PageHero's built-in search input -->
        </div>
        <div class="flex flex-wrap gap-3 text-sm text-white/70">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5l3.75-3 3.75 3M8.25 16.5l3.75 3 3.75-3" />
            </svg>
            {{ displayCount || 0 }} quizzes
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 9.75l7.5-4.5 7.5 4.5M4.5 14.25l7.5 4.5 7.5-4.5" />
            </svg>
            {{ topicsList?.length || 0 }} topics
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6l-2 4h4l-2 4" />
            </svg>
            {{ (Array.isArray(SUBJECTS) ? SUBJECTS.length : 0) || 0 }} subjects
          </span>
        </div>
      </template>

    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
      <aside class="lg:col-span-1">
        <div class="space-y-4">
          <FiltersSidebar
            :grade-options="GRADES"
            :subject-options="subjectsByGrade"
            :topic-options="topicsBySubject"
            :showTopic="true"
            :subject="subjectFilter"
            :topic="filterTopic"
            :grade="gradeFilter"
            storageKey="filters:quizzes"
            @update:subject="val => subjectFilter.value = val"
            @update:topic="val => filterTopic.value = val"
            @update:grade="val => gradeFilter.value = val"
            @apply="() => { /* apply handled reactively */ }"
            @clear="() => { subjectFilter.value = ''; filterTopic.value = ''; gradeFilter.value = '' }"
          />

          <UCard v-if="featuredQuiz">
            <template #header>
              <div class="text-sm text-gray-500">Featured</div>
            </template>
            <div class="mt-1">
              <div class="font-semibold text-indigo-800">{{ featuredQuiz.title }}</div>
              <div class="text-xs text-gray-500">{{ featuredQuiz.topic_name || 'General' }}</div>
              <div class="mt-3"><NuxtLink :to="`/quizee/quizzes/${featuredQuiz.id || ''}`" class="text-indigo-700 text-sm">Open →</NuxtLink></div>
            </div>
          </UCard>
          <UCard>
            <div class="text-sm text-gray-500">Quick filters</div>
            <div class="mt-3 flex flex-col gap-2">
              <button
                @click="activeTab = 'all'"
                :class="[ 'px-3 py-2 text-sm rounded', activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border' ]"
              >
                All
              </button>
              <button
                @click="activeTab = 'latest'"
                :class="[ 'px-3 py-2 text-sm rounded', activeTab === 'latest' ? 'bg-indigo-600 text-white' : 'bg-white border' ]"
              >
                Latest
              </button>
              <button
                @click="activeTab = 'featured'"
                :class="[ 'px-3 py-2 text-sm rounded', activeTab === 'featured' ? 'bg-indigo-600 text-white' : 'bg-white border' ]"
              >
                Featured
              </button>
            </div>
          </UCard>
        </div>
      </aside>
      <main class="lg:col-span-2">
        <div v-if="loading"><SkeletonGrid :count="3" /></div>
        <div v-else>
          <div v-if="(!displayQuizzes || displayQuizzes.length === 0)" class="p-6 border rounded-md text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">0 results returned</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6">
            <QuizCard
              v-for="q in paginatedQuizzes"
              :key="q.id"
              :to="`/quizee/quizzes/${q.id}`"
              :startLink="`/quizee/quizzes/${q.id}`"
              :takeLink="`/quizee/quizzes/take/${q.id}`"
              :title="q.title"
              :subject="q.topic?.subject?.name || q.subject?.name || q.subject_name"
              :grade="q.grade || q.grade_id"
              :questions-count="q.questions_count ?? q.questions ?? q.items_count"
              :topic="q.topic_name || q.topic?.name || ''"
              :marks="q.marks"
              :updated-at="q.updated_at"
              :cover="q.cover_image || q.cover || q.image || ''"
              :description="q.description || q.summary || ''"
              :difficulty="q.difficulty"
              :quizMaster="q['quiz-master']?.name || q.user?.name"
              :palette="pickPaletteClass(q.topic_id || q.topic?.id || q.id)"
              :showGrade="true"
              :showSubject="true"
              :showTopic="true"
              :showQuizMaster="true"
              :quiz-id="q.id"
              :liked="q.liked"
              :likes="q.likes_count ?? q.likes ?? 0"
              @like="onQuizLike(q, $event)"
            />
          </div>
          <!-- Pagination controls -->
          <div class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-600">Showing {{ shownFrom }} - {{ shownTo }} of {{ displayCount }} quizzes</div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1 border rounded" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">Prev</button>
              <template v-for="p in totalPages" :key="p">
                <button @click="currentPage = p" :class="['px-3 py-1 rounded', currentPage === p ? 'bg-indigo-600 text-white' : 'border']">{{ p }}</button>
              </template>
              <button class="px-3 py-1 border rounded" :disabled="currentPage === totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">Next</button>
            </div>
          </div>
        </div>
      </main>

  <!-- Right Sidebar -->
  <!-- Right Sidebar placeholder (kept empty for now) -->
  <aside class="lg:col-span-1" />
    </div>

    <!-- Bottom CTA banner -->
    <div class="mt-10">
      <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold">Ready for a challenge?</h3>
          <p class="opacity-90">Try a curated quiz or create one to test others.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink to="/quizzes" class="px-4 py-2 bg-white text-indigo-700 rounded w-full sm:w-auto text-center">Browse all</NuxtLink>
          <NuxtLink to="/register?role=quiz-master" class="px-4 py-2 border rounded w-full sm:w-auto text-center">Create quiz</NuxtLink>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { ref, computed, watch, onMounted } from 'vue'
import useQuizzes from '~/composables/useQuizzes'
import useTaxonomy from '~/composables/useTaxonomy'
import { getHeroClass } from '~/utils/heroPalettes'
const config = useRuntimeConfig()

useHead({
  title: 'Quizzes • Practice & Learn | Modeh',
  meta: [{ name: 'description', content: 'Browse and take quizzes across subjects and grades. Search, filter, and jump into quizzes to practice and improve.' }]
})

// use composable to fetch quizzes and topics
const { paginator, topics: topicsList, loading, normalizedQuizzes, fetchItems, fetchTopics } = useQuizzes()

// local UI state for filters/search
const query = ref('')
const filterTopic = ref('')
const gradeFilter = ref('')
const activeTab = ref('all')
let subjectFilter = ref('')

// pagination
const currentPage = ref(1)
const PAGE_SIZE = 12


// on mount, fetch initial data (composable will normalize)
onMounted(async () => {
  // fetch quizzes/topics and taxonomy (grades & subjects) for cards/filters
  await Promise.all([fetchItems(), fetchTopics(), fetchGrades(), fetchAllSubjects()])
})

// Keep filters cascading: when grade changes, clear subject & topic; when subject changes, clear topic
watch(gradeFilter, (nv, ov) => {
  if (nv !== ov) {
    subjectFilter.value = ''
    filterTopic.value = ''
  }
})
watch(subjectFilter, (nv, ov) => {
  if (nv !== ov) {
    filterTopic.value = ''
  }
})

// taxonomy composable provides grades/subjects/topics with simple caching
const { grades: taxGrades, subjects: taxSubjects, topics: taxTopics, fetchGrades, fetchSubjectsByGrade, fetchAllSubjects, fetchTopicsBySubject, fetchAllTopics } = useTaxonomy()

// Defensive computed wrappers used by the UI/cards
const SUBJECTS = computed(() => {
  const list = taxSubjects?.value || []
  return (Array.isArray(list) ? list : []).slice(0, 12).map(s => ({
    slug: s.slug || s.id,
    id: s.id,
    name: s.name || (s.title || 'Subject'),
    quizzes_count: s.quizzes_count || s.quizzes_count || 0,
    image: s.icon || s.image || s.cover_image || null,
    grade_id: s.grade_id || s.grade_id
  }))
})

const GRADES = computed(() => {
  const list = taxGrades?.value || []
  return Array.isArray(list) ? list.slice(0, 12) : []
})

// Top subjects to show as pills (popular by quizzes_count)
const topSubjects = computed(() => {
  const all = SUBJECTS || []
  return all.slice().sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0)).slice(0, 12)
})

// Subjects filtered by selected grade for cascading selector
const subjectsByGrade = computed(() => {
  if (!gradeFilter.value) return SUBJECTS
  return (SUBJECTS || []).filter(s => {
    if (s.grade_id) return String(s.grade_id) === String(gradeFilter.value)
    if (s.grades && Array.isArray(s.grades)) return s.grades.some(g => String(g.id || g) === String(gradeFilter.value))
    return true
  })
})

// Topics filtered by the selected subject (subjectFilter holds slug or id)
const topicsBySubject = computed(() => {
  // safely unwrap topicsList (it may be a ref whose value is an array)
  const list = Array.isArray(topicsList?.value) ? topicsList.value : (Array.isArray(topicsList) ? topicsList : [])
  if (!subjectFilter.value) return list
  // try match by slug or id
  return (list || []).filter(t => String(t.subject_id || t.subject) === String(subjectFilter.value) || String(t.subject_id) === String(subjectFilter.value) || String(t.subject?.id || t.subject?.slug || '') === String(subjectFilter.value))
})

// base filtered list from search + topic (use composable normalizedQuizzes)
const baseFiltered = computed(() => {
  let out = (normalizedQuizzes?.value || []) || []
  if (filterTopic.value) out = out.filter(q => String(q.topic_id) === String(filterTopic.value))
  const q = String(query.value || '').toLowerCase().trim()
  if (q) out = out.filter(i => (i.title||'').toLowerCase().includes(q) || (i.topic_name||'').toLowerCase().includes(q))
  out = out.filter(i => i && (i.id || i.title))
  return out
})

// Server-side search for quizzes (debounced by UiSearch)
async function onServerSearch(q) {
  try {
    await fetchItems({ q })
  } catch (e) {
    // ignore
  }
}

function onServerSubmit(q) { onServerSearch(q) }

// quizzes shown on the page depending on active tab and subject filter
const displayQuizzes = computed(() => {
  let out = baseFiltered.value.slice()
  if (subjectFilter.value) {
    out = out.filter(q => String(q.subject || q.subject_id || q.subject_slug || q.subject?.slug) === String(subjectFilter.value) || String(q.subject_slug || q.subject_id) === String(subjectFilter.value))
  }
  if (gradeFilter.value) {
    out = out.filter(q => String(q.grade || q.grade_id || q.grade_level) === String(gradeFilter.value) || String(q.grade) === String(gradeFilter.value))
  }
  if (activeTab.value === 'new' || activeTab.value === 'latest') {
    // assume `created_at` or `published_at` exists; fall back to updated_at
    out = out.slice().sort((a,b) => new Date(b.created_at || b.published_at || b.updated_at || 0) - new Date(a.created_at || a.published_at || a.updated_at || 0))
    return out.slice(0, 12)
  }
  if (activeTab.value === 'featured') {
    // featured flag or curated boolean
    const featured = out.filter(i => i.featured || i.is_featured || i.curated)
    return featured.length ? featured : out.slice(0, 12)
  }
  if (activeTab.value === 'top') {
    // Order by popularity/attempts/play count
    const sorted = out.slice().sort((a,b) => {
      const aPop = a.attempts || a.attempt_count || a.play_count || a.plays || 0
      const bPop = b.attempts || b.attempt_count || b.play_count || b.plays || 0
      if (bPop !== aPop) return bPop - aPop
      return (b.difficulty || 0) - (a.difficulty || 0)
    })
    return sorted.slice(0, 12)
  }
  return out
})

// pagination helpers
const displayCount = computed(() => Array.isArray(displayQuizzes.value) ? displayQuizzes.value.length : 0)
const totalPages = computed(() => Math.max(1, Math.ceil(displayCount.value / PAGE_SIZE)))
const paginatedQuizzes = computed(() => {
  const arr = Array.isArray(displayQuizzes.value) ? displayQuizzes.value : []
  const start = (currentPage.value - 1) * PAGE_SIZE
  return arr.slice(start, start + PAGE_SIZE)
})

const shownFrom = computed(() => displayCount.value === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1)
const shownTo = computed(() => Math.min(currentPage.value * PAGE_SIZE, displayCount.value))

// reset page when filtered/quizzes change
watch([displayQuizzes, activeTab, subjectFilter, gradeFilter, query], () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
})

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

function onQuizLike(q, payload) {
  try {
    if (!q) return
    if (payload && payload.liked === true) {
      q.likes_count = (q.likes_count || q.likes || 0) + 1
      q.liked = true
    } else if (payload && payload.liked === false) {
      q.likes_count = Math.max(0, (q.likes_count || q.likes || 0) - 1)
      q.liked = false
    }
  } catch (e) {
    // ignore
  }
}

// Compute a single featured quiz for the sidebar (defensive: may be undefined)
const featuredQuiz = computed(() => {
  const all = Array.isArray(normalizedQuizzes?.value) ? normalizedQuizzes.value : []
  const f = all.find(q => q && (q.featured || q.is_featured || q.curated))
  if (f) return f
  return (Array.isArray(displayQuizzes.value) && displayQuizzes.value.length) ? displayQuizzes.value[0] : (all.length ? all[0] : null)
})

function selectSubject(v) { subjectFilter.value = v }
// pillClass is no longer used; keep for backward compatibility
function pillClass(v) { return `px-3 py-1.5 text-sm rounded-full border ${subjectFilter.value === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}` }
function tabClass(t) { return `px-3 py-2 text-sm rounded ${activeTab.value === t ? 'bg-indigo-600 text-white' : 'bg-white border'}` }
</script>
