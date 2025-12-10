<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Quiz Settings</h2>
      <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Configure your quiz experience</p>
    </div>

    <!-- Error Banner -->
    <div v-if="errors && errors._raw" class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
      <div v-for="(m, idx) in errors._raw" :key="idx" class="text-xs sm:text-sm text-red-700">{{ m }}</div>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm font-medium text-gray-600">
        Step <span class="text-brand-600 font-bold">{{ currentStep }}</span> of 3
      </div>
      <div class="flex gap-1.5">
        <button
          v-for="step in 3"
          :key="step"
          @click="goToStep(step)"
          :class="[
            'w-2 h-2 rounded-full transition-all',
            step === currentStep ? 'bg-brand-600 w-8' : step < currentStep ? 'bg-green-500' : 'bg-gray-300'
          ]"
          :disabled="step > currentStep"
        />
      </div>
    </div>

    <!-- Settings Groups -->
    <div>
      <!-- Group 1 & 3 Combined: Timer Settings and Shuffle Options (2 columns on desktop) -->
      <div v-if="currentStep === 1" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
        <div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">Time Setting & Question Order</h3>
          <p class="text-sm text-gray-500 mt-0.5">Configure timing and how questions appear</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Timer Settings (Left Column) -->
          <div class="space-y-4">
            <div class="text-sm font-semibold text-gray-700">Timer Settings</div>
            <div class="flex items-center justify-between gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <label class="text-sm font-medium text-gray-700">Use per-question timer</label>
              <ClientOnly>
                <UCheckbox
                  v-model="usePerQuestionTimer"
                  @update:modelValue="(v) => emitUpdate({ use_per_question_timer: v })"
                  color="red"
                  class="!ring-brand-600"
                />
              </ClientOnly>
            </div>

            <ClientOnly>
              <div v-if="usePerQuestionTimer" class="space-y-2">
                <label for="per-question-seconds" class="block text-sm font-medium text-gray-700">Seconds per question</label>
                <UInput
                  id="per-question-seconds"
                  v-model.number="perQuestionSeconds"
                  type="number"
                  min="5"
                  step="5"
                  size="lg"
                  @update:modelValue="(v) => emitUpdate({ per_question_seconds: v })"
                  @keydown.enter="nextStep"
                />
                <p class="text-xs text-gray-500">Each question gets this much time</p>
              </div>

              <div v-else class="space-y-2">
                <label for="quiz-time-limit" class="block text-sm font-medium text-gray-700">Total time (minutes)</label>
                <UInput
                  id="quiz-time-limit"
                  v-model.number="timerMinutes"
                  type="number"
                  min="0"
                  placeholder="Leave empty for no limit"
                  size="lg"
                  @update:modelValue="(v) => emitUpdate({ timer_minutes: v })"
                  @keydown.enter="nextStep"
                />
                <p class="text-xs text-gray-500">Total time for the entire quiz</p>
              </div>
            </ClientOnly>
          </div>

          <!-- Question & Answer Order (Right Column) -->
          <div class="space-y-4">
            <div class="text-sm font-semibold text-gray-700">Question & Answer Order</div>
            <ClientOnly>
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">
                  <div>
                    <label class="text-sm font-medium text-gray-700 block">Shuffle questions</label>
                    <p class="text-xs text-gray-500 mt-1">Questions appear in random order for each attempt</p>
                  </div>
                  <UCheckbox
                    v-model="shuffleQuestions"
                    @update:modelValue="(v) => emitUpdate({ shuffle_questions: v })"
                    color="red"
                    class="!ring-brand-600"
                  />
                </div>

                <div class="flex items-center justify-between gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">
                  <div>
                    <label class="text-sm font-medium text-gray-700 block">Shuffle answer options</label>
                    <p class="text-xs text-gray-500 mt-1">Answer choices appear in random order</p>
                  </div>
                  <UCheckbox
                    v-model="shuffleAnswers"
                    @update:modelValue="(v) => emitUpdate({ shuffle_answers: v })"
                    color="red"
                    class="!ring-brand-600"
                  />
                </div>
              </div>
            </ClientOnly>
          </div>
        </div>

        <div class="flex gap-2 justify-between pt-4">
          <UButton
            @click="$emit('prev')"
            icon="i-heroicons-arrow-left"
            size="md"
            variant="ghost"
          >
            Back
          </UButton>
          <UButton
            @click="nextStep"
            icon="i-heroicons-arrow-right"
            size="md"
            class="!bg-brand-600 hover:!bg-brand-700 text-white"
          >
            Next
          </UButton>
        </div>
      </div>

      <!-- Group 2: Attempts & Visibility -->
      <div v-if="currentStep === 2" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
        <div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">Attempts & Access</h3>
          <p class="text-sm text-gray-500 mt-0.5">How many times can students try this quiz?</p>
        </div>

        <div class="space-y-4">
          <ClientOnly>
            <div>
              <label for="quiz-attempts" class="block text-sm font-medium text-gray-700 mb-2">Attempts allowed</label>
              <USelect
                v-model="attemptsAllowed"
                id="quiz-attempts"
                :options="[
                  { label: '1 attempt', value: '1' },
                  { label: '2 attempts', value: '2' },
                  { label: '3 attempts', value: '3' },
                  { label: 'Unlimited', value: '' }
                ]"
                size="lg"
                @update:modelValue="(v) => emitUpdate({ attempts_allowed: v })"
              />
            </div>

            <div>
              <label for="quiz-visibility" class="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <USelect
                v-model="visibility"
                id="quiz-visibility"
                :options="[
                  { label: 'Draft (Hidden)', value: 'draft' },
                  { label: 'Published (Visible)', value: 'published' },
                  { label: 'Scheduled', value: 'scheduled' }
                ]"
                size="lg"
                @update:modelValue="(v) => emitUpdate({ visibility: v })"
              />
              <p class="text-xs text-gray-500 mt-2">Draft quizzes are only visible to you</p>
            </div>
          </ClientOnly>
        </div>

        <div class="flex gap-2 justify-between pt-4">
          <UButton
            @click="prevStep"
            icon="i-heroicons-arrow-left"
            size="md"
            variant="ghost"
          >
            Back
          </UButton>
          <UButton
            @click="nextStep"
            icon="i-heroicons-arrow-right"
            size="md"
            class="!bg-brand-600 hover:!bg-brand-700 text-white"
          >
            Next
          </UButton>
        </div>
      </div>

      <!-- Group 3: Access Type (renamed from Group 4) -->
      <div v-if="currentStep === 3" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
        <div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">Access Type</h3>
          <p class="text-sm text-gray-500 mt-0.5">Is this quiz free or paid?</p>
        </div>

        <div class="space-y-4">
          <ClientOnly>
            <div>
              <label for="quiz-access" class="block text-sm font-medium text-gray-700 mb-2">Quiz access</label>
              <USelect
                v-model="access"
                id="quiz-access"
                :options="[
                  { label: 'Free', value: 'free' },
                  { label: 'Paid (One-time purchase)', value: 'paywall' }
                ]"
                size="lg"
                @update:modelValue="(v) => emitUpdate({ access: v })"
              />
              <p class="text-xs text-gray-500 mt-2">Pricing is managed by administrators</p>
            </div>
          </ClientOnly>
        </div>

        <!-- Summary Banner -->
        <div class="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-6">
          <div class="text-sm space-y-2">
            <div class="font-semibold text-blue-900">Settings Summary:</div>
            <ul class="text-blue-800 space-y-1 text-xs">
              <li>• Time: {{ usePerQuestionTimer ? `${perQuestionSeconds}s per question` : (timerMinutes ? `${timerMinutes} minutes` : 'No limit') }}</li>
              <li>• Attempts: {{ attemptsAllowed === '' ? 'Unlimited' : attemptsAllowed }}</li>
              <li>• Shuffle Questions: {{ shuffleQuestions ? 'Yes' : 'No' }} | Answers: {{ shuffleAnswers ? 'Yes' : 'No' }}</li>
              <li>• Access: {{ access === 'free' ? 'Free' : 'Paid' }} | Visibility: {{ visibility }}</li>
            </ul>
          </div>
        </div>

        <div class="flex gap-2 justify-between pt-4">
          <UButton
            @click="prevStep"
            icon="i-heroicons-arrow-left"
            size="md"
            variant="ghost"
          >
            Back
          </UButton>
          <UButton
            @click="$emit('next')"
            icon="i-heroicons-arrow-right"
            size="md"
            class="!bg-brand-600 hover:!bg-brand-700 text-white"
          >
            Next: Questions
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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

