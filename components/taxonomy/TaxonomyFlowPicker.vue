<template>
  <div class="w-full">
    <!-- Main Card Container -->
    <div class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <!-- Search Bar -->
      <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="flex-1 border-0 bg-transparent text-sm placeholder-slate-400 outline-none dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <!-- Breadcrumb Selections -->
      <div v-if="selections.level || selections.grade || selections.subject || selections.topic" class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div class="flex flex-wrap gap-2">
          <div v-if="selections.level" class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <span>{{ selections.level.name }}</span>
            <button type="button" @click="clearFrom('level')" class="ml-1 hover:text-blue-900 dark:hover:text-blue-100">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div v-if="selections.grade" class="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <span>{{ selections.grade.name }}</span>
            <button type="button" @click="clearFrom('grade')" class="ml-1 hover:text-green-900 dark:hover:text-green-100">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <template v-if="selections.subject">
            <template v-if="Array.isArray(selections.subject)">
              <div
                v-for="subject in selections.subject"
                :key="subject.id"
                class="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                <span>{{ subject.name }}</span>
                <button
                  type="button"
                  @click="selectSubject(subject)"
                  class="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </template>
            <div
              v-else
              class="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              <span>{{ (selections.subject as TaxonomyItem).name }}</span>
              <button type="button" @click="clearFrom('subject')" class="ml-1 hover:text-purple-900 dark:hover:text-purple-100">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </template>
          <div v-if="selections.topic" class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <span>{{ selections.topic.name }}</span>
            <button type="button" @click="clearFrom('topic')" class="ml-1 hover:text-amber-900 dark:hover:text-amber-100">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Step Indicators -->
      <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <button
            v-for="(step, index) in steps"
            :key="step.key"
            type="button"
            @click="currentStep = index"
            :disabled="!canAccessStep(index)"
            class="flex flex-col items-center gap-1"
            :class="{ 'opacity-50 cursor-not-allowed': !canAccessStep(index) }"
          >
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors"
              :class="{
                'border-blue-600 bg-blue-600 text-white': currentStep > index || stepCompleted(index),
                'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30': currentStep === index,
                'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-700/30': currentStep < index && !stepCompleted(index),
              }"
            >
              {{ index + 1 }}
            </div>
            <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ step.label }}</span>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="px-4 py-4">
        <!-- Level Selection -->
        <div v-if="currentStep === 0" class="space-y-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Education Level</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Choose your education level to continue</p>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingLevels" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div v-for="i in 3" :key="i" class="h-20 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div v-else-if="filteredLevels.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
              <svg class="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p class="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No levels found</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search</p>
            </div>
            <div v-else>
              <ul class="divide-y divide-slate-100 dark:divide-slate-700">
                <li
                  v-for="level in filteredLevels"
                  :key="level.id"
                  class="py-3 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-start justify-between"
                  @click="selectLevel(level)"
                >
                  <div>
                    <div :class="{'font-semibold text-slate-900 dark:text-slate-100': selections.level?.id === level.id, 'text-slate-800 dark:text-slate-200': selections.level?.id !== level.id}">{{ level.name }}</div>
                    <div v-if="level.description" class="text-xs text-slate-500 dark:text-slate-400">{{ level.description }}</div>
                  </div>
                  <div class="ml-3">
                    <svg v-if="selections.level?.id === level.id" class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"></path></svg>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Grade Selection -->
        <div v-if="currentStep === 1" class="space-y-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Grade / Course</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Choose a grade or course for {{ selections.level?.name }}</p>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingGrades" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div v-for="i in 3" :key="i" class="h-20 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div v-else-if="filteredGrades.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
              <svg class="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p class="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No grades found</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search</p>
            </div>
            <div v-else>
              <ul class="divide-y divide-slate-100 dark:divide-slate-700">
                <li
                  v-for="grade in filteredGrades"
                  :key="grade.id"
                  class="py-3 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-start justify-between"
                  @click="selectGrade(grade)"
                >
                  <div>
                    <div :class="{'font-semibold text-slate-900 dark:text-slate-100': selections.grade?.id === grade.id, 'text-slate-800 dark:text-slate-200': selections.grade?.id !== grade.id}">{{ grade.name }}</div>
                    <div v-if="grade.description" class="text-xs text-slate-500 dark:text-slate-400">{{ grade.description }}</div>
                  </div>
                  <div class="ml-3">
                    <svg v-if="selections.grade?.id === grade.id" class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"></path></svg>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Subject Selection -->
        <div v-if="currentStep === 2" class="space-y-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Select Subject{{ multiSelectSubjects ? '(s)' : '' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ multiSelectSubjects ? 'Choose one or more subjects' : 'Choose a subject' }} for {{ selections.grade?.name }}
            </p>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingSubjects" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div v-for="i in 3" :key="i" class="h-20 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div v-else-if="filteredSubjects.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
              <svg class="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p class="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No subjects found</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search</p>
            </div>
            <div v-else>
              <ul class="divide-y divide-slate-100 dark:divide-slate-700">
                <li
                  v-for="subject in filteredSubjects"
                  :key="subject.id"
                  class="py-3 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-start justify-between"
                  @click="selectSubject(subject)"
                >
                  <div>
                    <div :class="{'font-semibold text-slate-900 dark:text-slate-100': isSubjectSelected(subject), 'text-slate-800 dark:text-slate-200': !isSubjectSelected(subject)}">{{ subject.name }}</div>
                    <div v-if="subject.description" class="text-xs text-slate-500 dark:text-slate-400">{{ subject.description }}</div>
                  </div>
                  <div class="ml-3">
                    <svg v-if="isSubjectSelected(subject)" class="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Topic Selection -->
        <div v-if="currentStep === 3" class="space-y-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Topic</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Choose a topic for
              <template v-if="Array.isArray(selections.subject)">
                {{ selections.subject[0]?.name }}
              </template>
              <template v-else>
                {{ (selections.subject as TaxonomyItem)?.name }}
              </template>
            </p>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingTopics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div v-for="i in 3" :key="i" class="h-20 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div v-else-if="filteredTopics.length === 0" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
              <svg class="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p class="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No topics found</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search</p>
            </div>
            <div v-else>
              <ul class="divide-y divide-slate-100 dark:divide-slate-700">
                <li
                  v-for="topic in pagedTopics"
                  :key="topic.id"
                  class="py-3 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-start justify-between"
                  @click="selectTopic(topic)"
                >
                  <div>
                    <div :class="{'font-semibold text-slate-900 dark:text-slate-100': selections.topic?.id === topic.id, 'text-slate-800 dark:text-slate-200': selections.topic?.id !== topic.id}">{{ topic.name }}</div>
                    <div v-if="topic.description" class="text-xs text-slate-500 dark:text-slate-400">{{ topic.description }}</div>
                  </div>
                  <div class="ml-3">
                    <svg v-if="selections.topic?.id === topic.id" class="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"></path></svg>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Pagination for Topics -->
          <div v-if="totalTopicPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <span class="text-xs text-slate-600 dark:text-slate-400">
              {{ (currentTopicPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentTopicPage * itemsPerPage, filteredTopics.length) }} of {{ filteredTopics.length }}
            </span>
            <div class="flex gap-1">
              <button
                type="button"
                @click="currentTopicPage--"
                :disabled="currentTopicPage === 1"
                class="rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                type="button"
                @click="currentTopicPage++"
                :disabled="currentTopicPage === totalTopicPages"
                class="rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            @click="previousStep"
            :disabled="currentStep === 0"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Previous
          </button>
          <div class="flex gap-2">
            <button
              type="button"
              @click="reset"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Reset
            </button>
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              :disabled="!canGoNext"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Next
            </button>
            <button
              v-else-if="!props.multiSelectSubjects || currentStep > 2"
              type="button"
              @click="submit"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Done
            </button>
            <button
              v-else-if="props.multiSelectSubjects && currentStep === 2"
              type="button"
              @click="submit"
              :disabled="!Array.isArray(selections.subject) || selections.subject.length === 0"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import useApi from '~/composables/useApi'

