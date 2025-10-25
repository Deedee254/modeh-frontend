<template>
  <div>
    <PageHero
      :title="subject.name || 'Subject'"
      :description="subject.description || subject.summary || `Topics for ${subject.name || ''}`"
      :showSearch="true"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Subject detail
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/topics"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse all topics
          </NuxtLink>
          <NuxtLink
            :to="`/quizzes?subject=${encodeURIComponent(subject.slug || subject.id)}`"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Explore assessments
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Topic coverage</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ topics.length || 0 }} topics curated</p>
          <p v-if="subject.grade?.name" class="mt-2 text-sm text-white/70">Aligned to {{ subject.grade.name }}</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h12M4 18h8" />
        </svg>
      </template>

      <!-- stats slot intentionally removed for /subjects pages -->
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load topic for this subject.</div>

      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside class="lg:col-span-1">
            <FiltersSidebar
              :grade-options="taxGrades.value"
              :subject-options="subjectOptionsForSidebar"
              :topic-options="paginator?.data || topics"
              :showTopic="false"
              :subject="subjectFilter"
              :topic="filterTopic"
              :grade="gradeFilter"
              storageKey="filters:subjects"
              @update:subject="val => subjectFilter.value = val"
              @update:topic="val => filterTopic.value = val"
              @update:grade="val => gradeFilter.value = val"
              @apply="() => { fetchTopics() }"
              @clear="() => { subjectFilter.value = ''; filterTopic.value = ''; gradeFilter.value = '' }"
            />
          </aside>

          <main class="lg:col-span-2">
            <div v-if="paginator?.data?.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No topics found for this subject.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              <TopicCard
                v-for="t in displayTopics"
                :key="t.id"
                :title="t.name"
                :image="resolveIcon(t)"
                :grade="t.grade?.name || t.grade_name || ''"
                :subject="t.subject?.name || t.subject_name || ''"
                :description="t.description || t.summary || ''"
                :quizzesCount="t.quizzes_count || 0"
                :startLink="`/topics/${t.id}`"
                startLabel="View Assessments"
              />
            </div>

            <div class="mt-8">
              <Pagination :paginator="paginator" @change-page="onPageChange" />
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'
// HeroFilterBar removed — using PageHero search instead
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import FiltersSidebar from '~/components/FiltersSidebar.vue'
import Pagination from '~/components/Pagination.vue'
import { ref, onMounted, computed, watch } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { getHeroClass } from '~/utils/heroPalettes'

const route = useRoute()
const subjectId = route.params.id
const config = useRuntimeConfig()
const topics = ref([])
const paginator = ref(null)
const query = ref('')
const perPage = ref(12)
const page = ref(1)
const gradeFilter = ref('')
const subjectFilter = ref(subjectId)
const filterTopic = ref('')
// Local search handler used by PageHero
function onSearch(q) { query.value = String(q || '').toLowerCase().trim() }
const displayTopics = computed(() => {
  // When using server-side pagination we display paginator.data
  const arr = Array.isArray(paginator?.value?.data) ? paginator.value.data : (Array.isArray(topics.value) ? topics.value : [])
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return arr
  return (arr || []).filter(t => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
})
const subject = ref({})
// taxonomy for sidebar
const { fetchGrades, fetchLevels, fetchAllSubjects, grades: taxGrades, subjects: taxSubjects } = useTaxonomy()
const loading = ref(true)

// Provide subject options to the FiltersSidebar: prefer all subjects for the grade when available
const subjectOptionsForSidebar = computed(() => {
  try {
    const all = Array.isArray(taxSubjects.value) && taxSubjects.value.length ? taxSubjects.value : []
    const gid = subject.value?.grade?.id || subject.value?.grade_id || null
    if (all.length && gid) {
      return all.filter(s => String(s.grade_id || s.grade || '') === String(gid))
    }
    // fallback: expose current subject only
    return subject.value ? [subject.value] : []
  } catch (e) {
    return subject.value ? [subject.value] : []
  }
})
const error = ref(null)

function resolveIcon(t) { return t.icon || t.image || t.cover_image || '/images/topic-icon.svg' }

async function fetchTopics(params = {}) {
  loading.value = true
  try {
    // Build params using numeric _id when available (from fetched subject) otherwise use slug/string
    const baseParams = {
      page: page.value,
      per_page: perPage.value,
      q: query.value,
      ...params
    }

    // subject param: prefer subject.value.id if we've fetched subject metadata
    if (subject.value && (subject.value.id || subject.value.slug || subject.value.name)) {
      if (subject.value.id) baseParams.subject_id = subject.value.id
      else if (subject.value.slug) baseParams.subject = subject.value.slug
      else baseParams.subject = subject.value.name || subjectId
    } else {
      // fallback to the route param: treat numeric as id
      const sid = Number(subjectId)
      if (!Number.isNaN(sid) && sid > 0) baseParams.subject_id = subjectId
      else baseParams.subject = subjectId
    }

    // grade filter: send grade_id when numeric
    if (gradeFilter.value) {
      const g = Number(gradeFilter.value)
      if (!Number.isNaN(g) && g > 0) baseParams.grade_id = gradeFilter.value
      else baseParams.grade = gradeFilter.value
    }

    // topic filter: send topic_id when numeric
    if (filterTopic.value) {
      const t = Number(filterTopic.value)
      if (!Number.isNaN(t) && t > 0) baseParams.topic_id = filterTopic.value
      else baseParams.topic = filterTopic.value
    }

    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: baseParams })
    // normalize paginator/data shapes
    if (res && res.topics && Array.isArray(res.topics.data)) {
      paginator.value = res.topics
      topics.value = res.topics.data
    } else if (Array.isArray(res?.topics)) {
      paginator.value = { data: res.topics }
      topics.value = res.topics
    } else if (Array.isArray(res)) {
      paginator.value = { data: res }
      topics.value = res
    } else {
      paginator.value = { data: [] }
      topics.value = []
    }
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // fetch subject metadata
    const s = await $fetch(`${config.public.apiBase}/api/subjects/${subjectId}`)
    subject.value = (s && s.subject) ? s.subject : (s || {})
  } catch (e) {
    // ignore subject fetch error here
  }
  // preload taxonomy lists for the sidebar
  try { fetchGrades(); fetchLevels(); fetchAllSubjects() } catch (e) {}
  await fetchTopics()
})

// react to filter/search/pagination changes
watch([query, perPage, page, gradeFilter, filterTopic], () => {
  // ensure page param sent
  fetchTopics()
})

function onPageChange(p) { page.value = p }
</script>
