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
            Explore quizzes
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
      <div v-if="topics.length === 0" class="p-6 border rounded-md text-sm text-gray-600 bg-white">No topics found for this subject.</div>
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
          :startLink="`/topics/${t.slug || t.id}`"
          startLabel="View Quizzes"
        >
        </TopicCard>
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
import { ref, onMounted, computed } from 'vue'
import { getHeroClass } from '~/utils/heroPalettes'

const route = useRoute()
const subjectId = route.params.id
const config = useRuntimeConfig()
const topics = ref([])
const query = ref('')
// Local search handler used by PageHero
function onSearch(q) { query.value = String(q || '').toLowerCase().trim() }
const displayTopics = computed(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return topics.value
  return (topics.value || []).filter(t => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
})
const subject = ref({})
const loading = ref(true)
const error = ref(null)

function resolveIcon(t) { return t.icon || t.image || t.cover_image || '/images/topic-icon.svg' }

onMounted(async () => {
  try {
    // fetch subject metadata (API returns { subject: { ... } })
    const s = await $fetch(`${config.public.apiBase}/api/subjects/${subjectId}`)
    subject.value = (s && s.subject) ? s.subject : (s || {})

    // fetch topics for this subject. Normalize paginated shapes.
    const res = await $fetch(`${config.public.apiBase}/api/topics`, { params: { subject: subjectId } })
    // res.topics may be a paginator object; prefer the data array when present
    topics.value = (res && res.topics && Array.isArray(res.topics.data)) ? res.topics.data : (Array.isArray(res?.topics) ? res.topics : (Array.isArray(res) ? res : []))
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})
</script>
