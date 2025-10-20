<template>
  <div class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg font-medium mb-4 sm:mb-6">Quiz Settings</h2>
      
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
              <option value="unlimited">Unlimited</option>
            </select>
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
              <option value="premium">Premium</option>
            </select>
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
    <div class="mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
      <div class="w-full sm:w-auto">
          <button type="button" @click="$emit('prev')" class="inline-flex w-full sm:w-auto items-center justify-center px-3 py-2 rounded-md text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 text-gray-900 bg-white hover:bg-gray-50">Back to Details</button>
      </div>

      <div class="flex w-full sm:w-auto gap-3 sm:gap-4">
        <div class="flex-1 sm:flex-none">
            <button type="button" @click="saveAndContinue" class="inline-flex w-full sm:w-auto items-center justify-center px-3 py-2 rounded-md text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 text-gray-900 bg-white hover:bg-gray-50">Save and Continue</button>
        </div>
        <div class="flex-1 sm:flex-none">
            <button type="button" @click="validate" class="inline-flex w-full sm:w-auto items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Continue to Questions</button>
        </div>
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
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'prev', 'next'])

function validate() {
  // Add any settings validation here if needed
  emit('next')
  return true
}

async function saveAndContinue() {
  if (validate()) {
    await emit('save')
    emit('next')
  }
}
</script>