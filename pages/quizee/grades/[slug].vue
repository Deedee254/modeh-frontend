<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee/grades" class="hover:text-brand-600">Grades</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ grade?.name || 'Grade' }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ grade?.name || 'Grade' }}</h1>
      <p v-if="grade?.description || grade?.summary" class="text-gray-600 mb-6">{{ grade.description || grade.summary }}</p>
    </div>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this grade.</div>

        <div v-else>
          <div v-if="displayTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
            No topics found for this grade.
          </div>
          <template v-else>
            <!-- Horizontal on mobile -->
            <div class="sm:hidden space-y-3">
              <TopicCard
                v-for="t in displayTopics"
                :key="t.id"
                :title="t.name"
                :slug="t.slug"
                :to="`/quizee/topics/${t.slug}`"
                :isHorizontal="true"
              />
            </div>
            <!-- Vertical grid on tablet and desktop -->
            <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <TopicCard
                v-for="t in displayTopics"
                :key="t.id"
                :title="t.name"
                :slug="t.slug"
                :to="`/quizee/topics/${t.slug}`"
              />
            </div>
          </template>
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
const config = useRuntimeConfig()
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
    fetchGradeAndTopics().then(() => {
    
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
        config.public.baseUrl
      )
    }
    })
  }
})
</script>
