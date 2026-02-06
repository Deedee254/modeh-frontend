<template>
  <div class="space-y-4">
    <!-- Header with Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Questions</h2>
        <p class="text-sm text-gray-500 mt-0.5">{{ localQuestions.length }} question{{ localQuestions.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-banknotes"
          @click="$emit('open-bank')"
        >Bank</UButton>
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-eye"
          @click="$emit('preview')"
        >Preview</UButton>
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-arrow-up-tray"
          @click.prevent="showImportModal = true"
        >Import</UButton>
        <UButton
          size="sm"
          color="primary"
          icon="i-heroicons-plus"
          @click="addQuestion"
          class="!bg-brand-600 hover:!bg-brand-700"
        >Add Question</UButton>
      </div>
    </div>

    <!-- Question Editor Modal -->
    <UModal v-model="showEditorModal" :ui="{ width: 'sm:max-w-3xl' }">
      <div class="p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Edit Question</h3>
          <div class="text-sm text-gray-500">Question {{ editingIndex + 1 }}</div>
        </div>
        <div class="space-y-4">
          <QuestionEditorForm v-model="editorModel" :errors="modalErrors" @add-option="() => {}" />
          <div class="flex justify-end gap-2">
            <UButton size="sm" variant="soft" @click="showEditorModal = false">Cancel</UButton>
            <UButton size="sm" color="primary" :loading="savingQuestion" @click="saveEditedQuestion" class="!bg-brand-600 hover:!bg-brand-700">Save</UButton>
          </div>
        </div>
      </div>
    </UModal>

    <!-- Delete confirmation modal -->
    <UModal v-model="showDeleteConfirm" :ui="{ width: 'sm:max-w-md' }">
      <div class="p-4 sm:p-6">
        <h3 class="text-lg font-semibold mb-2">Delete question</h3>
        <p class="text-sm text-gray-600 mb-4">Are you sure you want to delete this question? This action cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <UButton size="sm" variant="soft" @click="showDeleteConfirm = false">Cancel</UButton>
          <UButton size="sm" color="red" @click="performDeleteQuestion">Delete</UButton>
        </div>
      </div>
    </UModal>
    <ImportQuestionsModal v-model="showImportModal" @imported="onImported" />

    <!-- Question List -->
    <div v-if="localQuestions.length" class="space-y-2">
      <TransitionGroup
        name="list"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="(q, idx) in localQuestions"
          :key="q.uid || q.id || idx"
          :data-question-uid="q.uid"
          class="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-150"
        >
          <!-- Question Header -->
          <div class="flex items-center gap-3 p-3 border-b border-gray-100">
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-brand-600/10 text-brand-600 font-semibold text-sm">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <UBadge color="gray" variant="subtle" size="xs">{{ typeLabels[q.type] || q.type || 'Unknown' }}</UBadge>
                <span class="text-gray-400">•</span>
                <span class="text-gray-600">{{ q.marks }} {{ q.marks === 1 ? 'mark' : 'marks' }}</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-600">{{ q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard' }}</span>
              </div>
              <!-- Validation Errors -->
              <div v-if="questionValidationErrors[q.uid] && questionValidationErrors[q.uid].length > 0" class="mt-1.5 flex items-start gap-1.5">
                <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                </svg>
                <div class="text-xs text-red-600 space-y-0.5">
                  <div v-for="(error, errorIdx) in questionValidationErrors[q.uid]" :key="errorIdx">{{ error }}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <UButton size="xs" variant="ghost" @click="duplicateQuestion(idx)" icon="i-heroicons-document-duplicate" />
              <UButton size="xs" variant="ghost" color="red" @click="confirmDeleteQuestion(idx)" icon="i-heroicons-trash" />
              <UButton size="xs" variant="ghost" color="gray" @click="openEditor(idx)" icon="i-heroicons-pencil" />
            </div>
          </div>

          <!-- Question Content -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <div v-show="q.open" class="p-3">
              <div class="prose max-w-none text-sm text-gray-700">
                <!-- Use backend 'body' only for rendering question HTML -->
                <div v-html="(q.body || '')"></div>
              </div>
            </div>
          </Transition>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div 
      v-else
      class="bg-white rounded-lg border-2 border-dashed border-gray-200 text-center py-12"
    >
      <div class="text-gray-400 mb-3">
        <Icon name="i-heroicons-clipboard-document-list" class="w-12 h-12 mx-auto" />
      </div>
      <h3 class="text-base font-medium text-gray-900 mb-1">No questions yet</h3>
      <p class="text-sm text-gray-500 mb-4">Get started by adding your first question</p>
      <UButton
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
        @click="addQuestion"
        class="!bg-brand-600 hover:!bg-brand-700"
      >Add Question</UButton>
    </div>

    <!-- Import errors modal -->
    <UModal v-model="showImportErrorsModal" :ui="{ width: 'sm:max-w-2xl' }">
      <div class="p-4 sm:p-6">
        <h3 class="text-lg font-semibold mb-4">Import Errors</h3>
        <div v-if="importErrors.length === 0" class="text-sm text-gray-600">No errors</div>
        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div v-for="(e, idx) in importErrors" :key="idx" class="border border-red-200 rounded-lg p-3 bg-red-50">
            <div class="text-sm font-medium text-red-700 mb-1">Row {{ e.row }}</div>
            <ul class="list-disc list-inside text-sm text-red-600 space-y-0.5">
              <li v-for="(m, i2) in e.errors" :key="i2">{{ m }}</li>
            </ul>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <UButton size="sm" variant="soft" @click="showImportErrorsModal = false">Close</UButton>
        </div>
      </div>
    </UModal>

    <!-- Quiz Summary -->
    <div v-if="localQuestions.length" class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-xs text-gray-500 mb-1">Total Questions</div>
          <div class="text-2xl font-semibold text-gray-900">{{ localQuestions.length }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Total Marks</div>
          <div class="text-2xl font-semibold text-gray-900">
            {{ localQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Avg Difficulty</div>
          <div class="text-2xl font-semibold text-gray-900">{{ averageDifficulty.label }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
      <UButton size="sm" variant="soft" icon="i-heroicons-arrow-left" @click="$emit('prev')" class="w-full sm:w-auto">Back to Settings</UButton>
      <UButton size="sm" color="primary" icon="i-heroicons-check" @click="handlePublish" :loading="publishing" class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700">Publish Quiz</UButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, toRef, nextTick } from 'vue'
import QuestionEditorForm from './QuestionEditorForm.vue'
import { useCreateQuizStore } from '~/stores/createQuizStore'
import { useAppAlert } from '~/composables/useAppAlert'
import ImportQuestionsModal from '~/components/quiz/ImportQuestionsModal.vue'
import { getQuestionValidationErrors } from '~/composables/useQuestionValidation'
import useApi from '~/composables/useApi'

const props = defineProps({
  errors: {
    type: Object,
    default: () => ({})
  },
  saving: {
    type: Boolean,
    default: false
  }
  ,
  publishing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'publish', 'prev', 'open-bank', 'preview'])

const store = useCreateQuizStore()
// Use a ref to the store's questions array directly.
// The `modelValue` prop is no longer needed for questions.
const localQuestions = toRef(store, 'questions')

// Use store.questions as the source of truth
const alert = useAppAlert()
  const showImportModal = ref(false)
  // showImportErrorsModal and importErrors are used by the errors modal below
  const showImportErrorsModal = ref(false)
  const importErrors = ref([])

function onImported(payload) {
  // Show summary from ImportQuestionsModal (it adds questions to store)
  try { if (payload && payload.created) alert.push({ type: 'success', message: `Imported ${payload.created} question(s).` }) } catch (e) {}
  if (payload && payload.errors && payload.errors.length) {
    importErrors.value = payload.errors
    showImportErrorsModal.value = true
  }
}

// import/parsing helpers moved to `ImportQuestionsModal.vue`

const typeLabels = {
  mcq: 'Multiple Choice',
  multi: 'Multiple Select',
  short: 'Short Answer',
  numeric: 'Numeric Answer',
  fill_blank: 'Fill in the Blanks',
  math: 'Math / Multipart',
  code: 'Code Answer',
}

function addQuestion() {
  // Open editor modal for a new question (user can save to persist)
  editingIndex.value = -1
  editorModel.value = {
    uid: Math.random().toString(36).substring(2),
    type: 'mcq',
    text: '<p></p>',
    marks: 1,
    difficulty: 2,
    options: [ '', '' ],
    answers: []
  }
  showEditorModal.value = true
}

function removeQuestion(idx) {
  localQuestions.value.splice(Number(idx), 1)
}

function duplicateQuestion(idx) {
  const original = localQuestions.value[idx]
  // Use the store action to add a normalized copy
  store.addQuestion(original)
}

function addOption(idx) {
  const question = localQuestions.value[idx]
  if (!question.options) question.options = []
  question.options.push('')
  // No emit needed here, watch will catch it
}

function removeOption(idx, optIdx) {
  const question = localQuestions.value[Number(idx)]
  if (question.options && question.options.length > 2) {
    question.options.splice(Number(optIdx), 1)
    // Adjust answers array (which uses string indexes)
    if (Array.isArray(question.answers)) {
      const optIdxStr = String(optIdx)
      // Remove the deleted option index
      question.answers = question.answers
        .filter(a => a !== optIdxStr)
        .map(a => {
          const num = Number(a)
          if (!isNaN(num) && num > optIdx) {
            // Decrement indexes that come after the removed option
            return String(num - 1)
          }
          return a
        })
    }
    // Legacy support for correct/corrects fields
    if (question.type === 'mcq' && typeof question.correct !== 'undefined') {
      if (question.correct === optIdx) {
        question.correct = -1
      } else if (question.correct > optIdx) {
        question.correct--
      }
    }
    if (Array.isArray(question.corrects)) {
      question.corrects = question.corrects
        .filter(c => c !== optIdx)
        .map(c => (c > optIdx ? c - 1 : c))
    }
  }
}

function handlePublish() {
  if (canPublish.value) {
    emit('publish');
    return;
  }

  // Find the first question with validation errors
  const firstInvalidQuestion = localQuestions.value.find(q => questionValidationErrors.value[q.uid]);
  if (firstInvalidQuestion) {
    // Find the corresponding DOM element using a data attribute
    const element = document.querySelector(`[data-question-uid="${firstInvalidQuestion.uid}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally, briefly highlight the element
      element.classList.add('ring-2', 'ring-red-400', 'ring-offset-2');
      setTimeout(() => element.classList.remove('ring-2', 'ring-red-400', 'ring-offset-2'), 2000);
    }
  }
}

// validation moved to shared composable `useQuestionValidation`
// Computed
const averageDifficulty = computed(() => {
  if (!localQuestions.value.length) return { avg: 0, label: 'N/A' }
  const sum = localQuestions.value.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  const avg = +(sum / localQuestions.value.length).toFixed(2)
  const label = avg <= 1.6 ? 'Easy' : avg <= 2.3 ? 'Medium' : 'Hard'
  return { avg, label }
})

const questionValidationErrors = computed(() => {
  const errorMap = {};
  for (const q of localQuestions.value) {
    const errors = getQuestionValidationErrors(q);
    if (errors.length > 0) {
      errorMap[q.uid] = errors;
    }
  }
  return errorMap;
});

const canPublish = computed(() => {
  return (
    localQuestions.value.length > 0 &&
    Object.keys(props.errors).length === 0 &&
    Object.keys(questionValidationErrors.value).length === 0
  );
})

// Editor modal state
const showEditorModal = ref(false)
const editingIndex = ref(-1)
const editorModel = ref(null)
const savingQuestion = ref(false)
const showDeleteConfirm = ref(false)
const deleteIndex = ref(-1)

const api = useApi()

function openEditor(idx) {
  editingIndex.value = idx
  // Deep clone to avoid mutating list until saved
  editorModel.value = JSON.parse(JSON.stringify(localQuestions.value[idx] || {}))
  showEditorModal.value = true
}

const modalErrors = computed(() => {
  try {
    const uid = editorModel.value?.uid
    return (uid && store.questionsErrors && store.questionsErrors[uid]) ? store.questionsErrors[uid] : []
  } catch (e) { return [] }
})

async function saveEditedQuestion() {
  if (!editorModel.value) return
  savingQuestion.value = true
  try {
    // Prevent saving a new question if quiz has not been created yet
    if (!store.quizId && !editorModel.value?.id) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return
    }

    // Call store saveQuestion which handles API and merges returned data
    await store.saveQuestion(editorModel.value)

    // Success: show toast, close modal, and scroll to the question
    alert.push({ type: 'success', message: 'Question saved' })
    showEditorModal.value = false

    // Wait for DOM update then find the saved question and scroll/highlight it
    await nextTick()
    const uid = editorModel.value?.uid
    let selector = uid ? `[data-question-uid="${uid}"]` : null
    // If uid didn't work, try to match by id (server-assigned)
    if (!selector && editorModel.value?.id) selector = `[data-question-id="${editorModel.value.id}"]`
    if (selector) {
      // locate element and ensure it is visible
      const el = document.querySelector(selector) || null
      if (el && el instanceof HTMLElement) {
        // Expand the question if collapsed
        try {
          const idxAttr = el.getAttribute('data-question-uid')
          // find question object and set open = true
          const q = store.questions.find(qi => qi.uid === uid || (editorModel.value?.id && qi.id === editorModel.value.id))
          if (q) q.open = true
        } catch (e) {}
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-offset-2', 'ring-green-300')
        setTimeout(() => el.classList.remove('ring-2', 'ring-offset-2', 'ring-green-300'), 2200)
      }
    }
  } catch (e) {
    // Let store.questionsErrors populate; also show a generic toast
    try { alert.push({ type: 'error', message: e.message || 'Failed to save question' }) } catch (err) {}
  } finally {
    savingQuestion.value = false
  }
}

function confirmDeleteQuestion(idx) {
  deleteIndex.value = idx
  showDeleteConfirm.value = true
}

async function performDeleteQuestion() {
  const idx = deleteIndex.value
  if (idx === -1) return
  const q = localQuestions.value[idx]
  try {
    if (q && q.id) {
      const res = await api.del(`/api/questions/${q.id}`)
      if (!res.ok) {
        const txt = await res.text().catch(() => null)
        throw new Error(txt || `Delete failed with status ${res.status}`)
      }
    }
    // Remove from local questions
    localQuestions.value.splice(idx, 1)
    showDeleteConfirm.value = false
    deleteIndex.value = -1
  } catch (e) {
    try { alert.push({ type: 'error', message: e.message || 'Failed to delete question' }) } catch (err) {}
  }
}
</script>
