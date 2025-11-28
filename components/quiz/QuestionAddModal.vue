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
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Add Question</h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Create a new question for your quiz</p>
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
          Cancel
        </UButton>
        <UButton 
          color="primary"
          size="sm"
          :loading="saving"
          class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700"
          @click="submitQuestion"
        >
          Save Question
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref } from 'vue'
import QuestionBuilder from '~/components/quiz/QuestionBuilder.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
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
const saving = ref(false)
const builderRef = ref(null)

// Sync modal open/close state
watch(() => props.modelValue, (nv) => {
  isOpen.value = nv
}, { immediate: true })

watch(isOpen, (nv) => {
  emit('update:modelValue', nv)
})

function handleClose() {
  isOpen.value = false
}

function handleSaved(question) {
  emit('saved', question)
  isOpen.value = false
}

async function submitQuestion() {
  try {
    saving.value = true
    if (builderRef.value && typeof builderRef.value.submit === 'function') {
      await builderRef.value.submit()
    }
  } catch (err) {
    console.error('Error submitting question:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Ensure modal scrolls properly on mobile */
@media (max-width: 640px) {
  :deep(.fixed) {
    position: fixed;
  }
}
</style>
