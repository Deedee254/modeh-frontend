<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <PageHero
        title="Craft a new quiz"
        description="Define quiz details, fine‑tune delivery settings, and curate impact-driven questions from your bank or create fresh ones on the fly."
        :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizzes', href: '/quiz-master/quizzes' }, { text: 'Create', current: true }]"
      >
        <template #eyebrow>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2"></span>
          Quiz creation flow
        </template>
        <template #actions>
          <div class="flex flex-wrap items-center gap-3 sm:gap-3">
            <UButton
              size="sm"
              color="white"
              variant="ghost"
              class="min-w-[88px] transition-transform hover:scale-105"
              @click="$router.back()"
              icon="i-heroicons-arrow-left"
            >Cancel</UButton>
            <UButton
              size="sm"
              color="white"
              variant="soft"
              class="min-w-[88px] transition-transform hover:scale-105"
              :loading="isSaving"
              @click="saveDraft"
              icon="i-heroicons-document-arrow-down"
            >Save draft</UButton>
            <UButton
              size="sm"
              color="white"
              variant="soft"
              class="min-w-[88px] transition-transform hover:scale-105"
              @click="previewDraft"
              icon="i-heroicons-eye"
            >Preview</UButton>
            <UButton
              size="sm"
              color="primary"
              class="shadow-lg shadow-indigo-500/30 min-w-[120px] transition-transform hover:scale-105"
              :loading="isSaving"
              :disabled="!canPublish"
              @click="submit"
              icon="i-heroicons-paper-airplane"
            >Publish quiz</UButton>
          </div>
        </template>
      </PageHero>

      <div class="mt-6 grid gap-6">
              <!-- Top row: Steps 1 & 2 side-by-side on large screens -->
              <div class="grid gap-6 lg:grid-cols-2">
                <!-- Step 1 -->
                <section class="rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                  <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-widest text-indigo-500">Step 1</p>
                      <h2 class="text-lg font-semibold text-slate-800">Quiz shell</h2>
                      <p class="text-xs text-slate-500">Give your quiz the essentials — title, audience, and taxonomy.</p>
                    </div>
                    <div class="hidden text-2xl font-semibold text-indigo-400 lg:block">01</div>
                  </div>

                  <div class="space-y-8 px-6 py-6">
                    <div class="space-y-3">
                      <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Quiz title</label>
                      <UInput
                        v-model="form.title"
                        placeholder="e.g. Algebra mastery check"
                        :color="validationErrors._title ? 'red' : 'primary'"
                        class="bg-white"
                      />
                      <p v-if="validationErrors._title" class="text-xs text-rose-400">{{ validationErrors._title }}</p>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="flex flex-col gap-3">
                        <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Grade level</label>
                        <USelect
                          v-model="selectedGradeId"
                          :options="gradeOptions"
                          size="md"
                          placeholder="Select grade"
                          class="bg-white"
                        />
                      </div>
                      <div class="flex flex-col gap-3">
                        <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Subject</label>
                        <USelect
                          v-model="selectedSubjectId"
                          :options="subjectOptions"
                          size="md"
                          placeholder="Select subject"
                          :disabled="!selectedGradeId"
                          class="bg-white"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-3">
                      <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Topic</label>
                      <div class="flex flex-wrap gap-3">
                        <div class="min-w-[180px] flex-1">
                          <USelect
                            v-model="form.topic_id"
                            :options="topicOptions"
                            placeholder="Select topic"
                            size="md"
                            :disabled="!selectedSubjectId"
                            :color="validationErrors._topic ? 'red' : 'primary'"
                            class="bg-white"
                          />
                        </div>
                        <UButton
                          variant="outline"
                          size="xs"
                          class="border-indigo-100 text-indigo-700 hover:bg-indigo-50"
                          :disabled="!selectedSubjectId"
                          @click="openCreateTopic"
                        >New topic</UButton>
                      </div>
                      <p v-if="validationErrors._topic" class="text-xs text-rose-400">{{ validationErrors._topic }}</p>
                    </div>

                    <div class="space-y-3">
                      <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Description</label>
                      <UTextarea
                        v-model="form.description"
                          :rows="4"
                          class="bg-white"
                        placeholder="Share context, outcomes, or instructions for learners"
                      />
                    </div>
                  </div>
                </section>

                <!-- Step 2 -->
                <section class="rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                  <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-widest text-indigo-500">Step 2</p>
                      <h3 class="text-lg font-semibold text-slate-800">Delivery settings</h3>
                      <p class="text-xs text-slate-500">Control pacing, visibility, and availability.</p>
                    </div>
                    <div class="hidden text-2xl font-semibold text-indigo-400 lg:block">02</div>
                  </div>

                  <div class="mt-6 px-6 py-6 grid gap-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <UField label="Time limit (minutes)" label-class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <UInput
                          v-model="form.timer_minutes"
                          type="number"
                          min="0"
                          placeholder="e.g. 45"
                          class="bg-white"
                        />
                      </UField>
                      <UField label="Attempts allowed" label-class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <USelect
                          v-model="form.attempts_allowed"
                          :options="attemptOptions"
                          class="bg-white"
                        />
                      </UField>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <UField label="Access" label-class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <USelect
                          v-model="form.access"
                          :options="[
                            { label: 'Free', value: 'free' },
                            { label: 'Premium', value: 'premium' }
                          ]"
                          class="bg-white"
                          placeholder="Select access"
                        />
                      </UField>

                      <UField label="Visibility" label-class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <USelect
                          v-model="form.visibility"
                          :options="visibilityOptions"
                          class="bg-white"
                          placeholder="Select visibility"
                        />
                      </UField>
                    </div>

                    <div class="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                      <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Randomization</label>
                      <div class="flex flex-col gap-3">
                        <div class="flex flex-col gap-2">
                          <label class="inline-flex items-center gap-2">
                            <UCheckbox v-model="form.shuffle_questions" />
                            <span class="text-sm text-slate-700">Shuffle questions for every attempt</span>
                          </label>
                          <p class="text-xs text-slate-500">Learners receive randomized sequences, ideal for mastery checks.</p>

                          <label class="inline-flex items-center gap-2">
                            <UCheckbox v-model="form.shuffle_answers" />
                            <span class="text-sm text-slate-700">Shuffle answer options</span>
                          </label>
                          <p class="text-xs text-slate-500">Randomize option order to discourage memorization.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Step 3 full width beneath: Questions workspace -->
              <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
                <div class="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-indigo-500">Step 3</p>
                    <h2 class="text-xl font-semibold text-slate-800">Questions workspace</h2>
                    <p class="text-xs text-slate-500">Blend curated bank items with freshly engineered questions.
                    </p>
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-3 w-full">
                    <UTooltip text="Please select a Grade, Subject, and Topic first." :prevent="!taxonomyIsMissing">
                      <UButton
                        type="button"
                        size="sm"
                        color="white"
                        variant="soft"
                        class="inline-flex items-center gap-2 rounded-full border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white w-full sm:w-auto"
                        :disabled="taxonomyIsMissing"
                        @click="toggleInlineBuilder"
                      >
                        <Icon name="solar:magic-stick-3-bold" class="h-4 w-4" />
                        Build new question
                      </UButton>
                    </UTooltip>

                    <UTooltip text="Please select a Grade, Subject, and Topic first." :prevent="!taxonomyIsMissing">
                      <UButton
                        variant="outline"
                        size="md"
                        class="border-gray-200 text-slate-700 hover:bg-gray-50 w-full sm:w-auto"
                        :disabled="taxonomyIsMissing"
                        @click="showSmartBank = true"
                      >Smart bank</UButton>
                    </UTooltip>

                    <!-- Quick add removed: use Build new question to open the full-page builder -->
                  </div>
                </div>

                <QuestionSummaryPanel :questions="questions" />
                <div v-if="showSmartBank" class="mt-4">
                  <QuestionBankModal
                    :modelValue="showSmartBank"
                    :inline="true"
                    :gradeOptions="bankGradeOptions"
                    :subjectOptions="bankSubjectOptions"
                    :topicOptions="bankTopicOptions"
                    @update:modelValue="val => showSmartBank = val"
                    @add="addFromBank"
                  />
                </div>
                <div v-if="showInlineBuilder" class="mt-4">
                  <QuestionBuilder
                    :subjectId="selectedSubjectId"
                    :topicId="form.topic_id"
                    @saved="onInlineSaved"
                    @cancel="() => { showInlineBuilder = false }"
                  />
                </div>

                <div class="space-y-4 mt-4">
                  <TransitionGroup
                    name="list"
                    tag="div"
                    class="space-y-4"
                  >
                    <QuestionCard
                      v-for="(q, idx) in questions"
                      :key="q.uid"
                      :question="q"
                      :index="idx"
                      :expanded="expandedQuestionIds.has(q.uid)"
                      @toggle="toggleExpanded(q.uid)"
                      @duplicate="duplicateQuestion(idx)"
                      @remove="removeQuestion(idx)"
                      @update="vals => updateQuestion(idx, vals)"
                      @manage-media="payload => openMediaPanel(q.uid, payload)"
                    />
                  </TransitionGroup>

                  <EmptyState v-if="!questions.length" @add="addQuestion" />
                </div>
              </section>
        </div>
      </div>

    <!-- Slide-over: question bank -->
    <QuestionBankModal
      :modelValue="showSmartBank"
      :filters="bankFilters"
      :gradeOptions="bankGradeOptions"
      :subjectOptions="bankSubjectOptions"
      :topicOptions="bankTopicOptions"
      @update:modelValue="val => showSmartBank = val"
      @add="addFromBank"
    />

    <!-- Topic modal & preview modal wiring -->
    <CreateTopicModal
      :modelValue="showCreateTopic"
      :subjects="subjectsByGrade"
      :defaultSubjectId="selectedSubjectId"
      @update:modelValue="val => showCreateTopic = val"
      @created="onTopicCreated"
    />

    <QuizPreviewModal
      v-if="showPreview"
      :modelValue="showPreview"
      @update:modelValue="val => showPreview = val"
      :questions="questions"
      :title="form.title"
      :description="form.description"
    />

    <QuestionMediaDrawer
      v-if="activeMediaQuestion"
      :question="activeMediaQuestion"
      @close="closeMediaPanel"
      @update="updateQuestionMedia"
      @upload="handleMediaUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRuntimeConfig, useRoute } from '#imports'
