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
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.id"
        :to="`/quiz-master/topics/${topic.id}`"
        class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition"
      >
        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900">{{ topic.name }}</h5>
        <p class="font-normal text-gray-700">{{ topic.quizzes_count || 0 }} quizzes</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })

import { ref, onMounted } from 'vue'
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
    const params = new URLSearchParams({ approved: 1, per_page: 100 }) // Fetch all topics for the subject
    const res = await fetch(`${useRuntimeConfig().public.apiBase}/api/subjects/${subjectId}/topics?${params.toString()}`, { credentials: 'include' })
    if (!res.ok) {
      throw new Error('Failed to fetch topics for this subject.')
    }
    const data = await res.json()
    topics.value = (data.topics || data.data || []).filter(t => t)
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