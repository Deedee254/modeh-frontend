<template>
  <div>
    <PageHero
      :title="topic?.name || 'Topic Quizzes'"
      :description="`Browse all quizzes in ${topic?.name || 'this topic'}`"
    >
      <template #eyebrow>
        <NuxtLink to="/quiz-master/quizzes" class="hover:underline">Quiz Management</NuxtLink> /
        <NuxtLink v-if="topic?.subject?.id" :to="`/quiz-master/subjects/${topic.subject.id}`" class="hover:underline">{{ topic?.subject?.name }}</NuxtLink>
        <span v-else>Subject</span> / Topic
      </template>

      <template #actions>
        <button
          @click="createQuiz"
          class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
          Create Quiz in this Topic
        </button>
      </template>
    </PageHero>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiSkeleton :count="6" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!quizzes.length" class="text-center py-12 text-gray-500">
      No quizzes found in this topic.
      <button @click="createQuiz" class="text-indigo-600 hover:underline">Create the first one!</button>
    </div>

    <!-- Filters and Sorting -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="mb-6 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
        <!-- Filters -->
        <div class="flex w-full sm:w-auto items-center gap-2 sm:gap-4">
          <select
            v-model="filters.status" 
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
            <option value="draft">Draft</option>
          </select>

          <select
            v-model="filters.sortBy" 
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
            <option value="questions">Most Questions</option>
          </select>
        </div>

        <!-- Quick Actions -->
        <div class="flex w-full sm:w-auto items-center gap-3">
          <button
            @click="createQuiz"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        </div>
      </div>

      <!-- Quiz Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuizCard
          v-for="quiz in filteredQuizzes"
          :key="quiz?.id || idx"
          :startLink="quiz.startLink"
          :title="quiz.title"
          :description="quiz.description"
          :subject="quiz.subject"
          :topic="quiz.topic"
          :subjectId="quiz.subject_id"
          :topicId="quiz.topic_id"
          :grade="quiz.grade"
          :questionsCount="quiz.questionsCount"
          :likes="quiz.likes"
          :quizId="quiz.id"
          :show-approval="true"
          :showEdit="true"
          :editLink="quiz.editLink"
          :is_approved="quiz.is_approved"
          :approval_requested_at="quiz.approval_requested_at"
          @approve="() => {}"
          @edit="() => router.push(quiz.editLink)"
        />
      </div>

      <!-- Empty State for Filtered Results -->
      <div v-if="filteredQuizzes.length === 0 && normalizedQuizzes.length > 0" class="text-center py-12 text-gray-500">
        No quizzes match your current filters.
        <button @click="resetFilters" class="text-indigo-600 hover:underline">Reset filters</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })

import { ref, onMounted, computed } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()

const topicId = route.params.id
const topic = ref(null)
const quizzes = ref([])
const loading = ref(true)

// Filter and sort states
const filters = ref({
  status: 'all',
  sortBy: 'newest'
})

function resetFilters() {
  filters.value = {
    status: 'all',
    sortBy: 'newest'
  }
}

const normalizedQuizzes = computed(() => {
  return (quizzes.value || [])
    .filter(q => q && q.id)
    .map(quiz => ({
      ...quiz,
      id: quiz.id,
      title: quiz.title || quiz.name || 'Untitled Quiz',
      description: quiz.description || quiz.summary || '',
      subject: quiz.subject?.name || quiz.subject_name || 'N/A',
      topic: quiz.topic?.name || quiz.topic_name || 'N/A',
      subject_id: quiz.subject?.id || quiz.subject_id,
      topic_id: quiz.topic?.id || quiz.topic_id,
      grade: quiz.grade?.name || quiz.grade_name || quiz.grade_id || 'N/A',
      questionsCount: quiz.questions_count ?? quiz.questions?.length ?? 0,
      likes: quiz.likes_count ?? quiz.likes ?? 0,
      startLink: `/quiz-master/quizzes/${quiz.id}`,
      editLink: `/quiz-master/quizzes/${quiz.id}/edit`,
      created_at: quiz.created_at || quiz.createdAt || new Date().toISOString(),
    }))
})

const filteredQuizzes = computed(() => {
  let result = [...normalizedQuizzes.value]

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(quiz => {
      switch (filters.value.status) {
        case 'approved':
          return quiz.is_approved
        case 'pending':
          return quiz.approval_requested_at && !quiz.is_approved
        case 'draft':
          return !quiz.approval_requested_at && !quiz.is_approved
        default:
          return true
      }
    })
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'likes':
        return b.likes - a.likes
      case 'questions':
        return b.questionsCount - a.questionsCount
      default:
        return 0
    }
  })

  return result
})

const config = useRuntimeConfig()

async function fetchTopicDetails() {
  try {
  const res = await fetch(`${config.public.apiBase}/api/topics/${topicId}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch topic details.')
    const data = await res.json()
    topic.value = data.topic || data.data
    // warm related taxonomy caches so subject/grade lists are available elsewhere in the UI
    try {
      if (topic.value) {
        // fetch subjects for the grade and topics for the subject (if available)
        await Promise.all([
          topic.value.grade_id ? fetchSubjectsByGrade(topic.value.grade_id) : Promise.resolve(),
          topic.value.subject_id ? fetchTopicsBySubject(topic.value.subject_id) : Promise.resolve(),
        ])
      }
    } catch (e) {
      // ignore warming errors
    }
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  }
}

async function fetchQuizzesForTopic() {
  try {
    const params = new URLSearchParams({ per_page: 100 }) // Fetch all quizzes
  const res = await fetch(`${config.public.apiBase}/api/topics/${topicId}/quizzes?${params.toString()}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch quizzes for this topic.')
    const data = await res.json()
    quizzes.value = data.quizzes || data.data || []
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  }
}

// optionally warm taxonomy caches for related subjects/grades used in the UI
const { fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()
onMounted(async () => {
  try {
    await fetchGrades()
  } catch (e) {}
})

function createQuiz() {
  if (!topic.value) {
    alert.push({ type: 'warning', message: 'Topic details not loaded yet.' })
    return
  }
  const query = {
    topic_id: topic.value.id,
    subject_id: topic.value.subject_id,
    grade_id: topic.value.grade_id,
  }
  // Filter out undefined values
  const filteredQuery = Object.fromEntries(Object.entries(query).filter(([_, v]) => v != null));

  router.push({
    path: '/quiz-master/quizzes/create',
    query: filteredQuery
  })
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchTopicDetails(),
    fetchQuizzesForTopic()
  ])
  loading.value = false
})
</script>