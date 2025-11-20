<template>
  <div>
    <PageHero
      :title="topic?.name || 'Topic Assessments'"
      :description="`Browse and manage assessments within ${topic?.name || 'this topic'}`"
    >
      <template #eyebrow>
        <NuxtLink to="/quiz-master/quizzes" class="hover:underline">Quiz Management</NuxtLink> /
        <NuxtLink v-if="topic?.subject?.id" :to="`/quiz-master/subjects/${topic.subject.id}`" class="hover:underline">{{ topic?.subject?.name }}</NuxtLink>
        <span v-else>Subject</span> / Topic
      </template>

      <template #actions>
        <NuxtLink
          v-if="topic && topicTaxonomy.topic_id"
          :to="{
            path: '/quiz-master/quizzes/create',
            query: {
              level_id: topicTaxonomy.level_id,
              grade_id: topicTaxonomy.grade_id,
              subject_id: topicTaxonomy.subject_id,
              topic_id: topicTaxonomy.topic_id,
            }
          }"
          class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
          Create Quiz in this Topic
        </NuxtLink>
      </template>
    </PageHero>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiSkeleton :count="6" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!quizzes.length" class="text-center py-12 text-gray-500">
      No quizzes found in this topic.
      <NuxtLink
        v-if="topic && topicTaxonomy.topic_id"
        :to="{
          path: '/quiz-master/quizzes/create',
          query: {
            level_id: topicTaxonomy.level_id,
            grade_id: topicTaxonomy.grade_id,
            subject_id: topicTaxonomy.subject_id,
            topic_id: topicTaxonomy.topic_id,
          }
        }"
        class="text-indigo-600 hover:underline"
      >
        Create the first one!
      </NuxtLink>
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
          <NuxtLink
            v-if="topic && topicTaxonomy.topic_id"
            :to="{
              path: '/quiz-master/quizzes/create',
              query: {
                level_id: topicTaxonomy.level_id,
                grade_id: topicTaxonomy.grade_id,
                subject_id: topicTaxonomy.subject_id,
                topic_id: topicTaxonomy.topic_id,
              }
            }"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Quiz
          </NuxtLink>
        </div>
      </div>

      <!-- Quiz Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuizCard
          v-for="quiz in filteredQuizzes"
          :key="quiz?.id || idx"
          :to="`/quiz-master/quizzes/${quiz.id}`"
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
          :editLink="`/quiz-master/quizzes/${quiz.id}/edit`"
          :is_approved="quiz.is_approved"
          :approval_requested_at="quiz.approval_requested_at"
          @approve="() => {}"
          @edit="() => navigateToEdit(quiz.id)"
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
import useApi from '~/composables/useApi'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()

const topicId = ref(route.params.id)
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

