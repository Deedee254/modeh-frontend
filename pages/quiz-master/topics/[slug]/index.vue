<template>
  <div>
    <PageHero
      :title="topic?.name || 'Topic Assessments'"
      :description="`Browse and manage assessments within ${topic?.name || 'this topic'}`"
    >
      <template #eyebrow>
        <NuxtLink to="/quiz-master/quizzes" class="hover:underline">Quiz Management</NuxtLink> /
        <NuxtLink v-if="topic?.subject?.slug" :to="`/quiz-master/subjects/${topic.subject.slug}`" class="hover:underline">{{ topic?.subject?.name }}</NuxtLink>
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
          class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
          Create Quiz in this Topic
        </NuxtLink>
      </template>
    </PageHero>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiSkeleton :count="1" />
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
        class="text-brand-600 hover:underline"
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
            class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Create Quiz
          </NuxtLink>
        </div>
      </div>

      <!-- Quiz Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuizCard
          v-for="(quiz, idx) in filteredQuizzes"
          :key="quiz?.slug || idx"
          :to="`/quiz-master/quizzes/${quiz.slug}`"
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
          :editLink="`/quiz-master/quizzes/${quiz.slug}/edit`"
          :is_approved="quiz.is_approved"
          :approval_requested_at="quiz.approval_requested_at"
          @approve="() => {}"
          @edit="() => navigateToEdit(quiz.slug)"
        />
      </div>

      <!-- Empty State for Filtered Results -->
      <div v-if="filteredQuizzes.length === 0 && normalizedQuizzes.length > 0" class="text-center py-12 text-gray-500">
        No quizzes match your current filters.
        <button @click="resetFilters" class="text-brand-600 hover:underline">Reset filters</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'quiz-master' })

import { ref, onMounted, computed } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import useSeo from '~/composables/useSeo'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useAppAlert } from '~/composables/useAppAlert'

interface Topic {
  id: string | number
  name?: string
  slug?: string
  description?: string
  summary?: string
  subject_id?: string | number
  grade_id?: string | number
  level_id?: string | number
  subject?: { id?: string | number; name?: string; slug?: string; grade_id?: string | number; grade?: { id?: string | number; level_id?: string | number } }
  grade?: { id?: string | number; name?: string; level_id?: string | number }
}

interface Quiz {
  id: string | number
  title?: string
  name?: string
  slug?: string
  description?: string
  summary?: string
  subject_id?: string | number
  subject_name?: string
  topic_id?: string | number
  topic_name?: string
  grade_id?: string | number
  grade_name?: string
  questions_count?: number
  questions?: any[]
  likes_count?: number
  likes?: number
  is_approved?: boolean
  approval_requested_at?: string
  created_at?: string
  createdAt?: string
  subject?: { id?: string | number; name?: string }
  topic?: { id?: string | number; name?: string }
  grade?: { id?: string | number; name?: string }
}

interface NormalizedQuiz extends Quiz {
  title: string  // Override to be required
  description: string  // Override to be required
  questionsCount: number
  created_at: string
  subject: { id?: string | number; name?: string }
  topic: { id?: string | number; name?: string }
  grade: { id?: string | number; name?: string }
}

interface Filters {
  status: 'all' | 'approved' | 'pending' | 'draft'
  sortBy: 'newest' | 'oldest' | 'likes' | 'questions'
}

interface TopicTaxonomy {
  level_id: string | number | null
  grade_id: string | number | null
  subject_id: string | number | null
  topic_id: string | number | null
}

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()
const seo = useSeo()
const api = useApi()

const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : param || ''
})
const topic = ref<Topic | null>(null)
const quizzes = ref<Quiz[]>([])
const loading = ref(true)

// Filter and sort states
const filters = ref<Filters>({
  status: 'all',
  sortBy: 'newest'
})

function resetFilters(): void {
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
  let level_id: string | number | null = t.grade?.level_id || t.level_id || null
  let grade_id: string | number | null = t.grade_id || t.grade?.id || null
  let subject_id: string | number | null = t.subject_id || t.subject?.id || null
  
  // Try nested paths
  if (!level_id && t.subject?.grade?.level_id) level_id = t.subject.grade.level_id
  if (!grade_id && t.subject?.grade_id) grade_id = t.subject.grade_id
  if (!grade_id && t.subject?.grade?.id) grade_id = t.subject.grade.id
  
  // If we still don't have grade_id but have subject, look it up in taxonomy store
  if (!grade_id && subject_id) {
    const subjectsInStore = subjects.value || []
    const subject = subjectsInStore.find((s: any) => String(s?.id || s?._id) === String(subject_id))
    if (subject) {
      grade_id = subject.grade_id || subject.gradeId || subject.grade?.id || null
    }
  }
  
  // If we still don't have level_id but have grade, look it up in taxonomy store
  if (!level_id && grade_id) {
    const gradesInStore = grades.value || []
    const grade = gradesInStore.find((g: any) => String(g?.id || g?._id) === String(grade_id))
    if (grade) {
      level_id = grade.level_id || grade.levelId || grade.level?.id || null
    }
  }
  
  // Also try looking through levels for nested grade info
  if (!level_id && grade_id) {
    for (const level of (levels.value || [])) {
      if (level?.grades && Array.isArray(level.grades)) {
        const g = level.grades.find((gr: any) => String(gr?.id || gr?._id) === String(grade_id))
        if (g) {
          level_id = level.id
          break
        }
      }
    }
  }
  
  const topic_id = t.id || null
  
  return { level_id, grade_id, subject_id, topic_id }
})