import { useAppAlert } from '~/composables/useAppAlert'
import QuizPreviewModal from '~/components/preview/QuizPreviewModal.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'
import PageHero from '~/components/ui/PageHero.vue'
import QuestionBuilder from '~/components/question/QuestionBuilder.vue'

// Set page layout meta for quiz-master
if (typeof definePageMeta === 'function') {
  definePageMeta({ layout: 'quiz-master' })
}

const router = useRouter()
const config = useRuntimeConfig()
const route = useRoute()

// UI State
const activeTab = ref('details')
const isSaving = ref(false)
const showCreateTopic = ref(false)
// `showSmartBank` tracks the QuestionBank modal visibility (renamed from showBank)
const showSmartBank = ref(false)
const showInlineBuilder = ref(false)
const showPreview = ref(false)
const validationErrors = ref({})

// Navigate to the full-page question builder and pass selected subject/topic as query
function goToQuestionBuilder() {
  const subject = selectedSubjectId.value || ''
  const topic = form.value.topic_id || ''
  router.push({ path: '/quiz-master/questions/create', query: { subject_id: String(subject), topic_id: String(topic) } })
}

function toggleInlineBuilder() { showInlineBuilder.value = !showInlineBuilder.value }

function onInlineSaved(saved) {
  if (!saved) return
  // ensure shape and add uid for local list
  const copy = { ...(saved || {}), uid: Math.random().toString(36).substring(2), is_banked: true, open: false }
  questions.value.push(copy)
  useAppAlert().push({ message: 'Question added to quiz and saved to bank', type: 'success' })
  // keep the inline builder open so user can create another; QuestionBuilder also shows its own confirmation UI
}

