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
              v-model="usePerQuestionTimer" 
              label="Use per-question timer"
              size="sm"
              @update:modelValue="(v) => emitUpdate({ use_per_question_timer: v })"
            />
          </div>

          <!-- When per-question timer is enabled show seconds input -->
          <div v-if="usePerQuestionTimer" class="space-y-2">
            <label for="per-question-seconds" class="block text-sm font-medium text-gray-700 mb-1.5">Per-question time limit (seconds)</label>
            <UInput
              id="per-question-seconds"
              v-model.number="perQuestionSeconds"
              type="number"
              min="0"
              placeholder="e.g. 30"
              size="md"
              @update:modelValue="(v) => emitUpdate({ per_question_seconds: v })"
            />
            <p v-if="errors && errors.per_question_seconds" class="text-xs text-red-600">{{ errors.per_question_seconds[0] }}</p>
            <p class="text-xs text-gray-500">When enabled, each question will use this time limit. The overall quiz time will be ignored.</p>
          </div>

          <!-- When per-question timer is disabled show overall minutes input -->
          <div v-else class="space-y-2">
            <label for="quiz-time-limit" class="block text-sm font-medium text-gray-700 mb-1.5">Time Limit (minutes)</label>
            <UInput
              v-model.number="timerMinutes"
              id="quiz-time-limit"
              type="number"
              min="0"
              placeholder="Optional"
              size="md"
              @update:modelValue="(v) => emitUpdate({ timer_minutes: v })"
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
            v-model="attemptsAllowed"
            id="quiz-attempts"
            :options="[
              { label: '1 attempt', value: '1' },
              { label: '2 attempts', value: '2' },
              { label: '3 attempts', value: '3' },
              { label: 'Unlimited', value: '' }
            ]"
            size="md"
            @update:modelValue="(v) => emitUpdate({ attempts_allowed: v })"
          />
          <p v-if="errors && errors.attempts_allowed" class="mt-1 text-xs text-red-600">{{ errors.attempts_allowed[0] }}</p>
        </div>

        <div>
          <label for="quiz-visibility" class="block text-sm font-medium text-gray-700 mb-1.5">Visibility</label>
          <USelect
            v-model="visibility"
            id="quiz-visibility"
            :options="[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
              { label: 'Scheduled', value: 'scheduled' }
            ]"
            size="md"
            @update:modelValue="(v) => emitUpdate({ visibility: v })"
          />
          <p v-if="errors && errors.visibility" class="mt-1 text-xs text-red-600">{{ errors.visibility[0] }}</p>
        </div>
      </div>

      <!-- Shuffle Options -->
      <div class="space-y-3 pt-2 border-t border-gray-200">
        <UCheckbox 
          v-model="shuffleQuestions" 
          label="Shuffle questions for each attempt"
          size="sm"
          @update:modelValue="(v) => emitUpdate({ shuffle_questions: v })"
        />
        <UCheckbox 
          v-model="shuffleAnswers" 
          label="Shuffle answer options"
          size="sm"
          @update:modelValue="(v) => emitUpdate({ shuffle_answers: v })"
        />
      </div>

      <!-- Pricing Options -->
      <div class="space-y-4 pt-2 border-t border-gray-200">
        <div>
          <label for="quiz-access" class="block text-sm font-medium text-gray-700 mb-1.5">Access Type</label>
          <USelect
            v-model="access"
            id="quiz-access"
            :options="[
              { label: 'Free', value: 'free' },
              { label: 'Paid (One-time purchase)', value: 'paywall' }
            ]"
            size="md"
            @update:modelValue="(v) => emitUpdate({ access: v })"
          />
          <p class="mt-1 text-xs text-gray-500">Choose whether users need to pay to access this quiz. Pricing is managed by the admin.</p>
        </div>
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
          class="w-full sm:w-auto !bg-brand-600 hover:!bg-brand-700"
        >Continue to Questions</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

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

// Internal state synced with parent
const usePerQuestionTimer = ref(false)
const perQuestionSeconds = ref(30)
const timerMinutes = ref(10)
const attemptsAllowed = ref('1')
const visibility = ref('draft')
const shuffleQuestions = ref(true)
const shuffleAnswers = ref(true)
const access = ref('free')

// Sync internal state with parent props on mount and when parent changes
watch(() => props.modelValue, (nv) => {
  if (!nv) return
  usePerQuestionTimer.value = nv.use_per_question_timer ?? false
  perQuestionSeconds.value = nv.per_question_seconds ?? 30
  timerMinutes.value = nv.timer_minutes ?? 10
  attemptsAllowed.value = String(nv.attempts_allowed ?? '1')
  visibility.value = nv.visibility ?? 'draft'
  shuffleQuestions.value = nv.shuffle_questions ?? true
  shuffleAnswers.value = nv.shuffle_answers ?? true
  access.value = nv.access ?? 'free'
}, { deep: true, immediate: true })

function emitUpdate(updates) {
  emit('update:modelValue', { ...props.modelValue, ...updates })
}

function validate() {
  const errors = []
  if (!timerMinutes.value && !usePerQuestionTimer.value) {
    errors.push('Please set either a total time limit or enable per-question timer')
  }
  if (usePerQuestionTimer.value && !perQuestionSeconds.value) {
    errors.push('Per-question time limit is required when using per-question timer')
  }

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

// Computed property to check if the form is valid
const isValid = computed(() => {
  if (!props.modelValue) return false
  
  // Basic validation rules
  if (usePerQuestionTimer.value && !perQuestionSeconds.value) return false
  if (!usePerQuestionTimer.value && !timerMinutes.value) return false
  
  return true
})
</script>
