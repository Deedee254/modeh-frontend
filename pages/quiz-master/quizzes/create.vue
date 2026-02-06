<template>
  <div class="bg-gray-50 pb-16 md:pb-0">
    <div class="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col items-start justify-between gap-2 mb-4 md:flex-row md:items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Create Quiz</h1>
          <p class="text-sm text-gray-500 mt-0.5">Multi-step wizard for quiz creation</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <nav class="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm mb-4">
        <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          <button
            v-for="tab in tabConfig"
            :key="tab.key"
            @click="store.setTab(tab.key)"
            :class="[
              'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all',
              store.activeTab === tab.key 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span>{{ tab.label }}</span>
            <ClientOnly>
              <Icon 
                v-if="(tab.key === 'details' && store.detailsSaved) || (tab.key === 'settings' && store.settingsSaved) || (tab.key === 'questions' && store.questionsSaved)" 
                name="i-heroicons-check-circle" 
                class="h-4 w-4" 
              />
            </ClientOnly>
          </button>
        </div>
      </nav>

      <!-- Content Container -->
      <div class="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <!-- Details Tab -->
        <ClientOnly>
          <QuizDetailsStepForm
            ref="quizDetailsFormRef"
            v-if="store.activeTab === 'details'"
            v-model="store.quiz"
            :levels="levels"
            :grades="grades"
            :subjects="subjects"
            :topics="topics"
            :errors="store.detailsErrors"
            :saving="store.isSubmitting"
            
            @create-topic="showTopicModal = true"
            @save="onSaveDetails"
            @next="onDetailsNext"
          />

          <!-- Settings Tab -->
          <QuizSettingsStepForm
            v-else-if="store.activeTab === 'settings'"
            :model-value="store.quiz"
            :errors="store.settingsErrors"
            :saving="store.isSubmitting"
            @update:modelValue="(v: any) => (store.quiz = v)"
            @save="onSaveSettings"
            @prev="() => store.setTab('details')"
            @next="() => store.setTab('questions')"
          />

          <!-- Questions Tab -->
          <QuizQuestionsSimplified
            v-else
            :subject-id="(store.quiz?.subject_id as any) ?? undefined"
            :topic-id="(store.quiz?.topic_id as any) ?? undefined"
            :grade-id="(store.quiz?.grade_id as any) ?? undefined"
            :level-id="(store.quiz?.level_id as any) ?? undefined"
            :publishing="store.isSubmitting"
            @preview="showPreviewModal = true"
            @open-bank="showQuestionBank = true"
            @open-import="showImportModal = true"
            @prev="() => store.setTab('settings')"
            @publish="onPublish"
          />
        </ClientOnly>
      </div>

      <!-- Modals -->
      <ClientOnly>
        <CreateTopicModal
          :model-value="showTopicModal"
          :grades="grades"
          :subjects="subjects"
          :defaultLevelId="(store.quiz?.level_id as any) ?? undefined"
          :defaultGradeId="(store.quiz?.grade_id as any) ?? undefined"
          :defaultSubjectId="(store.quiz?.subject_id as any) ?? undefined"
          @update:modelValue="(v: any) => (showTopicModal = v)"
          @created="onTopicCreated"
        />

        <QuestionBankModal
          :model-value="showQuestionBank"
          :gradeOptions="grades"
          :subjectOptions="subjects"
          :topicOptions="topics"
          :levelOptions="levels"
          :initialFilters="{
            level: store.quiz?.level_id ?? null,
            grade: store.quiz?.grade_id ?? null,
            subject: store.quiz?.subject_id ?? null,
            topic: store.quiz?.topic_id ?? null
          }"
          @update:modelValue="(v: any) => (showQuestionBank = v)"
          @add="onAddFromBank"
        />

        <ImportQuestionsModal
          :model-value="showImportModal"
          :quiz-id="(store.quiz?.id as any) ?? null"
          :topic-id="(store.quiz?.topic_id as any) ?? null"
          @update:modelValue="(v: any) => (showImportModal = v)"
          @imported="onQuestionsImported"
        />

        <!-- Import Errors Modal -->
        <UModal v-model="showImportErrorsModal" :ui="{ width: 'sm:max-w-2xl' }">
          <div class="p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-semibold">Import errors</h3>
            </div>
            <div class="space-y-3 max-h-72 overflow-auto">
              <div v-if="!importErrors || importErrors.length === 0" class="text-sm text-gray-600">No import errors.</div>
              <div v-for="(e, idx) in importErrors" :key="idx" class="bg-white border border-red-200 rounded p-3">
                <div class="text-sm font-medium text-red-700 mb-1">Row {{ e.row }}</div>
                <ul class="list-disc list-inside text-sm text-red-600 space-y-0.5">
                  <li v-for="(m, i2) in e.errors" :key="i2">{{ m }}</li>
                </ul>
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <UButton size="sm" variant="soft" @click="showImportErrorsModal = false">Close</UButton>
            </div>
          </div>
        </UModal>

        <QuizPayloadPreviewModal
          :model-value="showPreviewModal"
          :quiz="store.quiz"
          :questions="store.questions"
          :publishing="store.isSubmitting"
          :publish-error="store.publishError ?? undefined"
          @update:modelValue="(v: any) => (showPreviewModal = v)"
          @edit-section="(section: any) => { store.setTab(section); showPreviewModal = false }"
          @publish="onPublishConfirmed"
        />

        <!-- Success Modal -->
        <UModal v-model="showCreatedModal" :ui="{ width: 'sm:max-w-xl' }">
          <div class="p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-semibold">Quiz created</h3>
            </div>
            <div class="space-y-4">
              <div>
                <div class="text-xl font-bold">{{ (createdPayload as any)?.title || store.quiz?.title || '' }}</div>
                <div class="text-sm text-gray-600">{{ (createdPayload as any)?.description || store.quiz?.description || '' }}</div>
                <div class="text-sm text-gray-500">Topic: {{ (createdPayload as any)?.topic?.name || store.quiz?.topic?.name || store.quiz?.topic_id || '—' }}</div>
                <div class="text-sm text-gray-500">Questions: {{ store.questions.length }}</div>
              </div>
              <div class="flex justify-end gap-2">
                <UButton variant="soft" @click="showCreatedModal = false">Continue editing</UButton>
                <UButton color="primary" @click="onViewQuiz" class="!bg-brand-600 hover:!bg-brand-700">View</UButton>
                <UButton color="gray" variant="ghost" @click="onEditQuiz">Edit</UButton>
              </div>
            </div>
          </div>
        </UModal>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreateQuizStore } from '~/stores/createQuizStore'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAppAlert } from '~/composables/useAppAlert'
