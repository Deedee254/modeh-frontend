<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-1">Quiz Settings</h2>
      <p class="text-sm text-gray-500">Configure timer, attempts, and other quiz options</p>
    </div>

    <div v-if="errors && errors._raw" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <div v-for="(m, idx) in errors._raw" :key="idx" class="text-sm text-red-700">{{ m }}</div>
    </div>
    
    <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-5">
      <!-- Timer Settings -->
      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">Timer Settings</label>
            <UCheckbox 
              v-model="modelValue.use_per_question_timer" 
              label="Use per-question timer"
              size="sm"
            />
          </div>

          <!-- When per-question timer is enabled show seconds input -->
          <div v-if="modelValue.use_per_question_timer" class="space-y-2">
            <label for="per-question-seconds" class="block text-sm font-medium text-gray-700 mb-1.5">Per-question time limit (seconds)</label>
            <UInput
              id="per-question-seconds"
              v-model.number="modelValue.per_question_seconds"
              type="number"
              min="0"
              placeholder="e.g. 30"
              size="md"
            />
            <p v-if="errors && errors.per_question_seconds" class="text-xs text-red-600">{{ errors.per_question_seconds[0] }}</p>
            <p class="text-xs text-gray-500">When enabled, each question will use this time limit. The overall quiz time will be ignored.</p>
          </div>

          <!-- When per-question timer is disabled show overall minutes input -->
          <div v-else class="space-y-2">
            <label for="quiz-time-limit" class="block text-sm font-medium text-gray-700 mb-1.5">Time Limit (minutes)</label>
            <UInput
              v-model.number="modelValue.timer_minutes"
              id="quiz-time-limit"
              type="number"
              min="0"
              placeholder="Optional"
              size="md"
            />
            <p v-if="errors && (errors.timer_seconds || errors.timer_minutes)" class="text-xs text-red-600">{{ (errors.timer_seconds || errors.timer_minutes)[0] }}</p>
            <p class="text-xs text-gray-500">When disabled, the quiz will use this total time for the entire quiz.</p>
          </div>
        </div>
      </div>

      <!-- Attempts and Visibility -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="quiz-attempts" class="block text-sm font-medium text-gray-700 mb-1.5">Attempts Allowed</label>
          <USelect
            v-model="modelValue.attempts_allowed"
            id="quiz-attempts"
            :options="[
              { label: '1 attempt', value: '1' },
              { label: '2 attempts', value: '2' },
              { label: '3 attempts', value: '3' },
              { label: 'Unlimited', value: '' }
            ]"
            size="md"
          />
          <p v-if="errors && errors.attempts_allowed" class="mt-1 text-xs text-red-600">{{ errors.attempts_allowed[0] }}</p>
        </div>

        <div>
          <label for="quiz-visibility" class="block text-sm font-medium text-gray-700 mb-1.5">Visibility</label>
          <USelect
            v-model="modelValue.visibility"
            id="quiz-visibility"
            :options="[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
              { label: 'Scheduled', value: 'scheduled' }
            ]"
            size="md"
          />
          <p v-if="errors && errors.visibility" class="mt-1 text-xs text-red-600">{{ errors.visibility[0] }}</p>
        </div>
      </div>

      <!-- Shuffle Options -->
      <div class="space-y-3 pt-2 border-t border-gray-200">
        <UCheckbox 
          v-model="modelValue.shuffle_questions" 
          label="Shuffle questions for each attempt"
          size="sm"
        />
        <UCheckbox 
          v-model="modelValue.shuffle_answers" 
          label="Shuffle answer options"
          size="sm"
        />
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex flex-col sm:flex-row justify-between gap-2 pt-2">
      <UButton 
        size="sm" 
        variant="soft" 
        icon="i-heroicons-arrow-left"
        @click="$emit('prev')"
        :disabled="saving"
        class="w-full sm:w-auto"
      >Back to Details</UButton>
      <div class="flex flex-col sm:flex-row gap-2">
        <UButton 
          size="sm" 
          variant="soft" 
          icon="i-heroicons-document-arrow-down"
          @click="saveAndContinue"
          :loading="saving"
          :disabled="saving || !isValid"
          class="w-full sm:w-auto"
        >Save and Continue</UButton>
        <UButton 
          size="sm" 
          color="primary" 
          icon="i-heroicons-arrow-right"
          @click="validate"
          :disabled="saving || !isValid"
          class="w-full sm:w-auto"
        >Continue to Questions</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'prev', 'next', 'error'])

function validate() {
  const errors = []
  if (!props.modelValue.timer_minutes && !props.modelValue.use_per_question_timer) {
    errors.push('Please set either a total time limit or enable per-question timer')
  }
  if (props.modelValue.use_per_question_timer && !props.modelValue.per_question_seconds) {
    errors.push('Per-question time limit is required when using per-question timer')
  }
  // Access validation removed as it's not needed

  if (errors.length > 0) {
    errors.forEach(error => {
      emit('error', { type: 'error', message: error })
    })
    return false
  }

  emit('next')
  return true
}

function saveAndContinue() {
  if (validate()) {
    emit('save')
  }
}

// expose errors locally for template convenience
const errors = props.errors || {}

// Computed property to check if the form is valid
const isValid = computed(() => {
  if (!props.modelValue) return false
  
  // Basic validation rules
  if (props.modelValue.use_per_question_timer && !props.modelValue.per_question_seconds) return false
  if (!props.modelValue.use_per_question_timer && !props.modelValue.timer_minutes) return false
  
  return true
})
</script>