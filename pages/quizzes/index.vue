<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Quizzes</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Practice Quizzes</h1>
    </div>

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
const levelFilter = ref('')
const page = ref(1)

onMounted(async () => {
  await fetchTopics({ public: true })

  const q = route.query || {}
  if (q.topic_id) filterTopic.value = String(q.topic_id)
  else if (q.topic) filterTopic.value = String(q.topic)

  if (q.subject_id) subjectFilter.value = String(q.subject_id)
  else if (q.subject) subjectFilter.value = String(q.subject)

  if (q.grade_id) gradeFilter.value = String(q.grade_id)
  else if (q.grade) gradeFilter.value = String(q.grade)

  if (q.level_id) levelFilter.value = String(q.level_id)
  else if (q.level) levelFilter.value = String(q.level)

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

  // Use slugs directly if available as the backend now supports them
  if (filterTopic.value) {
    const isNumeric = String(filterTopic.value).match(/^\d+$/)
    if (isNumeric) params.topic_id = filterTopic.value
    else params.topic = filterTopic.value
  }

  if (subjectFilter.value) {
    const isNumeric = String(subjectFilter.value).match(/^\d+$/)
    if (isNumeric) params.subject_id = subjectFilter.value
    else params.subject = subjectFilter.value
  }

  if (gradeFilter.value) {
    const isNumeric = String(gradeFilter.value).match(/^\d+$/)
    if (isNumeric) params.grade_id = gradeFilter.value
    else params.grade = gradeFilter.value
  }

  if (levelFilter.value) {
    const isNumeric = String(levelFilter.value).match(/^\d+$/)
    if (isNumeric) params.level_id = levelFilter.value
    else params.level = levelFilter.value
  }
  
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