interface TaxonomyItem {
  id: string | number
  name: string
  description?: string
  [key: string]: any
}

interface SelectionState {
  level: TaxonomyItem | null
  grade: TaxonomyItem | null
  subject: TaxonomyItem | TaxonomyItem[] | null
  topic: TaxonomyItem | null
}

const props = defineProps({
  modelValue: {
    type: Object as () => SelectionState | null,
    default: null
  },
  includeTopics: {
    type: Boolean,
    default: true
  },
  multiSelectSubjects: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: SelectionState]
  submit: [value: SelectionState]
}>()

const store = useTaxonomyStore()

// State
const currentStep = ref(0)
const searchQuery = ref('')
const selections = ref<SelectionState>({
  level: null,
  grade: null,
  subject: props.multiSelectSubjects ? [] : null,
  topic: null
})

const loadingLevels = ref(false)
const loadingGrades = ref(false)
const loadingSubjects = ref(false)
const loadingTopics = ref(false)

const levels = ref<TaxonomyItem[]>([])
const grades = ref<TaxonomyItem[]>([])
const subjects = ref<TaxonomyItem[]>([])
const topics = ref<TaxonomyItem[]>([])

const currentTopicPage = ref(1)
const itemsPerPage = computed(() => props.itemsPerPage)

// Steps configuration
const steps = computed(() => {
  const s = [
    { key: 'level', label: 'Level' },
    { key: 'grade', label: 'Grade' },
    { key: 'subject', label: 'Subject' }
  ]
  if (props.includeTopics) {
    s.push({ key: 'topic', label: 'Topic' })
  }
  return s
})

