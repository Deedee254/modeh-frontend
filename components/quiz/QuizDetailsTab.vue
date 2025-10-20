<template>
  <div class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg font-medium mb-6">Quiz Details</h2>

      <!-- Basic Info Section -->
      <div class="space-y-6 mb-8">
        <div>
          <label for="quiz-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            v-model="modelValue.title"
            type="text"
            id="quiz-title"
            aria-describedby="title-error"
            :class="[ 'w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500', errors._title ? 'border-red-300' : '' ]"
          />
          <p v-if="errors._title" id="title-error" class="mt-1 text-sm text-red-600">{{ errors._title }}</p>
        </div>

        <!-- Grade & Subject Selection (stacked: subject below grade) -->
        <div class="space-y-4">
          <div>
            <label for="quiz-grade" class="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select 
              v-model="selectedGrade"
              id="quiz-grade"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Grade</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>

          <div>
            <label id="subject-label" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <TaxonomyPicker
              resource="subjects"
              :gradeId="selectedGrade || null"
              :perPage="50"
              title="Subjects"
              subtitle="Pick a subject"
              @selected="onSubjectPicked"
              aria-labelledby="subject-label"
            />
          </div>
        </div>

        <!-- Topic Selection -->
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label id="topic-label" class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <TaxonomyPicker
              ref="topicsPicker"
              resource="topics"
              :subjectId="selectedSubject || null"
              :perPage="50"
              title="Topics"
              subtitle="Pick or create a topic"
              aria-labelledby="topic-label"
              aria-describedby="topic-error"
              @selected="onTopicPicked"
            >
              <template #actions>
                <button
                  type="button"
                  @click="openCreateTopic"
                  :disabled="!selectedSubject"
                  class="inline-flex items-center justify-center gap-x-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-60"
                ><span>New Topic</span></button>
              </template>
            </TaxonomyPicker>
            <p v-if="errors._topic" id="topic-error" class="mt-1 text-sm text-red-600">{{ errors._topic }}</p>
          </div>
        </div>

        <div>
          <label for="quiz-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="modelValue.description"
            id="quiz-description"
            rows="3"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Optional: Add a brief description of this quiz"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Selection confirmation -->
  <div class="mx-auto max-w-4xl mt-4 px-4 sm:px-6">
      <div class="bg-white rounded-lg p-4 border text-sm text-slate-700 dark:bg-slate-800 dark:border-slate-700">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Grade:</span>
            <span class="font-medium">{{ selectedGradeName || '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Subject:</span>
            <span class="font-medium">{{ selectedSubjectName || '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Topic:</span>
            <span class="font-medium">{{ selectedTopicName || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
        <div class="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <div class="w-full sm:w-auto">
          <button
            type="button"
            @click="saveAndContinue"
            :disabled="saving"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-x-1.5 px-3 py-2 rounded-md text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            <span v-if="saving" class="animate-pulse mr-2">Saving…</span>
            Save and Continue
          </button>
        </div>

        <div class="w-full sm:w-auto">
          <button
            type="button"
            @click="validate"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-x-1.5 px-3 py-2 rounded-md text-sm font-medium shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            Continue to Settings
          </button>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  grades: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  topics: { type: Array, default: () => [] },
  errors: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false },
  loadingSubjects: { type: Boolean, default: false },
  loadingTopics: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'createTopic', 'save', 'next', 'subject-picked', 'topic-picked'])

// Internal selection refs initialized from parent modelValue
const selectedGrade = ref(props.modelValue?.grade_id || '')
const selectedSubject = ref(props.modelValue?.subject_id || '')
const topicsPicker = ref(null)

// Computed lists filtered by selections (client-side fallback)
const subjectsByGrade = computed(() => {
  if (!selectedGrade.value || !Array.isArray(props.subjects)) return []
  return props.subjects.filter(s => s && typeof s === 'object' && String(s.grade_id) === String(selectedGrade.value))
})

const filteredTopics = computed(() => {
  if (!selectedSubject.value || !Array.isArray(props.topics)) return []
  return props.topics.filter(t => t && typeof t === 'object' && String(t.subject_id) === String(selectedSubject.value))
})

// Selected names for confirmation display
const selectedGradeName = computed(() => {
  if (!selectedGrade.value || !Array.isArray(props.grades)) return ''
  const g = props.grades.find(x => String(x.id) === String(selectedGrade.value))
  return g ? g.name : ''
})

const selectedSubjectName = computed(() => {
  if (!selectedSubject.value || !Array.isArray(props.subjects)) return ''
  const s = props.subjects.find(x => String(x.id) === String(selectedSubject.value))
  return s ? s.name : ''
})

const selectedTopicName = computed(() => {
  const tid = props.modelValue?.topic_id || ''
  if (!tid || !Array.isArray(props.topics)) return ''
  const t = props.topics.find(x => String(x.id) === String(tid))
  return t ? t.name : ''
})

// When grade changes, clear subject/topic and notify parent
watch(selectedGrade, (nv) => {
  selectedSubject.value = ''
  emit('update:modelValue', { ...props.modelValue, grade_id: nv || null, subject_id: null, topic_id: '' })
})

// Keep internal selected values in sync with parent changes
watch(() => props.modelValue, (nv) => {
  if (!nv) return
  selectedGrade.value = nv.grade_id || ''
  selectedSubject.value = nv.subject_id || ''
}, { deep: true })

function onSubjectPicked(item) {
  selectedSubject.value = item?.id || ''
  emit('update:modelValue', { ...props.modelValue, subject_id: item?.id || null, topic_id: null })
  // also notify parent directly so callers can preload topics or update other state
  emit('subject-picked', item)
    // auto-focus the topics picker so users can quickly pick a topic after selecting a subject
    try {
        // topicsPicker is a template ref; access the component instance via .value
        const tp = topicsPicker?.value || null
        if (tp && typeof tp.focusSearch === 'function') {
          // small timeout to allow topics picker to refresh its list
          setTimeout(() => {
            try {
              tp.focusSearch()
              if (tp.$el && typeof tp.$el.scrollIntoView === 'function') tp.$el.scrollIntoView({ block: 'center', behavior: 'smooth' })
            } catch (e) {}
          }, 120)
        }
      } catch (e) {}
}

function onTopicPicked(item) {
  emit('update:modelValue', { ...props.modelValue, topic_id: item?.id || null })
  emit('topic-picked', item)
}

function openCreateTopic() {
  emit('createTopic')
}

function validate() {
  if (!props.modelValue.title?.trim()) return false
  if (!props.modelValue.topic_id) return false
  emit('next')
  return true
}

async function saveAndContinue() {
  await emit('save')
  // The parent component should validate before moving to the next step.
  emit('next')
}
</script>