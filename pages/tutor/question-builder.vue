<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-6xl space-y-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Question Builder</h1>
          <p class="text-gray-600">Craft clear, answerable questions for your quizzes in just a few steps.</p>
        </div>
        <NuxtLink
          to="/quiz-master/questions"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 w-full sm:w-auto justify-center"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to questions
        </NuxtLink>
      </div>

      <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" @submit.prevent="handleSubmit">
          <section class="space-y-3">
            <header class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Question content</h2>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Step 1</span>
            </header>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Question text <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.body"
                rows="4"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. What is the derivative of sin(x)?"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                Use clear wording. You can paste formatted text or LaTeX that matches what learners will see.
              </p>
            </div>
          </section>

          <section class="space-y-3">
            <header class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Question type</h2>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Step 2</span>
            </header>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                v-for="type in questionTypes"
                :key="type.value"
                type="button"
                @click="selectType(type.value)"
                :class="[
                  'rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-200',
                  form.type === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-500'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">{{ type.label }}</span>
                  <span v-if="form.type === type.value" class="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-medium text-white">
                    Selected
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ type.description }}</p>
              </button>
            </div>
          </section>

          <section v-if="requiresOptions" class="space-y-4">
            <header class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Answer options</h2>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Step 3</span>
            </header>

            <div class="space-y-3">
              <transition-group name="list" tag="div" class="space-y-3">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm transition hover:border-indigo-200 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div class="flex flex-1 items-start gap-3">
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-600">
                      {{ index + 1 }}
                    </span>
                    <input
                      v-model="form.options[index]"
                      class="flex-1 rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Option {{ index + 1 }}"
                    />
                  </div>
                  <div class="flex items-center justify-between gap-2 sm:w-40 flex-col sm:flex-row">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-rose-300 hover:text-rose-500 w-full sm:w-auto justify-center"
                      @click="removeOption(index)"
                      :disabled="form.options.length <= minOptions"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-500 w-full sm:w-auto justify-center"
                      @click="duplicateOption(index)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16h8m-8-4h8m-8-4h8M4 6h1a2 2 0 012 2v12a2 2 0 01-2 2H4zM19 4h1a2 2 0 012 2v12a2 2 0 01-2 2h-1a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                      Duplicate
                    </button>
                  </div>
                </div>
              </transition-group>

              <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-100"
                  @click="addOption"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add option
                </button>
                <p class="text-xs text-gray-500">{{ minOptions }}–{{ maxOptions }} options recommended.</p>
              </div>
            </div>

            <div class="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <h3 class="text-sm font-semibold text-indigo-800">Mark correct answers</h3>
              <p class="mb-3 text-xs text-indigo-700">
                {{ form.type === 'mcq'
                  ? 'Pick exactly one correct answer.'
                  : 'Select every option that is correct. Learners must choose all to receive credit.'
                }}
              </p>

              <div v-if="form.type === 'mcq'" class="grid gap-2 sm:grid-cols-2">
                <label
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="inline-flex items-center gap-2 rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <input
                    v-model.number="form.correct"
                    :value="index"
                    type="radio"
                    name="correct"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{{ option || 'Option ' + (index + 1) }}</span>
                </label>
              </div>

              <div v-else class="grid gap-2 sm:grid-cols-2">
                <label
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="inline-flex items-center gap-2 rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    :value="index"
                    :checked="form.corrects.includes(index)"
                    @change="toggleCorrect(index)"
                  />
                  <span>{{ option || 'Option ' + (index + 1) }}</span>
                </label>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <header class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Difficulty</h2>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Step 4</span>
            </header>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Difficulty (1-5)</label>
              <input
                type="range"
                v-model.number="form.difficulty"
                :min="1"
                :max="5"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-indigo-300 to-indigo-500"
              />
              <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Easy</span>
                <span class="font-medium text-gray-700">{{ difficultyLabel }}</span>
                <span>Advanced</span>
              </div>
            </div>
          </section>

          <footer class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-xs text-gray-500">
              All fields marked with <span class="text-red-500">*</span> are required. Changes are local until you submit.
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-gray-900"
                @click="resetForm"
              >
                Reset form
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
              >
                <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ submitting ? 'Saving…' : 'Save question' }}
              </button>
            </div>
          </footer>
        </form>

        <aside class="space-y-4 rounded-2xl border border-indigo-100 bg-white/80 p-6 text-sm text-indigo-900 shadow-inner">
          <header class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-indigo-800">Live preview</h3>
              <p class="text-xs text-indigo-600">See how learners will experience this question.</p>
            </div>
            <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">quiz-master view</span>
          </header>

          <div class="space-y-4">
            <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
              <p class="text-sm text-gray-700" v-html="form.body || '<em class=\'text-indigo-400\'>Start typing your question…</em>'"></p>
            </div>

            <div v-if="requiresOptions" class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-indigo-500">Options</label>
              <div class="space-y-2">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
                >
                  <input
                    :type="form.type === 'mcq' ? 'radio' : 'checkbox'"
                    disabled
                    class="h-4 w-4 text-indigo-600"
                    :checked="form.type === 'mcq' ? form.correct === index : form.corrects.includes(index)"
                  />
                  <span>{{ option || 'Option ' + (index + 1) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-xs text-indigo-600">
              This question type doesn’t require predefined options.
            </div>

            <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600">
              <div class="flex items-center justify-between">
                <span><strong class="font-semibold text-gray-700">Difficulty:</strong> {{ difficultyLabel }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({ layout: 'quiz-master' })

const cfg = useRuntimeConfig()
const minOptions = 2
const maxOptions = 6

const form = ref({
  body: '',
  type: 'mcq',
  options: ['', ''],
  correct: 0,
  corrects: [],
  difficulty: 2
})

const submitting = ref(false)

const questionTypes = [
  { value: 'mcq', label: 'Multiple choice', description: 'Learner selects a single correct option.' },
  { value: 'multi', label: 'Multiple select', description: 'Learner selects all correct options.' },
  { value: 'short', label: 'Short answer', description: 'Learner writes a brief response.' },
  { value: 'numeric', label: 'Numeric', description: 'Learner inputs a number.' },
  { value: 'fill_blank', label: 'Fill in the blanks', description: 'Learner fills in missing words in text.' },
  { value: 'image_mcq', label: 'Image MCQ', description: 'MCQ with an image upload or URL.' },
  { value: 'audio_mcq', label: 'Audio MCQ', description: 'MCQ with an audio file or URL.' },
  { value: 'video_mcq', label: 'Video MCQ', description: 'MCQ with a YouTube video URL.' }
]

const requiresOptions = computed(() => ['mcq', 'multi'].includes(form.value.type))

const difficultyLabel = computed(() => {
  const level = form.value.difficulty
  if (level <= 1) return 'Very easy'
  if (level === 2) return 'Easy'
  if (level === 3) return 'Moderate'
  if (level === 4) return 'Challenging'
  return 'Expert level'
})

function selectType(type) {
  form.value.type = type
  if (requiresOptions.value && form.value.options.length < minOptions) {
    form.value.options = Array.from({ length: minOptions }, () => '')
  }
  if (!requiresOptions.value) {
    form.value.options = []
    form.value.corrects = []
  }
  if (type === 'mcq') {
    form.value.correct = 0
  }
}

function addOption() {
  if (form.value.options.length >= maxOptions) return
  form.value.options.push('')
}

function duplicateOption(index) {
  if (form.value.options.length >= maxOptions) return
  form.value.options.splice(index + 1, 0, form.value.options[index] || '')
}

function removeOption(index) {
  if (form.value.options.length <= minOptions) return
  form.value.options.splice(index, 1)
  if (form.value.type === 'mcq' && form.value.correct >= form.value.options.length) {
    form.value.correct = Math.max(0, form.value.options.length - 1)
  }
  if (form.value.type === 'multi') {
    form.value.corrects = form.value.corrects.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
  }
}

function toggleCorrect(index) {
  const current = new Set(form.value.corrects)
  if (current.has(index)) current.delete(index)
  else current.add(index)
  form.value.corrects = Array.from(current).sort()
}

function resetForm() {
  form.value = {
    body: '',
    type: 'mcq',
    options: ['', ''],
    correct: 0,
    corrects: [],
    difficulty: 2
  }
}

function mapIndexToValue(index) {
  if (!Array.isArray(form.value.options)) return String(index)
  if (index === -1) return null
  return form.value.options[index] !== undefined ? form.value.options[index] : String(index)
}

async function handleSubmit() {
  if (!form.value.body.trim()) {
    window.alert('Please enter the question text before saving.'); return
  }
  if (requiresOptions.value && form.value.options.some(opt => !opt.trim())) {
    window.alert('Please fill in all option fields or remove unused ones.'); return
  }
  if (requiresOptions.value && form.value.type === 'mcq' && (form.value.correct < 0 || form.value.correct >= form.value.options.length)) {
    window.alert('Please pick a correct answer.'); return
  }
  if (requiresOptions.value && form.value.type === 'multi' && form.value.corrects.length === 0) {
    window.alert('Please mark at least one correct option.'); return
  }

  submitting.value = true
  const payload = {
    body: form.value.body,
    type: form.value.type,
    options: form.value.options,
    answers:
      form.value.type === 'mcq'
        ? [mapIndexToValue(form.value.correct)].filter(v => v !== null)
        : (form.value.corrects || []).map(mapIndexToValue).filter(v => v !== null),
    difficulty: form.value.difficulty
  }

  try {
    const res = await fetch(cfg.public.apiBase + '/api/questions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      window.location.href = '/quiz-master/questions'
    } else {
      window.alert('Failed to save the question. Please try again.')
    }
  } catch (error) {
    window.alert('Network error. Please check your connection and try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: #4338ca;
  border: 3px solid #ffff;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(67, 56, 202, 0.4);
}
input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: #4338ca;
  border: 3px solid #ffff;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(67, 56, 202, 0.4);
}
</style>