const normalizedQuizzes = computed<NormalizedQuiz[]>(() => {
  return (quizzes.value || [])
    .filter((q: Quiz | undefined | null): q is Quiz => q != null && (q?.id != null))
    .map((quiz: Quiz) => ({
      ...quiz,
      id: quiz.id,
      slug: quiz.slug || '',
      title: quiz.title || quiz.name || 'Untitled Quiz',
      description: quiz.description || quiz.summary || '',
      subject: quiz.subject || { id: quiz.subject_id, name: quiz.subject_name },
      topic: quiz.topic || { id: quiz.topic_id, name: quiz.topic_name },
      subject_id: quiz.subject?.id || quiz.subject_id,
      topic_id: quiz.topic?.id || quiz.topic_id,
      grade: quiz.grade || { id: quiz.grade_id, name: quiz.grade_name } || { name: 'N/A' },
      questionsCount: quiz.questions_count ?? quiz.questions?.length ?? 0,
      likes: quiz.likes_count ?? quiz.likes ?? 0,
      created_at: quiz.created_at || quiz.createdAt || new Date().toISOString(),
    }))
})

const filteredQuizzes = computed<NormalizedQuiz[]>(() => {
  let result = [...normalizedQuizzes.value]

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter((quiz: NormalizedQuiz) => {
      switch (filters.value.status) {
        case 'approved':
          return quiz.is_approved === true
        case 'pending':
          return quiz.approval_requested_at != null && quiz.is_approved !== true
        case 'draft':
          return quiz.approval_requested_at == null && quiz.is_approved !== true
        default:
          return true
      }
    })
  }

  // Apply sorting
  result.sort((a: NormalizedQuiz, b: NormalizedQuiz) => {
    switch (filters.value.sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'likes':
        return (b.likes || 0) - (a.likes || 0)
      case 'questions':
        return (b.questionsCount || 0) - (a.questionsCount || 0)
      default:
        return 0
    }
  })

  return result
})

const config = useRuntimeConfig()

async function fetchTopicDetails(): Promise<void> {
  try {
    const endpoint = `/api/topics?slug=${slug.value}`
    const res = await api.get(endpoint)
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        alert.push({ type: 'warning', message: 'You do not have permission to view this topic.' })
      } else {
        throw new Error('Failed to fetch topic details.')
      }
      return
    }
    const data = await res.json().catch(() => null)
    topic.value = (Array.isArray(data?.data) ? data.data[0] : data?.data) || data?.topic || null

    if (topic.value) {
      const t = topic.value
      const subject_id = t.subject_id || t.subject?.id
      const grade_id = t.grade_id || t.grade?.id
      
      const warmingPromises = []
      
      if (subject_id) {
        warmingPromises.push(
          api.get(`/api/subjects?q=${encodeURIComponent(subject_id)}`).then(async (subjectRes) => {
            if (subjectRes.ok) {
              const subjectData = await subjectRes.json().catch(() => null)
              if (subjectData?.subjects && Array.isArray(subjectData.subjects)) {
                const foundSubject = subjectData.subjects.find((s: any) => String(s.id) === String(subject_id))
                if (foundSubject && !grade_id) {
                  t.grade_id = foundSubject.grade_id || foundSubject.gradeId
                }
              }
            }
          })
        )
        warmingPromises.push(fetchTopicsBySubject(subject_id))
      }
      
      if (grade_id || t.grade) {
        warmingPromises.push(fetchGrades())
      }
      
      await Promise.all(warmingPromises)
    }
  } catch (e: any) {
    console.error('[fetchTopicDetails] error:', e)
    alert.push({ type: 'error', message: e?.message || String(e) })
  }
}

async function fetchQuizzesForTopic(): Promise<void> {
  try {
    // Use topic ID if available, otherwise fall back to querying by topic slug
    const topicIdToUse = topic.value?.id || slug.value
    const params = new URLSearchParams({ 
      topic_id: String(topicIdToUse),
      per_page: '100'
    })
    const endpoint = `/api/quizzes?${params.toString()}`
    const res = await api.get(endpoint)
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Access denied to fetch quizzes
        alert.push({ type: 'warning', message: 'You do not have permission to view quizzes for this topic.' })
      } else {
        throw new Error('Failed to fetch quizzes for this topic.')
      }
      return
    }
    const data = await res.json().catch(() => null)
    quizzes.value = data?.quizzes || data?.data || []
  } catch (e: any) {
    console.error('[fetchQuizzesForTopic] error:', e)
    alert.push({ type: 'error', message: (e?.message) ? e.message : String(e) })
  }
}

// optionally warm taxonomy caches for related subjects/grades used in the UI
const { fetchLevels, fetchGrades, fetchSubjectsByGrade, fetchTopicsBySubject, subjects, grades, levels } = useTaxonomy()

function navigateToEdit(quizSlug: string | undefined): void {
  if (quizSlug) {
    router.push(`/quiz-master/quizzes/${quizSlug}/edit`)
  }
}

onMounted(async () => {
  loading.value = true
  // Parallelize levels, topic details and quizzes
  // fetchQuizzesForTopic can fall back to using slug.value if topic.value.id isn't ready
  await Promise.all([
    fetchLevels().catch(() => {}),
    fetchTopicDetails(),
    fetchQuizzesForTopic()
  ])
  
  // Setup SEO for topic page
  if (topic.value?.id && topic.value?.slug) {
    seo.setupPageSeo(
      {
        id: topic.value.id,
        name: topic.value.name || 'Topic',
        slug: topic.value.slug,
        description: topic.value.description || topic.value.summary
      },
      'topic',
      config.public.baseUrl
    )
  }
  
  loading.value = false
})
</script>