// Filtered and paginated data
const filteredLevels = computed(() => {
  if (!searchQuery.value) return levels.value
  const q = searchQuery.value.toLowerCase()
  return levels.value.filter(l => l.name.toLowerCase().includes(q))
})

const filteredGrades = computed(() => {
  if (!searchQuery.value) return grades.value
  const q = searchQuery.value.toLowerCase()
  return grades.value.filter(g => g.name.toLowerCase().includes(q))
})

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return subjects.value
  const q = searchQuery.value.toLowerCase()
  return subjects.value.filter(s => s.name.toLowerCase().includes(q))
})

const filteredTopics = computed(() => {
  if (!searchQuery.value) return topics.value
  const q = searchQuery.value.toLowerCase()
  return topics.value.filter(t => t.name.toLowerCase().includes(q))
})

const pagedTopics = computed(() => {
  const start = (currentTopicPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTopics.value.slice(start, end)
})

const totalTopicPages = computed(() => {
  return Math.ceil(filteredTopics.value.length / itemsPerPage.value) || 1
})

// Navigation logic
const canGoNext = computed(() => {
  if (currentStep.value === 0) return selections.value.level !== null
  if (currentStep.value === 1) return selections.value.grade !== null
  if (currentStep.value === 2) {
    if (props.multiSelectSubjects) {
      // In multi-select mode, need at least one subject
      return Array.isArray(selections.value.subject) && selections.value.subject.length > 0
    }
    return selections.value.subject !== null
  }
  return false
})

const canAccessStep = (step: number) => {
  if (step === 0) return true
  if (step === 1) return selections.value.level !== null
  if (step === 2) return selections.value.grade !== null
  if (step === 3) return selections.value.subject !== null
  return false
}

const stepCompleted = (step: number) => {
  if (step === 0) return selections.value.level !== null
  if (step === 1) return selections.value.grade !== null
  if (step === 2) return selections.value.subject !== null
  if (step === 3) return selections.value.topic !== null
  return false
}

// Selection methods
const selectLevel = (level: TaxonomyItem) => {
  selections.value.level = level
  selections.value.grade = null
  selections.value.subject = null
  selections.value.topic = null
  fetchGrades(level.id)
  emit('update:modelValue', selections.value)
  nextStep()
}

const selectGrade = (grade: TaxonomyItem) => {
  selections.value.grade = grade
  selections.value.subject = null
  selections.value.topic = null
  fetchSubjects(grade.id)
  emit('update:modelValue', selections.value)
  nextStep()
}

const isSubjectSelected = (subject: TaxonomyItem): boolean => {
  if (props.multiSelectSubjects) {
    const subjects = selections.value.subject as TaxonomyItem[]
    return Array.isArray(subjects) && subjects.some(s => s.id === subject.id)
  }
  return (selections.value.subject as TaxonomyItem)?.id === subject.id
}

const selectSubject = (subject: TaxonomyItem) => {
  if (props.multiSelectSubjects) {
    // Multi-select mode: toggle subject in array
    const subjects = Array.isArray(selections.value.subject) ? [...selections.value.subject] : []
    const index = subjects.findIndex(s => s.id === subject.id)
    if (index >= 0) {
      subjects.splice(index, 1)
    } else {
      subjects.push(subject)
    }
    selections.value.subject = subjects
    emit('update:modelValue', selections.value)
    // Don't auto-advance in multi-select mode
  } else {
    // Single-select mode: replace subject
    selections.value.subject = subject
    selections.value.topic = null
    if (props.includeTopics) {
      fetchTopics(subject.id)
      emit('update:modelValue', selections.value)
      nextStep()
    } else {
      emit('update:modelValue', selections.value)
      submit()
    }
  }
}

const selectTopic = (topic: TaxonomyItem) => {
  selections.value.topic = topic
  emit('update:modelValue', selections.value)
  submit()
}

// Fetch methods
const fetchLevels = async () => {
  loadingLevels.value = true
  try {
    await store.fetchLevels()
    levels.value = (store.levels || []).map(l => ({
      id: l.id,
      name: l.name,
      description: l.description
    }))
  } catch (e) {
    console.error('Error fetching levels:', e)
  } finally {
    loadingLevels.value = false
  }
}

const fetchGrades = async (levelId: string | number) => {
  loadingGrades.value = true
  try {
    await store.fetchGrades()
    const allGrades = store.grades || []
    grades.value = allGrades
      .filter(g => String(g.level_id || g.levelId || '') === String(levelId))
      .map(g => ({
        id: g.id,
        name: g.name,
        description: g.description
      }))
  } catch (e) {
    console.error('Error fetching grades:', e)
  } finally {
    loadingGrades.value = false
  }
}

const fetchSubjects = async (gradeId: string | number) => {
  loadingSubjects.value = true
  try {
    await store.fetchSubjectsByGrade(gradeId)
    subjects.value = (store.subjects || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }))
  } catch (e) {
    console.error('Error fetching subjects:', e)
  } finally {
    loadingSubjects.value = false
  }
}

