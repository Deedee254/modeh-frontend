<template>
  <div class="mx-auto max-w-xs sm:max-w-2xl lg:max-w-4xl px-2 py-4 sm:px-4 sm:py-6">
    <div class="bg-white rounded-lg shadow-sm p-3 sm:p-6">
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
            v-for="(q, idx) in modelValue"
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
                  v-model="modelValue[idx]"
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
        v-if="!modelValue.length"
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
          <div class="text-xl sm:text-2xl font-medium">{{ modelValue.length }}</div>
        </div>
        
        <div>
          <div class="text-xs sm:text-sm text-gray-500">Total Marks</div>
          <div class="text-xl sm:text-2xl font-medium">
            {{ modelValue.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) }}
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
      <UButton size="sm" color="primary" @click="$emit('publish')" :loading="publishing" :disabled="!canPublish" class="w-full sm:w-auto">Publish Quiz</UButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QuestionEditor from './QuestionEditor.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  saving: {
    type: Boolean,
    default: false
  },
  publishing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'publish', 'prev', 'open-bank', 'preview'])

const typeLabels = {
  mcq: 'Multiple Choice',
  multi: 'Multiple Select',
  short: 'Short Answer',
  numeric: 'Numeric Answer',
  fill_blank: 'Fill in the Blanks',
  math: 'Math / Multipart',
  code: 'Code Answer',
}

const questionTemplate = {
  type: 'mcq',
  text: '<p></p>',
  options: ['', ''],
  correct: -1,
  corrects: [],
  difficulty: 2,
  marks: 1,
  fill_parts: [],
  answers: [],
  media: null,
  explanation: '',
  tags: '',
  hint: '',
  solution_steps: '<p></p>',
  open: true,
  is_banked: false,
}

// Methods
function makeQuestion() {
  const base = JSON.parse(JSON.stringify(questionTemplate))
  base.uid = Math.random().toString(36).substring(2)
  setQuestionTypeDefaults(base)
  return base
}

function addQuestion() {
  const questions = [...props.modelValue]
  const q = makeQuestion()
  questions.push(q)
  emit('update:modelValue', questions)
}

function setQuestionTypeDefaults(q) {
  if (!q || typeof q !== 'object') return
  if (q.type === 'fill_blank') {
    q.answers = Array.isArray(q.answers) ? q.answers : []
    q.fill_parts = Array.isArray(q.fill_parts) ? q.fill_parts : []
    q.parts = Array.isArray(q.parts) ? q.parts : []
    if (!q.text) q.text = ''
  } else {
    q.answers = []
    q.fill_parts = []
    q.parts = []
  }

  if (['mcq', 'multi'].includes(q.type)) {
    if (!Array.isArray(q.options) || q.options.length < 2) q.options = ['', '']
    if (['mcq'].includes(q.type)) {
      q.correct = typeof q.correct === 'number' ? q.correct : -1
      q.corrects = []
    } else {
      q.corrects = Array.isArray(q.corrects) ? q.corrects : []
      q.correct = -1
    }
  } else {
    q.options = []
    q.correct = -1
    q.corrects = []
  }
}

function removeQuestion(idx) {
  const questions = [...props.modelValue]
  questions.splice(idx, 1)
  emit('update:modelValue', questions)
}

function duplicateQuestion(idx) {
  const questions = [...props.modelValue]
  const original = questions[idx]
  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    uid: Math.random().toString(36).substring(2)
  }
  questions.splice(idx + 1, 0, copy)
  emit('update:modelValue', questions)
}

function addOption(idx) {
  const questions = [...props.modelValue]
  if (!questions[idx].options) questions[idx].options = []
  questions[idx].options.push('')
  emit('update:modelValue', questions)
}

function removeOption(idx, optIdx) {
  const questions = [...props.modelValue]
  if (questions[idx].options && questions[idx].options.length > 2) {
    questions[idx].options.splice(optIdx, 1)
    if (questions[idx].correct >= optIdx) {
      questions[idx].correct = Math.max(0, questions[idx].correct - 1)
    }
    if (Array.isArray(questions[idx].corrects)) {
      questions[idx].corrects = questions[idx].corrects.filter(c => c !== optIdx).map(c => c > optIdx ? c - 1 : c)
    }
  }
  emit('update:modelValue', questions)
}

// Computed
const averageDifficulty = computed(() => {
  if (!props.modelValue.length) return { avg: 0, label: 'N/A' }
  const sum = props.modelValue.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  const avg = +(sum / props.modelValue.length).toFixed(2)
  const label = avg <= 1.6 ? 'Easy' : avg <= 2.3 ? 'Medium' : 'Hard'
  return { avg, label }
})

const canPublish = computed(() => {
  // Check if we have any questions
  if (!props.modelValue.length) return false
  
  // Check for any validation errors
  if (Object.keys(props.errors).length > 0) return false
  
  // Validate each question
  for (const question of props.modelValue) {
    // Check required fields
    if (!question.text?.trim()) return false
    if (!question.type) return false
    
    // Validate based on question type
    switch (question.type) {
      case 'mcq':
        if (!Array.isArray(question.options) || question.options.length < 2) return false
        if (question.correct < 0 || question.correct >= question.options.length) return false
        break
      case 'multi':
        if (!Array.isArray(question.options) || question.options.length < 2) return false
        if (!Array.isArray(question.corrects) || question.corrects.length === 0) return false
        break
      case 'fill_blank':
        if (!Array.isArray(question.answers) || question.answers.length === 0) return false
        break
      case 'short':
      case 'numeric':
        if (!Array.isArray(question.answers) || question.answers.length === 0) return false
        break
    }
    
    // Validate marks and difficulty
    if (!question.marks || question.marks < 1) return false
    if (!question.difficulty || question.difficulty < 1 || question.difficulty > 3) return false
  }
  
  return true
})
</script>