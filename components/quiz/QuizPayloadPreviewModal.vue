<template>
  <UModal 
    v-model="isOpen"
    :ui="{ width: 'sm:max-w-2xl' }"
    @update:modelValue="(v) => emit('update:modelValue', v)"
  >
    <div class="flex flex-col max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Review Quiz</h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Verify all details before publishing</p>
        </div>
        <UButton 
          color="gray" 
          variant="ghost" 
          size="sm"
          icon="i-heroicons-x-mark"
          @click="isOpen = false"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        <!-- Error Banner (if publishing failed) -->
        <div v-if="publishError" class="rounded-lg bg-red-50 border border-red-200 p-3 sm:p-4">
          <div class="flex gap-3">
            <Icon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-red-900">Cannot publish quiz</h3>
              <div v-if="publishError.message" class="text-xs sm:text-sm text-red-800 mt-1">{{ publishError.message }}</div>
              <div v-if="publishError.details?.length" class="mt-2 space-y-1">
                <div v-for="(msg, i) in publishError.details" :key="i" class="text-xs text-red-700">• {{ msg }}</div>
              </div>
              <div v-if="!publishing" class="mt-3">
                <UButton 
                  size="xs"
                  variant="soft"
                  color="gray"
                  @click="onFixErrors"
                >
                  Fix Errors
                </UButton>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Details Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base font-semibold text-gray-900">Quiz Details</h3>
            <UButton 
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-pencil"
              @click="$emit('edit-section', 'details')"
            >Edit</UButton>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Title:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.title || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Grade:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.grade?.name || normalizedQuiz.grade_name || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Subject:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.subject?.name || normalizedQuiz.subject_name || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Topic:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.topic?.name || normalizedQuiz.topic_name || '—' }}</span>
            </div>
            <div v-if="normalizedQuiz.description" class="border-t border-gray-200 pt-2">
              <span class="text-gray-600">Description:</span>
              <div class="text-gray-700 mt-1 line-clamp-2">{{ normalizedQuiz.description }}</div>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base font-semibold text-gray-900">Settings</h3>
            <UButton 
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-pencil"
              @click="$emit('edit-section', 'settings')"
            >Edit</UButton>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Time:</span>
              <span class="font-medium text-gray-900">
                {{ normalizedQuiz.use_per_question_timer ? `${normalizedQuiz.per_question_seconds}s per question` : (normalizedQuiz.timer_minutes ? `${normalizedQuiz.timer_minutes} minutes` : 'No limit') }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Attempts:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.attempts_allowed ? normalizedQuiz.attempts_allowed : 'Unlimited' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shuffle Questions:</span>
              <Icon :name="normalizedQuiz.shuffle_questions ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="normalizedQuiz.shuffle_questions ? 'text-green-600' : 'text-gray-400'" class="w-4 h-4" />
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shuffle Answers:</span>
              <Icon :name="normalizedQuiz.shuffle_answers ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="normalizedQuiz.shuffle_answers ? 'text-green-600' : 'text-gray-400'" class="w-4 h-4" />
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Access:</span>
              <span class="font-medium text-gray-900">{{ normalizedQuiz.access === 'free' ? 'Free' : 'Paid' }}</span>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base font-semibold text-gray-900">Questions ({{ questions.length }})</h3>
            <UButton 
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-pencil"
              @click="$emit('edit-section', 'questions')"
            >Edit</UButton>
          </div>
          <div class="space-y-2">
            <div v-for="(q, idx) in questions" :key="idx" class="bg-gray-50 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900">#{{ idx + 1 }}: {{ typeLabels[q.type] || q.type }}</div>
                  <div class="text-gray-600 line-clamp-1 mt-0.5">{{ (q.body || '').replace(/<[^>]*>/g, '') || '(no text)' }}</div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <UBadge color="gray" variant="subtle" size="xs">{{ q.marks }} mark{{ q.marks !== 1 ? 's' : '' }}</UBadge>
                    <UBadge :color="difficultyColor(q.difficulty)" variant="subtle" size="xs">
                      {{ difficultyLabel(q.difficulty) }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3 bg-brand-50 rounded-lg p-3 sm:p-4">
          <div class="text-center">
            <div class="text-xs text-brand-700 mb-1">Total Questions</div>
            <div class="text-lg sm:text-xl font-bold text-brand-900">{{ questions.length }}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-brand-700 mb-1">Total Marks</div>
            <div class="text-lg sm:text-xl font-bold text-brand-900">{{ totalMarks }}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-brand-700 mb-1">Avg Difficulty</div>
            <div class="text-lg sm:text-xl font-bold text-brand-900">{{ avgDifficultyLabel }}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
        <UButton 
          variant="soft"
          size="sm"
          @click="isOpen = false"
          class="w-full sm:w-auto"
        >
          Back
        </UButton>
        <UButton 
          color="primary"
          size="sm"
          :loading="publishing"
          @click="$emit('publish')"
          class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700"
        >
          Publish Quiz
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  quiz: { type: Object, required: true },
  questions: { type: Array, default: () => [] },
  publishing: { type: Boolean, default: false },
  publishError: { type: Object, default: null, required: false }
})

const emit = defineEmits(['update:modelValue', 'edit-section', 'publish'])

const isOpen = ref(false)

watch(() => props.modelValue, (nv) => {
  isOpen.value = nv
})

// Derived error message for display
const publishError = computed(() => props.publishError)

// Function to handle "Fix Errors" button
const onFixErrors = () => {
  // Determine which section needs fixing based on error
  const errorMessage = publishError.value?.message || ''
  if (errorMessage.includes('questions') || errorMessage.includes('Question')) {
    emit('edit-section', 'questions')
  } else if (errorMessage.includes('Time')) {
    emit('edit-section', 'settings')
  } else {
    emit('edit-section', 'details')
  }
}
const normalizedQuiz = computed(() => {
  const q = props.quiz || {}
  return {
    ...q,
    per_question_seconds: Number(q.per_question_seconds) || 30,
    timer_minutes: Number(q.timer_minutes) || 10
  }
})

const typeLabels = {
  mcq: 'Multiple Choice',
  multi: 'Multiple Select',
  short: 'Short Answer',
  numeric: 'Numeric',
  fill_blank: 'Fill Blanks',
  math: 'Math',
  code: 'Code'
}

const totalMarks = computed(() => {
  return props.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)
})

const avgDifficulty = computed(() => {
  if (!props.questions.length) return 0
  const sum = props.questions.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  return sum / props.questions.length
})

const avgDifficultyLabel = computed(() => {
  const avg = avgDifficulty.value
  if (avg <= 1.5) return 'Easy'
  if (avg <= 2.5) return 'Med'
  return 'Hard'
})

function difficultyLabel(difficulty) {
  if (difficulty === 1) return 'Easy'
  if (difficulty === 2) return 'Medium'
  return 'Hard'
}

function difficultyColor(difficulty) {
  if (difficulty === 1) return 'green'
  if (difficulty === 2) return 'yellow'
  return 'red'
}
</script>
