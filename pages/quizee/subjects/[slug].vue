<template>
  <div>
    <PageHero
      :title="displayTitle"
      :description="displayDescription"
      :flush="true"
    >
      <template #eyebrow>
        Subject detail
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/quizee/topics"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Browse all topics
          </NuxtLink>
          <NuxtLink
            :to="`/quizee/quizzes?subject=${encodeURIComponent(subject?.slug)}`"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Explore assessments
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Topic coverage</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ displayTopics.length || 0 }} topics</p>
          <p v-if="subject?.grade?.name" class="mt-2 text-sm text-white/70">Aligned to {{ subject.grade.name }}</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h12M4 18h8" />
        </svg>
      </template>
    </PageHero>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Sort Bar (button group) -->
        <div class="mb-8 flex items-center gap-3">
          <div class="text-sm text-gray-600">Sort:</div>
          <div class="flex items-center gap-2">
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'newest' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'newest'"
            >
              Newest
            </button>
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'name' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'name'"
            >
              Name (A–Z)
            </button>
            <button
              :class="[ 'px-3 py-1 rounded-full text-sm font-medium', sortOption === 'most_quizzes' ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700' ]"
              @click="sortOption = 'most_quizzes'"
            >
              Most quizzes
            </button>
          </div>
        </div>

        <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this subject.</div>

        <div v-else>
          <div v-if="displayTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
            No topics found for this subject.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicCard
              v-for="t in displayTopics"
              :key="t.id"
              :title="t.name"
              :slug="t.slug"
              :to="`/quizee/topics/${t.slug}`"
              :quizzes-count="t.quizzes_count || 0"
              :subject="subject?.name || subject?.id"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useTaxonomy from '~/composables/useTaxonomy'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useApi from '~/composables/useApi'
import useSeo from '~/composables/useSeo'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore topics within this subject.' }
  ]
})

const route = useRoute()
const auth = useAuthStore()
const api = useApi()
const taxonomy = useTaxonomy()
const seo = useSeo()

const slug = computed(() => route.params.slug)
const loading = ref(false)
const error = ref(false)
const subject = ref<any>(null)
const topics = ref<any[]>([])
const sortOption = ref('newest')
const taxonomyStore = useTaxonomyStore()

const displayTitle = computed(() => {
  const s = subject.value
  if (!s) return 'Subject'
  if (typeof s === 'object') {
    return s.name || s.title || s.display_name || s.subject_name || s.slug || 'Subject'
  }
  try {
    const arr = Array.isArray((taxonomyStore as any).subjects) ? (taxonomyStore as any).subjects : (Array.isArray((taxonomyStore as any).subjects?.value) ? (taxonomyStore as any).subjects.value : [])
    const found = arr.find((x: any) => String(x.id) === String(s))
    if (found) return found.name || found.title || found.display_name || String(s)
  } catch (e) {}
  return String(s)
})

const displayDescription = computed(() => {
  const s = subject.value
  if (!s) return ''
  if (typeof s === 'object') {
    return s.description || s.summary || `Topics for ${s.name || s.title || ''}`
  }
  return ''
})

const displayTopics = computed(() => {
  let list = topics.value || []
  // no client-side search filter (filter bar removed)

  const sort = sortOption.value
  if (sort === 'name') {
    list = list.slice().sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'most_quizzes') {
  list = list.slice().sort((a: any, b: any) => Number(b.quizzes_count || 0) - Number(a.quizzes_count || 0))
  } else {
    list = list.slice().sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0
      const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0
      return tb - ta
    })
  }

  return list
})

async function fetchSubjectAndTopics() {
  loading.value = true
  error.value = false
  try {
    const subjectRes = await api.get(`/api/subjects?slug=${slug.value}`)
    if (!subjectRes.ok) {
      error.value = true
      loading.value = false
      return
    }
    const subjectData = await subjectRes.json()
    subject.value = (subjectData && subjectData.subjects && subjectData.subjects[0]) ? subjectData.subjects[0] : ((subjectData && subjectData.subject) ? subjectData.subject : (subjectData.data || subjectData))

    const topicsRes = await api.get(`/api/subjects/${subject.value?.id || slug.value}/topics`)
    if (topicsRes.ok) {
      const topicsData = await topicsRes.json()
      topics.value = topicsData.data || topicsData.topics || []
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

// search was removed; no-op

onMounted(() => {
  if (slug.value) {
    fetchSubjectAndTopics()
  }
  ;(async () => {
    try {
      await taxonomy.fetchLevels()
      const levelId = subject.value?.grade?.level_id || null
      if (levelId && taxonomy.fetchGradesByLevel) await taxonomy.fetchGradesByLevel(levelId)
      else if (taxonomy.fetchGrades) await taxonomy.fetchGrades()
      const gid = subject.value?.grade?.id || subject.value?.grade_id || null
      if (gid && taxonomy.fetchSubjectsByGrade) await taxonomy.fetchSubjectsByGrade(gid)
      
      // Setup SEO for subject page
      if (subject.value?.id && subject.value?.slug) {
        seo.setupPageSeo(
          {
            id: subject.value.id,
            name: subject.value.name || 'Subject',
            slug: subject.value.slug,
            description: subject.value.description || subject.value.summary
          },
          'subject',
          window.location.origin
        )
      }
    } catch (e) {
    }
  })()
})
</script>
