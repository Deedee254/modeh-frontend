<template>
  <div class="mx-auto max-w-xs sm:max-w-2xl lg:max-w-4xl px-2 py-4 sm:px-4 sm:py-6">
    <!-- The localQuestions ref is now directly bound to the store's questions -->
    <div class="bg-white rounded-lg shadow-sm p-3 sm:p-6" v-if="localQuestions">
      <div class="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 class="text-lg font-medium">Questions</h2>
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <UButton 
            size="sm" 
            variant="soft" 
            class="w-full sm:w-auto" 
            @click="$emit('open-bank')"
          >Question Bank</UButton>
          <UButton 
            size="sm" 
            variant="soft" 
            class="w-full sm:w-auto" 
            @click="$emit('preview')"
          >Preview Questions</UButton>
          <UButton 
            size="sm" 
            color="primary" 
            class="w-full sm:w-auto"
            @click="addQuestion"
          >Add Question</UButton>
        </div>
      </div>

      <!-- Question List -->
      <div class="space-y-3 sm:space-y-4">
        <TransitionGroup
          name="list"
          tag="div"
          class="space-y-3 sm:space-y-4"
        >
          <div
            v-for="(q, idx) in localQuestions"
            :key="q.uid || q.id || idx"
            class="group bg-gray-50 rounded-lg p-3 sm:p-4 border border-transparent hover:border-gray-300 transition-colors duration-200"
          >
            <!-- Question Header -->
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
              <div class="flex items-start gap-2 min-w-0">
                <span class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium text-sm">
                  {{ idx + 1 }}
                </span>
                <div class="space-y-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500">
                    <span class="px-2 py-0.5 rounded bg-gray-200 whitespace-nowrap">
                      {{ typeLabels[q.type] || q.type || 'Unknown' }}
                    </span>
                    <span class="hidden sm:inline">•</span>
                    <span class="whitespace-nowrap">{{ q.marks }} {{ q.marks === 1 ? 'mark' : 'marks' }}</span>
                    <span class="hidden sm:inline">•</span>
                    <span class="whitespace-nowrap">{{ q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard' }}</span>
                  </div>
                </div>
              </div>

              <!-- Validation Errors -->
              <div v-if="questionValidationErrors[q.uid] && questionValidationErrors[q.uid].length > 0" class="mt-2 text-xs text-red-500 space-y-1">
                <div v-for="(error, errorIdx) in questionValidationErrors[q.uid]" :key="errorIdx" class="flex items-start gap-1.5">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <UButton size="xs" variant="ghost" @click="duplicateQuestion(idx)" title="Duplicate"><span class="sr-only">Duplicate</span><i class="fas fa-copy"></i></UButton>
                <UButton size="xs" variant="ghost" color="red" @click="removeQuestion(idx)" title="Delete"><span class="sr-only">Delete</span><i class="fas fa-trash"></i></UButton>
                <button class="p-1 text-gray-400 hover:text-gray-600" @click="q.open = !q.open" :aria-label="q.open ? 'Collapse question' : 'Expand question'"><i :class="['fas', q.open ? 'fa-chevron-up' : 'fa-chevron-down']"></i></button>
              </div>
            </div>

            <!-- Question Content -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 max-h-0 overflow-hidden"
              leave-to-class="opacity-0 max-h-0 overflow-hidden"
            >
              <div v-show="q.open" class="space-y-4">
                <QuestionEditor 
                  v-model="localQuestions[idx]"
                  :index="idx"
                  :errors="errors[q.uid]"
                  @add-option="addOption(idx)"
                  @remove-option="removeOption(idx, $event)"
                  @duplicate="duplicateQuestion(idx)"
                  @remove="removeQuestion(idx)"
                />
              </div>
            </Transition>
          </div>
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div 
        v-if="!localQuestions.length"
        class="text-center py-8 sm:py-12"
      >
        <div class="text-gray-400 mb-3">
          <i class="fas fa-clipboard-list text-3xl sm:text-4xl"></i>
        </div>
        <h3 class="text-base font-medium text-gray-900">No questions yet</h3>
        <p class="text-sm text-gray-500 mb-4">Get started by adding your first question</p>
        <UButton
          size="sm"
          color="primary"
          @click="addQuestion"
        >Add Question</UButton>
      </div>
    </div>

    <!-- Question Summary -->
    <div class="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-3 sm:p-6">
      <h3 class="text-base font-medium mb-3 sm:mb-4">Quiz Summary</h3>
      <div class="grid grid-cols-3 gap-2 sm:gap-4">
        <div>
          <div class="text-xs sm:text-sm text-gray-500">Total Questions</div>
          <div class="text-xl sm:text-2xl font-medium">{{ localQuestions.length }}</div>
        </div>
        
        <div>
          <div class="text-xs sm:text-sm text-gray-500">Total Marks</div>
          <div class="text-xl sm:text-2xl font-medium">
            {{ localQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) }}
          </div>
        </div>

        <div>
          <div class="text-xs sm:text-sm text-gray-500">Avg Difficulty</div>
          <div class="text-xl sm:text-2xl font-medium">{{ averageDifficulty.label }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-4 sm:mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-3">
      <UButton size="sm" variant="soft" @click="$emit('prev')" class="w-full sm:w-auto">Back to Settings</UButton>
      <UButton size="sm" color="primary" @click="handlePublish" :loading="publishing" class="w-full sm:w-auto">Publish Quiz</UButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, toRef } from 'vue'
import QuestionEditor from './QuestionEditor.vue'
import { useCreateQuizStore } from '~/stores/createQuizStore'

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

const typeLabels = {
  mcq: 'Multiple Choice',
  multi: 'Multiple Select',
  short: 'Short Answer',
  numeric: 'Numeric Answer',
  fill_blank: 'Fill in the Blanks',
  math: 'Math / Multipart',
  code: 'Code Answer',
}

// Methods
function addQuestion() {
  // Use the new store action which handles normalization
  store.addQuestion()
}

function removeQuestion(idx) {
  localQuestions.value.splice(idx, 1)
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
  const question = localQuestions.value[idx]
  if (question.options && question.options.length > 2) {
    question.options.splice(optIdx, 1)
    // Also adjust correct answer indexes
    if (question.type === 'mcq') {
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

function getQuestionValidationErrors(question) {
  const errors = [];
  if (!question) {
    errors.push('Question data is missing.');
    return errors;
  }

  if (!question.text?.trim() || question.text === '<p></p>') {
    errors.push('Question text cannot be empty.');
  }
  if (!question.type) {
    errors.push('A question type must be selected.');
  }

  // Validate marks and difficulty
  if (!question.marks || question.marks < 1) {
    errors.push('Marks must be at least 1.');
  }
  if (!question.difficulty || question.difficulty < 1 || question.difficulty > 3) {
    errors.push('A difficulty level must be set.');
  }

  // Validate based on question type
  switch (question.type) {
    case 'mcq':
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push('MCQ questions require at least 2 options.');
      }
      if (!Array.isArray(question.answers) || question.answers.length !== 1 || 
          Number(question.answers[0]) < 0 || Number(question.answers[0]) >= (question.options?.length || 0)) {
        errors.push('A correct option must be selected for MCQ.');
      }
      break;
    case 'multi':
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push('Multiple select questions require at least 2 options.');
      }
      if (!Array.isArray(question.answers) || question.answers.length === 0 || 
          !question.answers.every(idx => Number(idx) >= 0 && Number(idx) < (question.options?.length || 0))) {
        errors.push('At least one valid correct option must be selected for multiple select.');
      }
      break;
    case 'fill_blank':
    case 'short':
    case 'numeric':
      if (!Array.isArray(question.answers) || question.answers.length === 0 || !question.answers.some(a => String(a).trim())) {
        errors.push('At least one answer must be provided.');
      }
      break;
  }
  return errors;
}
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
</script>