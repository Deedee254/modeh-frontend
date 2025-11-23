<template>
  <div>
    <PageHero
      title="Browse by Grade"
  description="Discover assessments curated for each grade and aligned to curriculum standards so learners and educators can assign and practice with confidence."
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
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
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

      <div v-else class="mt-6">
        <div v-if="filteredGrades.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No grades found.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          <GradeCard
            v-for="g in filteredGrades"
            :key="g.id"
            :title="g.display_name || g.name || `Grade ${g.id}`"
            :subtitle="`${g.quizzes_count || 0} quizzes available`"
            :badgeText="`G${g.id}`"
            :to="`/grades/${g.id}`"
            :actionLink="`/grades/${g.id}`"
            actionLabel="Explore Subjects"
          />
        </div>
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