import QuizDetailsStepForm from '~/components/quiz/QuizDetailsStepForm.vue'
import QuizSettingsStepForm from '~/components/quiz/QuizSettingsStepForm.vue'
import QuizQuestionsSimplified from '~/components/quiz/QuizQuestionsSimplified.vue'
import QuizPayloadPreviewModal from '~/components/quiz/QuizPayloadPreviewModal.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'
import ImportQuestionsModal from '~/components/quiz/ImportQuestionsModal.vue'

// Page meta
definePageMeta({
  layout: 'quiz-master',
  title: 'Create quiz',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Create a new quiz as a quiz-master — add questions, settings and publish options.' },
  ],
})

// Store and composition functions
const store = useCreateQuizStore()
const route = useRoute()
const router = useRouter()
const alert = useAppAlert()

// Taxonomy data
const {
  levels,
  grades,
  subjects,
  topics,
  fetchLevels,
  fetchGrades,
  fetchSubjectsPage,
  fetchTopicsPage,
  fetchSubjectsByGrade,
  fetchTopicsBySubject,
  fetchAllSubjects,
  addTopic,
  addSubject,
} = useTaxonomy()

// UI state
const showTopicModal = ref(false)
const showQuestionBank = ref(false)
const showImportModal = ref(false)
const importErrors = ref<any[]>([])
const showImportErrorsModal = ref(false)
const showPreviewModal = ref(false)
const showCreatedModal = ref(false)
const createdPayload = ref(null)
const quizDetailsFormRef = ref<InstanceType<typeof QuizDetailsStepForm> | null>(null)

// Tab configuration
const tabConfig = [
  { key: 'details', label: 'Details', savedFlag: 'detailsSaved' },
  { key: 'settings', label: 'Settings', savedFlag: 'settingsSaved' },
  { key: 'questions', label: 'Questions', savedFlag: 'questionsSaved' },
]

// Save details handler
const onSaveDetails = async () => {
  try {
    const ok = await store.saveDetails()
    if (ok) {
      alert.push({ type: 'success', message: 'Quiz details saved' })
      store.setTab('settings')
    } else {
      alert.push({
        type: 'error',
        message: 'Failed to save details. Please check for errors and try again.',
      })
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error: ${e?.message || 'Unknown error'}` })
  }
}

// Details step - move to settings
const onDetailsNext = async () => {
  try {
    const ok = await store.saveDetails()
    if (ok) {
      store.setTab('settings')
    } else {
      alert.push({
        type: 'warning',
        message: 'Please complete all required fields',
      })
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error: ${e?.message || 'Unknown error'}` })
  }
}

// Save settings handler
const onSaveSettings = async () => {
  try {
    const ok = await store.saveSettings()
    if (ok) {
      alert.push({ type: 'success', message: 'Quiz settings saved' })
      store.setTab('questions')
    } else {
      alert.push({
        type: 'error',
        message: 'Failed to save settings. Please check for errors and try again.',
      })
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error: ${e?.message || 'Unknown error'}` })
  }
}

// Topic creation handler
const onTopicCreated = async (topic: any) => {
  try {
    // Optimization: Add topic directly to taxonomy instead of refetching
    addTopic(topic)
    
    store.quiz.topic_id = topic.id
    showTopicModal.value = false
    
    // Update the TaxonomyFlowPicker with the new topic
    if (quizDetailsFormRef.value && typeof quizDetailsFormRef.value.handleTopicCreated === 'function') {
      quizDetailsFormRef.value.handleTopicCreated(topic)
    }
    
    alert.push({ type: 'success', message: 'Topic created' })
  } catch (e: any) {
    alert.push({ type: 'error', message: `Failed to update local state: ${e?.message || 'Unknown error'}` })
  }
}

// Add questions from bank
const onAddFromBank = async (questions: any[]) => {
  try {
    for (const q of questions) {
      await store.addQuestion(q)
    }
    showQuestionBank.value = false
    alert.push({ type: 'success', message: `${questions.length} question(s) added` })
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error adding questions: ${e?.message || 'Unknown error'}` })
  }
}

