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

    <!-- Step 2: Taxonomy Selection -->
    <div v-if="currentStep === 2" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Education Path & Topic</h3>
        <p class="text-sm text-gray-500">Select level, grade, subject, and topic for your quiz</p>
      </div>
      <ClientOnly>
        <TaxonomyFlowPicker
          ref="taxonomyFlowPickerRef"
          :modelValue="taxonomySelection"
          :includeTopics="true"
          @update:modelValue="updateTaxonomySelection"
          @submit="onTaxonomySubmit"
          @create-topic="$emit('create-topic')"
        />
      </ClientOnly>
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
          :disabled="!taxonomyComplete"
          icon="i-heroicons-arrow-right"
          size="md"
          class="!bg-brand-600 hover:!bg-brand-700 text-white"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Step 3: Description & YouTube (Optional) -->
    <div v-if="currentStep === 3" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 animate-fadeIn">
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
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
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
const fileInput = ref(null)
const taxonomyFlowPickerRef = ref(null)

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
  return taxonomySelection.value?.level?.name ?? ''
})

const selectedGradeName = computed(() => {
  return taxonomySelection.value?.grade?.name ?? ''
})

const selectedSubjectName = computed(() => {
  return taxonomySelection.value?.subject?.name ?? ''
})

const selectedTopicName = computed(() => {
  return taxonomySelection.value?.topic?.name ?? ''
})

// Methods
const { fetchSubjectsByGrade, fetchTopicsBySubject, fetchGradesByLevel, loadingLevels, loadingGrades, loadingSubjects, loadingTopics } = useTaxonomy()

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
  if (!taxonomySelection.value.grade) {
    localErrors.value._grade = 'Grade is required.'
    ok = false
  }
  if (!taxonomySelection.value.subject) {
    localErrors.value._subject = 'Subject is required.'
    ok = false
  }
  if (!taxonomySelection.value.topic) {
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
  if (currentStep.value === 2 && !taxonomyComplete.value) return
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    emit('next')
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

// Taxonomy Flow Picker handlers
const taxonomySelection = ref({
  level: null,
  grade: null,
  subject: null,
  topic: null
})

const taxonomyComplete = computed(() => !!(taxonomySelection.value.level && taxonomySelection.value.grade && taxonomySelection.value.subject && taxonomySelection.value.topic))

const isPreloading = computed(() => {
  return Boolean(loadingLevels.value || loadingGrades.value || loadingSubjects.value || loadingTopics.value)
})

const updateTaxonomySelection = (selection) => {
  taxonomySelection.value = selection
}

const onTaxonomySubmit = (selection) => {
  emit('update:modelValue', {
    ...props.modelValue,
    level_id: selection.level?.id,
    grade_id: selection.grade?.id,
    subject_id: selection.subject?.id,
    topic_id: selection.topic?.id,
    level_name: selection.level?.name,
    grade_name: selection.grade?.name,
    subject: selection.subject,
    topic: selection.topic
  })
  nextStep()
}

const handleTopicCreated = (newTopic) => {
  // Call the TaxonomyFlowPicker's method to add the new topic to its list
  if (taxonomyFlowPickerRef.value && typeof taxonomyFlowPickerRef.value.handleTopicCreated === 'function') {
    taxonomyFlowPickerRef.value.handleTopicCreated(newTopic)
  }
}

defineExpose({
  handleTopicCreated
})

// Sync taxonomySelection when modelValue is first provided (e.g., when editing existing quiz)
watch(() => props.modelValue, async (nv) => {
  if (!nv) return
  
  const levelId = nv.level_id ?? nv.level?.id ?? null
  const gradeId = nv.grade_id ?? nv.grade?.id ?? null
  const subjectId = nv.subject_id ?? nv.subject?.id ?? null
  const topicId = nv.topic_id ?? nv.topic?.id ?? null

  // CRITICAL: Check if values actually changed before updating
  // This prevents re-initializing when the incoming modelValue is the same
  const currentLevel = taxonomySelection.value.level?.id
  const currentGrade = taxonomySelection.value.grade?.id
  const currentSubject = taxonomySelection.value.subject?.id
  const currentTopic = taxonomySelection.value.topic?.id
  
  const levelChanged = String(levelId || '') !== String(currentLevel || '')
  const gradeChanged = String(gradeId || '') !== String(currentGrade || '')
  const subjectChanged = String(subjectId || '') !== String(currentSubject || '')
  const topicChanged = String(topicId || '') !== String(currentTopic || '')
  
  if (!levelChanged && !gradeChanged && !subjectChanged && !topicChanged) {
    return
  }

  // Only initialize if there are values to load
  if (gradeId) {
    // Preload the taxonomy lists if needed
    try {
      if (levelId) {
        await fetchGradesByLevel(levelId)
      }
      if (gradeId) {
        await fetchSubjectsByGrade(gradeId, levelId)
      }
      if (subjectId) {
        await fetchTopicsBySubject(subjectId)
      }
    } catch (e) {}

    // Set the taxonomySelection from the modelValue
    const levelObj = (props.levels || []).find(l => String(l.id) === String(levelId)) || nv.level || (levelId ? { id: levelId } : null)
    const gradeObj = (props.grades || []).find(g => String(g.id) === String(gradeId)) || nv.grade || (gradeId ? { id: gradeId } : null)
    const subjectObj = (props.subjects || []).find(s => String(s.id) === String(subjectId)) || nv.subject || (subjectId ? { id: subjectId } : null)
    const topicObj = (props.topics || []).find(t => String(t.id) === String(topicId)) || nv.topic || (topicId ? { id: topicId } : null)

    taxonomySelection.value = {
      level: levelObj,
      grade: gradeObj,
      subject: subjectObj,
      topic: topicObj
    }
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
