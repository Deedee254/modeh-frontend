<template>
  <div>
    <PageHero
      title="Browse by Grade"
  description="Discover assessments curated for each grade and aligned to curriculum standards so Quizees and Quiz Masters can assign and practice with confidence."
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Grade collections
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/subjects"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Browse subjects
          </NuxtLink>
          <NuxtLink
            to="/topics"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Explore topics
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Find the right level</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ filteredGrades.length || 0 }} grade levels curated</p>
          <p class="mt-2 text-sm text-white/70">Use the hero search to jump straight to a grade.</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Total grades</p>
          <p class="mt-2 text-xl font-semibold">{{ filteredGrades.length || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Total subjects</p>
          <p class="mt-2 text-xl font-semibold">{{ subjectsCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Total topics</p>
          <p class="mt-2 text-xl font-semibold">{{ topicsCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Total quizzes</p>
          <p class="mt-2 text-xl font-semibold">{{ totalQuizzes }}</p>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="!store.grades.length" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load grades.</div>

      <div v-else class="mt-6 space-y-10">
        <!-- Group grades by level -->
        <template v-for="level in gradesByLevel" :key="level.id">
          <div v-if="level.grades.length > 0" class="space-y-4">
            <!-- Level Header with Description -->
            <div class="border-l-4 border-teal-500 pl-4">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ level.name }}</h2>
              <p v-if="level.description" class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ level.description }}</p>
            </div>

            <!-- Grades for this level -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              <GradeCard
                v-for="g in level.grades"
                :key="g.id"
                :title="g.display_name || g.name || `Grade ${g.id}`"
                :subtitle="`${g.quizzes_count || 0} quizzes available`"
                :badgeText="`G${g.id}`"
                :to="`/grades/${g.slug || g.id}`"
                :actionLink="`/grades/${g.slug || g.id}`"
                actionLabel="Explore Subjects"
              />
            </div>
          </div>
        </template>

        <!-- Show message if no grades match search -->
        <div v-if="filteredGrades.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No grades found.</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import { ref, computed, onMounted } from 'vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades, subjects, topics, levels
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchTopics: true,
  fetchLevels: true
})

const error = ref(null)
const query = ref('')

function isCourseType(t) {
  return ['course', 'tertiary'].includes(String(t || '').toLowerCase())
}

const filteredGrades = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = Array.isArray(store.grades) ? store.grades.slice() : []
  // Exclude tertiary/course items — those belong on /courses
  const onlyGrades = list.filter(g => !isCourseType(g.type))
  if (!q) return onlyGrades
  return onlyGrades.filter(grade => String(grade.name || grade.title || grade.id).toLowerCase().includes(q))
})

const gradesByLevel = computed(() => {
  const grades = filteredGrades.value
  const levels = Array.isArray(store.levels) ? store.levels : []
  
  // Group grades by level_id
  const grouped = {}
  grades.forEach(grade => {
    const levelId = grade.level_id
    if (!grouped[levelId]) {
      grouped[levelId] = []
    }
    grouped[levelId].push(grade)
  })
  
  // Map to level objects with their grades
  return levels
    .map(level => ({
      ...level,
      grades: grouped[level.id] || []
    }))
    .filter(level => level.grades.length > 0) // Only include levels with grades
})

function onSearch(q) {
  query.value = q
}

const subjectsCount = computed(() => Array.isArray(store.subjects) ? store.subjects.length : 0)
const topicsCount = computed(() => Array.isArray(store.topics) ? store.topics.length : 0)
const totalQuizzes = ref(0)

// Fetch quizzes count
try {
  const quizzesRes = await $fetch(`${config.public.apiBase}/api/quizzes?per_page=1`, { credentials: 'include' })
  totalQuizzes.value = quizzesRes?.quizzes?.total || quizzesRes?.total || 0
} catch (e) {
  totalQuizzes.value = 0
}

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
