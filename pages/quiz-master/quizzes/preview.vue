<template>
  <div>
    <!-- Page Hero Section -->
    <PageHero
      :title="quiz?.title || 'Quiz Preview'"
      :description="quiz?.description || 'Preview your quiz before publishing'"
      :flush="true"
    >
      <template #eyebrow>
        Quiz Preview
      </template>

      <template #actions>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <ShareButton
            :url="shareUrl"
            class="w-full sm:w-auto"
          />
          <UButton
            size="lg"
            variant="outline"
            class="w-full sm:w-auto text-white border-white/40 hover:bg-white/10"
            to="/quiz-master/quizzes"
          >
            Back to Quizzes
          </UButton>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Created by</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ quiz?.user?.name || 'Quiz Master' }}</p>
          <p class="mt-2 text-sm text-white/70">{{ quiz?.questions_count || 0 }} questions</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </template>
    </PageHero>

    <!-- Questions Preview Section -->
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Question Preview</h2>
          <p class="text-sm text-gray-600 mt-1">Preview of the first {{ previewQuestions.length }} question{{ previewQuestions.length !== 1 ? 's' : '' }} from your quiz</p>
        </div>

        <div class="divide-y divide-gray-200">
          <div
            v-for="(question, index) in previewQuestions"
            :key="question?.uid || index"
            class="p-6"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-brand-700">{{ index + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="prose prose-sm max-w-none">
                  <div v-html="question?.text || question?.body || 'Question text'" class="text-gray-900"></div>
                </div>

                <!-- Question Options/Answers Preview -->
                <div v-if="question?.options && question.options.length > 0" class="mt-4 space-y-2">
                  <div
                    v-for="(option, optIndex) in question.options.slice(0, 4)"
                    :key="optIndex"
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div class="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-500">{{ String.fromCharCode(65 + optIndex) }}</span>
                    </div>
                    <div class="flex-1 text-sm text-gray-700" v-html="option?.text || option"></div>
                  </div>
                  <div v-if="question.options.length > 4" class="text-xs text-gray-500 mt-2">
                    +{{ question.options.length - 4 }} more options...
                  </div>
                </div>

                <!-- Question Type and Metadata -->
                <div class="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span class="px-2 py-1 bg-gray-100 rounded-full capitalize">{{ question?.type || 'multiple-choice' }}</span>
                  <span>Difficulty: {{ getDifficultyLabel(question?.difficulty || 1) }}</span>
                  <span>{{ question?.marks || 1 }} mark{{ (question?.marks || 1) !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="questions.length === 0" class="px-6 py-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
          <p class="mt-1 text-sm text-gray-500">Add some questions to your quiz to see a preview of the first 2 questions.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Quiz } from '~/types'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

// Page meta
definePageMeta({
  layout: 'quiz-master',
  title: 'Quiz Preview',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Preview your quiz before publishing to ensure everything looks correct.' }
  ]
})

// Route and API
const route = useRoute()
const api = useApi()
const alert = useAppAlert()

// Types
interface QuizQuestion {
  uid?: string
  id?: number
  type?: string
  text?: string
  body?: string
  options?: any[]
  difficulty?: number
  marks?: number
}

// Reactive data
const quiz = ref<Quiz | null>(null)
const questions = ref<QuizQuestion[]>([])
const loading = ref(true)

// Computed properties
const shareUrl = computed(() => {
  if (!quiz.value?.slug && !quiz.value?.id) return ''
  const config = useRuntimeConfig()
  // Prefer slug-based public route
  const identifier = quiz.value?.slug || quiz.value?.id
  return `${config.public.baseUrl}/quizzes/${identifier}`
})

const previewQuestions = computed(() => {
  return questions.value.slice(0, 2)
})

// Helper functions
function getDifficultyLabel(difficulty: number): string {
  const labels = ['Easy', 'Medium', 'Hard', 'Expert']
  return labels[difficulty - 1] || 'Medium'
}

// Fetch quiz data
async function fetchQuiz() {
  try {
    loading.value = true
    const quizId = route.params.id

    if (!quizId) {
      alert.push({ type: 'error', message: 'Quiz ID is required' })
      return
    }

    const response = await api.get(`/api/quizzes/${quizId}`)

    if (response.ok) {
      const data = await response.json()
      quiz.value = data.quiz || {}
      questions.value = Array.isArray(data.quiz?.questions) ? data.quiz.questions : []
    } else {
      alert.push({ type: 'error', message: 'Failed to load quiz data' })
    }
  } catch (error) {
    console.error('Error fetching quiz:', error)
    alert.push({ type: 'error', message: 'Failed to load quiz data' })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchQuiz()
})
</script>

<style scoped>
.prose :deep(p) {
  margin: 0;
}

.prose :deep(ul), .prose :deep(ol) {
  margin: 0.5rem 0;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}
</style>
