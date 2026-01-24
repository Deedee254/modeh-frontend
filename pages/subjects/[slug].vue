<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/subjects" class="hover:text-brand-600">Subjects</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ subject?.name }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ subject?.name }}</h1>
      <p class="text-gray-600">{{ subject?.description || subject?.summary }}</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
        <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this subject.</div>

        <div v-else>
          <div v-if="(paginator?.data || topics).length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No topics found for this subject.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicCard
              v-for="t in displayTopics"
              :key="t.id"
              :title="t.name"
              :image="resolveIcon(t)"
              :grade="t.grade?.name || t.grade_name || ''"
              :subject="t.subject?.name || t.subject_name || ''"
              :description="t.description || t.summary || ''"
              :quizzesCount="t.quizzes_count || 0"
              :to="`/topics/${encodeURIComponent(t.slug)}`"
              startLabel="View Assessments"
            />
          </div>

          <div v-if="paginator" class="mt-8">
            <Pagination :paginator="paginator" @change-page="onPageChange" />
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import Pagination from '~/components/Pagination.vue'
import { ref, onMounted, computed, watch } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'

const route = useRoute()
const slug = computed(() => route.params.slug)
const config = useRuntimeConfig()
const topics = ref([])
const paginator = ref(null)
const query = ref('')
const perPage = ref(12)
const page = ref(1)

const displayTopics = computed(() => {
  // When using server-side pagination we display paginator.data
  const arr = Array.isArray(paginator?.value?.data) ? paginator.value.data : (Array.isArray(topics.value) ? topics.value : [])
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return arr
  return (arr || []).filter(t => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
})
const subject = ref({})
const { fetchTopicsPage } = useTaxonomy()
const loading = ref(true)
const error = ref(null)

function resolveIcon(t) { return t.image || t.cover_image || '/images/topic.png' }

async function fetchTopics(params = {}) {
  loading.value = true
  try {
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
      else baseParams.subject = subject.value.name || slug.value
    } else {
      // fallback to the route param: treat numeric as id, otherwise as slug
      const sid = Number(slug.value)
      if (!Number.isNaN(sid) && sid > 0) baseParams.subject_id = slug.value
      else baseParams.subject = slug.value
    }

    const { items, meta } = await fetchTopicsPage({
      subjectId: baseParams.subject_id || baseParams.subject,
      page: baseParams.page,
      perPage: baseParams.per_page,
      q: baseParams.q
    })
    paginator.value = { data: items, ...meta }
    topics.value = items
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // fetch subject metadata using shared API composable (preserves auth/session)
    try {
      const api = useApi()
      // Use the dedicated show endpoint which supports route-model binding by slug
      const subjectRes = await api.get(`/api/subjects/${encodeURIComponent(slug.value)}`)
      if (subjectRes && subjectRes.ok) {
        const s = await subjectRes.json()
        // Laravel Resource show() typically returns { data: { ... } }
        subject.value = s?.data ?? s ?? {}
      }
    } catch (e) {
      // ignore subject fetch error here
    }
  } catch (e) {
    // ignore subject fetch error here
  }

  // preload taxonomy lists for the sidebar (levels-first)
  try {
    await fetchLevels()
    // if the subject has a grade with a known level, fetch grades for that level
    const levelId = subject.value?.grade?.level_id || null
    if (levelId) await fetchGradesByLevel(levelId)
    else await fetchGrades()
    // Fetch subjects for the sidebar based on the current subject's grade
    const gid = subject.value?.grade?.id || subject.value?.grade_id || null
    if (gid) await fetchSubjectsByGrade(gid)
  } catch (e) {}

  // preload taxonomy lists for the sidebar (levels-first)
  try {
    await fetchLevels()
    // if the subject has a grade with a known level, fetch grades for that level
    const levelId = subject.value?.grade?.level_id || null
    if (levelId) await fetchGradesByLevel(levelId)
    else await fetchGrades()
    // Fetch subjects for the sidebar based on the current subject's grade
    const gid = subject.value?.grade?.id || subject.value?.grade_id || null
    if (gid) await fetchSubjectsByGrade(gid)
  } catch (e) {}

  await fetchTopics()
})

// react to search/pagination changes
watch([query, perPage, page], () => {
  // ensure page param sent
  fetchTopics()
})

function onPageChange(p) { page.value = p }
</script>
