<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Quiz Details</h2>
      <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Set up your quiz step by step</p>
    </div>

    <!-- Error Banner -->
    <div v-if="errors && errors._raw" class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
      <div v-for="(m, idx) in errors._raw" :key="idx" class="text-xs sm:text-sm text-red-700 mb-1">{{ m }}</div>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm font-medium text-gray-600">
        Step <span class="text-brand-600 font-bold">{{ currentStep }}</span> of 4
      </div>
      <div class="flex gap-1.5">
        <button
          v-for="step in 4"
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

    <!-- Step 1: Title -->
    <div v-if="currentStep === 1" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Quiz Title</h3>
        <p class="text-sm text-gray-500">What's your quiz called?</p>
      </div>
      <UInput
        id="quiz-title"
        v-model="title"
        :error="displayTitleError"
        placeholder="Enter quiz title"
        size="lg"
        class="w-full"
        autofocus
        @blur="validateTitle"
        @keydown.enter="titleComplete && nextStep()"
      />
      <p v-if="displayTitleError" class="text-sm text-red-600">{{ displayTitleError }}</p>
      <div class="flex gap-2 justify-between pt-4">
        <div />
        <UButton
          @click="nextStep"
          :disabled="!titleComplete"
          icon="i-heroicons-arrow-right"
          size="md"
          class="!bg-brand-600 hover:!bg-brand-700 text-white"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Step 2: Level & Grade -->
    <div v-if="currentStep === 2" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Education Level & Grade</h3>
        <p class="text-sm text-gray-500">Select the level and grade for your quiz</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="quiz-level" class="block text-sm font-medium text-gray-700 mb-2">Level</label>
          <ClientOnly>
            <template #placeholder>
              <USelect :options="[]" placeholder="Loading…" disabled />
            </template>
            <USelect
              v-model="selectedLevel"
              id="quiz-level"
              :options="levels.map(l => ({ label: l.name, value: l.id }))"
              placeholder="Select Level"
              size="lg"
            />
          </ClientOnly>
        </div>
        <div>
          <label for="quiz-grade" class="block text-sm font-medium text-gray-700 mb-2">Grade / Course <span class="text-red-500">*</span></label>
          <ClientOnly>
            <TaxonomyPicker
              resource="grades"
              :level-id="selectedLevel || null"
              :model-value="selectedGrade || null"
              compact
              title="Grades"
              subtitle="Pick a grade or course"
              @update:modelValue="onGradeModelUpdate"
              @selected="onGradeSelected"
            />
          </ClientOnly>
          <p v-if="displayGradeError" class="mt-1 text-sm text-red-600">{{ displayGradeError }}</p>
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
          @click="nextStep"
          :disabled="!levelGradeComplete"
          icon="i-heroicons-arrow-right"
          size="md"
          class="!bg-brand-600 hover:!bg-brand-700 text-white"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Step 3: Subject & Topic -->
    <div v-if="currentStep === 3" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Subject & Topic</h3>
        <p class="text-sm text-gray-500">Pick a subject and topic for your quiz</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Subject -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <ClientOnly>
            <template #placeholder>
              <div class="h-12 bg-gray-100 rounded animate-pulse"></div>
            </template>
            <TaxonomyPicker
              ref="subjectsPicker"
              resource="subjects"
              :grade-id="selectedGrade || null"
              :per-page="50"
              :model-value="selectedSubjectObj || null"
              title="Subjects"
              subtitle="Pick a subject"
              :disabled="!selectedGrade"
              @selected="onSubjectPicked"
              aria-labelledby="subject-label"
              v-model:query="subjectQuery"
            />
            <p v-if="displaySubjectError" class="text-sm text-red-600">{{ displaySubjectError }}</p>
          </ClientOnly>
        </div>

        <!-- Topic -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <ClientOnly>
            <template #placeholder>
              <div class="h-12 bg-gray-100 rounded animate-pulse"></div>
            </template>
            <TaxonomyPicker
              ref="topicsPicker"
              resource="topics"
              :subject-id="selectedSubject || null"
              :per-page="50"
              :model-value="selectedTopicObj || null"
              title="Topics"
              subtitle="Pick or create a topic"
              :disabled="!selectedSubject"
              aria-labelledby="topic-label"
              aria-describedby="topic-error"
              @selected="onTopicPicked"
              v-model:query="topicQuery"
            >
              <template #actions>
                <UButton
                  size="xs"
                  variant="soft"
                  @click="openCreateTopic"
                  :disabled="!selectedSubject"
                  icon="i-heroicons-plus"
                >New Topic</UButton>
              </template>
            </TaxonomyPicker>
            <p v-if="displayTopicError" id="topic-error" class="text-sm text-red-600">{{ displayTopicError }}</p>
          </ClientOnly>
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
          @click="nextStep"
          :disabled="!subjectComplete || !topicComplete"
          icon="i-heroicons-arrow-right"
          size="md"
          class="!bg-brand-600 hover:!bg-brand-700 text-white"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Step 4: Description & YouTube (Optional) -->
    <div v-if="currentStep === 4" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Extra Information</h3>
        <p class="text-sm text-gray-500">Optional: Add description and media</p>
      </div>
      <div class="space-y-4">
        <div>
          <label for="quiz-description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <UTextarea
            v-model="description"
            id="quiz-description"
            :rows="4"
            placeholder="Brief description of your quiz..."
            size="md"
          />
        </div>

        <div>
          <label for="quiz-youtube" class="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
          <UInput
            v-model="youtubeUrl"
            id="quiz-youtube"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            size="md"
          />
        </div>

        <!-- Cover Image -->
        <ClientOnly>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div class="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div class="w-full sm:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 flex-shrink-0">
                <img v-if="previewUrl" :src="previewUrl" class="object-cover w-full h-full" alt="Quiz cover" />
                <div v-else class="text-xs text-gray-400">No cover</div>
              </div>
              <div class="flex-1 w-full space-y-2">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onCoverChange" />
                <div class="flex gap-2">
                  <UButton size="sm" variant="soft" icon="i-heroicons-photo" @click="triggerFileInput" class="flex-1 sm:flex-none">Choose File</UButton>
                  <UButton size="sm" variant="ghost" color="gray" icon="i-heroicons-trash" @click="removeCover" :disabled="!hasCover" class="flex-1 sm:flex-none">Remove</UButton>
                </div>
                <p class="text-xs text-gray-500">Up to 5MB. JPEG/PNG.</p>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>

      <!-- Summary Banner -->
      <div class="bg-brand-50 rounded-lg border border-brand-200 p-4 mt-6">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-semibold text-brand-900">Quiz Summary:</span>
          <UBadge v-if="selectedLevelName" color="indigo" variant="subtle" size="xs">{{ selectedLevelName }}</UBadge>
          <UBadge v-if="selectedGradeName" color="indigo" variant="subtle" size="xs">{{ selectedGradeName }}</UBadge>
          <UBadge v-if="selectedSubjectName" color="indigo" variant="subtle" size="xs">{{ selectedSubjectName }}</UBadge>
          <UBadge v-if="selectedTopicName" color="indigo" variant="subtle" size="xs">{{ selectedTopicName }}</UBadge>
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
          Next: Settings
        </UButton>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { resolveAssetUrl } from '~/composables/useAssets'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const props = defineProps({
  modelValue: { type: Object, required: true },
  levels: { type: Array, default: () => [] },
  grades: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  topics: { type: Array, default: () => [] },
  errors: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'create-topic', 'save', 'next', 'approval-requested'])

