<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/quizee/courses" class="hover:text-brand-600">Courses</NuxtLink>
        <span class="mx-2">›</span>
        <span>{{ course?.name || 'Course' }}</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ course?.name || 'Course' }}</h1>
      <p v-if="course?.description || course?.summary" class="text-gray-600 mb-6">{{ course.description || course.summary }}</p>
    </div>

    <div class="bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div v-if="loading" class="mt-6"><UiSkeleton :count="1" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this course.</div>

        <div v-else>
          <div v-if="displayTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
            No topics found for this course.
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
import useSeo from '~/composables/useSeo'
import TopicCard from '~/components/ui/TopicCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'

definePageMeta({
  layout: 'quizee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Explore topics within this course.' }
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
const course = ref<any>(null)
const topics = ref<any[]>([])

const displayTopics = computed(() => {
  let list = topics.value || []
  // client-side search removed for this page
  return list
})

async function fetchCourseAndTopics() {
  loading.value = true
  error.value = false
  try {
    // Fetch course detail (using subjects API since courses are subjects for tertiary)
    const courseRes = await api.get(`/api/subjects?slug=${slug.value}`)
    if (!courseRes.ok) {
      error.value = true
      loading.value = false
      return
    }
    const courseData = await courseRes.json()
    course.value = (Array.isArray(courseData.data) ? courseData.data[0] : courseData.data) || courseData

    // Fetch topics for this course using course ID
    if (course.value?.id) {
      const topicsRes = await api.get(`/api/subjects/${course.value.id}/topics`)
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
    fetchCourseAndTopics()
    
    // Setup SEO for course page
    if (course.value?.id && course.value?.slug) {
      seo.setupPageSeo(
        {
          id: course.value.id,
          name: course.value.name || 'Course',
          slug: course.value.slug,
          description: course.value.description || course.value.summary
        },
        'subject',
        window.location.origin
      )
    }
  }
})
</script>
