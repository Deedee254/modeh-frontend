<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Grades</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Find Perfect Quizzes for Your Grade Level</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="!store.grades.length" class="mt-6"><UiSkeleton :count="1" /></div>
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
