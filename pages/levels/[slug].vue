<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/levels" class="hover:text-brand-600">Levels</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ level.name || 'Level' }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ level.name || 'Level' }}</h1>
      <p v-if="level.description || level.summary" class="text-gray-600 mb-6">{{ level.description || level.summary }}</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load level data.</div>

      <div v-else>
        <header class="text-center mb-6">
          <p class="text-sm uppercase tracking-wide text-brand-500 font-semibold">{{ level.type || 'Level' }}</p>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">{{ level.name }}</h2>
          <p class="mt-2 text-slate-600">{{ level.description || level.summary || '' }}</p>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GradeCard
            v-for="g in levelGradesWithCounts"
            :key="g.id"
            :to="`/grades/${g.slug}`"
            :title="g.name || g.title || g.slug"
            :grade="g"
            :quizzes_count="g.quizzes_count"
            :subjects_count="g.subjects_count"
            actionLabel="Explore Grade"
            :actionLink="`/grades/${g.slug}`"
          />
        </div>

        <div v-if="!levelGrades.length" class="mt-6 text-center text-sm text-gray-600">No grades or courses found for this level.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const slug = computed(() => route.params.slug)
const config = useRuntimeConfig()

const level = ref({})
const loading = ref(true)
const error = ref(null)

const { grades: taxGrades, fetchGradesByLevel } = useTaxonomy()



onMounted(async () => {
  loading.value = true
  try {
    // fetch level metadata from API using slug
    try {
      const res = await $fetch(`${config.public.apiBase}/api/levels?slug=${slug.value}`)
      // Support multiple API shapes: { levels: [...] }, { level: {...} }, { data: [...] }, or direct object
      const levelData = res?.levels?.[0] ?? res?.level ?? res?.data?.[0] ?? res ?? {}
      level.value = levelData
    } catch (e) {
      // ignore level fetch error; we will still try to render grades from taxonomy
      level.value = { slug: slug.value }
    }

    // ensure taxonomy grades are loaded only if the server didn't return nested grades
    try {
      if (!Array.isArray(level.value?.grades) || !level.value.grades.length) {
        const levelId = level.value?.id
        if (levelId) await fetchGradesByLevel(levelId)
      }
    } catch (e) {}
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})

const levelGrades = computed(() => {
  // Prefer server-provided nested grades when available
  if (Array.isArray(level.value?.grades) && level.value.grades.length) return level.value.grades
  return Array.isArray(taxGrades.value) ? taxGrades.value : []
})

// Ensure grades have reliable counts for subjects and quizzes regardless of API shape
const levelGradesWithCounts = computed(() => {
  return (levelGrades.value || []).map(g => {
  const subjectsCount = (g.subjects_count ?? (Array.isArray(g.subjects) ? g.subjects.length : (g.subjects?.data && Array.isArray(g.subjects.data) ? g.subjects.data.length : 0))) || 0

  // Prefer canonical quizzes_count field; fall back to 0 if missing
  const quizzesCount = (typeof g.quizzes_count === 'number') ? g.quizzes_count : 0

    return {
      ...g,
      subjects_count: subjectsCount,
      quizzes_count: quizzesCount
    }
  })
})
</script>

<style scoped>
/* keep styles minimal — cards inherit UI behavior */
</style>