// Form State
const form = ref({
  topic_id: '',
  title: '',
  description: '',
  youtube_url: '',
  cover: null,
  timer_minutes: null,
  attempts_allowed: 1,
  shuffle_questions: false,
  shuffle_answers: false,
  access: 'free',
  visibility: 'draft',
  scheduled_at: null,
})

// Initialize all data with proper types
const subjects = ref([])
const topics = ref([])
const selectedSubjectId = ref('')
const grades = ref([])
const selectedGradeId = ref('')
const questions = ref([])
const questionMedia = ref(Object.create(null)) // Empty object for media map

// UI state for expanded question cards (use a Set wrapped in a ref for simple membership checks)
const expandedQuestionIds = ref(new Set())

function toggleExpanded(uid) {
  // create a new Set to ensure reactivity when mutating
  const next = new Set(expandedQuestionIds.value)
  if (next.has(uid)) next.delete(uid)
  else next.add(uid)
  expandedQuestionIds.value = next
}

// Options used by various form controls
const attemptOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: 'Unlimited', value: 0 }
]

const visibilityOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' }
]

// Filters passed to the smart bank modal; computed so it stays in sync with selections
const bankFilters = computed(() => ({
  grade: selectedGradeId.value || null,
  subject: selectedSubjectId.value || null,
  topic: form.value.topic_id || null
}))

