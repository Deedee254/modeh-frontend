<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Question Modal -->
    <UModal
      v-model="showQuestionModal"
      :prevent-close="isSubmitting"
      :ui="{ width: 'sm:max-w-3xl' }"
    >
      <div class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingIndex !== null ? 'Edit' : 'Add' }} Question</h3>
          <UButton size="sm" variant="ghost" icon="i-heroicons-x-mark" @click="closeQuestionModal" :disabled="isSubmitting" />
        </div>
        <QuestionEditorForm
          v-model="questionForm"
          :gradeId="props.gradeId"
          :levelId="props.levelId"
          :subjectId="props.subjectId"
          :topicId="props.topicId"
          :errors="formErrors"
          @add-option="addOption"
          @remove-option="removeOption"
        />
        <div class="mt-5 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
          <UButton
            size="sm"
            variant="soft"
            @click="closeQuestionModal"
            :disabled="isSubmitting"
            class="w-full sm:w-auto"
          >Cancel</UButton>
          <UButton
            size="sm"
            color="primary"
            @click="saveQuestion"
            :loading="isSubmitting"
            :disabled="isSubmitting || !isQuestionValid"
            icon="i-heroicons-check"
            class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700"
          >{{ editingIndex !== null ? 'Update' : 'Add' }} Question</UButton>
        </div>
      </div>
    </UModal>

    <!-- Questions List -->
    <draggable
      v-model="localQuestions"
      v-bind="dragOptions"
      item-key="id"
      class="space-y-4"
      handle=".drag-handle"
      @end="$emit('update:questions', localQuestions)"
    >
      <template #item="{ element, index }">
        <QuestionEditor
          v-model="localQuestions[index]"
          :index="index"
          :errors="(props.errors && element && typeof element.id !== 'undefined') ? props.errors[element.id] : []"
          @remove="removeQuestion(index)"
          @duplicate="duplicateQuestion(index)"
          @add-option="addOptionToQuestion(index)"
          @remove-option="removeOptionFromQuestion(index, $event)"
        />
      </template>
    </draggable>

    <!-- Empty State -->
    <div v-if="!localQuestions.length" class="bg-white rounded-lg border-2 border-dashed border-gray-200 text-center py-12">
      <Icon name="i-heroicons-clipboard-document-list" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 class="text-base font-medium text-gray-900 mb-1">No questions yet</h3>
      <p class="text-sm text-gray-500 mb-4">Get started by adding your first question</p>
      <UButton
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
        @click="openQuestionModal"
        :disabled="!canAddQuestion"
        class="!bg-brand-600 hover:!bg-brand-700"
      >Add Question</UButton>
    </div>

    <!-- Add Question Button (Below List) -->
    <div v-if="localQuestions.length > 0" class="flex flex-wrap gap-2">
      <UButton
        size="sm"
        variant="soft"
        icon="i-heroicons-plus"
        @click="openQuestionModal"
        :disabled="!canAddQuestion"
        class="flex-1 sm:flex-none"
      >Add Question</UButton>
      <UButton
        size="sm"
        variant="soft"
        icon="i-heroicons-banknotes"
        @click="showQuestionBankModal = true"
        :disabled="!canAddQuestion"
        class="flex-1 sm:flex-none"
      >Question Bank</UButton>
    </div>

    <!-- Question Bank Modal -->
    <QuestionBankModal
      v-model="showQuestionBankModal"
      :grade-id="gradeId"
      :subject-id="subjectId"
      :topic-id="topicId"
      @add="addFromBank"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useAppAlert } from '~/composables/useAppAlert'
import QuestionEditorComp from './QuestionEditor.vue'
import QuestionEditorFormComp from './QuestionEditorForm.vue'
import QuestionBankModalComp from '~/components/bank/QuestionBankModal.vue'

const QuestionEditor = QuestionEditorComp
const QuestionEditorForm = QuestionEditorFormComp
const QuestionBankModal = QuestionBankModalComp