// Local state
const currentStep = ref(1)
const localErrors = ref({ _title: null, _grade: null, _subject: null, _topic: null })
const selectedLevel = ref(props.modelValue?.level_id ?? '')
const selectedGrade = ref(props.modelValue?.grade_id ?? '')
const selectedSubject = ref(props.modelValue?.subject_id ?? '')
const selectedTopic = ref(props.modelValue?.topic_id ?? '')
const lastSelectedGrade = ref(null)
const lastSelectedSubject = ref(null)
const lastSelectedTopic = ref(null)
const subjectsPicker = ref(null)
const topicsPicker = ref(null)
const subjectQuery = ref('')
const topicQuery = ref('')
const fileInput = ref(null)

// Computed
const title = computed({
  get: () => props.modelValue?.title ?? '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, title: v })
})

const description = computed({
  get: () => props.modelValue?.description ?? '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, description: v })
})

const youtubeUrl = computed({
  get: () => props.modelValue?.youtube_url ?? '',
  set: (v) => emit('update:modelValue', { ...props.modelValue, youtube_url: v })
})

const displayTitleError = computed(() => props.errors?._title || localErrors.value._title)
const displayGradeError = computed(() => props.errors?._grade || localErrors.value._grade)
const displaySubjectError = computed(() => props.errors?._subject || localErrors.value._subject)
const displayTopicError = computed(() => props.errors?._topic || localErrors.value._topic)

