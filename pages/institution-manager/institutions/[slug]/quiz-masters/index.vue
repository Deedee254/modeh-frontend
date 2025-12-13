<script setup lang="ts">
import { useRoute } from 'vue-router';
definePageMeta({ layout: 'institution' as any })
import { ref, computed, watch } from 'vue';
import { useApi } from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import MemberList from '~/components/institution/MemberList.vue'
import PageHero from '~/components/institution/PageHero.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const api = useApi()
const route = useRoute();
// Prefer route param slug (when using the nested route), fallback to query.institutionSlug
const institutionId = ref(route.params.slug || route.query.institutionSlug || null);

const members = ref([] as any[])
const loading = ref(false)
const error = ref(null as any)
const selectedLevel = ref(null as any)
const selectedGrade = ref(null as any)
const { fetchLevels, levels, fetchGrades, grades, fetchGradesByLevel } = useTaxonomy()

async function loadMembers() {
  if (!institutionId.value) return
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('role', 'quiz-master')
    if (selectedLevel.value) params.set('level_id', String(selectedLevel.value))
    if (selectedGrade.value) params.set('grade_id', String(selectedGrade.value))

    const resp = await api.get(`/api/institutions/${institutionId.value}/members?${params.toString()}`)
    if (api.handleAuthStatus(resp)) return
    const json = await api.parseResponse(resp)
    members.value = json?.members || []
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

// initial load when we have a slug
if (institutionId.value) {
  await Promise.all([loadMembers(), fetchLevels(), fetchGrades()])
}

// react to route changes (params or query) and reload
watch(
  () => route.params.slug || route.query.institutionSlug,
  async (newVal, oldVal) => {
    institutionId.value = newVal || null
    if (institutionId.value) {
      await Promise.all([loadMembers(), fetchLevels(), fetchGrades()])
    }
  }
)

const quizMasters = computed(() => (members.value || []).filter((m: any) => m.role === 'quiz-master'))
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Page Hero -->
    <PageHero
      title="Quiz Masters"
      description="Manage and view quiz masters in your institution"
      theme="purple"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!institutionId" class="p-4 bg-yellow-50 border rounded">
        <p class="text-sm">No institution selected. Add ?institutionSlug=SLUG to the URL.</p>
      </div>

      <div v-else>
        <!-- Filters -->
        <div class="mb-6">
          <!-- Dropdown Filters -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <!-- Level Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Level</label>
              <select
                v-model.number="selectedLevel"
                @change="() => { selectedGrade = null; fetchGradesByLevel(selectedLevel); loadMembers() }"
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option :value="null">All Levels</option>
                <option v-for="level in levels" :key="level.id" :value="level.id">{{ level.name }}</option>
              </select>
            </div>

            <!-- Grade Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🎓 Grade</label>
              <select
                v-model.number="selectedGrade"
                @change="loadMembers()"
                :disabled="!selectedLevel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option :value="null">All Grades</option>
                <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
              </select>
            </div>

            <!-- Clear Filters Button -->
            <div v-if="selectedLevel || selectedGrade" class="flex items-end">
              <button
                @click="() => { selectedLevel = null; selectedGrade = null; loadMembers() }"
                class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="selectedLevel || selectedGrade" class="p-4 rounded-lg bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-900 mb-4">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Filters:</p>
            <div class="flex flex-wrap gap-2">
              <span v-if="selectedLevel" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-medium">
                📚 {{ (levels.find((l: any) => l.id === selectedLevel) as any)?.name || 'Level' }}
                <button @click="() => { selectedLevel = null; selectedGrade = null; loadMembers() }" class="hover:text-purple-200">✕</button>
              </span>
              <span v-if="selectedGrade" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                🎓 {{ (grades.find((g: any) => g.id === selectedGrade) as any)?.name || 'Grade' }}
                <button @click="() => { selectedGrade = null; loadMembers() }" class="hover:text-blue-200">✕</button>
              </span>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="loading" />
        <ErrorAlert v-else-if="error">Failed to load members: {{ error.message || error }}</ErrorAlert>
        <div v-else>
          <MemberList :members="quizMasters" :page-size="6" />
        </div>
      </div>
    </div>
  </div>
</template>