interface Props {
  questions: any[]
  gradeId?: number
  levelId?: number
  subjectId?: number
  topicId?: number
  disabled?: boolean
  maxQuestions?: number
  errors?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  questions: () => [],
  gradeId: undefined,
  levelId: undefined,
  subjectId: undefined,
  topicId: undefined,
  disabled: false,
  maxQuestions: 50,
  errors: () => ({})
})

const emit = defineEmits(['update:questions', 'save-question', 'saved'])
const alert = useAppAlert()

// State
const showQuestionModal = ref(false)
const showQuestionBankModal = ref(false)
const editingIndex = ref<number | null>(null)
const isSubmitting = ref(false)
const questionForm = ref<any>(getDefaultForm())
const localQuestions = ref<any[]>([...props.questions])
const formErrors = ref<any[]>([]) // Form-level errors for the modal (array expected by QuestionEditorForm)

// Watch for external changes to questions
watch(() => props.questions, (newVal) => {
  localQuestions.value = [...newVal]
}, { deep: true })

// Computed
const canAddQuestion = computed(() => localQuestions.value.length < props.maxQuestions)
const dragOptions = computed(() => ({
  disabled: props.disabled,
  animation: 150
}))

const isQuestionValid = computed(() => {
  const form = questionForm.value
  if (!form?.text?.trim()) return false
  
  switch (form.type) {
    case 'mcq':
    case 'multi':
      return form.options?.length >= 2 &&
             form.options.every((o: any) => o.text.trim()) &&
             form.options.some((o: any) => o.is_correct)
    case 'fill_blank':
      return form.options?.length >= 2 &&
             form.options.every((o: any) => o.text.trim()) &&
             form.options.some((o: any) => o.is_correct)
    case 'short':
    case 'numeric':
      return form.answers?.[0]?.trim()
    case 'math':
    case 'code':
      return form.parts?.length > 0 &&
             form.parts.every((p: any) => p.text?.trim())
    default:
      return true
  }
})

// Methods
function getDefaultForm(type = 'mcq') {
  return {
    type,
    text: '',
    explanation: '',
    options: type === 'mcq' || type === 'multi' ? [
      { text: '', is_correct: true },
      { text: '', is_correct: false }
    ] : [],
    answers: [],
    parts: [],
    difficulty: 2,
    marks: 1,
    correct: -1,
    corrects: [],
    grade_id: props.gradeId ?? null,
    level_id: props.levelId ?? null,
    subject_id: props.subjectId ?? null,
    topic_id: props.topicId ?? null
  }
}

function openQuestionModal() {
  if (!canAddQuestion.value) return
  questionForm.value = getDefaultForm()
  editingIndex.value = null
  showQuestionModal.value = true
}

function closeQuestionModal() {
  if (isSubmitting.value) return
  showQuestionModal.value = false
  questionForm.value = getDefaultForm()
  editingIndex.value = null
  formErrors.value = []
}

function addOption() {
  if (questionForm.value.options.length < 6) {
    questionForm.value.options.push({ text: '', is_correct: false })
  }
}



function removeOption(index: number) {
  if (questionForm.value.options.length > 2) {
    questionForm.value.options.splice(index, 1)
    // Adjust correct answer indexes
    if (questionForm.value.correct === index) {
      questionForm.value.correct = -1
    } else if (questionForm.value.correct > index) {
      questionForm.value.correct--
    }
    if (Array.isArray(questionForm.value.corrects)) {
      questionForm.value.corrects = questionForm.value.corrects
        .filter((c: number) => c !== index)
        .map((c: number) => (c > index ? c - 1 : c))
    }
  }
}

function addOptionToQuestion(questionIndex: number) {
  const q = localQuestions.value[questionIndex]
  if (!Array.isArray(q.options)) q.options = []
  if (q.options.length < 6) {
    q.options.push({ text: '', is_correct: false })
    emit('update:questions', localQuestions.value)
  }
}