// Media drawer state
const activeMediaQuestion = ref(null)

function openMediaPanel(uid /*, payload */) {
  const q = questions.value.find(item => item.uid === uid)
  if (q) activeMediaQuestion.value = q
}

function closeMediaPanel() {
  activeMediaQuestion.value = null
}

function updateQuestionMedia(payload) {
  // payload expected to be { uid, media } or similar shape from drawer
  if (!payload || !payload.uid) return
  const q = questions.value.find(item => item.uid === payload.uid)
  if (!q) return
  // update question media pointer
  q.media = payload.media

  // if a File was provided, also register it for multipart upload
  const idx = questions.value.findIndex(item => item.uid === payload.uid)
  if (idx >= 0) questionMedia.value[idx] = payload.media
}

function handleMediaUpload({ uid, file }) {
  if (!uid) return
  const idx = questions.value.findIndex(item => item.uid === uid)
  if (idx < 0) return
  // store file for multipart upload
  questionMedia.value[idx] = file
  // also attach to the question object if present
  const q = questions.value[idx]
  if (q) q.media = file
}

// Ensure arrays are properly initialized
onMounted(() => {
  // Initialize with empty arrays to ensure proper type
  subjects.value = []
  topics.value = []
  grades.value = []
  questions.value = []
})

// Fetch with timeout + AbortController to avoid long-hanging network requests
const lastFetchController = ref(null)

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  // Abort previous pending controller for autosave-like calls
  try { if (lastFetchController.value) { lastFetchController.value.abort() } } catch (e) {}
  const controller = new AbortController()
  lastFetchController.value = controller
  const signal = controller.signal
  const opts = { ...options, signal }
  try {
    const fetcher = (url.startsWith('http') || url.startsWith('/api')) ? $fetch.raw : fetch
    return await fetcher(url, opts)
  } catch (err) {
      try {
        console.error('[fetchWithTimeout] error fetching', url, { name: err && err.name, message: err && err.message, code: err && err.code })
      } catch (logErr) {}
      throw err
  } finally {
    if (lastFetchController.value === controller) lastFetchController.value = null
  }
}

// Question Operations
const questionTemplate = {
  type: 'mcq-single',
  text: '<p></p>',
  options: ['', ''],
  correct: -1,
  corrects: [],
  difficulty: 2,
  marks: 1,
  fill_parts: ['', ''],
  media: null,
  explanation: '',
  tags: '',
  hint: '',
  solution_steps: '<p></p>',
  open: true,
  is_banked: false,
}

function makeQuestion() {
  return {
    ...questionTemplate,
    uid: Math.random().toString(36).substring(2)
  }
}

