<template>
  <div>
    <PageHero
      :title="`Course ${courseMeta?.name || courseId}`"
      :description="courseMeta?.description || 'Subjects for this course'"
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Course overview
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/subjects"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            View all subjects
          </NuxtLink>
          <NuxtLink
            :to="`/quizzes?grade=${encodeURIComponent(courseId)}`"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse quizzes
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">What you'll find</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ subjects.length || 0 }} subjects curated</p>
          <p v-if="courseMeta?.summary" class="mt-2 text-sm text-white/70">{{ courseMeta.summary }}</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4h18M3 10h12M3 16h6" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Subjects</p>
          <p class="mt-2 text-xl font-semibold">{{ subjects.length || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Topics</p>
          <p class="mt-2 text-xl font-semibold">{{ topicCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Quizzes</p>
          <p class="mt-2 text-xl font-semibold">{{ quizCount }}</p>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
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
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import FiltersSidebar from '~/components/FiltersBar.vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const courseId = route.params.id
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
  return s.icon || s.image || s.cover_image || '/images/subject-icon.svg'
}

async function fetchCourseMeta() {
  try {
    // Courses are stored as grades with type='course' on the backend, so reuse grade API
    const res = await $fetch(`${config.public.apiBase}/api/grades/${courseId}`)
    courseMeta.value = res?.grade || res || {}
  } catch (e) {
    courseMeta.value = {}
  }
}

async function fetchSubjects() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/subjects`, { params: { grade: courseId } })
    const raw = (res && res.subjects && Array.isArray(res.subjects.data)) ? res.subjects.data : (Array.isArray(res?.subjects) ? res.subjects : (Array.isArray(res) ? res : []))
    subjects.value = Array.isArray(raw) ? raw.filter(Boolean) : []
  } catch (e) {
    throw e
  }
}

async function fetchTopicCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: { grade: courseId } })
    const list = res?.topics?.data || res?.topics || res || []
    topicCount.value = Array.isArray(list) ? list.length : 0
  } catch (e) {
    topicCount.value = 0
  }
}

async function fetchQuizCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/quizzes`, { params: { grade: courseId, per_page: 1 } })
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