const titleComplete = computed(() => !!title.value?.trim())
const levelGradeComplete = computed(() => !!(selectedLevel.value && selectedGrade.value))
const subjectComplete = computed(() => !!selectedSubject.value)
const topicComplete = computed(() => !!selectedTopic.value)

const previewUrl = computed(() => {
  try {
    const cov = props.modelValue?.cover
    if (typeof cov === 'string') {
      if (cov.startsWith('blob:')) return cov
      return resolveAssetUrl(cov)
    }
    if (cov instanceof File) return URL.createObjectURL(cov)
    const stored = props.modelValue?.cover_image
    if (typeof stored === 'string' && stored) return resolveAssetUrl(stored)
  } catch (e) {}
  return null
})

const hasCover = computed(() => !!(props.modelValue?.cover || props.modelValue?.cover_image))

const selectedLevelName = computed(() => {
  const levelId = selectedLevel.value || props.modelValue?.level_id || ''
  if (!levelId) return props.modelValue?.level_name ?? ''
  return props.levels.find(l => String(l.id) === String(levelId))?.name || ''
})

const selectedGradeName = computed(() => {
  const gradeId = selectedGrade.value || props.modelValue?.grade_id || ''
  if (!gradeId) return props.modelValue?.grade_name ?? ''
  return props.grades.find(g => String(g.id) === String(gradeId))?.name || ''
})

const selectedSubjectName = computed(() => {
  const subjectId = selectedSubject.value || props.modelValue?.subject_id || ''
  if (!subjectId) return props.modelValue?.subject?.name ?? ''
  return props.subjects.find(s => String(s.id) === String(subjectId))?.name || ''
})

const selectedTopicName = computed(() => {
  const topicId = selectedTopic.value || props.modelValue?.topic_id || ''
  if (!topicId) return props.modelValue?.topic?.name ?? ''
  return props.topics.find(t => String(t.id) === String(topicId))?.name || ''
})

const selectedSubjectObj = computed(() => {
  const modelSub = props.modelValue?.subject || null
  if (modelSub && typeof modelSub === 'object' && modelSub.id) return modelSub
  const sid = selectedSubject.value || props.modelValue?.subject_id || ''
  if (!sid) return null
  return props.subjects.find(s => String(s.id) === String(sid)) || sid
})

const selectedTopicObj = computed(() => {
  const modelTopic = props.modelValue?.topic || null
  if (modelTopic && typeof modelTopic === 'object' && modelTopic.id) return modelTopic
  const tid = selectedTopic.value || props.modelValue?.topic_id || ''
  if (!tid) return null
  return props.topics.find(t => String(t.id) === String(tid)) || tid
})

// Methods
const { fetchSubjectsByGrade, fetchTopicsBySubject, fetchGradesByLevel } = useTaxonomy()

function sameId(a, b) {
  const left = a === null || typeof a === 'undefined' ? '' : String(a)
  const right = b === null || typeof b === 'undefined' ? '' : String(b)
  return left === right
}

function validateTitle() {
  localErrors.value._title = null
  if (!title.value?.trim()) {
    localErrors.value._title = 'Title is required.'
  }
}

