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
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
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
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <select 
          v-model="selectedLevel" 
          class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
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
        v-for="grade in filteredGrades"
        :key="grade.id"
        :title="grade.name"
        :subtitle="grade.level || ''"
        :quizzes_count="grade.quizzes_count || grade.quizzes || 0"
        :subjects_count="grade.subjects_count || grade.subjects || 0"
        :description="grade.description || ''"
        :cover="grade.image || grade.cover_image || ''"
        :actionLink="`/quiz-master/subjects?grade=${grade.id}`"
        actionLabel="Explore subjects"
        @click="handleGradeClick(grade)"
      />
      <div v-if="filteredGrades.length === 0" class="col-span-full text-center py-12 text-gray-500">
        No grades found. Try adjusting your filters or add a new grade.
      </div>
    </div>

    <div v-if="gradesResponse?.grades?.meta" class="mt-6">
      <Pagination 
        :paginator="gradesResponse.grades" 
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
import { ref, computed, watchEffect } from 'vue'
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
const isLoading = ref(true)

const page = ref(1)
const perPage = ref(12)

const { data: gradesResponse, pending, error, refresh } = await useFetch(config.public.apiBase + '/api/grades', {
  credentials: 'include',
  params: {
    page: page.value,
    per_page: perPage.value
  }
})

// keep isLoading in sync with the fetch pending state and reference error to avoid unused vars
watchEffect(() => {
  isLoading.value = !!pending?.value
  if (error?.value) console.error(error.value)
})

const grades = computed(() => gradesResponse.value?.grades?.data || [])

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

async function handlePageChange(newPage) {
  page.value = newPage
  await refresh()
}

async function onServerSearch(q) {
  try {
    await $fetch(config.public.apiBase + '/api/grades', { 
      params: { query: q },
      credentials: 'include' 
    })
    searchQuery.value = q
  } catch (e) {
    // ignore network errors
  }
}
</script>