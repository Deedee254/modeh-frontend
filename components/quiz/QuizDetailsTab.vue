<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg font-medium mb-4">Quiz Details</h2>

      <div v-if="props.errors && props.errors._raw" class="mb-4">
        <div v-for="(m, idx) in props.errors._raw" :key="idx" class="text-sm text-red-600">{{ m }}</div>
        <div v-if="props.errors._actions && props.errors._actions.requestTopicApproval" class="mt-2">
          <UButton size="sm" variant="soft" @click="requestApproval" :loading="approvalRequestLoading">Request topic approval</UButton>
        </div>
      </div>

      <!-- Basic Info Section -->
      <div class="space-y-6 mb-8">
        <div>
          <label for="quiz-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            v-model="modelValue.title"
            type="text"
            id="quiz-title"
            aria-describedby="title-error"
            :class="[ 'block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base', displayTitleError ? 'border-red-300' : '' ]"
          />
          <p v-if="displayTitleError" id="title-error" class="mt-1 text-sm text-red-600">{{ displayTitleError }}</p>
        </div>

        <!-- Grade & Subject Selection (stacked: subject below grade) -->
        <div class="space-y-4">
                <div>
                  <label for="quiz-level" class="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <ClientOnly>
                    <template #placeholder>
                      <select id="quiz-level" class="w-full rounded-md border-gray-300 shadow-sm">
                        <option>Loading…</option>
                      </select>
                    </template>
                    <select 
                      v-model="selectedLevel"
                      id="quiz-level"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2"
                    >
                      <option value="">Select Level</option>
                      <option v-for="lvl in levels" :key="lvl.id" :value="lvl.id">{{ lvl.name }}</option>
                    </select>

                    <label for="quiz-grade" class="block text-sm font-medium text-gray-700 mb-1">Grade / Course</label>
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
                    <p v-if="displayGradeError" class="mt-1 text-sm text-red-600">{{ displayGradeError }}</p>
                  </ClientOnly>
                </div>

          <div>
            <label id="subject-label" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <ClientOnly>
              <template #placeholder>
                <div class="rounded-xl border bg-white p-3">
                  <div class="p-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-semibold text-sm">Subjects</h4>
                        <div class="text-xs text-slate-500">Pick a subject</div>
                      </div>
                    </div>
                  </div>
                  <div class="p-3">
                    <div class="h-10 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </template>
                              <TaxonomyPicker
                                ref="subjectsPicker"
                                resource="subjects"
                                :grade-id="selectedGrade || null"
                                :per-page="50"
                                :model-value="selectedSubjectObj || null"
                                title="Subjects"
                                subtitle="Pick a subject"
                                @selected="onSubjectPicked"
                                aria-labelledby="subject-label"
                                v-model:query="subjectQuery"
                              />
                            <p v-if="displaySubjectError" class="mt-1 text-sm text-red-600">{{ displaySubjectError }}</p>
            </ClientOnly>
          </div>
        </div>

        <!-- Topic Selection -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label id="topic-label" class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <ClientOnly>
              <template #placeholder>
                <div class="rounded-xl border bg-white p-3">
                  <div class="p-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-semibold text-sm">Topics</h4>
                        <div class="text-xs text-slate-500">Pick or create a topic</div>
                      </div>
                    </div>
                  </div>
                  <div class="p-3">
                    <div class="h-10 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </template>
              <TaxonomyPicker
                ref="topicsPicker"
                resource="topics"
                :subject-id="selectedSubject || null"
                :per-page="50"
                :model-value="selectedTopicObj || null"
                title="Topics"
                subtitle="Pick or create a topic"
                aria-labelledby="topic-label"
                aria-describedby="topic-error"
                @selected="onTopicPicked"
                v-model:query="topicQuery"
              >
                <template #actions>
                  <button
                    type="button"
                    @click="openCreateTopic"
                    :disabled="!selectedSubject"
                    class="w-full sm:w-auto inline-flex items-center justify-center gap-x-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-60"
                  ><span>New Topic</span></button>
                </template>
              </TaxonomyPicker>
            </ClientOnly>
            <p v-if="displayTopicError" id="topic-error" class="mt-1 text-sm text-red-600">{{ displayTopicError }}</p>
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

        <div>
          <label for="quiz-youtube" class="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
          <input
            v-model="modelValue.youtube_url"
            id="quiz-youtube"
            type="url"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Optional: link to a YouTube video"
          />
        </div>

        <!-- Cover image picker -->
        <ClientOnly>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cover image</label>
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div class="w-full sm:w-48 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center border">
                <img v-if="previewUrl" :src="previewUrl" class="object-cover w-full h-full" />
                <div v-else class="text-xs text-gray-500">No cover</div>
              </div>

              <div class="flex-1 w-full sm:w-auto">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onCoverChange" />
                <div class="flex flex-col sm:flex-row gap-2 mb-2 w-full">
                  <UButton size="sm" variant="soft" @click="triggerFileInput" class="w-full sm:w-auto">Choose file</UButton>
                  <UButton size="sm" variant="ghost" color="gray" @click="removeCover" :disabled="!hasCover" class="w-full sm:w-auto">Remove</UButton>
                </div>
                <p class="text-xs text-gray-500 text-center sm:text-left">Recommended: JPEG/PNG up to 5MB.</p>
                <p v-if="modelValue.cover_image" class="text-xs text-slate-500 mt-2 text-center sm:text-left">Current uploaded cover will be used until you choose a new file.</p>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- Selection confirmation (render on client to avoid SSR mismatch) -->
    <ClientOnly>
      <div class="mt-4">
        <div class="bg-white rounded-lg border p-3 text-sm text-slate-700 dark:bg-slate-800 dark:border-slate-700">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Level:</span>
              <span class="font-medium">{{ selectedLevelName || '—' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Grade:</span>
              <span class="font-medium">{{ selectedGradeName || '—' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Subject:</span>
              <span class="font-medium flex items-center gap-1">
                {{ selectedSubjectName || '—' }}
                <Icon v-if="selectedSubject" name="heroicons:check-circle-20-solid" class="h-4 w-4 text-emerald-500" />
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Topic:</span>
              <span class="font-medium flex items-center gap-1">
                {{ selectedTopicName || '—' }}
                <Icon v-if="selectedTopic" name="heroicons:check-circle-20-solid" class="h-4 w-4 text-emerald-500" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Approval request moved into CreateTopicModal; details tab only shows selection summary -->

    <!-- Bottom Actions -->
    <div class="mt-6 flex flex-col sm:flex-row justify-end gap-3">
      <UButton size="sm" variant="soft" @click="saveAndContinue" :loading="saving" class="w-full sm:w-auto">Save and Continue</UButton>
      <UButton size="sm" color="primary" @click="validateAndGoNext" class="w-full sm:w-auto">Continue to Settings</UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRuntimeConfig } from '#imports'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'
import { useAppAlert } from '~/composables/useAppAlert'

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

// local client-side validation state
const localErrors = ref({ _title: null, _grade: null, _subject: null, _topic: null })
const displayTitleError = computed(() => props.errors?._title || localErrors.value._title)
const displayGradeError = computed(() => props.errors?._grade || localErrors.value._grade)
const displaySubjectError = computed(() => props.errors?._subject || localErrors.value._subject)
const displayTopicError = computed(() => props.errors?._topic || localErrors.value._topic)
function validate() {
  let ok = true
  localErrors.value._title = null
  localErrors.value._grade = null
  localErrors.value._subject = null
  localErrors.value._topic = null
  if (!props.modelValue.title || !props.modelValue.title.trim()) {
    localErrors.value._title = 'Title is required.'
    ok = false
  }
  if (!props.modelValue.grade_id) {
    localErrors.value._grade = 'Grade is required.'
    ok = false
  }
  if (!props.modelValue.subject_id) {
    localErrors.value._subject = 'Subject is required.'
    ok = false
  }
  if (!props.modelValue.topic_id) {
    localErrors.value._topic = 'Please pick a topic.'
    ok = false
  }
  return ok
}

function sameId(a, b) {
  const left = a === null || typeof a === 'undefined' ? '' : String(a)
  const right = b === null || typeof b === 'undefined' ? '' : String(b)
  return left === right
}
const api = useApi()
const alert = useAppAlert()
const approvalRequestLoading = ref(false)
const runtimeConfig = useRuntimeConfig()
const suppressWatchers = ref(true)
let suppressionRun = 0
const loadedTopicSubjects = new Set()

// Internal selection refs initialized from parent modelValue
const selectedLevel = ref(props.modelValue?.level_id ?? '')
const selectedGrade = ref(props.modelValue?.grade_id ?? '')
const lastSelectedGrade = ref(null)
const selectedSubject = ref(props.modelValue?.subject_id ?? '')
const lastSelectedSubject = ref(null)
const topicsPicker = ref(null)
const selectedTopic = ref(props.modelValue?.topic_id ?? '')
const subjectsPicker = ref(null)
const lastSelectedTopic = ref(null)
const initialSubjectId = props.modelValue?.subject_id ? String(props.modelValue.subject_id) : ''
if (initialSubjectId) {
  nextTick(() => {
    ensureTopicsForSubject(initialSubjectId, true)
  })
}

const subjectQuery = ref('')
const topicQuery = ref('')

nextTick(() => { suppressWatchers.value = false })
nextTick(() => { suppressWatchers.value = false })

// Cover picker related refs
const fileInput = ref(null)

function resolveAssetUrl(value) {
  if (!value || typeof value !== 'string') return null
  if (/^(?:https?:)?\/\//.test(value)) return value
  if (/^(?:data:|blob:)/.test(value)) return value
  const base = runtimeConfig?.public?.apiBase || ''
  if (!base) return value.startsWith('/') ? value : `/${value}`
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = value.startsWith('/') ? value : `/${value}`
  return `${cleanBase}${cleanPath}`
}

// compute preview URL from either modelValue.cover (tmp key or File) or modelValue.cover_image (server URL)
const previewUrl = computed(() => {
  // modelValue.cover can be a File object (from picker) or a string (from server)
  try {
    const cov = props.modelValue?.cover
    // If it's a string, it could be a blob URL or a server path
    if (typeof cov === 'string') {
      if (cov.startsWith('blob:')) return cov
      return resolveAssetUrl(cov)
    }
    // If it's a File object, create a URL for it
    if (cov instanceof File) return URL.createObjectURL(cov)
    const stored = props.modelValue?.cover_image
    if (typeof stored === 'string' && stored) return resolveAssetUrl(stored)
  } catch (e) {}
  return null
})

const hasCover = computed(() => !!(props.modelValue?.cover || props.modelValue?.cover_image))

// Computed lists filtered by selections (client-side fallback)
const subjectsByGrade = computed(() => {
  if (!selectedGrade.value || !Array.isArray(props.subjects)) return []
  return props.subjects.filter(s => s && typeof s === 'object' && s.grade_id && String(s.grade_id) === String(selectedGrade.value))
})

// Filter grades by selected level when levels data available (levels expected as array of {id,name,grades:[]})
const filteredGrades = computed(() => {
  try {
    if (selectedLevel.value && Array.isArray(props.grades) && Array.isArray(props.levels)) {
      const lv = props.levels.find(l => l && String(l.id) === String(selectedLevel.value))
      if (lv && Array.isArray(lv.grades)) return lv.grades
    }
  } catch (e) {}
  // fallback: return props.grades
  return props.grades || []
})

const filteredTopics = computed(() => {
  const subjectId = selectedSubject.value || props.modelValue?.subject_id || ''
  if (!subjectId) return []
  if (Array.isArray(props.topics) && props.topics.length) {
    const list = props.topics.filter(t => topicMatchesSubject(t, subjectId))
    if (list.length) return list
  }
  if (Array.isArray(props.modelValue?.subject?.topics)) {
    const list = props.modelValue.subject.topics.filter(t => topicMatchesSubject(t, subjectId))
    if (list.length) return list
  }
  return []
})

// Selected names for confirmation display
const selectedLevelName = computed(() => {
  const levelId = selectedLevel.value || props.modelValue?.level_id || ''
  if (!levelId) {
    if (props.modelValue?.level && props.modelValue.level.name) return props.modelValue.level.name
    if (props.modelValue?.level_name) return props.modelValue.level_name
    return ''
  }
  if (Array.isArray(props.levels)) {
    const l = props.levels.find(x => x && sameId(x.id, levelId))
    if (l && l.name) return l.name
  }
  if (props.modelValue?.level && sameId(props.modelValue.level.id, levelId)) return props.modelValue.level.name || ''
  if (props.modelValue?.level_name && sameId(props.modelValue?.level_id, levelId)) return props.modelValue.level_name
  return ''
})

const selectedGradeName = computed(() => {
  const gradeId = selectedGrade.value || props.modelValue?.grade_id || ''
  if (!gradeId) {
    if (props.modelValue?.grade && props.modelValue.grade.name) return props.modelValue.grade.name
    if (props.modelValue?.grade_name) return props.modelValue.grade_name
    return ''
  }
  const lists = []
  if (Array.isArray(props.grades)) lists.push(props.grades)
  if (Array.isArray(props.levels)) {
    for (const lvl of props.levels) {
      const list = Array.isArray(lvl?.grades) ? lvl.grades : []
      if (list.length) lists.push(list)
    }
  }
  for (const list of lists) {
    const found = list.find(g => g && sameId(g.id, gradeId))
    if (found && found.name) return found.name
  }
  if (props.modelValue?.grade && sameId(props.modelValue.grade.id, gradeId)) {
    return props.modelValue.grade.name || ''
  }
  if (props.modelValue?.grade_name && sameId(props.modelValue?.grade_id, gradeId)) return props.modelValue.grade_name
  return ''
})

const selectedSubjectName = computed(() => {
  const subjectId = selectedSubject.value || props.modelValue?.subject_id || ''
  if (!subjectId) {
    if (props.modelValue?.subject && props.modelValue.subject.name) return props.modelValue.subject.name
    return ''
  }
  if (Array.isArray(props.subjects)) {
    const s = props.subjects.find(x => x && sameId(x.id, subjectId))
    if (s && s.name) return s.name
  }
  if (lastSelectedSubject.value && sameId(lastSelectedSubject.value?.id, subjectId)) {
    return lastSelectedSubject.value?.name || lastSelectedSubject.value?.display_name || ''
  }
  if (props.modelValue?.subject && sameId(props.modelValue.subject.id, subjectId)) {
    return props.modelValue.subject.name || ''
  }
  return ''
})

const selectedTopicName = computed(() => {
  const topicId = selectedTopic.value || props.modelValue?.topic_id || ''
  if (!topicId) {
    if (props.modelValue?.topic && props.modelValue.topic.name) return props.modelValue.topic.name
    return ''
  }
  if (Array.isArray(props.topics)) {
    const t = props.topics.find(x => x && sameId(x.id, topicId))
    if (t && t.name) return t.name
  }
  if (Array.isArray(filteredTopics.value)) {
    const t = filteredTopics.value.find(x => x && sameId(x.id, topicId))
    if (t && t.name) return t.name
  }
  if (lastSelectedTopic.value && sameId(lastSelectedTopic.value?.id, topicId)) {
    return lastSelectedTopic.value?.name || lastSelectedTopic.value?.display_name || ''
  }
  const modelTopic = props.modelValue?.topic
  if (modelTopic && modelTopic.name) return modelTopic.name
  return ''
})

const selectedTopicObj = computed(() => {
  // prefer a full topic object from the model if available
  const modelTopic = props.modelValue?.topic || null
  if (modelTopic && typeof modelTopic === 'object' && modelTopic.id) return modelTopic
  const tid = selectedTopic.value || props.modelValue?.topic_id || ''
  if (!tid) return null
  if (Array.isArray(props.topics)) {
    const found = props.topics.find(x => x && sameId(x.id, tid))
    if (found) return found
  }
  if (Array.isArray(filteredTopics.value)) {
    const found = filteredTopics.value.find(x => x && sameId(x.id, tid))
    if (found) return found
  }
  if (lastSelectedTopic.value && sameId(lastSelectedTopic.value?.id, tid)) return lastSelectedTopic.value
  return tid
})

// Provide a subject object (or id) for TaxonomyPicker so it can display
// the selected subject even when the subjects list is not yet populated.
const selectedSubjectObj = computed(() => {
  const modelSub = props.modelValue?.subject || null
  if (modelSub && typeof modelSub === 'object' && modelSub.id) return modelSub
  const sid = selectedSubject.value || props.modelValue?.subject_id || ''
  if (!sid) return null
  if (Array.isArray(props.subjects)) {
    const found = props.subjects.find(x => x && sameId(x.id, sid))
    if (found) return found
  }
  if (lastSelectedSubject.value && sameId(lastSelectedSubject.value?.id, sid)) return lastSelectedSubject.value
  if (props.modelValue?.subject && sameId(props.modelValue.subject.id, sid)) return props.modelValue.subject
  return sid
})

function gradeDisplayName(grade) {
  if (!grade || typeof grade !== 'object') return ''
  return grade.name || grade.display_name || grade.title || grade.label || ''
}

function findGradeById(id) {
  if (id === null || typeof id === 'undefined' || id === '') return null
  const target = String(id)
  if (Array.isArray(props.grades)) {
    const direct = props.grades.find(g => g && sameId(g.id, target))
    if (direct) return direct
  }
  if (Array.isArray(props.levels)) {
    for (const lvl of props.levels) {
      const list = Array.isArray(lvl?.grades) ? lvl.grades : []
      const found = list.find(g => g && sameId(g.id, target))
      if (found) return found
    }
  }
  const current = props.modelValue?.grade
  if (current && sameId(current.id, target)) return current
  return null
}

function topicSubjectId(topic) {
  if (!topic || typeof topic !== 'object') return null
  if (topic.subject_id != null) return topic.subject_id
  if (topic.subject && typeof topic.subject === 'object') return topic.subject.id ?? null
  return null
}

function topicMatchesSubject(topic, subjectId) {
  if (!subjectId) return false
  const sid = topicSubjectId(topic)
  if (sid == null) return false
  return sameId(sid, subjectId)
}

async function ensureTopicsForSubject(subjectId, force = false) {
  if (subjectId === null || typeof subjectId === 'undefined' || subjectId === '') return
  const key = String(subjectId)
  if (!force && loadedTopicSubjects.has(key)) return
  try {
    await fetchTopicsBySubject(subjectId)
    loadedTopicSubjects.add(key)
  } catch (e) {}
}

async function requestApproval() {
  const t = selectedTopicObj.value
  if (!t || !t.id) return
  approvalRequestLoading.value = true
  try {
    const res = await api.postJson(`/topics/${t.id}/request-approval`, {})
    const data = await res.json().catch(() => null)
    if (res.ok) {
      // emit event so parent can refresh topics list
      emit('approval-requested', t.id)
      alert.push({ type: 'success', message: 'Approval requested. An admin will review the topic shortly.' })
    } else {
      alert.push({ type: 'error', message: data?.message || 'Failed to request approval' })
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to request approval' })
  } finally {
    approvalRequestLoading.value = false
  }
}

// When grade changes, clear subject/topic and notify parent; also fetch subjects for the selected grade
const { fetchSubjectsByGrade, fetchTopicsBySubject, fetchGradesByLevel } = useTaxonomy()
watch(selectedGrade, async (nv, ov) => {
  try { console.debug('QuizDetailsTab: selectedGrade changed from', ov, 'to', nv) } catch (e) {}
  if (suppressWatchers.value) return
  if (sameId(nv, ov)) return
  subjectQuery.value = ''
  topicQuery.value = ''
  selectedSubject.value = ''
  selectedTopic.value = ''
  lastSelectedSubject.value = null
  lastSelectedTopic.value = null
  const currentId = nv === null || typeof nv === 'undefined' ? '' : String(nv)
  if (!currentId) lastSelectedGrade.value = null
  let gradeItem = null
  if (lastSelectedGrade.value && sameId(lastSelectedGrade.value?.id, currentId)) gradeItem = lastSelectedGrade.value
  if (!gradeItem) gradeItem = findGradeById(currentId)
  if (!gradeItem && props.modelValue?.grade && sameId(props.modelValue.grade.id, currentId)) gradeItem = props.modelValue.grade
  const nameSource = gradeDisplayName(gradeItem) || props.modelValue?.grade_name || ''
  const normalizedGradeName = nameSource ? String(nameSource) : null
  const gradePayload = currentId && (gradeItem || normalizedGradeName)
    ? (gradeItem ? { ...gradeItem } : { id: currentId, name: normalizedGradeName })
    : null
  if (gradePayload) {
    if (!gradePayload.name && normalizedGradeName) gradePayload.name = normalizedGradeName
    lastSelectedGrade.value = gradePayload
  } else {
    lastSelectedGrade.value = null
  }
  const nextModel = {
    ...props.modelValue,
    grade_id: currentId ? currentId : null,
    grade: gradePayload,
    grade_name: normalizedGradeName,
    subject_id: null,
    subject: null,
    topic_id: null,
    topic: null
  }
  emit('update:modelValue', nextModel)
  try { await fetchSubjectsByGrade(currentId) } catch (e) {}
  // Fetch topics for the new grade's subjects if needed, but avoid clearing topic picker unnecessarily
})

// When level changes, clear grade/subject/topic and notify parent
watch(selectedLevel, async (nv, ov) => {
  if (suppressWatchers.value) return
  if (sameId(nv, ov)) return
  subjectQuery.value = ''
  topicQuery.value = ''
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
    grade: null,
    grade_name: null,
    subject_id: null,
    subject: null,
    topic_id: null,
    topic: null
  })
  if (!nv) return
  try { await fetchGradesByLevel(nv) } catch (e) {}
})

// Keep internal selected values in sync with parent changes
watch(() => props.modelValue, (nv) => {
  if (!nv) return
  suppressionRun += 1
  const ticket = suppressionRun
  suppressWatchers.value = true
  const prevLevel = selectedLevel.value
  const prevGrade = selectedGrade.value
  const prevSubject = selectedSubject.value
  const prevTopic = selectedTopic.value
  const { grade_id, subject_id, level_id, topic_id } = nv
  if (!sameId(prevLevel, level_id)) selectedLevel.value = level_id ?? ''
  if (!sameId(prevGrade, grade_id)) selectedGrade.value = grade_id ?? ''
  if (!sameId(prevSubject, subject_id)) selectedSubject.value = subject_id ?? ''
  if (!sameId(prevTopic, topic_id)) selectedTopic.value = topic_id ?? ''
  if (grade_id && !sameId(prevGrade, grade_id)) {
    if (props.modelValue?.grade && sameId(props.modelValue.grade.id, grade_id)) {
      lastSelectedGrade.value = props.modelValue.grade
    }
  } else if (!grade_id) {
    lastSelectedGrade.value = null
  }
  if (subject_id && !sameId(prevSubject, subject_id)) {
    if (props.modelValue?.subject && sameId(props.modelValue.subject.id, subject_id)) {
      lastSelectedSubject.value = props.modelValue.subject
    }
    lastSelectedTopic.value = null
  } else if (!subject_id) {
    lastSelectedSubject.value = null
  }
  if (topic_id && !sameId(prevTopic, topic_id)) {
    if (props.modelValue?.topic && sameId(props.modelValue.topic.id, topic_id)) {
      lastSelectedTopic.value = props.modelValue.topic
    }
  } else if (!topic_id) {
    lastSelectedTopic.value = null
  }
  const ensureSubjectId = subject_id
  const shouldFetchSubjects = grade_id && !sameId(prevGrade, grade_id)
  const shouldFetchTopics = subject_id && !sameId(prevSubject, subject_id)
  nextTick(async () => {
    if (shouldFetchSubjects) {
      try { await fetchSubjectsByGrade(grade_id) } catch (e) {}
    }
    if (ensureSubjectId) {
      try { await ensureTopicsForSubject(ensureSubjectId, shouldFetchTopics) } catch (e) {}
    }
    if (!shouldFetchTopics && ensureSubjectId && !loadedTopicSubjects.has(String(ensureSubjectId))) {
      try { await ensureTopicsForSubject(ensureSubjectId, true) } catch (e) {}
    }
    if (shouldFetchTopics) {
      try { await fetchTopicsBySubject(subject_id) } catch (e) {}
    }
    if (suppressionRun === ticket) suppressWatchers.value = false
  })
}, { deep: true })

function onSubjectPicked(item) {
  selectedSubject.value = item?.id || ''
  const sid = item?.id ? (Number(item.id) || null) : null
  // Only clear topic_id when the subject actually changes. Avoids clearing
  // the topic when the subjects list is refreshed but the selected subject
  // remains the same (which caused accidental topic clears).
  if (!sameId(sid, props.modelValue?.subject_id)) {
    topicQuery.value = ''
    emit('update:modelValue', { ...props.modelValue, subject_id: sid, topic_id: null, subject: item })
  }
  nextTick(() => {
    try {
      const tp = topicsPicker?.value || null
      if (tp && typeof tp.focusSearch === 'function') {
        tp.focusSearch()
        if (tp.$el && typeof tp.$el.scrollIntoView === 'function') {
          tp.$el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      }
    } catch (e) {}
  })
  // Fetch topics for the selected subject to populate the picker
  if (sid) {
    try { fetchTopicsBySubject(sid) } catch (e) {}
  }
}

// Grade handlers (used by the grades TaxonomyPicker)
function onGradeModelUpdate(v) {
  try {
    if (v && typeof v === 'object') {
      lastSelectedGrade.value = v
      selectedGrade.value = v.id || ''
    } else {
      if (!v) lastSelectedGrade.value = null
      selectedGrade.value = v || ''
    }
  } catch (e) {}
}

function onGradeSelected(item) {
  try {
    lastSelectedGrade.value = item || null
    selectedGrade.value = item?.id || ''
    try { console.debug('QuizDetailsTab: onGradeSelected item', item, 'selectedGrade', selectedGrade.value) } catch (e) {}
    // Auto focus subjects picker after grade selection
    nextTick(() => {
      if (subjectsPicker.value) {
        subjectsPicker.value.focusSearch()
        if (subjectsPicker.value.$el && typeof subjectsPicker.value.$el.scrollIntoView === 'function') {
          subjectsPicker.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    })
  } catch (e) {}
}

function onTopicPicked(item) {
  const tid = item?.id ? (Number(item.id) || null) : null
  emit('update:modelValue', { ...props.modelValue, topic_id: tid, topic: item })
}

function openCreateTopic() {
  // emit kebab-case event (template listeners should use kebab-case)
  emit('create-topic')
}

function validateAndGoNext() {
  if (validate()) {
    emit('next')
  }
}

function saveAndContinue() {
  if (validate()) {
    emit('save')
  }
}

function triggerFileInput() {
  try { fileInput.value && fileInput.value.click() } catch (e) {}
}

function removeCover() {
  // remove both cover and cover_image
  const newModel = { ...props.modelValue }
  // Also clear the file object if it exists
  newModel.cover_file = undefined
  newModel.cover = undefined
  newModel.cover_image = null
  emit('update:modelValue', newModel)
}

async function onCoverChange(e) {
  const f = (e.target && e.target.files && e.target.files[0]) || null
  const newModel = { ...props.modelValue }
  if (f) {
    newModel.cover = URL.createObjectURL(f) // For preview
    newModel.cover_file = f // The actual file for upload
  }
  emit('update:modelValue', newModel)
}
</script>