function validate() {
  let ok = true
  localErrors.value._title = null
  localErrors.value._grade = null
  localErrors.value._subject = null
  localErrors.value._topic = null

  if (!title.value?.trim()) {
    localErrors.value._title = 'Title is required.'
    ok = false
  }
  if (!selectedGrade.value) {
    localErrors.value._grade = 'Grade is required.'
    ok = false
  }
  if (!selectedSubject.value) {
    localErrors.value._subject = 'Subject is required.'
    ok = false
  }
  if (!selectedTopic.value) {
    localErrors.value._topic = 'Topic is required.'
    ok = false
  }

  return ok
}

function validateAndNext() {
  if (validate()) {
    emit('next')
  }
}

function nextStep() {
  if (currentStep.value === 1 && !titleComplete.value) return
  if (currentStep.value === 2 && !levelGradeComplete.value) return
  if (currentStep.value === 3 && !subjectComplete.value) return
  if (currentStep.value === 4 && !topicComplete.value) return
  if (currentStep.value < 5) {
    currentStep.value++
  } else {
    validateAndNext()
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

function openCreateTopic() {
  emit('create-topic')
}

function triggerFileInput() {
  try { fileInput.value && fileInput.value.click() } catch (e) {}
}

function removeCover() {
  const newModel = { ...props.modelValue }
  newModel.cover_file = undefined
  newModel.cover = undefined
  newModel.cover_image = null
  emit('update:modelValue', newModel)
}

function onCoverChange(e) {
  const f = (e.target && e.target.files && e.target.files[0]) || null
  const newModel = { ...props.modelValue }
  if (f) {
    newModel.cover = URL.createObjectURL(f)
    newModel.cover_file = f
  }
  emit('update:modelValue', newModel)
}

function onGradeModelUpdate(v) {
  if (v && typeof v === 'object') {
    lastSelectedGrade.value = v
    selectedGrade.value = v.id || ''
  } else {
    lastSelectedGrade.value = null
    selectedGrade.value = v || ''
  }
}

function onGradeSelected(item) {
  lastSelectedGrade.value = item || null
  selectedGrade.value = item?.id || ''
  const currentId = item?.id || ''
  
  emit('update:modelValue', {
    ...props.modelValue,
    grade_id: currentId ? currentId : null,
    grade: item || null,
    grade_name: item?.name || null,
    subject_id: null,
    subject: null,
    topic_id: null,
    topic: null
  })

  nextTick(async () => {
    if (subjectsPicker.value && typeof subjectsPicker.value.focusSearch === 'function') {
      subjectsPicker.value.focusSearch()
    }
    try { await fetchSubjectsByGrade(currentId) } catch (e) {}
  })
}

function onSubjectPicked(item) {
  selectedSubject.value = item?.id || ''
  const sid = item?.id ? (Number(item.id) || null) : null

  if (!sameId(sid, props.modelValue?.subject_id)) {
    topicQuery.value = ''
    emit('update:modelValue', { ...props.modelValue, subject_id: sid, topic_id: null, subject: item })
  }

  nextTick(() => {
    if (topicsPicker.value && typeof topicsPicker.value.focusSearch === 'function') {
      topicsPicker.value.focusSearch()
    }
  })

  if (sid) {
    try { fetchTopicsBySubject(sid) } catch (e) {}
  }
}

function onTopicPicked(item) {
  const tid = item?.id ? (Number(item.id) || null) : null
  emit('update:modelValue', { ...props.modelValue, topic_id: tid, topic: item })
}

watch(selectedLevel, async (nv, ov) => {
  if (sameId(nv, ov)) return
  selectedGrade.value = ''
  selectedSubject.value = ''
  selectedTopic.value = ''
  lastSelectedGrade.value = null
  lastSelectedSubject.value = null
  lastSelectedTopic.value = null
  
  emit('update:modelValue', {
    ...props.modelValue,
    level_id: nv || null,
    grade_id: null,
    subject_id: null,
    topic_id: null
  })

  if (nv) {
    try { await fetchGradesByLevel(nv) } catch (e) {}
  }
})

watch(() => props.modelValue, (nv) => {
  if (!nv) return
  selectedLevel.value = nv.level_id ?? ''
  selectedGrade.value = nv.grade_id ?? ''
  selectedSubject.value = nv.subject_id ?? ''
  selectedTopic.value = nv.topic_id ?? ''
}, { deep: true })
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
