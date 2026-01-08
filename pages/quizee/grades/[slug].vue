<template>
  <div>
    <PageHero
      :title="grade?.name || 'Grade'"
      :description="grade?.description || grade?.summary || `Topics for ${grade?.name || ''}`"
      :flush="true"
    >
      <template #eyebrow>
        Grade detail
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
            :to="`/quizees/quizzes?grade=${encodeURIComponent(grade?.slug)}`"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Explore assessments
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Topic coverage</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ topics.length || 0 }} topics available</p>
          <p v-if="grade?.level?.name" class="mt-2 text-sm text-white/70">Aligned to {{ grade.level.name }}</p>
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
        <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this grade.</div>

        <div v-else>
          <div v-if="displayTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
            No topics found for this grade.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicCard
              v-for="t in displayTopics"
              :key="t.id"
              :title="t.name"
              :slug="t.slug"
              :to="`/quizee/topics/${t.slug}`"
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
import useApi from '~/composables/useApi'
import PageHero from '~/components/ui/PageHero.vue'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import useSeo from '~/composables/useSeo'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore topics within this grade level.' }
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
const grade = ref<any>(null)
const topics = ref<any[]>([])

const userProfile = computed(() => {
  const u = (auth as any).user
  return (u && typeof u === 'object' && 'value' in u) ? u.value : (u || {})
})

const displayTopics = computed(() => {
  let list = topics.value || []
  // client-side search removed for this page
  return list
})

async function fetchGradeAndTopics() {
  loading.value = true
  error.value = false
  try {
    // Fetch grade detail by slug
    const gradeRes = await api.get(`/api/grades?slug=${slug.value}`)
    if (!gradeRes.ok) {
      error.value = true
      loading.value = false
      return
    }
    const gradeData = await gradeRes.json()
    grade.value = (Array.isArray(gradeData.data) ? gradeData.data[0] : gradeData.data) || gradeData

    // Fetch topics for this grade using grade ID
    if (grade.value?.id) {
      const topicsRes = await api.get(`/api/grades/${grade.value.id}/topics`)
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        topics.value = topicsData.data || topicsData.topics || []
      }
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

// search removed for this page

onMounted(() => {
  if (slug.value) {
    fetchGradeAndTopics()
    
    // Setup SEO for grade page
    if (grade.value?.id && grade.value?.slug) {
      seo.setupPageSeo(
        {
          id: grade.value.id,
          name: grade.value.name || 'Grade',
          slug: grade.value.slug,
          description: grade.value.description || grade.value.summary
        },
        'grade',
        window.location.origin
      )
    }
  }
})
</script>
