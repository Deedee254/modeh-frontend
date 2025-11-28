<template>
  <div class="p-4 xl:p-6 xl:pt-0 space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Battle Type -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="battle-type">Battle Type</label>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            :color="battleType === 'public' ? 'primary' : 'white'"
            class="w-full"
            :disabled="loading"
            @click="$emit('update:battleType', 'public')"
          >
            <i-lucide-globe class="h-4 w-4" />
            <span>Public</span>
          </UButton>
          <UButton
            :color="battleType === 'private' ? 'primary' : 'white'"
            class="w-full"
            :disabled="loading"
            @click="$emit('update:battleType', 'private')"
          >
            <i-lucide-lock class="h-4 w-4" />
            <span>Private</span>
          </UButton>
        </div>
      </div>

      <!-- Grade -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="grade">Grade</label>
        <USelect
          :model-value="grade"
          @update:model-value="$emit('update:grade', $event)"
          :options="grades"
          placeholder="Select grade"
          :disabled="loading"
        />
      </div>

      <!-- Subject -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="subject">Subject</label>
        <USelect
          :model-value="subject"
          @update:model-value="$emit('update:subject', $event)"
          :options="subjects"
          placeholder="Select subject"
          :disabled="loading"
        />
      </div>

      <!-- Topic -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="topic">Topic</label>
        <USelect
          :model-value="topic"
          @update:model-value="$emit('update:topic', $event)"
          :options="topics"
          placeholder="Select topic"
          :disabled="loading"
        />
      </div>

      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="difficulty">Difficulty</label>
        <USelect
          :model-value="difficulty"
          @update:model-value="$emit('update:difficulty', $event)"
          :options="difficulties"
          :disabled="loading"
        />
      </div>

      <!-- Time Per Question -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="time-per-question">Time Per Question (seconds)</label>
        <USelect
          :model-value="timePerQuestion"
          @update:model-value="$emit('update:timePerQuestion', $event)"
          :options="timeOptions"
          :disabled="loading"
        />
      </div>

      <!-- Number of Questions -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none" for="total-questions">Number of Questions</label>
        <USelect
          :model-value="totalQuestions"
          @update:model-value="$emit('update:totalQuestions', $event)"
          :options="questionCountOptions"
          :disabled="loading"
        />
      </div>
    </div>

    <div class="flex items-center pt-4">
      <UButton
        color="primary"
        class="w-full !bg-brand-600 hover:!bg-brand-700"
        :disabled="loading || !canStart"
        @click="!loading && canStart && $emit('start')"
      >
        <span v-if="!loading">{{ buttonText }}</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Creating...
        </span>
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  battleType: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  gradesOptions: { type: Array, required: true },
  subjectsOptions: { type: Array, required: true },
  topicsOptions: { type: Array, required: true },
  optionsLoading: { type: Boolean, default: false },
  difficulty: { type: String, required: true },
  timePerQuestion: { type: [Number, String], required: true },
  totalQuestions: { type: [Number, String], required: true },
  buttonText: { type: String, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits([
  'update:battleType',
  'update:grade',
  'update:subject',
  'update:topic',
  'update:difficulty',
  'update:timePerQuestion',
  'update:totalQuestions',
  'start'
])

// Options must be provided by parent (fetched from API)
const grades = props.gradesOptions
const subjects = props.subjectsOptions
const topics = props.topicsOptions

const difficulties = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' }
]

const timeOptions = [
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
  { label: '15 seconds', value: 15 },
  { label: '20 seconds', value: 20 },
  { label: '30 seconds', value: 30 }
]

const questionCountOptions = [
  { label: '5 questions', value: 5 },
  { label: '10 questions', value: 10 },
  { label: '15 questions', value: 15 },
  { label: '20 questions', value: 20 }
]

const canStart = computed(() => {
  if (props.optionsLoading) return false
  if (!Array.isArray(props.gradesOptions) || !Array.isArray(props.subjectsOptions) || !Array.isArray(props.topicsOptions)) return false
  if (!props.grade || !props.subject || !props.topic) return false
  return true
})
</script>