function removeOptionFromQuestion(questionIndex: number, optionIndex: number) {
  if (localQuestions.value[questionIndex].options.length > 2) {
    localQuestions.value[questionIndex].options.splice(optionIndex, 1)
    emit('update:questions', localQuestions.value)
  }
}

async function saveQuestion() {
  if (!isQuestionValid.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const questionData = JSON.parse(JSON.stringify(questionForm.value))

    // Convert editor's 'text' field to backend's canonical 'body' field
    // Remove 'text' so backend only sees 'body'
    if (questionData.text) {
      questionData.body = questionData.text
      delete questionData.text
    }

    // Ensure answers are properly formatted
    if (!Array.isArray(questionData.answers)) {
      questionData.answers = []
    }

    if (editingIndex.value !== null) {
      localQuestions.value[editingIndex.value] = questionData
    } else {
      localQuestions.value.push(questionData)
    }

    emit('update:questions', localQuestions.value)
    emit('save-question', questionData)
    // Also emit legacy 'saved' event so parent listeners (create.vue) receive the saved question
    try { emit('saved', questionData) } catch (e) {}

    closeQuestionModal()
    alert.push({
      type: 'success',
      message: `Question ${editingIndex.value !== null ? 'updated' : 'added'} successfully!`
    })
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to save question' })
  } finally {
    isSubmitting.value = false
  }
}

function editQuestion(index: number) {
  questionForm.value = JSON.parse(JSON.stringify(localQuestions.value[index]))
  editingIndex.value = index
  showQuestionModal.value = true
}

function removeQuestion(index: number) {
  localQuestions.value.splice(index, 1)
  emit('update:questions', localQuestions.value)
}

function duplicateQuestion(index: number) {
  const original = localQuestions.value[index]
  const copy = JSON.parse(JSON.stringify(original))
  copy.id = undefined // Clear ID for new question
  localQuestions.value.splice(index + 1, 0, copy)
  emit('update:questions', localQuestions.value)
}

function addFromBank(questions: any | any[]) {
  const toAdd = Array.isArray(questions) ? questions : [questions]
  if (localQuestions.value.length + toAdd.length > props.maxQuestions) {
    alert.push({
      type: 'error',
      message: `Cannot add ${toAdd.length} questions. Maximum limit is ${props.maxQuestions}`
    })
    return
  }

  // Normalize answers for added questions
  const normalizedToAdd = toAdd.map(q => {
    const normalized = { ...q }
    if (q.type === 'mcq' && q.correct !== undefined && Array.isArray(q.options)) {
      // Convert legacy correct index to answers array
      const idx = parseInt(q.correct)
      if (!isNaN(idx) && q.options[idx]) {
        normalized.answers = [idx.toString()]
      }
    } else if (q.type === 'multi' && Array.isArray(q.corrects) && q.corrects.length > 0) {
      // Convert legacy corrects array to answers array
      normalized.answers = q.corrects.map((c: any) => c.toString())
    } else if (q.type === 'fill_blank' && Array.isArray(q.corrects) && q.corrects.length > 0 && Array.isArray(q.options)) {
      // For fill_blank, corrects may be strings, convert to indexes
      normalized.answers = q.corrects.map((c: any) => {
        if (typeof c === 'number') return c.toString()
        const idx = q.options.findIndex((o: any) => String(o).trim() === String(c).trim())
        return idx >= 0 ? idx.toString() : c.toString()
      })
    }
    return normalized
  })

  localQuestions.value.push(...normalizedToAdd)
  emit('update:questions', localQuestions.value)
  normalizedToAdd.forEach(q => {
    emit('save-question', q)
    try { emit('saved', q) } catch (e) {}
  })
  showQuestionBankModal.value = false
  alert.push({
    type: 'success',
    message: `Added ${toAdd.length} question${toAdd.length === 1 ? '' : 's'}`
  })
}

// Expose methods for parent components
defineExpose({
  openQuestionModal,
  showQuestionBankModal
})
</script>