function addQuestion() {
  const newQuestion = makeQuestion()
  questions.value.push(newQuestion)
  nextTick(() => newQuestion.open = true)
}

function removeQuestion(idx) {
  questions.value.splice(idx, 1)
}

function duplicateQuestion(idx) {
  const original = questions.value[idx]
  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    uid: Math.random().toString(36).substring(2)
  }
  questions.value.splice(idx + 1, 0, copy)
}

function addOption(idx) {
  if (questions.value[idx]) {
    questions.value[idx].options.push('')
  }
}

function removeOption(idx, optIdx) {
  if (questions.value[idx] && questions.value[idx].options.length > 2) {
    questions.value[idx].options.splice(optIdx, 1)
  }
}

function addFromBank(q) {
  if (Array.isArray(q)) {
    q.forEach(item => {
      const copy = { ...JSON.parse(JSON.stringify(item)), uid: Math.random().toString(36).substring(2), open: true, is_banked: true }
      questions.value.push(copy)
    })
    return
  }
  const copy = {
    ...JSON.parse(JSON.stringify(q)),
    uid: Math.random().toString(36).substring(2),
    open: true,
    is_banked: true
  }
  questions.value.push(copy)
}

// Computed Values
const overallDifficulty = computed(() => {
  if (!questions.value.length) return { avg: 0, label: 'N/A' }
  const sum = questions.value.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  const avg = +(sum / questions.value.length).toFixed(2)
  const label = avg <= 1.6 ? 'Easy' : avg <= 2.3 ? 'Medium' : 'Hard'
  return { avg, label }
})

const canPublish = computed(() => {
  if (!form.value.title?.trim() || !form.value.topic_id) return false
  if (!questions.value.length) return false
  // A lighter check: ensure no questions have validation errors
  return Object.keys(validationErrors.value).length === 0
})

const taxonomyIsMissing = computed(() => !selectedGradeId.value || !selectedSubjectId.value || !form.value.topic_id)

// Safe computed properties with null checks
const subjectsByGrade = computed(() => {
  if (!selectedGradeId.value || !Array.isArray(subjects.value)) return []
  return subjects.value.filter(s => s && typeof s === 'object' && Number(s.grade_id) === Number(selectedGradeId.value))
})

const bankGradeOptions = computed(() => Array.isArray(grades.value) ? grades.value.map(g => ({ label: g.name || `Grade ${g.id}`, value: g.id })) : [])
const bankSubjectOptions = computed(() => {
  if (!Array.isArray(subjects.value)) return []
  // if a grade is selected, filter subjects to that grade
  const list = selectedGradeId.value ? subjects.value.filter(s => Number(s.grade_id) === Number(selectedGradeId.value)) : subjects.value
  return list.map(s => ({ label: s.name || s.title || s.id, value: s.id, grade_id: s.grade_id }))
})
const bankTopicOptions = computed(() => {
  if (!Array.isArray(topics.value)) return []
  const list = selectedSubjectId.value ? topics.value.filter(t => Number(t.subject_id) === Number(selectedSubjectId.value)) : topics.value
  return list.map(t => ({ label: t.name || t.title || t.id, value: t.id, subject_id: t.subject_id }))
})

// Backwards-compatible aliases used by the template
const gradeOptions = computed(() => bankGradeOptions.value)
const subjectOptions = computed(() => bankSubjectOptions.value)
const topicOptions = computed(() => bankTopicOptions.value)

const filteredTopics = computed(() => {
  if (!selectedSubjectId.value || !Array.isArray(topics.value)) return []
  return topics.value.filter(t => t && typeof t === 'object' && Number(t.subject_id) === Number(selectedSubjectId.value))
})

// Watchers
watch(selectedGradeId, () => {
  selectedSubjectId.value = ''
  form.value.topic_id = ''
})

watch(selectedSubjectId, () => {
  form.value.topic_id = ''
})

// Topic Modal Handlers
function openCreateTopic() {
  showCreateTopic.value = true
}