const fetchTopics = async (subjectId: string | number) => {
  loadingTopics.value = true
  currentTopicPage.value = 1
  try {
    await store.fetchTopicsBySubject(subjectId)
    topics.value = (store.topics || []).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description
    }))
  } catch (e) {
    console.error('Error fetching topics:', e)
  } finally {
    loadingTopics.value = false
  }
}

// Navigation
const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Clear selections from a specific step onwards
const clearFrom = (step: keyof SelectionState) => {
  if (step === 'level') {
    selections.value.level = null
    selections.value.grade = null
    selections.value.subject = null
    selections.value.topic = null
    currentStep.value = 0
  } else if (step === 'grade') {
    selections.value.grade = null
    selections.value.subject = null
    selections.value.topic = null
    currentStep.value = 1
  } else if (step === 'subject') {
    selections.value.subject = null
    selections.value.topic = null
    currentStep.value = 2
  } else if (step === 'topic') {
    selections.value.topic = null
    currentStep.value = 3
  }
  emit('update:modelValue', selections.value)
}

const reset = () => {
  selections.value = {
    level: null,
    grade: null,
    subject: props.multiSelectSubjects ? [] : null,
    topic: null
  }
  currentStep.value = 0
  searchQuery.value = ''
  currentTopicPage.value = 1
  emit('update:modelValue', selections.value)
}

const submit = () => {
  emit('submit', selections.value)
}

