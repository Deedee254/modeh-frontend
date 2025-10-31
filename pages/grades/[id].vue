<template>
  <div>
    <PageHero
      :title="`Grade ${gradeMeta?.name || gradeId}`"
      :description="gradeMeta?.description || 'Subjects for this grade'"
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Grade overview
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/subjects"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            View all subjects
          </NuxtLink>
          <NuxtLink
            :to="`/quizzes?grade=${encodeURIComponent(gradeId)}`"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse quizzes
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">What you'll find</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ (subjects && subjects.value ? subjects.value.length : 0) }} subjects curated</p>
          <p v-if="gradeMeta?.summary" class="mt-2 text-sm text-white/70">{{ gradeMeta.summary }}</p>
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
          <p class="mt-2 text-xl font-semibold">{{ (subjects && subjects.value ? subjects.value.length : 0) }}</p>
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
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load subjects for this grade.</div>

      <div v-else>
      <div v-if="!subjects || !subjects.value || subjects.value.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No subjects found for this grade.</div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SubjectCard
          v-for="s in displaySubjects"
          :key="s.id"
          :title="s.name"
          :subtitle="`${s.quizzes_count || 0} quizzes available`"
          :image="resolveIcon(s)"
          :badgeText="(s.name || '').charAt(0).toUpperCase()"
          :topicsCount="s.topics_count || s.topics?.length || 0"
          :startLink="`/subjects/${s.slug || s.id}`"
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
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import { ref, computed, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const gradeId = route.params.id
const config = useRuntimeConfig()

const { subjects, fetchSubjectsByGrade } = useTaxonomy()
const query = ref('')
const gradeMeta = ref({})
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
  return s.icon || s.image || s.cover_image || '/images/subject-icon.svg'
}

async function fetchGradeMeta() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/grades/${gradeId}`)
    gradeMeta.value = res?.grade || res || {}
  } catch (e) {
    gradeMeta.value = {}
  }
}



async function fetchTopicCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: { grade: gradeId } })
    const list = res?.topics?.data || res?.topics || res || []
    topicCount.value = Array.isArray(list) ? list.length : 0
  } catch (e) {
    topicCount.value = 0
  }
}

async function fetchQuizCount() {
  try {
    const res = await $fetch(`${config.public.apiBase}/api/quizzes`, { params: { grade: gradeId, per_page: 1 } })
    quizCount.value = res?.quizzes?.total || res?.total || 0
  } catch (e) {
    quizCount.value = 0
  }
}

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    await Promise.all([fetchGradeMeta(), fetchSubjectsByGrade(gradeId), fetchTopicCount(), fetchQuizCount()])
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})
</script>
