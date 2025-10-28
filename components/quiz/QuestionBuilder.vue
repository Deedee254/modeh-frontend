<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Question Modal -->
    <UModal
      v-model="showQuestionModal"
      :prevent-close="isSubmitting"
      class="w-full"
      :ui="{ base: 'mx-2 sm:mx-4 lg:mx-auto', width: 'w-full max-w-xs sm:max-w-2xl lg:max-w-4xl' }"
    >
      <div class="p-3 sm:p-6">
        <h3 class="text-lg font-medium mb-4">{{ editingIndex !== null ? 'Edit' : 'Add' }} Question</h3>
        <QuestionEditorForm
          v-model="questionForm"
          :errors="formErrors"
          @add-option="addOption"
          @remove-option="removeOption"
        />
        <div class="mt-4 sm:mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <UButton
            variant="soft"
            @click="closeQuestionModal"
            :disabled="isSubmitting"
            class="w-full sm:w-auto"
          >Cancel</UButton>
          <UButton
            color="primary"
            @click="saveQuestion"
            :loading="isSubmitting"
            :disabled="isSubmitting || !isQuestionValid"
            class="w-full sm:w-auto"
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
          :errors="(props.errors && element && typeof element.id !== 'undefined') ? props.errors[element.id] : {}"
          @remove="removeQuestion(index)"
          @duplicate="duplicateQuestion(index)"
          @add-option="addOptionToQuestion(index)"
          @remove-option="removeOptionFromQuestion(index, $event)"
        />
      </template>
    </draggable>

    <!-- Empty State -->
    <div v-if="!localQuestions.length" class="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-8 sm:py-12 text-center">
      <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No questions yet</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first question</p>
      <UButton
        size="sm"
        color="primary"
        @click="openQuestionModal"
        :disabled="!canAddQuestion"
      >Add Question</UButton>
    </div>

    <!-- Add Question Button (Below List) -->
    <div v-if="localQuestions.length > 0" class="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <UButton
        size="sm"
        variant="soft"
        @click="openQuestionModal"
        :disabled="!canAddQuestion"
        class="w-full sm:w-auto"
      >
        <i class="fas fa-plus mr-1"></i>
        Add Question
      </UButton>
      <UButton
        size="sm"
        variant="soft"
        @click="showQuestionBankModal = true"
        :disabled="!canAddQuestion"
        class="w-full sm:w-auto"
      >
        <i class="fas fa-database mr-1"></i>
        Question Bank
      </UButton>
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
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { useAppAlert } from '~/composables/useAppAlert'
import QuestionEditor from './QuestionEditor.vue'
import QuestionEditorForm from './QuestionEditorForm.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'

interface Props {
  questions: any[]
  gradeId?: number
  subjectId?: number
  topicId?: number
  disabled?: boolean
  maxQuestions?: number
  errors?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  questions: () => [],
  gradeId: undefined,
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
const formErrors = ref<Record<string, string[]>>({}) // Renamed to avoid confusion with props

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
      return form.answers?.length > 0 && 
             form.answers.every((a: string) => a.trim())
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
    corrects: []
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
  formErrors.value = {}
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
        .filter(c => c !== index)
        .map(c => (c > index ? c - 1 : c))
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
  
  localQuestions.value.push(...toAdd)
  emit('update:questions', localQuestions.value)
  toAdd.forEach(q => {
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