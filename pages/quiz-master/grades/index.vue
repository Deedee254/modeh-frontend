<template>
  <div>
    <PageHero
      title="Grade Levels"
      description="Manage grade levels and their associated content. Organize quizzes by educational level."
      :showSearch="true"
      :flush="true"
      @search="onServerSearch"
    >
      <template #eyebrow>
        Grade Management
      </template>

      <template #actions>
        <div class="flex items-center gap-3">
          <button 
            @click="router.push('/quiz-master/grades/create')"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Add Grade
          </button>
        </div>
      </template>
    </PageHero>

    <!-- Search and Filters -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 min-w-[200px]">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search grades..." 
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select 
          v-model="selectedLevel" 
          class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-100"
        >
          <option value="">All Levels</option>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="college">College</option>
        </select>
      </div>
    </div>

    <!-- Grades Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <GradeCard
        v-for="(grade, idx) in (Array.isArray(gradesPaginator.data) ? gradesPaginator.data.filter(Boolean) : [])"
        :key="grade?.id || idx"
        :title="grade?.name"
        :subtitle="grade?.level || ''"
        :quizzes_count="grade?.quizzes_count || grade?.quizzes || 0"
        :subjects_count="grade?.subjects_count || grade?.subjects || 0"
        :description="grade?.description || ''"
        :cover="grade?.image || grade?.cover_image || ''"
        :actionLink="`/quiz-master/subjects?grade=${grade?.id}`"
        actionLabel="Explore subjects"
        @click="grade && handleGradeClick(grade)"
      />
      <div v-if="filteredGrades.length === 0" class="col-span-full text-center py-12 text-gray-500">
        No grades found. Try adjusting your filters or add a new grade.
      </div>
    </div>

    <div v-if="gradesPaginator.meta" class="mt-6">
      <Pagination 
        :paginator="gradesPaginator" 
        @change-page="handlePageChange"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import useTaxonomy, { normalizeList } from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import PageHero from '~/components/ui/PageHero.vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'quiz-master',
})

const router = useRouter()
const config = useRuntimeConfig()
const searchQuery = ref('')
const selectedLevel = ref('')
const isLoadingLocal = ref(true)

const page = ref(1)
const perPage = ref(12)

// Use the taxonomy composable for grades and loading state
const { grades: taxGrades, fetchGrades, loadingGrades } = useTaxonomy()
const isLoading = computed(() => Boolean(loadingGrades?.value) || isLoadingLocal.value)

// derive a local grades list from the composable
const grades = computed(() => Array.isArray(taxGrades.value) ? taxGrades.value : [])

// client-side pagination helpers to keep the existing Pagination component working
const totalGrades = computed(() => grades.value.length)
const gradesPaginator = computed(() => ({
  data: grades.value.slice((page.value - 1) * perPage.value, page.value * perPage.value),
  meta: {
    total: totalGrades.value,
    per_page: perPage.value,
    current_page: page.value,
    last_page: Math.max(1, Math.ceil(totalGrades.value / perPage.value))
  }
}))

// Computed filtered grades based on search and level filter
const filteredGrades = computed(() => {
  return grades.value.filter(grade => {
    const matchesSearch = (grade.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesLevel = !selectedLevel.value || grade.level === selectedLevel.value
    return matchesSearch && matchesLevel
  })
})

const handleGradeClick = (grade) => {
  router.push(`/quiz-master/grades/${grade.id}`)
}

function handlePageChange(newPage) {
  page.value = newPage
}


// initialize global taxonomy caches for counts / selects used elsewhere
const { fetchAllSubjects, fetchAllTopics, fetchGrades: fetchTaxGrades, fetchLevels } = useTaxonomy()
onMounted(async () => {
  try {
    // prefer loading levels first so the composable can derive nested grades when available
    await fetchLevels()
    await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics()])
  } catch (e) {
    // ignore
  }
  // mark local loading complete once caches warmed
  isLoadingLocal.value = false
})

// Replace raw $fetch search with useApi + normalizeList so we update the
// taxonomy cache (taxGrades) with server-side search results.
async function onServerSearch(q) {
  try {
    const api = useApi()
    const res = await api.get(`/api/grades?query=${encodeURIComponent(q)}`)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) return
    const data = await res.json().catch(() => null)
    if (!data) return
    const list = normalizeList(data)
    // Update the shared grades ref so the rest of the page reacts
    taxGrades.value = list
    searchQuery.value = q
    page.value = 1
  } catch (e) {
    // ignore network errors
  }
}
</script>