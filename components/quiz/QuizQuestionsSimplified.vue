<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Questions</h2>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">{{ questions.length }} question{{ questions.length !== 1 ? 's' : '' }} added</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-eye"
          @click="$emit('preview')"
          :disabled="!questions.length"
          class="flex-1 sm:flex-none"
        >Preview</UButton>
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-banknotes"
          @click="$emit('open-bank')"
          class="flex-1 sm:flex-none"
        >Bank</UButton>
        <UButton
          size="sm"
          variant="soft"
          icon="i-heroicons-arrow-up-tray"
          @click="$emit('open-import')"
          class="flex-1 sm:flex-none"
        >Import CSV</UButton>
        <UButton
          size="sm"
          color="primary"
          icon="i-heroicons-plus"
          @click="showQuestionModal = true"
          class="flex-1 sm:flex-none !bg-brand-600 hover:!bg-brand-700"
        >Add Question</UButton>
      </div>
    </div>

    <!-- Questions List or Empty State -->
    <div v-if="questions.length" class="space-y-2 sm:space-y-3">
      <TransitionGroup name="list" tag="div" class="space-y-2 sm:space-y-3">
        <div
          v-for="(q, idx) in questions"
          :key="q.uid || idx"
          class="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-150 overflow-hidden"
        >
          <!-- Question Card Header -->
          <div class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border-b border-gray-100">
            <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-brand-100 text-brand-600 font-semibold text-xs sm:text-sm">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <UBadge color="gray" variant="subtle" size="xs">
                  {{ typeLabels[q.type] || q.type }}
                </UBadge>
                <span class="text-xs text-gray-400">•</span>
                <span class="text-xs text-gray-600">{{ q.marks }} mark{{ q.marks !== 1 ? 's' : '' }}</span>
                <span class="text-xs text-gray-400">•</span>
                <UBadge :color="difficultyColor(q.difficulty)" variant="subtle" size="xs">
                  {{ difficultyLabel(q.difficulty) }}
                </UBadge>
              </div>
            </div>
            <button
              class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              @click="q.open = !q.open"
              :aria-label="q.open ? 'Collapse' : 'Expand'"
            >
              <Icon :name="q.open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
            </button>
          </div>

          <!-- Question Preview -->
          <Transition
            enter-active-class="transition-all duration-200"
            leave-active-class="transition-all duration-200"
            enter-from-class="opacity-0 max-h-0"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="q.open" class="border-t border-gray-100">
              <!-- Question Text Preview -->
              <div class="p-3 sm:p-4 bg-white">
                <div class="text-xs sm:text-sm text-gray-700 line-clamp-3" v-html="q.text || '<em>No question text</em>'"></div>
                
                <!-- Options Preview (if multiple choice) -->
                <div v-if="['mcq', 'multi'].includes(q.type) && q.options?.length" class="mt-3 space-y-1.5">
                  <div class="text-xs font-medium text-gray-600 mb-2">Options:</div>
                  <div v-for="(opt, optIdx) in q.options.slice(0, 3)" :key="optIdx" class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border text-xs" :class="opt.is_correct ? 'border-green-500 bg-green-50 text-green-600 font-bold' : 'border-gray-300 text-gray-400'">
                      {{ String.fromCharCode(65 + optIdx) }}
                    </span>
                    <span class="text-xs text-gray-600 line-clamp-1">{{ opt.text || '(empty)' }}</span>
                  </div>
                  <div v-if="q.options.length > 3" class="text-xs text-gray-500 ml-7">+{{ q.options.length - 3 }} more options</div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-1 p-3 sm:p-4 bg-gray-50 border-t border-gray-100">
                <UButton size="xs" variant="ghost" icon="i-heroicons-document-duplicate" @click="duplicateQuestion(idx)" />
                <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash" @click="removeQuestion(idx)" />
              </div>
            </div>
          </Transition>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg border-2 border-dashed border-gray-300 text-center py-12 sm:py-16">
      <Icon name="i-heroicons-clipboard-document-list" class="w-12 h-12 mx-auto text-gray-300 mb-3" />
      <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-1">No questions yet</h3>
      <p class="text-xs sm:text-sm text-gray-500 mb-4">Add your first question to get started</p>
      <UButton
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
        @click="showQuestionModal = true"
        class="!bg-brand-600 hover:!bg-brand-700"
      >Add Question</UButton>
    </div>

    <!-- Stats Card -->
    <div v-if="questions.length" class="bg-brand-50 rounded-lg border border-brand-200 p-3 sm:p-4">
      <div class="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div>
          <div class="text-xs text-brand-700 mb-0.5">Total</div>
          <div class="text-lg sm:text-2xl font-bold text-brand-900">{{ questions.length }}</div>
        </div>
        <div>
          <div class="text-xs text-brand-700 mb-0.5">Marks</div>
          <div class="text-lg sm:text-2xl font-bold text-brand-900">{{ totalMarks }}</div>
        </div>
        <div>
          <div class="text-xs text-brand-700 mb-0.5">Avg Difficulty</div>
          <div class="text-lg sm:text-2xl font-bold text-brand-900">{{ avgDifficultyLabel }}</div>
        </div>
      </div>
    </div>

    <!-- Question Add Modal -->
    <QuestionAddModal
      v-model="showQuestionModal"
      :subject-id="subjectId"
      :topic-id="topicId"
      :grade-id="gradeId"
      :level-id="levelId"
      @saved="onQuestionSaved"
    />

    <!-- Bottom Actions -->
    <div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between pt-2 sm:pt-4">
      <UButton
        variant="soft"
        size="sm"
        icon="i-heroicons-arrow-left"
        @click="$emit('prev')"
        class="w-full sm:w-auto"
      >
        Back to Settings
      </UButton>
      <UButton
        color="primary"
        size="sm"
        icon="i-heroicons-check"
        @click="handlePublish"
        :loading="publishing"
        :disabled="!questions.length"
        class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700"
      >
        Publish Quiz
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCreateQuizStore } from '~/stores/createQuizStore'
import QuestionAddModal from '~/components/quiz/QuestionAddModal.vue'

const props = defineProps({
  subjectId: { type: [String, Number], default: null },
  topicId: { type: [String, Number], default: null },
  gradeId: { type: [String, Number], default: null },
  levelId: { type: [String, Number], default: null },
  publishing: { type: Boolean, default: false }
})

const emit = defineEmits(['preview', 'open-bank', 'open-import', 'prev', 'publish'])

const store = useCreateQuizStore()
const questions = computed(() => store.questions)
const showQuestionModal = ref(false)
const showImportModal = ref(false)

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
  return questions.value.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)
})

const avgDifficulty = computed(() => {
  if (!questions.value.length) return 0
  const sum = questions.value.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  return sum / questions.value.length
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

function removeQuestion(idx) {
  questions.value.splice(idx, 1)
}

function duplicateQuestion(idx) {
  const original = questions.value[idx]
  store.addQuestion(original)
}

function onQuestionSaved(question) {
  store.addQuestion(question)
  showQuestionModal.value = false
}

function handlePublish() {
  emit('publish')
}
</script>
