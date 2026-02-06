<template>
  <UModal 
    v-model="isOpen" 
    :ui="{ width: 'sm:max-w-4xl' }"
    @update:modelValue="handleClose"
  >
    <div class="flex flex-col h-screen sm:h-auto sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div>
                  <h2 class="text-lg sm:text-xl font-semibold text-gray-900">{{ props.initialQuestion ? 'Edit Question' : 'Add Question' }}</h2>
                  <p class="text-xs sm:text-sm text-gray-500 mt-0.5">{{ props.initialQuestion ? 'Edit this question' : 'Create a new question for your quiz' }}</p>
                </div>
        <UButton 
          color="gray" 
          variant="ghost" 
          size="sm"
          icon="i-heroicons-x-mark"
          @click="handleClose"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <QuestionBuilder 
          ref="builderRef"
          :subject-id="subjectId" 
          :topic-id="topicId" 
          :grade-id="gradeId" 
          :level-id="levelId"
          :initial-question="initialQuestion"
          @cancel="handleClose"
          @saved="handleSaved"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <UButton 
            variant="soft" 
            color="gray"
            size="sm"
            @click="handleClose"
            class="w-full sm:w-auto"
          >
            Close
          </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import QuestionBuilder from '~/components/quiz/QuestionBuilder.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  initialQuestion: {
    type: Object,
    default: null
  },
  subjectId: {
    type: [String, Number],
    default: null
  },
  topicId: {
    type: [String, Number],
    default: null
  },
  gradeId: {
    type: [String, Number],
    default: null
  },
  levelId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = ref(false)
const builderRef = ref(null)

// Sync modal open/close state
watch(() => props.modelValue, (nv) => {
  isOpen.value = nv
}, { immediate: true })

watch(isOpen, (nv) => {
  emit('update:modelValue', nv)
})

// If an initialQuestion is provided, populate the builder form when modal opens
watch(() => props.initialQuestion, (q) => {
  if (!q) return
  // Open the modal when an initial question is provided. The QuestionBuilder will
  // pick up the `initialQuestion` prop and prefill the form.
  isOpen.value = true
}, { immediate: false })

function handleClose() {
  isOpen.value = false
}

function handleSaved(question) {
  emit('saved', question)
  isOpen.value = false
}

// Note: The actual save is handled inside QuestionBuilder. We expose the
// builder's events (saved) up to the parent via handleSaved.
</script>

<style scoped>
/* Ensure modal scrolls properly on mobile */
@media (max-width: 640px) {
  :deep(.fixed) {
    position: fixed;
  }
}
</style>