function onTopicCreated(created) {
  if (!created) return
  topics.value.unshift(created)
  form.value.topic_id = created.id
  if (created.subject_id) selectedSubjectId.value = created.subject_id
  showCreateTopic.value = false
}

// Form Submission
function validateQuestion(q) {
  const errs = []
  if (!q.text || !String(q.text).trim()) errs.push('Question text required')
  if (q.type === 'mcq-single') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errs.push('At least 2 options required')
    } else if (q.correct === -1) {
      errs.push('Select the correct answer')
    }
  } else if (q.type === 'tf' && q.correct === -1) {
    errs.push('Select True or False')
  }
  return errs
}

function runValidation() {
  const out = {}
  if (!form.value.title?.trim()) out._title = 'Title required'
  if (!form.value.topic_id) out._topic = 'Topic required'
  
  questions.value.forEach(q => {
    const errors = validateQuestion(q)
    if (errors.length) out[q.uid] = errors
  })
  
  validationErrors.value = out
  return out
}

async function buildQuizPayload(isDraft = false) {
  const data = new FormData()
  
  // Form fields
  const fields = ['topic_id', 'title', 'description', 'youtube_url']
  fields.forEach(field => {
    if (form.value[field]) data.append(field, form.value[field])
  })

  // Settings
  if (form.value.timer_minutes) data.append('timer_minutes', form.value.timer_minutes)
  data.append('attempts_allowed', form.value.attempts_allowed)
  data.append('shuffle_questions', form.value.shuffle_questions ? '1' : '0')
  data.append('shuffle_answers', form.value.shuffle_answers ? '1' : '0')
  data.append('access', form.value.access)
  data.append('visibility', isDraft ? 'draft' : form.value.visibility)
  
  // Questions: send the questions array as returned/persisted by the builder and bank
  try {
    data.append('questions', JSON.stringify(questions.value))
  } catch (e) {
    data.append('questions', JSON.stringify([]))
  }

  // Media
  Object.entries(questionMedia.value).forEach(([idx, file]) => {
    if (file) data.append(`question_media[${idx}]`, file)
  })

  return data
}

async function submit() {
  const errors = runValidation()
  if (Object.keys(errors).length) {
    useAppAlert().push({ message: 'Please fix validation errors before publishing', type: 'warning' })
    return
  }

  isSaving.value = true
  try {
    const payload = await buildQuizPayload(false)
    const res = await fetchWithTimeout(config.public.apiBase + '/api/quizzes', {
      method: 'POST',
      credentials: 'include',
      body: payload
    })
    
  if (!res.ok) throw new Error('Failed to save quiz')

  const json = await res.json()
  useAppAlert().push({ message: 'Quiz published successfully!', type: 'success' })
    
  // Redirect to quiz list
    router.push('/quiz-master/quizzes')
  } catch (e) {
    useAppAlert().push({ message: 'Failed to publish quiz: ' + e.message, type: 'error' })
  } finally {
    isSaving.value = false
  }
}

async function saveDraft() {
  if (!form.value.title) {
    useAppAlert().push({ message: 'Please enter a title before saving draft', type: 'warning' })
    return
  }

  isSaving.value = true
  try {
    const payload = await buildQuizPayload(true)
    const res = await fetchWithTimeout(config.public.apiBase + '/api/quizzes', {
      method: 'POST',
      credentials: 'include',
      body: payload
    })
    
  if (!res.ok) throw new Error('Failed to save draft')

  useAppAlert().push({ message: 'Draft saved successfully!', type: 'success' })
  } catch (e) {
    useAppAlert().push({ message: 'Failed to save draft: ' + e.message, type: 'error' })
  } finally {
    isSaving.value = false
  }
}

