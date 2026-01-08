<template>
  <div>
  <PageHero
    title="Practice Quizzes That Actually Improve Your Grades"
    description="Discover smart practice quizzes across all subjects and grade levels. Each quiz adapts to your learning style and provides instant feedback to accelerate your progress."
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
        </div>
      </template>

    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Sticky Filters at Top -->
      <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 -mx-4 px-4 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div class="space-y-4">
          <!-- Mobile Filter Drawer -->
          <MobileFilterDrawer
            @apply="() => { /* apply handled reactively */ }"
            @clear="() => { subjectFilter = ''; filterTopic = ''; gradeFilter = '' }"
          >
            <FiltersSidebar
              :grade-options="GRADES"
              :subject-options="subjectsByGrade"
              :topic-options="topicsBySubject"
              :showTopic="true"
              :subject="subjectFilter"
              :topic="filterTopic"
              :grade="gradeFilter"
              storageKey="filters:quizzes"
              @update:subject="val => subjectFilter = val"
              @update:topic="val => filterTopic = val"
              @update:grade="val => gradeFilter = val"
              @apply="() => { /* apply handled reactively */ }"
              @clear="() => { subjectFilter = ''; filterTopic = ''; gradeFilter = '' }"
            />
          </MobileFilterDrawer>

          <!-- Desktop Filters -->
          <div class="hidden lg:block">
            <FiltersSidebar
              :grade-options="GRADES"
              :subject-options="subjectsByGrade"
              :topic-options="topicsBySubject"
              :showTopic="true"
              :subject="subjectFilter"
              :topic="filterTopic"
              :grade="gradeFilter"
              storageKey="filters:quizzes"
              @update:subject="val => subjectFilter = val"
              @update:topic="val => filterTopic = val"
              @update:grade="val => gradeFilter = val"
              @apply="() => { /* apply handled reactively */ }"
              @clear="() => { subjectFilter = ''; filterTopic = ''; gradeFilter = '' }"
            />
          </div>
        </div>
      </div>

      <main class="w-full">
        <div v-if="loading"><SkeletonGrid :count="1" /></div>
        <div v-else>
          <div v-if="(!paginator?.data || paginator.data.length === 0)" class="p-6 border rounded-md text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">0 results returned</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <QuizCard
              v-for="q in paginator.data"
              :key="q.id"
              :quiz="q"
              :to="`/quizzes/${q.slug}`"
              :startLink="`/quizzes/${q.slug}`"
              :takeLink="`/quizzes/${q.slug}/take`"
              :title="q.title"
              :subject="q.subject_name"
              :questions-count="q.questions_count"
              :topic="q.topic_name"
              :cover="q.cover_image"
              :description="q.description"
              :difficulty="q.difficulty"
              :palette="pickPaletteClass(q.topic_id || q.id)"
              :showGrade="true"
              :showSubject="true"
              :showTopic="true"
              :quiz-id="q.id"
              :liked="q.liked"
              :likes="q.likes_count"
              @like="onQuizLike(q, $event)"
            />
          </div>
          <!-- Pagination controls -->
          <div class="mt-8" v-if="paginator?.data?.length > 0">
            <Pagination :paginator="paginator" @change-page="onPageChange" />
          </div>
        </div>
      </main>

    <!-- Bottom CTA banner -->
    <div class="mt-10">
      <div class="bg-gradient-to-r from-brand-600 to-brand-950 text-white rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold">Ready to assess your skills?</h3>
          <p class="opacity-90">Begin a curated assessment to evaluate your understanding or create assessments to measure others' progress.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink to="/quizzes" class="px-4 py-2 bg-white text-brand-600 rounded w-full sm:w-auto text-center">Browse all</NuxtLink>
          <NuxtLink to="/register/quiz-master" class="px-4 py-2 border rounded w-full sm:w-auto text-center">Create quiz</NuxtLink>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import Pagination from '~/components/Pagination.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import MobileFilterDrawer from '~/components/MobileFilterDrawer.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useQuizzes from '~/composables/useQuizzes'
import useApi from '~/composables/useApi'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const route = useRoute()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration
await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true
})

