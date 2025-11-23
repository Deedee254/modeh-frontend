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
const selectedSubject = ref(null as any)
const selectedTopic = ref(null as any)
const { fetchLevels, levels, fetchGrades, grades, fetchGradesByLevel, fetchSubjectsByGrade, fetchTopicsBySubject, subjects, topics } = useTaxonomy()

async function loadMembers() {
  if (!institutionId.value) return
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('role', 'quiz-master')
    if (selectedLevel.value) params.set('level_id', String(selectedLevel.value))
    if (selectedGrade.value) params.set('grade_id', String(selectedGrade.value))
    if (selectedSubject.value) params.set('subject_id', String(selectedSubject.value))
    if (selectedTopic.value) params.set('topic_id', String(selectedTopic.value))

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
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-gray-600">Level</label>
            <select v-model="selectedLevel" @change="(e)=>{ if (selectedLevel) fetchGradesByLevel(selectedLevel); selectedGrade = null; selectedSubject = null; selectedTopic = null; loadMembers() }" class="w-full border rounded px-2 py-1">
              <option :value="null">All levels</option>
              <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600">Grade</label>
            <select v-model="selectedGrade" @change="(e)=>{ if (selectedGrade) fetchSubjectsByGrade(selectedGrade); selectedSubject = null; selectedTopic = null; loadMembers() }" class="w-full border rounded px-2 py-1">
              <option :value="null">All grades</option>
              <option v-for="g in grades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600">Subject</label>
            <select v-model="selectedSubject" @change="(e)=>{ if (selectedSubject) fetchTopicsBySubject(selectedSubject); selectedTopic = null; loadMembers() }" class="w-full border rounded px-2 py-1">
              <option :value="null">All subjects</option>
              <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600">Topic</label>
            <select v-model="selectedTopic" @change="() => loadMembers()" class="w-full border rounded px-2 py-1">
              <option :value="null">All topics</option>
              <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
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
