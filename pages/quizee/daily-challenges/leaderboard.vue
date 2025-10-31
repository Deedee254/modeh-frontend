<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

definePageMeta({
  layout: 'quizee',
})

useHead({
  title: 'Daily Challenge Leaderboard — Modeh',
  meta: [
    { name: 'description', content: 'See who is at the top of the Daily Challenge leaderboard.' },
  ]
})

const api = useApi()
const { grades, levels, fetchGrades, fetchGradesByLevel, fetchLevels } = useTaxonomy()

const leaderboard = ref([])
const meta = ref({})
const loading = ref(true)
const error = ref(null)

const filters = ref({
  date: new Date().toISOString().split('T')[0], // Default to today
  level_id: '',
  grade_id: '',
})

const fetchLeaderboard = async () => {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: meta.value.current_page || 1,
    }
    // Add filters to params if they have a value
    if (filters.value.date) params.date = filters.value.date
    if (filters.value.level_id) params.level_id = filters.value.level_id
    if (filters.value.grade_id) params.grade_id = filters.value.grade_id

    const res = await api.get('/api/daily-challenges/leaderboard', { params })
    if (res.ok) {
      const data = await res.json()
      leaderboard.value = data.data
      meta.value = data.meta
    } else {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to fetch leaderboard data.')
    }
  } catch (e) {
    error.value = e.message
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

const filteredGrades = computed(() => {
  if (!filters.value.level_id) return grades.value
  return grades.value.filter(g => String(g.level_id) === String(filters.value.level_id))
})

watch(filters, fetchLeaderboard, { deep: true })

watch(() => filters.value.level_id, (newLevelId) => {
    // Reset grade if it doesn't belong to the new level
    if (filters.value.grade_id) {
        const grade = grades.value.find(g => String(g.id) === String(filters.value.grade_id));
        if (grade && String(grade.level_id) !== String(newLevelId)) {
            filters.value.grade_id = '';
        }
    }
});

// When level changes, prefer to fetch grades for that level from the server so
// the grades list only contains relevant grades. Fallback to fetchGrades when
// no level is selected.
watch(() => filters.value.level_id, async (val) => {
  try {
    if (val && typeof fetchGradesByLevel === 'function') {
      await fetchGradesByLevel(val)
    } else {
      await fetchGrades()
    }
  } catch (e) {
    // ignore
  }
})

onMounted(async () => {
  // Load leaderboard and taxonomy. Prefer levels first, then load grades
  // filtered by any preselected level in filters.
  await fetchLeaderboard()
  try { await fetchLevels() } catch (e) {}
  try {
    if (filters.value.level_id && typeof fetchGradesByLevel === 'function') await fetchGradesByLevel(filters.value.level_id)
    else await fetchGrades()
  } catch (e) {}
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Daily Challenge Leaderboard</h1>
        <p class="text-gray-600 mt-1">See how you stack up against other players.</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="date-filter" class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date-filter" v-model="filters.date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="level-filter" class="block text-sm font-medium text-gray-700">Level</label>
            <select id="level-filter" v-model="filters.level_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="">All Levels</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">{{ level.name }}</option>
            </select>
          </div>
          <div>
            <label for="grade-filter" class="block text-sm font-medium text-gray-700">Grade/Course</label>
            <select id="grade-filter" v-model="filters.grade_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" :disabled="!grades.length">
              <option value="">All Grades</option>
              <option v-for="grade in filteredGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-500">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2">Loading Leaderboard...</p>
        </div>
        <div v-else-if="error" class="p-8 text-center text-red-600">
          <p>Oops! Something went wrong.</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <div v-else-if="leaderboard.length === 0" class="p-8 text-center text-gray-500">
          <p class="font-semibold">No entries found.</p>
          <p class="text-sm">There are no completed challenges for the selected filters.</p>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="(entry, index) in leaderboard" :key="entry.id" class="p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
            <div class="flex-shrink-0 w-8 text-center">
              <span class="text-lg font-bold text-gray-500">{{ index + 1 }}</span>
            </div>
            <div class="flex-shrink-0">
              <img :src="entry.avatar || `https://ui-avatars.com/api/?name=${entry.name}&background=random`" alt="avatar" class="w-12 h-12 rounded-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ entry.name }}</p>
              <div class="text-xs text-gray-500 truncate">
                <span v-if="entry.level">{{ entry.level }}</span>
                <span v-if="entry.level && entry.grade"> • </span>
                <span v-if="entry.grade">{{ entry.grade }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-indigo-600">{{ entry.score }} pts</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Pagination could be added here if needed -->

    </div>
  </div>
</template>
