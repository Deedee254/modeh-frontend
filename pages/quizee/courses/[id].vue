<template>
  <div>
    <PageHero
      :title="course?.name || 'Course'"
      :description="course?.description || course?.summary || `Topics in ${course?.name || ''}`"
      :flush="true"
    >
      <template #eyebrow>
        Course topics
      </template>

      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/quizee/courses"
            class="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Back to courses
          </NuxtLink>
          <NuxtLink
            :to="`/quizee/quizzes?subject=${encodeURIComponent(course?.slug || course?.id)}`"
            class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Explore assessments
          </NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Topics in this course</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ displayTopics.length || 0 }}</p>
          <p v-if="course?.grade?.name" class="mt-2 text-sm text-white/70">{{ course.grade.name }} field</p>
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
        <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
        <div v-else-if="error" class="mt-6 text-red-600">Failed to load topics for this course.</div>

        <div v-else>
          <div v-if="displayTopics.length === 0" class="p-6 border rounded-xl text-sm text-gray-600 bg-white shadow-sm">
            No topics found for this course.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TopicCard
              v-for="t in displayTopics"
              :key="t.id"
              :title="t.name"
              :slug="t.slug"
              :to="`/quizee/topics/${t.slug || t.id}`"
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

const courseId = computed(() => route.params.id)
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
    const courseRes = await api.get(`/api/subjects/${courseId.value}`)
    if (!courseRes.ok) {
      error.value = true
      loading.value = false
      return
    }
    const courseData = await courseRes.json()
    course.value = courseData.data || courseData

    // Fetch topics for this course
    const topicsRes = await api.get(`/api/subjects/${courseId.value}/topics`)
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

// search removed for this page

onMounted(() => {
  if (courseId.value) {
    fetchCourseAndTopics()
  }
})
</script>