useHead({
  title: 'Practice Quizzes That Actually Improve Your Grades | Modeh',
  meta: [
    { name: 'description', content: 'Discover smart practice quizzes across all subjects and grade levels. Each quiz adapts to your learning style and provides instant feedback to accelerate your academic progress.' },
    { name: 'keywords', content: 'practice quizzes, study quizzes, exam preparation, grade improvement, adaptive learning, instant feedback, curriculum practice, academic assessment' },
    { property: 'og:title', content: 'Practice Quizzes That Actually Improve Your Grades | Modeh' },
    { property: 'og:description', content: 'Discover smart practice quizzes across all subjects and grade levels. Each quiz adapts to your learning style and provides instant feedback to accelerate your academic progress.' }
  ]
})

const { paginator, topics: topicsList, loading, fetchItems, fetchTopics } = useQuizzes()

const query = ref('')
const filterTopic = ref('')
const gradeFilter = ref('')
const subjectFilter = ref('')
const page = ref(1)

onMounted(async () => {
  await fetchTopics({ public: true })

  const q = route.query || {}
  if (q.topic_id) filterTopic.value = String(q.topic_id)
  if (q.subject_id) subjectFilter.value = String(q.subject_id)
  if (q.grade_id) gradeFilter.value = String(q.grade_id)
  if (q.q) query.value = String(q.q)

  await doFetch()

  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})

async function doFetch() {
  const params = {
    public: true,
    page: page.value,
    per_page: 12
  }
  if (query.value) params.q = query.value
  // Resolve topic/subject slugs to numeric ids when possible (backend filters expect ids)
  const api = useApi()
  if (filterTopic.value) {
    const t = Number(filterTopic.value)
    if (!Number.isNaN(t) && t > 0) params.topic_id = filterTopic.value
    else {
      // try local store first
      const found = (store.topics || []).find(x => String(x?.slug) === String(filterTopic.value) || String(x?.name) === String(filterTopic.value))
      if (found && found.id) params.topic_id = String(found.id)
      else {
        // fallback: try API lookup
        try {
          const res = await api.get(`/api/topics?per_page=20`)
          if (res.ok) {
            const json = await res.json()
            const list = json?.topics || json?.data || []
            const candidate = (Array.isArray(list) && list.find(ti => String(ti.slug) === String(filterTopic.value))) || null
            if (candidate && candidate.id) params.topic_id = String(candidate.id)
          }
        } catch (e) {}
      }
    }
  }

  if (subjectFilter.value) {
    const s = Number(subjectFilter.value)
    if (!Number.isNaN(s) && s > 0) params.subject_id = subjectFilter.value
    else {
      const found = (store.subjects || []).find(x => String(x?.slug) === String(subjectFilter.value) || String(x?.name) === String(subjectFilter.value))
      if (found && found.id) params.subject_id = String(found.id)
      else {
        try {
          const res = await api.get(`/api/subjects?per_page=20`)
          if (res.ok) {
            const json = await res.json()
            const list = json?.subjects || json?.data || []
            const candidate = (Array.isArray(list) && list.find(si => String(si.slug) === String(subjectFilter.value))) || null
            if (candidate && candidate.id) params.subject_id = String(candidate.id)
          }
        } catch (e) {}
      }
    }
  }

  if (gradeFilter.value) params.grade_id = gradeFilter.value
  
  await fetchItems(params)
}

function onPageChange(p) {
  page.value = p
  doFetch()
}

// Watch filters
watch([filterTopic, subjectFilter, gradeFilter], () => {
  page.value = 1
  doFetch()
})

// Keep filters cascading
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

const GRADES = computed(() => store.grades || [])
const SUBJECTS = computed(() => {
  return (store.subjects || []).map(s => ({
    ...s,
    id: String(s.id),
    grade_id: String(s.grade_id)
  }))
})

const subjectsByGrade = computed(() => {
  if (!gradeFilter.value) return SUBJECTS.value
  return SUBJECTS.value.filter(s => s.grade_id === String(gradeFilter.value))
})

const topicsBySubject = computed(() => {
  const list = topicsList.value || []
  if (!subjectFilter.value) return list
  return list.filter(t => String(t.subject_id) === String(subjectFilter.value))
})

async function onServerSearch(q) {
  query.value = q
  page.value = 1
  await doFetch()
}

const displayCount = computed(() => paginator.value?.total || 0)

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

function onQuizLike(q, payload) {
  if (!q) return
  if (payload && payload.liked === true) {
    q.likes_count = (q.likes_count || 0) + 1
    q.liked = true
  } else if (payload && payload.liked === false) {
    q.likes_count = Math.max(0, (q.likes_count || 0) - 1)
    q.liked = false
  }
}
</script>
