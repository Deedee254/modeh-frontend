<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg font-medium mb-4">Quiz Settings</h2>
      <div v-if="errors && errors._raw" class="mb-4">
        <div v-for="(m, idx) in errors._raw" :key="idx" class="text-sm text-red-600">{{ m }}</div>
      </div>
      
      <div class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
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
            <label for="quiz-access" class="block text-sm font-medium text-gray-700 mb-1">Access</label>
            <select 
              v-model="modelValue.access"
              id="quiz-access"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="free">Free</option>
              <!-- backend accepts 'paywall' to indicate paid quizzes -->
              <option value="paywall">Premium</option>
            </select>
            <p v-if="errors && errors.access" class="mt-1 text-sm text-red-600">{{ errors.access[0] }}</p>
          </div>

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
    <div class="mt-6 flex justify-between gap-3">
      <UButton size="sm" variant="soft" @click="$emit('prev')">Back to Details</UButton>
      <div class="flex gap-2">
        <UButton size="sm" variant="soft" @click="saveAndContinue">Save and Continue</UButton>
        <UButton size="sm" color="primary" @click="validate">Continue to Questions</UButton>
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

const emit = defineEmits(['update:modelValue', 'save', 'prev', 'next'])

function validate() {
  // Add any settings validation here if needed
  emit('next')
  return true
}

function saveAndContinue() {
  if (validate()) {
    // Emit save and let the parent await the save and navigate when appropriate.
    emit('save')
  }
}

// expose errors locally for template convenience
const errors = props.errors || {}
</script>