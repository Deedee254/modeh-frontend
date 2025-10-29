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
                                resource="subjects"
                                :grade-id="selectedGrade || null"
                                :per-page="50"
                                :model-value="selectedSubjectObj || null"
                                title="Subjects"
                                subtitle="Pick a subject"
                                @update:modelValue="onSubjectModelUpdate"
                                @selected="onSubjectPicked"
                                aria-labelledby="subject-label"
                              />
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
                @update:modelValue="onTopicModelUpdate"
                @selected="onTopicPicked"
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
    <div class="mt-6 flex justify-end gap-3">
      <UButton size="sm" variant="soft" @click="saveAndContinue" :loading="saving">Save and Continue</UButton>
      <UButton size="sm" color="primary" @click="validate">Continue to Settings</UButton>
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

// small helper to generate a temporary key for window._tmpFiles
function makeTmpKey() {
  return `tmpfile_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

const props = defineProps({
  modelValue: { type: Object, required: true },
  levels: { type: Array, default: () => [] },
  grades: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  topics: { type: Array, default: () => [] },
  errors: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false },
  loadingSubjects: { type: Boolean, default: false },
  loadingTopics: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'create-topic', 'save', 'next', 'subject-picked', 'topic-picked'])

// local client-side validation state
const localErrors = ref({ _title: null, _topic: null })
const displayTitleError = computed(() => props.errors?._title || localErrors.value._title)
const displayTopicError = computed(() => props.errors?._topic || localErrors.value._topic)

function validateBeforeSave() {
  let ok = true
  localErrors.value._title = null
  localErrors.value._topic = null
  if (!props.modelValue.title || !props.modelValue.title.trim()) {
    localErrors.value._title = 'Title is required.'
    ok = false
  }
  if (!props.modelValue.topic_id) {
    localErrors.value._topic = 'Please pick a topic.'
    ok = false
  }
  return ok
}

// Internal selection refs initialized from parent modelValue
const selectedGrade = ref(props.modelValue?.grade_id || '')
const selectedLevel = ref(props.modelValue?.level_id || '')
const selectedSubject = ref(props.modelValue?.subject_id || '')
const topicsPicker = ref(null)
const selectedTopic = ref(props.modelValue?.topic_id || '')

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
  try {
    const cov = props.modelValue?.cover
    if (cov && typeof cov === 'string') {
      const store = typeof window !== 'undefined' ? (window['_tmpFiles'] || {}) : {}
      const f = store[cov]
      if (f instanceof File) return URL.createObjectURL(f)
      if (/^(?:https?:)?\/\//.test(cov) || /^(?:data:|blob:)/.test(cov)) return cov
      if (cov.startsWith('tmpfile_')) return null
      const resolvedCover = resolveAssetUrl(cov)
      if (resolvedCover) return resolvedCover
    }
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
  if (!selectedSubject.value || !Array.isArray(props.topics)) return []
  return props.topics.filter(t => t && typeof t === 'object' && t.subject_id && String(t.subject_id) === String(selectedSubject.value))
})

// Selected names for confirmation display
const selectedLevelName = computed(() => {
  if (!selectedLevel.value || !Array.isArray(props.levels)) return ''
  const l = props.levels.find(x => x && String(x.id) === String(selectedLevel.value))
  return l && l.name ? l.name : ''
})

const selectedGradeName = computed(() => {
  if (!selectedGrade.value || !Array.isArray(props.grades)) return ''
  const g = props.grades.find(x => x && String(x.id) === String(selectedGrade.value))
  return g && g.name ? g.name : ''
})

const selectedSubjectName = computed(() => {
  // prefer name from subjects list
  if (selectedSubject.value && Array.isArray(props.subjects)) {
    const s = props.subjects.find(x => x && String(x.id) === String(selectedSubject.value))
    if (s && s.name) return s.name
  }
  // fallback to model-provided subject object
  const modelSub = props.modelValue?.subject
  if (modelSub && modelSub.name) return modelSub.name
  return ''
})

const selectedTopicName = computed(() => {
  const tid = props.modelValue?.topic_id || ''
  if (tid && Array.isArray(props.topics)) {
    const t = props.topics.find(x => x && String(x.id) === String(tid))
    if (t && t.name) return t.name
  }
  const modelTopic = props.modelValue?.topic
  if (modelTopic && modelTopic.name) return modelTopic.name
  return ''
})

const selectedTopicObj = computed(() => {
  // prefer a full topic object from the model if available
  const modelTopic = props.modelValue?.topic || null
  if (modelTopic && typeof modelTopic === 'object' && modelTopic.id) return modelTopic
  const tid = props.modelValue?.topic_id || ''
  if (!tid) return null
  if (Array.isArray(props.topics)) {
    const found = props.topics.find(x => x && String(x.id) === String(tid))
    if (found) return found
  }
  return tid
})

// Provide a subject object (or id) for TaxonomyPicker so it can display
// the selected subject even when the subjects list is not yet populated.
const selectedSubjectObj = computed(() => {
  const modelSub = props.modelValue?.subject || null
  if (modelSub && typeof modelSub === 'object' && modelSub.id) return modelSub
  const sid = props.modelValue?.subject_id || ''
  if (!sid) return null
  if (Array.isArray(props.subjects)) {
    const found = props.subjects.find(x => x && String(x.id) === String(sid))
    if (found) return found
  }
  return sid
})

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
const { fetchSubjectsByGrade, fetchTopicsBySubject } = useTaxonomy()
watch(selectedGrade, async (nv, ov) => {
  if (suppressWatchers.value) return
  if (sameId(nv, ov)) return
  selectedSubject.value = ''
  if (!sameId(props.modelValue?.grade_id, nv)) {
    emit('update:modelValue', { ...props.modelValue, grade_id: nv || null, subject_id: null, topic_id: null })
  }
  try { await fetchSubjectsByGrade(nv) } catch (e) {}
})

// When level changes, clear grade/subject/topic and notify parent
watch(selectedLevel, (nv, ov) => {
  if (suppressWatchers.value) return
  if (sameId(nv, ov)) return
  selectedGrade.value = ''
  selectedSubject.value = ''
  if (!sameId(props.modelValue?.level_id, nv)) {
    emit('update:modelValue', { ...props.modelValue, level_id: nv || null, grade_id: null, subject_id: null, topic_id: null })
  }
})

// Keep internal selected values in sync with parent changes
watch(() => props.modelValue, (nv) => {
  if (!nv) return
  const { grade_id, subject_id, level_id, topic_id } = nv
  if (!sameId(selectedGrade.value, grade_id)) selectedGrade.value = grade_id || ''
  if (!sameId(selectedSubject.value, subject_id)) selectedSubject.value = subject_id || ''
  if (!sameId(selectedLevel.value, level_id)) selectedLevel.value = level_id || ''
  if (!sameId(selectedTopic.value, topic_id)) selectedTopic.value = topic_id || ''
}, { deep: true })

function onSubjectPicked(item) {
  selectedSubject.value = item?.id || ''
  const sid = item?.id ? (Number(item.id) || null) : null
  emit('update:modelValue', { ...props.modelValue, subject_id: sid, topic_id: null })
  // also notify parent directly so callers can preload topics or update other state
  emit('subject-picked', item)
  // preload topics for the selected subject via composable
  try { fetchTopicsBySubject(sid) } catch (e) {}
  // auto-focus the topics picker so users can quickly pick a topic after selecting a subject
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
}

// Model update handlers used by TaxonomyPicker's v-model (@update:modelValue)
function onSubjectModelUpdate(v) {
  try {
    // v may be an id or an object; normalize for local ref
    selectedSubject.value = (v && typeof v === 'object') ? (v.id || '') : (v || '')
    const item = (v && typeof v === 'object') ? v : (props.subjects || []).find(s => String(s.id) === String(v)) || null
    onSubjectPicked(item)
  } catch (e) {}
}

// Grade handlers (used by the grades TaxonomyPicker)
function onGradeModelUpdate(v) {
  try {
    selectedGrade.value = (v && typeof v === 'object') ? (v.id || '') : (v || '')
    // clear subject/topic when grade changes
    emit('update:modelValue', { ...props.modelValue, grade_id: selectedGrade.value || null, subject_id: null, topic_id: null })
    try { fetchSubjectsByGrade(selectedGrade.value) } catch (e) {}
  } catch (e) {}
}

function onGradeSelected(item) {
  try {
    selectedGrade.value = item?.id || ''
    onGradeModelUpdate(item)
    // Auto focus subjects picker after grade selection
    nextTick(() => {
      const subjectsPicker = document.querySelector('[aria-labelledby="subject-label"] input')
      if (subjectsPicker) {
        subjectsPicker.focus()
        if (typeof subjectsPicker.scrollIntoView === 'function') {
          subjectsPicker.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    })
  } catch (e) {}
}

function onTopicModelUpdate(v) {
  try {
    selectedTopic.value = (v && typeof v === 'object') ? (v.id || '') : (v || '')
    const item = (v && typeof v === 'object') ? v : (props.topics || []).find(t => String(t.id) === String(v)) || null
    onTopicPicked(item)
  } catch (e) {}
}

function onTopicPicked(item) {
  const tid = item?.id ? (Number(item.id) || null) : null
  emit('update:modelValue', { ...props.modelValue, topic_id: tid })
  emit('topic-picked', item)
}

function openCreateTopic() {
  // emit kebab-case event (template listeners should use kebab-case)
  emit('create-topic')
}

function validate() {
  if (!props.modelValue.title?.trim()) return false
  if (!props.modelValue.topic_id) return false
  emit('next')
  return true
}

function saveAndContinue() {
  // client-side validate before emitting save to avoid server 422
  if (!validateBeforeSave()) return
  emit('save')
}

function triggerFileInput() {
  try { fileInput.value && fileInput.value.click() } catch (e) {}
}

function removeCover() {
  // remove both cover and cover_image
  const newModel = { ...props.modelValue }
  newModel.cover = null
  newModel.cover_image = null
  emit('update:modelValue', newModel)
}

async function onCoverChange(e) {
  const f = (e.target && e.target.files && e.target.files[0]) || null
  if (!f) return
  // store in a global tmp map so preview and other components can access it
  try {
  if (!window['_tmpFiles']) window['_tmpFiles'] = {}
  const key = makeTmpKey()
  window['_tmpFiles'][key] = f
    // emit update with cover set to tmp key
    const newModel = { ...props.modelValue, cover: key }
    emit('update:modelValue', newModel)
  } catch (err) {
    // fallback: emit the File directly
    const newModel = { ...props.modelValue, cover: f }
    emit('update:modelValue', newModel)
  }
}
</script>