// Compute taxonomy IDs from topic, handling various response formats
// Also uses taxonomy store to look up related grade/level info
const topicTaxonomy = computed(() => {
  if (!topic.value) return { level_id: null, grade_id: null, subject_id: null, topic_id: null }
  
  const t = topic.value
  
  // Direct extraction attempts
  let level_id = t.grade?.level_id || t.level_id || t.levelId || null
  let grade_id = t.grade_id || t.gradeId || t.grade?.id || null
  let subject_id = t.subject_id || t.subjectId || t.subject?.id || null
  
  // Try nested paths
  if (!level_id && t.subject?.grade?.level_id) level_id = t.subject.grade.level_id
  if (!grade_id && t.subject?.grade_id) grade_id = t.subject.grade_id
  if (!grade_id && t.subject?.grade?.id) grade_id = t.subject.grade.id
  
  // If we still don't have grade_id but have subject, look it up in taxonomy store
  if (!grade_id && subject_id) {
    const subjectsInStore = subjects.value || []
    const subject = subjectsInStore.find(s => String(s.id || s._id) === String(subject_id))
    if (subject) {
      grade_id = subject.grade_id || subject.gradeId || subject.grade?.id || null
    }
  }
  
  // If we still don't have level_id but have grade, look it up in taxonomy store
  if (!level_id && grade_id) {
    const gradesInStore = grades.value || []
    const grade = gradesInStore.find(g => String(g.id || g._id) === String(grade_id))
    if (grade) {
      level_id = grade.level_id || grade.levelId || grade.level?.id || null
    }
  }
  
  // Also try looking through levels for nested grade info
  if (!level_id && grade_id) {
    for (const level of (levels.value || [])) {
      if (level.grades && Array.isArray(level.grades)) {
        const g = level.grades.find(gr => String(gr.id || gr._id) === String(grade_id))
        if (g) {
          level_id = level.id
          break
        }
      }
    }
  }
  
  const topic_id = t.id || null
  
  console.log('[topicTaxonomy] computed:', { 
    level_id, 
    grade_id, 
    subject_id, 
    topic_id,
    'from direct': { grade_id: t.grade_id, level_id: t.level_id },
    'from nested': { grade_id: t.subject?.grade_id, level_id: t.subject?.grade?.level_id },
  })
  
  return { level_id, grade_id, subject_id, topic_id }
})

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
    const api = useApi()
    const endpoint = `/api/topics/${topicId.value}`
    console.log('[fetchTopicDetails] fetching from:', endpoint)
    const res = await api.get(endpoint)
    console.log('[fetchTopicDetails] response status:', res.status)
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn('[fetchTopicDetails] access denied', res.status)
        alert.push({ type: 'warning', message: 'You do not have permission to view this topic.' })
      } else {
        throw new Error('Failed to fetch topic details.')
      }
      return
    }
    const data = await res.json().catch(() => null)
    topic.value = data?.topic || data?.data || null
    console.log('[fetchTopicDetails] loaded topic:', topic.value?.name, 'raw topic data:', topic.value)
    // warm related taxonomy caches so we can look up grade/level info
    try {
      if (topic.value) {
        // Extract IDs from the topic
        const subject_id = topic.value.subject_id || topic.value.subjectId
        const grade_id = topic.value.grade_id || topic.value.gradeId || topic.value.grade?.id
        
        // Fetch the full subject to get grade info
        if (subject_id) {
          const subjectRes = await api.get(`/api/subjects?q=${encodeURIComponent(subject_id)}`)
          if (subjectRes.ok) {
            const subjectData = await subjectRes.json().catch(() => null)
            if (subjectData?.subjects && Array.isArray(subjectData.subjects)) {
              const foundSubject = subjectData.subjects.find(s => String(s.id) === String(subject_id))
              if (foundSubject && !grade_id) {
                topic.value.grade_id = foundSubject.grade_id || foundSubject.gradeId
              }
            }
          }
        }
        
        // Fetch grades to populate the store for lookups
        if (grade_id) {
          await fetchGrades()
        }
        
        // Also fetch all topics for this subject for warmth
        if (subject_id) {
          await fetchTopicsBySubject(subject_id)
        }
      }
    } catch (e) {
      // ignore warming errors
      console.log('[fetchTopicDetails] warming error (ignored):', e)
    }
  } catch (e) {
    console.error('[fetchTopicDetails] error:', e)
    alert.push({ type: 'error', message: (e && e.message) ? e.message : String(e) })
  }
}

async function fetchQuizzesForTopic() {
  try {
    const api = useApi()
    const params = new URLSearchParams({ 
      topic_id: topicId.value,
      per_page: 100 
    })
    const endpoint = `/api/quizzes?${params.toString()}`
    console.log('[fetchQuizzesForTopic] fetching from:', endpoint)
    const res = await api.get(endpoint)
    console.log('[fetchQuizzesForTopic] response status:', res.status)
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn('[fetchQuizzesForTopic] access denied', res.status)
        alert.push({ type: 'warning', message: 'You do not have permission to view quizzes for this topic.' })
      } else {
        throw new Error('Failed to fetch quizzes for this topic.')
      }
      return
    }
    const data = await res.json().catch(() => null)
    quizzes.value = data?.quizzes || data?.data || []
    console.log('[fetchQuizzesForTopic] loaded', quizzes.value.length, 'quizzes')
  } catch (e) {
    console.error('[fetchQuizzesForTopic] error:', e)
    alert.push({ type: 'error', message: (e && e.message) ? e.message : String(e) })
  }
}

// optionally warm taxonomy caches for related subjects/grades used in the UI
const { fetchLevels, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject, subjects, grades, levels } = useTaxonomy()

function navigateToEdit(quizId) {
  router.push(`/quiz-master/quizzes/${quizId}/edit`)
}

onMounted(async () => {
  loading.value = true
  try {
    // prefer to load levels first so downstream callers receive levels-aware data
    await fetchLevels()
  } catch (e) {}
  
  await Promise.all([
    fetchTopicDetails(),
    fetchQuizzesForTopic()
  ])
  loading.value = false
})
</script>