// Initial Load
onMounted(async () => {
  // Load grades and subjects
  try {
    const [gradesRes, subjectsRes, topicsRes] = await Promise.all([
      fetch(config.public.apiBase + '/api/grades', { credentials: 'include' }),
      fetch(config.public.apiBase + '/api/subjects', { credentials: 'include' }),
      fetch(config.public.apiBase + '/api/topics', { credentials: 'include' })
    ])

    // Grades (may include nested subjects)
    if (gradesRes.ok) {
      const json = await gradesRes.json()
      const gradesData = json.grades || json.data || []
      grades.value = Array.isArray(gradesData) ? gradesData : []

      // If grades contain nested subjects, extract them
      const nestedSubjects = []
      grades.value.forEach(g => {
        if (Array.isArray(g.subjects) && g.subjects.length) {
          g.subjects.forEach(s => nestedSubjects.push(s))
        }
      })
      if (nestedSubjects.length) {
        // merge nested subjects into subjects.value without duplicates
        const map = new Map((subjects.value || []).map(s => [s.id, s]))
        nestedSubjects.forEach(s => map.set(s.id, s))
        subjects.value = Array.from(map.values())
      }
    }

    // Subjects (flat list) - merge with any nested subjects we may have added
    if (subjectsRes.ok) {
      const json = await subjectsRes.json()
      const subjectsData = json.subjects || json.data || []
      if (Array.isArray(subjectsData) && subjectsData.length) {
        const map = new Map((subjects.value || []).map(s => [s.id, s]))
        subjectsData.forEach(s => map.set(s.id, s))
        subjects.value = Array.from(map.values())
      }
    }

    // Topics
    if (topicsRes.ok) {
      const json = await topicsRes.json()
      const topicsData = json.topics || json.data || []
      topics.value = Array.isArray(topicsData) ? topicsData : []
    }
  } catch (e) {
    console.error('Failed to load initial data:', e)
  }

  // Load existing quiz if editing
  const editId = route.query.id
  if (editId) {
    try {
      const res = await fetch(config.public.apiBase + '/api/quizzes/' + encodeURIComponent(editId), {
        credentials: 'include'
      })
      
      if (res.ok) {
        const json = await res.json()
        const quiz = json.quiz || json
        
        // Populate form
        form.value = {
          topic_id: quiz.topic_id || '',
          title: quiz.title || '',
          description: quiz.description || '',
          youtube_url: quiz.youtube_url || '',
          cover: null,
          timer_minutes: quiz.timer_minutes || null,
          attempts_allowed: quiz.attempts_allowed || 1,
          shuffle_questions: !!quiz.shuffle_questions,
          shuffle_answers: !!quiz.shuffle_answers,
          access: quiz.access || 'free',
          visibility: quiz.visibility || 'draft',
          scheduled_at: quiz.scheduled_at || null,
        }
        
        // Set subject
        if (quiz.topic?.subject_id) {
          const subject = subjects.value.find(s => s.id === quiz.topic.subject_id)
          if (subject) {
            selectedGradeId.value = subject.grade_id
            selectedSubjectId.value = subject.id
          }
        }
        
        // Load questions
        if (Array.isArray(quiz.questions)) {
          questions.value = quiz.questions.map(q => ({
            ...q,
            uid: Math.random().toString(36).substring(2),
            open: false
          }))
        }
        
  // previously we used a local successMessage ref here; use global alert instead
  useAppAlert().push({ message: 'Editing existing quiz', type: 'info' })
      }
    } catch (e) {
      console.error('Failed to load quiz:', e)
    }
  }

  // Prefill from query params when this is a new quiz (not editing)
  if (!editId) {
    const qSubject = route.query.subject_id || route.query.subject || ''
    const qTopic = route.query.topic_id || route.query.topic || ''
    try {
      if (qSubject) {
        const sid = Number(Array.isArray(qSubject) ? qSubject[0] : qSubject)
        if (!Number.isNaN(sid)) {
          // set subject and its grade if available
          const subject = subjects.value.find(s => Number(s.id) === sid)
          if (subject) {
            selectedSubjectId.value = subject.id
            selectedGradeId.value = subject.grade_id || selectedGradeId.value
          } else {
            selectedSubjectId.value = sid
          }
        }
      }

      if (qTopic) {
        const tid = Number(Array.isArray(qTopic) ? qTopic[0] : qTopic)
        if (!Number.isNaN(tid)) {
          form.value.topic_id = tid
          const topic = topics.value.find(t => Number(t.id) === tid)
          if (topic && topic.subject_id && !selectedSubjectId.value) {
            selectedSubjectId.value = topic.subject_id
            const subject = subjects.value.find(s => Number(s.id) === Number(topic.subject_id))
            if (subject) selectedGradeId.value = subject.grade_id || selectedGradeId.value
          }
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // If we returned from question builder with a success flag, show a brief toast-style message
  try {
    const qs = route.query || {}
    if (qs.new_question_saved) {
      useAppAlert().push({ message: 'Question saved', type: 'success' })
      // remove the param from the URL without reloading
      const newQuery = { ...qs }
      delete newQuery.new_question_saved
      router.replace({ path: route.path, query: newQuery })
    }
  } catch (e) {}

  // Merge any pending questions saved by the full-page question creator
  try {
    const raw = sessionStorage.getItem('quiz:pending_questions')
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length) {
        arr.forEach(q => {
          const copy = { ...(q || {}), uid: Math.random().toString(36).substring(2), is_banked: true }
          questions.value.push(copy)
        })
      }
      sessionStorage.removeItem('quiz:pending_questions')
    }
    // also check in-memory fallback
    if (window._pendingQuestions && Array.isArray(window._pendingQuestions)) {
      window._pendingQuestions.forEach(q => questions.value.push({ ...(q || {}), uid: Math.random().toString(36).substring(2), is_banked: true }))
      window._pendingQuestions = []
    }
  } catch (e) {}
})

function previewDraft() {
  // gather current form and questions into sessionStorage
  const payload = {
    form: form.value,
    questions: questions.value
  }

  // window._tmpFiles is used to transfer File objects between routes
  window._tmpFiles = window._tmpFiles || {}
  // iterate questions for any File objects in questionMedia or attachments and assign temp keys
  questions.value.forEach((q, idx) => {
    if (q.media instanceof File) {
      const key = `q_media_${Date.now()}_${idx}`
      window._tmpFiles[key] = q.media
      q._imageFileKey = key
    }
    if (q.audio instanceof File) {
      const key = `q_audio_${Date.now()}_${idx}`
      window._tmpFiles[key] = q.audio
      q._audioFileKey = key
    }
  })

  try { sessionStorage.setItem('quiz:draft', JSON.stringify(payload)) } catch (e) {}
  // navigate to preview
  useAppAlert().push({ message: 'Opening preview — your files are stored temporarily', type: 'info' })
  router.push('/quiz-master/quizzes/preview')
}

onBeforeUnmount(() => {
  // Abort any pending requests
  if (lastFetchController.value) {
    try {
      lastFetchController.value.abort()
    } catch (e) {}
  }
})
</script>

<style>
/* Transition Classes */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.u-button {
  transition: all 0.2s ease-in-out;
}

.list-leave-active {
  position: absolute;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .rounded-lg {
    border-radius: 0.5rem;
  }

  /* Improve touch targets */
  button, 
  select,
  input[type="radio"],
  input[type="checkbox"] {
    min-height: 2.5rem;
    min-width: 2.5rem;
  }

  /* Make checkboxes and radios easier to tap on small screens */
  input[type="checkbox"],
  input[type="radio"] {
    width: 1.5rem;
    height: 1.5rem;
    min-width: 1.5rem;
    min-height: 1.5rem;
    margin-right: 0.5rem;
    /* use brand accent where supported */
    accent-color: #0b3d91;
  }

  /* Ensure inline labels have extra padding so taps hit the label as well */
  label.inline-flex,
  .inline-flex.items-center {
    padding: 0.375rem 0.5rem;
    border-radius: 0.5rem;
  }

  /* If the project's UI library wraps native inputs, provide generic wrappers a minimum hit area */
  .u-checkbox, .u-radio, .checkbox-wrapper, .radio-wrapper {
    min-width: 2rem;
    min-height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Stack grid items on mobile */
  .grid {
    grid-template-columns: 1fr !important;
  }

  /* Adjust spacing */
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }
}
</style>