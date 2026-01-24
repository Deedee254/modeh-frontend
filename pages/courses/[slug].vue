<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/courses" class="hover:text-brand-600">Courses</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ courseMeta?.name || slug }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Course {{ courseMeta?.name || slug }}</h1>
      <p class="text-gray-600">{{ courseMeta?.description }}</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load subjects for this course.</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside class="lg:col-span-1">
          <FiltersSidebar
            :subject-options="subjects"
              :grade-options="taxGrades.value"
            :showTopic="false"
            :subject="subjectFilter"
            :grade="gradeFilter"
            :level="levelFilter"
            storageKey="filters:course-detail"
            @update:subject="val => subjectFilter.value = val"
            @update:grade="val => gradeFilter.value = val"
            @update:level="val => levelFilter.value = val"
          />
        </aside>

        <main class="lg:col-span-3">
          <div v-if="subjectsFiltered.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No subjects found for this course.</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SubjectCard
              v-for="s in subjectsFiltered"
              :key="s.id"
              :title="s.name"
              :subtitle="`${s.quizzes_count || 0} quizzes available`"
              :image="resolveIcon(s)"
              :badgeText="(s.name || '').charAt(0).toUpperCase()"
              :topicsCount="s.topics_count || s.topics?.length || 0"
                :startLink="`/subjects/${encodeURIComponent(s.slug || s.id)}`"
              :description="s.description || s.summary || ''"
              :grade="s.grade?.name || s.grade_id || ''"
              startLabel="Explore Topics"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const slug = route.params.slug
const config = useRuntimeConfig()

const subjects = ref([])
const query = ref('')
const courseMeta = ref({})
const topicCount = ref(0)
const quizCount = ref(0)

// sidebar filters
const subjectFilter = ref('')
const gradeFilter = ref('')
const levelFilter = ref('')

const { grades: taxGrades, subjects: taxSubjects, levels: taxLevels, fetchGrades, fetchLevels, fetchGradesByLevel } = useTaxonomy()

const subjectsFiltered = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  let list = Array.isArray(subjects.value) ? subjects.value.slice() : []
  if (q) list = list.filter(s => (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
  if (subjectFilter.value) list = list.filter(s => String(s.id || s.slug || s) === String(subjectFilter.value))
  if (gradeFilter.value) list = list.filter(s => String(s.grade_id || s.grade || '') === String(gradeFilter.value))
  if (levelFilter.value) list = list.filter(s => String(s.level_id || (s.grade && s.grade.level_id) || '') === String(levelFilter.value))
  return list
})

function onSearch(q) {
  query.value = q
}

function resolveIcon(s) {
  return s.image || s.cover_image || '/images/subject.png'
}

async function fetchCourseMeta() {
  try {
    // Courses are stored as grades with type='course' on the backend, so reuse grade API
    const res = await $fetch(`${config.public.apiBase}/api/grades/${slug}`)
    courseMeta.value = res?.grade || res || {}
  } catch (e) {
    courseMeta.value = {}
  }
}

async function fetchSubjects() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/subjects`, { params: { grade: slug } })
    const raw = (res && res.subjects && Array.isArray(res.subjects.data)) ? res.subjects.data : (Array.isArray(res?.subjects) ? res.subjects : (Array.isArray(res) ? res : []))
    subjects.value = Array.isArray(raw) ? raw.filter(Boolean) : []
  } catch (e) {
    throw e
  }
}

async function fetchTopicCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: { grade: slug } })
    const list = res?.topics?.data || res?.topics || res || []
    topicCount.value = Array.isArray(list) ? list.length : 0
  } catch (e) {
    topicCount.value = 0
  }
}

async function fetchQuizCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/quizzes`, { params: { grade: slug, per_page: 1 } })
    quizCount.value = res?.quizzes?.total || res?.total || 0
  } catch (e) {
    quizCount.value = 0
  }
}

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    await Promise.all([fetchCourseMeta(), fetchSubjects(), fetchTopicCount(), fetchQuizCount()])
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }

  // ensure taxonomy lists are available for the sidebar (levels-first)
  try {
    await fetchLevels()
    const levelId = courseMeta.value?.level_id || courseMeta.value?.level?.id || null
    if (levelId) await fetchGradesByLevel(levelId)
    else await fetchGrades()
  } catch (e) {}
})
</script>
