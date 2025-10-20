<template>
  <div>
    <PageHero
      :title="subject?.name || 'Subject Topics'"
      :description="`Browse all topics available in ${subject?.name || 'this subject'}`"
    >
      <template #eyebrow>
        <NuxtLink to="/quiz-master/quizzes" class="hover:underline">Quiz Management</NuxtLink> / Subject
      </template>
    </PageHero>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p>Loading topics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-red-500">
      <p>{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!topics.length" class="text-center py-12 text-gray-500">
      <p>No topics found for this subject.</p>
    </div>

    <!-- Topics List -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="(topic, idx) in (Array.isArray(topics) ? topics.filter(Boolean) : [])"
          :key="topic?.id || idx"
          :to="`/quiz-master/topics/${topic?.id}`"
          class="group relative block p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200"
        >
          <!-- Topic Icon -->
          <div class="mb-4 inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <Icon name="heroicons:book-open" class="w-6 h-6" />
          </div>

          <!-- Topic Details -->
          <h5 class="mb-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {{ topic.name }}
          </h5>
          
          <!-- Topic Stats -->
          <div class="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <Icon name="heroicons:document-text" class="w-4 h-4" />
              <span>{{ topic.quizzes_count || 0 }} {{ topic.quizzes_count === 1 ? 'quiz' : 'quizzes' }}</span>
            </div>
            <div v-if="topic.grade" class="flex items-center gap-1">
              <Icon name="heroicons:academic-cap" class="w-4 h-4" />
              <span>{{ topic.grade.name }}</span>
            </div>
          </div>

          <!-- Hover State Arrow -->
          <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="heroicons:arrow-right" class="w-5 h-5 text-indigo-600" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })

import { ref, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { useRoute } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const alert = useAppAlert()

const subjectId = route.params.id
const subject = ref(null)
const topics = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchSubjectDetails() {
  try {
    const res = await fetch(`${useRuntimeConfig().public.apiBase}/api/subjects/${subjectId}`, { credentials: 'include' })
    if (!res.ok) {
      throw new Error('Failed to fetch subject details.')
    }
    const data = await res.json()
    subject.value = data.subject || data.data
  } catch (e) {
    error.value = e.message
    alert.push({ type: 'error', message: e.message })
  }
}

async function fetchTopicsForSubject() {
  try {
    // Prefer composable cache if available
    const { fetchTopicsBySubject, topics: taxTopics } = useTaxonomy()
    await fetchTopicsBySubject(subjectId)
    if (Array.isArray(taxTopics.value) && taxTopics.value.length) {
      topics.value = taxTopics.value
      return
    }
    // fallback to direct fetch
    const params = new URLSearchParams({ approved: 1, per_page: 100 }) // Fetch all topics for the subject
    const res = await fetch(`${useRuntimeConfig().public.apiBase}/api/subjects/${subjectId}/topics?${params.toString()}`, { credentials: 'include' })
    if (!res.ok) {
      throw new Error('Failed to fetch topics for this subject.')
    }
    const data = await res.json()
    topics.value = (data.topics || data.data || []).filter(t => t)
    // warm grade and subject caches for UI consistency
    try {
      if (subject.value) {
        await Promise.all([
          fetchGrades(),
          fetchTopicsBySubject(subjectId),
        ])
      }
    } catch (e) {
      // ignore warming errors
    }
  } catch (e) {
    error.value = e.message
    alert.push({ type: 'error', message: e.message })
  }
}

onMounted(async () => {
  loading.value = true
  error.value = null
  await Promise.all([
    fetchSubjectDetails(),
    fetchTopicsForSubject()
  ])
  loading.value = false
})
</script>