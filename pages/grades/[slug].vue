<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/grades" class="hover:text-brand-600">Grades</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ gradeMeta?.name || slug }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Grade {{ gradeMeta?.name || slug }}</h1>
      <p class="text-gray-600">{{ gradeMeta?.description }}</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load subjects for this grade.</div>

      <div v-else>
      <div v-if="!subjects || subjects.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No subjects found for this grade.</div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SubjectCard
          v-for="s in displaySubjects"
          :key="s.id"
          :title="s.name"
          :subtitle="`${s.quizzes_count || 0} quizzes available`"
          :image="resolveIcon(s)"
          :badgeText="(s.name || '').charAt(0).toUpperCase()"
          :topicsCount="s.topics_count || (s.topics ? (Array.isArray(s.topics) ? s.topics.length : (s.topics.length || 0)) : 0)"
          :to="`/subjects/${encodeURIComponent(s.slug)}`"
          :startLink="`/subjects/${s.slug}`"
          :description="s.description || s.summary || ''"
          :grade="s.grade?.name || s.grade_id || ''"
          startLabel="Explore Topics"
        >
        </SubjectCard>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import { ref, computed, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const slug = computed(() => route.params.slug)
const config = useRuntimeConfig()

const { subjects, fetchSubjectsByGrade } = useTaxonomy()
const query = ref('')
const gradeMeta = ref({})
const gradeId = computed(() => gradeMeta.value?.id)
const topicCount = ref(0)
const quizCount = ref(0)

const displaySubjects = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return subjects.value
  return (subjects.value || []).filter(s => (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
})

function onSearch(q) {
  query.value = q
}

function resolveIcon(s) {
  return s.image || s.cover_image || '/images/subject.png'
}

async function fetchGradeMeta() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/grades?slug=${slug.value}`)
    // Support multiple API shapes: { grades: [...] }, { grade: {...} }, or { data: [...] }
    const grade = res?.grades?.[0] ?? res?.grade ?? (res?.data && Array.isArray(res.data) ? res.data[0] : undefined) ?? res ?? {}
    gradeMeta.value = grade
  } catch (e) {
    gradeMeta.value = {}
  }
}



async function fetchTopicCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: { grade: gradeId.value } })
    const list = res?.topics?.data || res?.topics || res || []
    topicCount.value = Array.isArray(list) ? list.length : 0
  } catch (e) {
    topicCount.value = 0
  }
}

async function fetchQuizCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/quizzes`, { params: { grade: gradeId.value, per_page: 1 } })
    quizCount.value = res?.quizzes?.total || res?.total || 0
  } catch (e) {
    quizCount.value = 0
  }
}

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    await fetchGradeMeta()
    // Prefer fetching subjects by the numeric/string `id` returned by the grade
    // API; fall back to the slug if an id isn't available.
    const gradeRef = gradeMeta.value?.id ?? slug.value
    await fetchSubjectsByGrade(gradeRef)
    await Promise.all([fetchTopicCount(), fetchQuizCount()])
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})
</script>