// Watch for external changes to modelValue (e.g., when editing existing data)
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue) {
      selections.value = newValue
      // Trigger data fetch cascade if we have level selected
      if (newValue.level) {
        currentStep.value = 1
        const levelId = (newValue.level as TaxonomyItem).id
        await fetchGrades(levelId)
        if (newValue.grade) {
          currentStep.value = 2
          const gradeId = (newValue.grade as TaxonomyItem).id
          await fetchSubjects(gradeId)
          if (newValue.subject) {
            const subjectId = Array.isArray(newValue.subject)
              ? newValue.subject[0]?.id
              : (newValue.subject as TaxonomyItem).id
            if (subjectId && props.includeTopics) {
              currentStep.value = 3
              await fetchTopics(subjectId)
            }
          }
        }
      }
    }
  },
  { deep: true }
)

// Initialize
onMounted(async () => {
  await fetchLevels()
  if (props.modelValue) {
    selections.value = props.modelValue
    if (selections.value.level) {
      currentStep.value = 1
      const lvlId = (selections.value.level as TaxonomyItem).id
      await fetchGrades(lvlId)
      if (selections.value.grade) {
        currentStep.value = 2
        const grdId = (selections.value.grade as TaxonomyItem).id
        await fetchSubjects(grdId)
        if (selections.value.subject) {
          // Handle both single subject and array of subjects
          const subjectId = Array.isArray(selections.value.subject)
            ? selections.value.subject[0]?.id
            : (selections.value.subject as TaxonomyItem).id
          if (subjectId && props.includeTopics) {
            currentStep.value = 3
            await fetchTopics(subjectId)
          }
        }
      }
    }
  }
  // If no explicit modelValue provided, allow URL query params to prefill selections
  else {
    try {
      const route = useRoute()
      const q = route.query || {}
      const levelId = q.level_id ?? q.levelId ?? q.level ?? null
      const gradeId = q.grade_id ?? q.gradeId ?? q.grade ?? null
      const subjectId = q.subject_id ?? q.subjectId ?? q.subject ?? null
      const topicId = q.topic_id ?? q.topicId ?? q.topic ?? null

  // Always return a string (empty string when input is null/undefined).
  // This simplifies later use where we only enter the guarded branches
  // when the original query value was present.
  const asString = (v: any) => (v === null || typeof v === 'undefined') ? '' : String(v)

      const api = useApi()

    if (levelId) {
  const levelIdStr = asString(levelId)
    // Ensure levels loaded
    if (!levels.value || levels.value.length === 0) await fetchLevels()
    let foundLevel: TaxonomyItem | undefined = levels.value.find(l => String(l.id) === levelIdStr)
    if (!foundLevel) {
          // Try server fetch-by-id fallback
          try {
            const res = await api.get(`/api/levels/${encodeURIComponent(levelIdStr)}`)
            if (res.ok) {
              const data = await res.json().catch(() => null)
              // server may return { level: {...} } or direct object
              const serverLevel = data?.level || data?.data || data || null
                if (serverLevel) {
                foundLevel = { id: String(serverLevel.id ?? levelIdStr), name: serverLevel.name ?? serverLevel.title ?? `Level #${levelIdStr}` }
                // insert into local list so picker can display it
                if (foundLevel) {
                  levels.value = [foundLevel, ...levels.value.filter(l => String(l.id) !== String(foundLevel.id))]
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
  selections.value.level = foundLevel ?? { id: levelIdStr, name: `Level #${levelIdStr}` }
  currentStep.value = 1
  // load grades for this level
  if (selections.value.level) await fetchGrades((selections.value.level as TaxonomyItem).id)
      }

  if (gradeId) {
  const gradeIdStr = asString(gradeId)
    if (!grades.value || grades.value.length === 0) await fetchGrades(asString(selections.value.level?.id))
    let foundGrade: TaxonomyItem | undefined = grades.value.find(g => String(g.id) === gradeIdStr)
    if (!foundGrade) {
          try {
            const res = await api.get(`/api/grades/${encodeURIComponent(gradeIdStr)}`)
            if (res.ok) {
              const data = await res.json().catch(() => null)
              const serverGrade = data?.grade || data?.data || data || null
                if (serverGrade) {
                foundGrade = { id: String(serverGrade.id ?? gradeIdStr), name: serverGrade.name ?? serverGrade.title ?? `Grade #${gradeIdStr}`, level_id: serverGrade.level_id ?? serverGrade.level ?? selections.value.level?.id }
                if (foundGrade) {
                  grades.value = [foundGrade, ...grades.value.filter(g => String(g.id) !== String(foundGrade.id))]
                }
              }
            }
          } catch (e) {}
        }
  selections.value.grade = foundGrade ?? { id: gradeIdStr, name: `Grade #${gradeIdStr}`, level_id: selections.value.level?.id }
  currentStep.value = 2
  // load subjects for this grade
  if (selections.value.grade) await fetchSubjects((selections.value.grade as TaxonomyItem).id)
      }

  if (subjectId) {
  const subjectIdStr = asString(subjectId)
    if (!subjects.value || subjects.value.length === 0) await fetchSubjects(asString(selections.value.grade?.id))
    let foundSubject: TaxonomyItem | undefined = subjects.value.find(s => String(s.id) === subjectIdStr)
    if (!foundSubject) {
          try {
            const res = await api.get(`/api/subjects/${encodeURIComponent(subjectIdStr)}`)
            if (res.ok) {
              const data = await res.json().catch(() => null)
              const serverSubject = data?.subject || data?.data || data || null
                if (serverSubject) {
                foundSubject = { id: String(serverSubject.id ?? subjectIdStr), name: serverSubject.name ?? serverSubject.title ?? `Subject #${subjectIdStr}`, grade_id: serverSubject.grade_id ?? serverSubject.grade ?? selections.value.grade?.id }
                if (foundSubject) {
                  subjects.value = [foundSubject, ...subjects.value.filter(s => String(s.id) !== String(foundSubject.id))]
                }
              }
            }
          } catch (e) {}
        }
  selections.value.subject = foundSubject ?? { id: subjectIdStr, name: `Subject #${subjectIdStr}`, grade_id: selections.value.grade?.id }
  currentStep.value = 3
  // load topics for this subject
  if (props.includeTopics && selections.value.subject) await fetchTopics((selections.value.subject as TaxonomyItem).id)
      }

  if (topicId && props.includeTopics) {
  const topicIdStr = asString(topicId)
  const subjectIdForTopics = Array.isArray(selections.value.subject) ? selections.value.subject[0]?.id : (selections.value.subject as TaxonomyItem)?.id
  if (!topics.value || topics.value.length === 0) await fetchTopics(asString(subjectIdForTopics))
    let foundTopic: TaxonomyItem | undefined = topics.value.find(t => String(t.id) === topicIdStr)
    if (!foundTopic) {
          try {
            const res = await api.get(`/api/topics/${encodeURIComponent(topicIdStr)}`)
            if (res.ok) {
              const data = await res.json().catch(() => null)
              const serverTopic = data?.topic || data?.data || data || null
                if (serverTopic) {
                foundTopic = { id: String(serverTopic.id ?? topicIdStr), name: serverTopic.name ?? serverTopic.title ?? `Topic #${topicIdStr}`, subject_id: serverTopic.subject_id ?? (Array.isArray(selections.value.subject) ? selections.value.subject[0]?.id : (selections.value.subject as TaxonomyItem)?.id) }
                if (foundTopic) {
                  topics.value = [foundTopic, ...topics.value.filter(t => String(t.id) !== String(foundTopic.id))]
                }
              }
            }
          } catch (e) {}
        }
        selections.value.topic = foundTopic ?? { id: topicIdStr, name: `Topic #${topicIdStr}`, subject_id: (Array.isArray(selections.value.subject) ? selections.value.subject[0]?.id : (selections.value.subject as TaxonomyItem)?.id) }
        currentStep.value = steps.value.length - 1
      }

      // update parent with derived selections
      emit('update:modelValue', selections.value)
    } catch (e) {
      // non-fatal
      console.warn('TaxonomyFlowPicker: failed to prefill from query', e)
    }
  }
})
</script>

<style scoped>
/* Smooth transitions for step changes */
</style>
