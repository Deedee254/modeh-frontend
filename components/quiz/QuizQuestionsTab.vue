<template>
  <div class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 class="text-lg font-medium">Questions</h2>
        <div class="flex gap-2 items-center w-full sm:w-auto">
          <UButton size="sm" variant="soft" @click="$emit('open-bank')">Question Bank</UButton>
          <UButton size="sm" variant="soft" @click="$emit('preview')">Preview Questions</UButton>
          <UButton size="sm" color="primary" @click="addQuestion">Add Question</UButton>
        </div>
      </div>

      <!-- Question List -->
      <div class="space-y-6">
        <TransitionGroup
          name="list"
          tag="div"
          class="space-y-4"
        >
          <div
            v-for="(q, idx) in modelValue"
            :key="q.uid || q.id || idx"
            class="group bg-gray-50 rounded-lg p-3 sm:p-6 border border-transparent hover:border-gray-300 transition-colors duration-200"
          >
            <!-- Question Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium">
                  {{ idx + 1 }}
                </span>
                <div class="space-y-1">
                  <div class="flex items-center text-sm text-gray-500 space-x-2">
                    <span class="px-2 py-0.5 rounded bg-gray-200">
                      {{ q.type === 'mcq-single' ? 'Multiple Choice' : 'True/False' }}
                    </span>
                    <span>•</span>
                    <span>{{ q.marks }} {{ q.marks === 1 ? 'mark' : 'marks' }}</span>
                    <span>•</span>
                    <span>{{ q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  :errors="errors[q.uid]"
                />
              </div>
            </Transition>
          </div>
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div 
        v-if="!modelValue.length"
        class="text-center py-12"
      >
        <div class="text-gray-400 mb-4">
          <i class="fas fa-clipboard-list text-4xl"></i>
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
    <div class="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h3 class="text-base font-medium mb-3">Quiz Summary</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <div class="text-sm text-gray-500">Total Questions</div>
          <div class="text-2xl font-medium">{{ modelValue.length }}</div>
        </div>
        
        <div>
          <div class="text-sm text-gray-500">Total Marks</div>
          <div class="text-2xl font-medium">
            {{ modelValue.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) }}
          </div>
        </div>

        <div>
          <div class="text-sm text-gray-500">Average Difficulty</div>
          <div class="text-2xl font-medium">{{ averageDifficulty.label }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-6 flex justify-between gap-3">
      <UButton size="sm" variant="soft" @click="$emit('prev')">Back to Settings</UButton>
      <div class="flex gap-2">
        <UButton size="sm" color="primary" @click="$emit('publish')" :loading="publishing" :disabled="!canPublish">Publish Quiz</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QuestionEditor from '~/components/questions/QuestionEditor.vue'

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

const emit = defineEmits(['update:modelValue', 'save', 'publish', 'prev', 'open-bank'])

// Question template
const questionTemplate = {
  type: 'mcq-single',
  text: '<p></p>',
  options: ['', ''],
  correct: -1,
  corrects: [],
  difficulty: 2,
  marks: 1,
  fill_parts: ['', ''],
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
  return {
    ...questionTemplate,
    uid: Math.random().toString(36).substring(2)
  }
}

function addQuestion() {
  const questions = [...props.modelValue]
  questions.push(makeQuestion())
  emit('update:modelValue', questions)
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

// Computed
const averageDifficulty = computed(() => {
  if (!props.modelValue.length) return { avg: 0, label: 'N/A' }
  const sum = props.modelValue.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  const avg = +(sum / props.modelValue.length).toFixed(2)
  const label = avg <= 1.6 ? 'Easy' : avg <= 2.3 ? 'Medium' : 'Hard'
  return { avg, label }
})

const canPublish = computed(() => {
  if (!props.modelValue.length) return false
  return Object.keys(props.errors).length === 0
})
</script>