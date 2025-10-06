<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <PageHero title="Browse by Grade" description="Find quizzes designed for each grade level." />

    <!-- Toolbar -->
    <div class="mt-4 flex items-center gap-3">
      <USelect v-model="difficulty" :options="difficultyOptions" placeholder="Filter by difficulty" class="w-56" />
      <USelectMenu v-model="sortBy" :options="sortOptions" placeholder="Sort by" class="w-48" />
    </div>

    <div v-if="pending" class="mt-6"><UiSkeleton :count="6" /></div>
    <div v-else-if="error" class="mt-6 text-red-600 dark:text-red-400">Failed to load grades.</div>
    <div v-else class="mt-6">
      <div v-if="filtered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">No grades found.</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PillCard
          v-for="g in filtered"
          :key="g.id"
          eyebrow="Grade Level"
          :title="`Grade ${g.id}`"
          :subtitle="`${g.quizzes_count} quizzes available`"
          color="green"
          :badge-text="`G${g.id}`"
        >
          <div class="flex gap-2">
            <NuxtLink :to="`/quizzes?grade=${g.id}&difficulty=easy`" class="text-emerald-600 dark:text-emerald-400 text-xs hover:underline">Easy (+5)</NuxtLink>
            <NuxtLink :to="`/quizzes?grade=${g.id}&difficulty=medium`" class="text-amber-600 dark:text-amber-400 text-xs hover:underline">Medium (+10)</NuxtLink>
            <NuxtLink :to="`/quizzes?grade=${g.id}&difficulty=hard`" class="text-rose-600 dark:text-rose-400 text-xs hover:underline">Hard (+20)</NuxtLink>
          </div>
        </PillCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import PillCard from '~/components/ui/PillCard.vue'
import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const { data, pending, error } = await useFetch(config.public.apiBase + '/api/grades')
const grades = data?.value?.grades || []

const difficulty = ref('')
const difficultyOptions = [
  { label: 'All difficulties', value: '' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

const sortBy = ref('popular')
const sortOptions = [
  { label: 'Most quizzes', value: 'popular' },
  { label: 'Lowest grade first', value: 'asc' },
  { label: 'Highest grade first', value: 'desc' },
]

const filtered = computed(() => {
  let list = grades || []
  if (sortBy.value === 'asc') list = [...list].sort((a,b) => a.id - b.id)
  else if (sortBy.value === 'desc') list = [...list].sort((a,b) => b.id - a.id)
  else list = [...list].sort((a,b) => (b.quizzes_count||0) - (a.quizzes_count||0))
  return list
})
</script>