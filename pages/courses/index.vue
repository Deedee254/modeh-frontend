<template>
  <div>
    <PageHero
      title="Courses"
      description="Browse all tertiary courses available on the platform"
      :showSearch="true"
    />

    <div class="max-w-6xl mx-auto px-4 py-12">
      <div v-if="loading" class="text-center py-12">Loading courses…</div>

      <div v-else>
        <!-- Sticky Filters at Top -->
        <div class="sticky top-0 z-40 bg-white dark:bg-slate-900 -mx-4 px-4 py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <FiltersSidebar
            :subject-options="store.subjects"
            :grade-options="store.grades"
            :showTopic="false"
            :subject="subjectFilter"
            :grade="gradeFilter"
            :level="levelFilter"
            storageKey="filters:courses"
            @update:subject="val => subjectFilter.value = val"
            @update:grade="val => gradeFilter.value = val"
            @update:level="val => levelFilter.value = val"
            @apply="() => {}"
          />
        </div>

        <main class="w-full">
          <div v-if="coursesFiltered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No courses found.</div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <GradeCard
              v-for="c in coursesFiltered"
              :key="c.id"
              :grade="c"
              :actionLink="`/courses/${c.id}`"
              :actionLabel="'Open course'"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'
import PageHero from '~/components/ui/PageHero.vue'
import GradeCard from '~/components/ui/GradeCard.vue'

const config = useRuntimeConfig()
const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch grades, subjects, levels for sidebar and course filtering
const { data } = await useTaxonomyHydration({
  fetchGrades: true,
  fetchSubjects: true,
  fetchLevels: true
})

const subjectFilter = ref('')
const gradeFilter = ref('')
const levelFilter = ref('')

// Compute courses by filtering store.grades for course type
const courses = computed(() => {
  return (Array.isArray(store.grades) ? store.grades : []).filter(g => 
    String(g.type || '').toLowerCase() === 'course' || String(g.type || '').toLowerCase() === 'tertiary'
  )
})

const loading = computed(() => !store.grades.length)

const coursesFiltered = computed(() => {
  let list = courses.value.slice()
  if (subjectFilter.value) list = list.filter(c => Array.isArray(c.subjects) ? c.subjects.some(s => String(s.id) === String(subjectFilter.value)) : false)
  if (gradeFilter.value) list = list.filter(c => String(c.grade_id || c.grade || '') === String(gradeFilter.value))
  if (levelFilter.value) list = list.filter(c => String(c.level_id || (c.grade && c.grade.level_id) || '') === String(levelFilter.value))
  return list
})

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