// Handle imported questions: accepts either a summary ({created, errors})
// or raw question object(s). Avoid double-adding if modal already pushed to store.
const onQuestionsImported = async (payload: any) => {
  try {
    // If payload looks like the modal's summary (has created/errors), assume
    // the modal already added the questions to the store and just show toast
    if (payload && (typeof payload.created === 'number' || Array.isArray(payload?.errors))) {
      showImportModal.value = false
      if (payload.created) alert.push({ type: 'success', message: `Imported ${payload.created} question(s).` })
      if (payload.errors && payload.errors.length) {
        importErrors.value = payload.errors
        showImportErrorsModal.value = true
      }
      return
    }

    // Otherwise treat payload as question(s) and add them to the store
    const questions = Array.isArray(payload) ? payload : [payload]
    for (const q of questions) {
      if (q) await store.addQuestion(q)
    }
    showImportModal.value = false
    alert.push({ type: 'success', message: `${questions.length} question(s) imported` })
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error importing questions: ${e?.message || 'Unknown error'}` })
  }
}

// Publish with preview confirmation
const onPublish = async () => {
  showPreviewModal.value = true
}

// Final publish after preview confirmation
const onPublishConfirmed = async () => {
  try {
    const ok = await store.submitFinalPayload()
    if (ok) {
      const result = store.lastCreated || { id: store.quizId }
      createdPayload.value = result
      showPreviewModal.value = false
      showCreatedModal.value = true
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: `Error publishing quiz: ${e?.message || 'Unknown error'}` })
  }
}

// Navigate to view quiz (slug-only)
const onViewQuiz = () => {
  showCreatedModal.value = false
  const payload = (createdPayload.value as any) || {}
  const slug = payload.slug || store.quiz?.slug || null
  if (slug) {
    router.push(`/quiz-master/quizzes/${slug}`)
  } else {
    alert.push({ type: 'warning', message: 'Quiz slug unavailable — opening quizzes list' })
    router.push('/quiz-master/quizzes')
  }
}

// Navigate to edit quiz (slug-only)
const onEditQuiz = () => {
  showCreatedModal.value = false
  const payload = (createdPayload.value as any) || {}
  const slug = payload.slug || store.quiz?.slug || null
  if (slug) {
    router.push(`/quiz-master/quizzes/${slug}/edit`)
  } else {
    alert.push({ type: 'warning', message: 'Quiz slug unavailable — opening quizzes list' })
    router.push('/quiz-master/quizzes')
  }
}

// Page lifecycle
onMounted(async () => {
  try {
    // Load taxonomy data and quiz in parallel
    const quizId = route.query.id || route.query.slug
    const promises: Promise<any>[] = [fetchLevels(), fetchGrades()]
    
    if (quizId) {
      promises.push(store.loadQuiz(quizId))
    }
    
    await Promise.all(promises)

    // Handle editing existing quiz
    if (quizId) {
      // After loading the quiz object into the store, preload subjects/topics
      try {
        const q = store.quiz || {}
        const levelId = q?.level_id ?? q?.level?.id ?? null
        const gradeId = q?.grade_id ?? q?.grade?.id ?? null
        const subjectId = q?.subject_id ?? q?.subject?.id ?? null
        const topicId = q?.topic_id ?? q?.topic?.id ?? null

        const preloads = []
        // If we have a grade, fetch subjects filtered by grade (and level if present).
        if (gradeId) {
          preloads.push(fetchSubjectsByGrade(gradeId, levelId).catch(() => 
            fetchSubjectsPage({ gradeId, page: 1, perPage: 50, q: '' })
          ))
        } else {
          // no grade specified: fetch all subjects so the picker can show the saved subject
          preloads.push(fetchAllSubjects())
        }

        // If we have a subject, fetch topics for that subject
        if (subjectId) {
          preloads.push(fetchTopicsBySubject(subjectId).catch(() => 
            fetchTopicsPage({ subjectId, page: 1, perPage: 50, q: '' })
          ))
        }
        
        await Promise.all(preloads)

        // Ensure the loaded subject/topic objects are present in the shared lists
        if (subjectId && !subjects.value.find((s: any) => String(s.id) === String(subjectId))) {
          addSubject({ id: subjectId })
        }
        if (topicId && !topics.value.find((t: any) => String(t.id) === String(topicId))) {
          addTopic(q.topic || { id: topicId })
        }
      } catch (e: any) {
        // Failed to preload taxonomy for edit mode
      }
    } else {
      store.reset()
    }
  } catch (e: any) {
    alert.push({ type: 'error', message: `Failed to load page: ${e?.message || 'Unknown error'}` })
  }
})
</script>
