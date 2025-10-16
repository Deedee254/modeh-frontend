<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-medium mb-6">Quiz Settings</h2>
      
      <div class="space-y-6">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
            <input 
              v-model="modelValue.timer_minutes"
              type="number"
              min="0"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
            <select 
              v-model="modelValue.attempts_allowed"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="1">1 attempt</option>
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Access</label>
            <select 
              v-model="modelValue.access"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select 
              v-model="modelValue.visibility"
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
    <div class="mt-6 flex justify-between">
      <UButton
        color="white"
        @click="$emit('prev')"
      >Back to Details</UButton>

      <div class="space-x-4">
        <UButton
          color="white"
          @click="saveAndContinue"
          :loading="saving"
        >Save and Continue</UButton>
        
        <UButton
          color="primary"
          @click="validate"
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