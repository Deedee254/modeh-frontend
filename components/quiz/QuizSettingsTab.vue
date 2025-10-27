<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg font-medium mb-4">Quiz Settings</h2>
      <div v-if="errors && errors._raw" class="mb-4">
        <div v-for="(m, idx) in errors._raw" :key="idx" class="text-sm text-red-600">{{ m }}</div>
      </div>
      
      <div class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="flex flex-col">
            <label class="flex items-center justify-between">
              <span class="block text-sm font-medium text-gray-700 mb-1">Timer Mode</span>
              <label class="inline-flex items-center">
                <input type="checkbox" v-model="modelValue.use_per_question_timer" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span class="text-sm text-gray-600">Use per-question timer</span>
              </label>
            </label>

            <!-- When per-question timer is enabled show seconds input -->
            <div v-if="modelValue.use_per_question_timer" class="mt-2">
              <label for="per-question-seconds" class="block text-sm font-medium text-gray-700 mb-1">Per-question time limit (seconds)</label>
              <input
                id="per-question-seconds"
                type="number"
                min="0"
                v-model="modelValue.per_question_seconds"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g. 30"
              />
              <p v-if="errors && errors.per_question_seconds" class="mt-1 text-sm text-red-600">{{ errors.per_question_seconds[0] }}</p>
              <p class="mt-1 text-xs text-gray-500">When enabled, each question will use this time limit. The overall quiz time will be ignored.</p>
            </div>

            <!-- When per-question timer is disabled show overall minutes input -->
            <div v-else class="mt-2">
              <label for="quiz-time-limit" class="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
              <input 
                v-model="modelValue.timer_minutes"
                id="quiz-time-limit"
                type="number"
                min="0"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Optional"
              />
              <p v-if="errors && (errors.timer_seconds || errors.timer_minutes)" class="mt-1 text-sm text-red-600">{{ (errors.timer_seconds || errors.timer_minutes)[0] }}</p>
              <p class="mt-1 text-xs text-gray-500">When disabled, the quiz will use this total time for the entire quiz.</p>
            </div>
          </div>

          <div>
            <label for="quiz-attempts" class="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
            <select 
              v-model="modelValue.attempts_allowed"
              id="quiz-attempts"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="1">1 attempt</option>
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
              <!-- Use empty string for unlimited so store can convert to null explicitly -->
              <option value="">Unlimited</option>
            </select>
            <p v-if="errors && errors.attempts_allowed" class="mt-1 text-sm text-red-600">{{ errors.attempts_allowed[0] }}</p>
          </div>
        </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label for="quiz-visibility" class="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select 
              v-model="modelValue.visibility"
              id="quiz-visibility"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <p v-if="errors && errors.visibility" class="mt-1 text-sm text-red-600">{{ errors.visibility[0] }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <label class="flex items-center space-x-2">
            <input 
              v-model="modelValue.shuffle_questions" 
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">Shuffle questions for each attempt</span>
          </label>

          <label class="flex items-center space-x-2">
            <input 
              v-model="modelValue.shuffle_answers" 
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">Shuffle answer options</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-6 flex flex-col sm:flex-row justify-between gap-3">
      <UButton 
        size="sm" 
        variant="soft" 
        @click="$emit('prev')"
        :disabled="saving"
        class="w-full sm:w-auto"
      >Back to Details</UButton>
      <div class="flex flex-col sm:flex-row gap-2">
        <UButton 
          size="sm" 
          variant="soft" 
          @click="saveAndContinue"
          :loading="saving"
          :disabled="saving || !isValid"
          class="w-full sm:w-auto"
        >Save and Continue</UButton>
        <UButton 
          size="sm" 
          color="primary" 
          @click="validate"
          :disabled="saving || !isValid"
          class="w-full sm:w-auto"
        >Continue to Questions</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
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
    emit('error', { type: 'success', message: 'Settings saved successfully' })
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