// Internal state
const currentStep = ref(1)
const usePerQuestionTimer = ref(false)
const perQuestionSeconds = ref(30)
const timerMinutes = ref(10)
const attemptsAllowed = ref('1')
const visibility = ref('draft')
const shuffleQuestions = ref(false)
const shuffleAnswers = ref(false)
const access = ref('free')

// Methods
function emitUpdate(obj) {
  // Ensure all values are properly normalized
  const normalized = { ...obj }
  
  if ('use_per_question_timer' in normalized) {
    normalized.use_per_question_timer = Boolean(normalized.use_per_question_timer)
  }
  if ('per_question_seconds' in normalized) {
    normalized.per_question_seconds = Number(normalized.per_question_seconds) || 30
  }
  if ('timer_minutes' in normalized) {
    normalized.timer_minutes = Number(normalized.timer_minutes) || 10
  }
  if ('attempts_allowed' in normalized) {
    // Empty string means unlimited, keep as empty string
    if (normalized.attempts_allowed === '') {
      normalized.attempts_allowed = ''
    } else {
      normalized.attempts_allowed = normalized.attempts_allowed ? Number(normalized.attempts_allowed) : null
    }
  }
  if ('shuffle_questions' in normalized) {
    normalized.shuffle_questions = Boolean(normalized.shuffle_questions)
  }
  if ('shuffle_answers' in normalized) {
    normalized.shuffle_answers = Boolean(normalized.shuffle_answers)
  }
  
  emit('update:modelValue', { ...props.modelValue, ...normalized })
}

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goToStep(step) {
  if (step <= currentStep.value) {
    currentStep.value = step
  }
}

// Sync with parent props
watch(() => props.modelValue, (nv) => {
  if (nv) {
    usePerQuestionTimer.value = nv.use_per_question_timer ?? false
    perQuestionSeconds.value = Number(nv.per_question_seconds) || 30
    timerMinutes.value = Number(nv.timer_minutes) || 10
    attemptsAllowed.value = String(nv.attempts_allowed ?? '1')
    visibility.value = nv.visibility ?? 'draft'
    shuffleQuestions.value = nv.shuffle_questions ?? false
    shuffleAnswers.value = nv.shuffle_answers ?? false
    access.value = nv.access ?? 'free'
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
