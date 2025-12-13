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
        <!-- Sort pills -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'newest' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'newest'"
            >
              Newest
            </button>
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'name' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'name'"
            >
              Name (A–Z)
            </button>
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_quizzes' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'most_quizzes'"
            >
              Most quizzes
            </button>
          </div>
        </div>

        <main class="w-full">
          <div v-if="coursesFiltered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No courses found.</div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradeCard
              v-for="c in coursesFiltered"
              :key="c.id"
              :grade="c"
              :title="c.display_name || c.name || c.title || `Course ${c.id}`"
              :subtitle="`${c.quizzes_count || 0} quizzes available`"
              :quizzes_count="c.quizzes_count || 0"
              :subjects_count="c.subjects_count ?? (Array.isArray(c.subjects) ? c.subjects.length : 0)"
              :subjects="c.subjects || []"
              :description="c.description || c.summary || ''"
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
// FiltersSidebar removed: using simple sort pills instead
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

const sortOption = ref('newest')

// Compute courses by filtering store.grades for course type
const courses = computed(() => {
  return (Array.isArray(store.grades) ? store.grades : []).filter(g => 
    String(g.type || '').toLowerCase() === 'course' || String(g.type || '').toLowerCase() === 'tertiary'
  )
})

const loading = computed(() => !store.grades.length)

const coursesFiltered = computed(() => {
  let list = courses.value.slice()
  if (sortOption.value === 'name') {
    list = list.slice().sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sortOption.value === 'most_quizzes') {
  list = list.slice().sort((a,b) => Number(b.quizzes_count || 0) - Number(a.quizzes_count || 0))
  } else {
    list = list.slice().sort((a,b) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }
  return list
})

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
