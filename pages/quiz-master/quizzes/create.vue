<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <div class="mx-auto max-w-[320px] sm:max-w-2xl lg:max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Create a new quiz</h1>
          <p class="text-sm text-slate-500">Quick multi-step wizard for quiz-masters</p>
        </div>
      </div>

      <nav class="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            v-for="tab in tabConfig"
            :key="tab.key"
            @click="trySetTab(tab.key)"
            :class="[
              'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
              store.activeTab === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            ]"
          >
            <span>{{ tab.label }}</span>
            <Icon v-if="store[tab.savedFlag]" name="heroicons:check-circle-20-solid" class="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div v-if="store.activeTab === 'questions'" class="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span class="font-semibold uppercase tracking-wide text-slate-500">Bank filters</span>
          <span v-if="store.quiz?.level_id" class="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-indigo-700">
            Level: {{ (levels || []).find(l => String(l.id) === String(store.quiz?.level_id))?.name || store.quiz?.level_id }}
          </span>
          <span v-if="store.quiz?.grade_id" class="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-indigo-700">
            Grade: {{ (grades || []).find(g => String(g.id) === String(store.quiz?.grade_id))?.name || store.quiz?.grade_id }}
          </span>
          <span v-if="store.quiz?.subject_id" class="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-indigo-700">
            Subject: {{ (subjects || []).find(s => String(s.id) === String(store.quiz?.subject_id))?.name || store.quiz?.subject_id }}
          </span>
          <span v-if="store.quiz?.topic_id" class="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-indigo-700">
            Topic: {{ (topics || []).find(t => String(t.id) === String(store.quiz?.topic_id))?.name || store.quiz?.topic_id }}
          </span>
        </div>

        <QuizDetailsTab
          v-if="store.activeTab === 'details'"
          :model-value="store.quiz"
          :grades="grades"
          :levels="levels"
          :subjects="subjects"
          :topics="topics"
          :loading-subjects="loadingSubjects"
          :loading-topics="loadingTopics"
          :errors="store.detailsErrors"
          :saving="store.isSubmitting"
          @update:modelValue="(v) => (store.quiz = v)"
          @subject-picked="onSelectSubject"
          @topic-picked="onSelectTopic"
          @create-topic="() => { showTopicModal = true }"
          @subject-search="onSubjectSearch"
          @topic-search="onTopicSearch"
          @save="async () => { const ok = await saveDetails(); if (ok) trySetTab('settings'); }"
          @next="() => trySetTab('settings')"
          @approval-requested="async (id) => { try { await fetchTopicsPage({ subjectId: store.quiz?.subject_id ?? null, page: 1, perPage: 50, q: '' }) } catch (e) {} }"
        />

        <QuizSettingsTab
          v-else-if="store.activeTab === 'settings'"
          :model-value="store.quiz"
          :saving="store.isSubmitting"
          :errors="store.settingsErrors"
          @update:modelValue="(v) => (store.quiz = v)"
          @save="async () => { const ok = await saveSettings(); if (ok) trySetTab('questions'); }"
          @next="() => trySetTab('questions')"
          @prev="() => trySetTab('details')"
          @error="(e) => alert.push(e)"
        />

        <QuizQuestionsTab
          v-else
          :errors="store.questionsErrors"
          :saving="store.isSubmitting"
          @open-builder="openBuilder"
          @open-bank="onOpenBank"
          @edit="(q) => edit(q)"
          @preview="onPreview"
          @prev="() => store.setTab('settings')"
          @publish="onPublish"
        />
      </div>

      <div v-if="showBuilder" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <QuestionBuilder :subjectId="subject_id" :topicId="topic_id" @saved="onQuestionSaved" @cancel="onCancel" />
      </div>

      <CreateTopicModal
        :model-value="showTopicModal"
        :grades="grades"
        :subjects="subjects"
        :defaultLevelId="store.quiz?.level_id ?? null"
        :defaultGradeId="store.quiz?.grade_id ?? null"
        :defaultSubjectId="store.quiz?.subject_id ?? null"
        @update:modelValue="(v) => (showTopicModal = v)"
        @created="onTopicCreated"
      />

      <QuestionBankModal
        :model-value="showQuestionBank"
        :gradeOptions="grades"
        :subjectOptions="subjects"
        :topicOptions="topics"
        :levelOptions="levels"
        :initialFilters="{ level: store.quiz?.level_id ?? null, grade: store.quiz?.grade_id ?? null, subject: store.quiz?.subject_id ?? null, topic: store.quiz?.topic_id ?? null }"
        @update:modelValue="(v) => (showQuestionBank = v)"
        @add="onAddFromBank"
      />

      <QuizPreviewModal :model-value="showPreview" :quiz="{ ...(store.quiz || {}), questions: store.questions }" />

      <UModal v-model="showCreatedModal" :ui="{ width: 'sm:max-w-xl' }">
        <div class="p-4 sm:p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Quiz created</h3>
          </div>
          <div class="space-y-4">
            <div>
              <div class="text-xl font-bold">{{ createdPayload?.title || store.quiz?.title || '' }}</div>
              <div class="text-sm text-gray-600">{{ createdPayload?.description || store.quiz?.description || '' }}</div>
              <div class="text-sm text-gray-500">Topic: {{ createdPayload?.topic_name || store.quiz?.topic_id || '—' }}</div>
              <div class="text-sm text-gray-500">Questions: {{ store.questions.length }}</div>
            </div>
            <div class="flex justify-end gap-2">
              <UButton variant="soft" @click="showCreatedModal = false">Continue editing</UButton>
              <UButton color="primary" @click="() => { showCreatedModal = false; router.push(`/quiz-master/quizzes/${createdPayload?.id || store.quizId}`) }">View</UButton>
              <UButton color="gray" variant="ghost" @click="() => { showCreatedModal = false; router.push(`/quiz-master/quizzes/${createdPayload?.id || store.quizId}/edit`) }">Edit</UButton>
            </div>
          </div>
        </div>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useCreateQuizStore } from '~/stores/createQuizStore'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import QuestionBuilder from '~/components/quiz/QuestionBuilder.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'
import UiCard from '~/components/ui/UiCard.vue'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import QuizDetailsTab from '~/components/quiz/QuizDetailsTab.vue'
import QuizSettingsTab from '~/components/quiz/QuizSettingsTab.vue'
import QuizQuestionsTab from '~/components/quiz/QuizQuestionsTab.vue'
import QuizPreviewModal from '~/components/preview/QuizPreviewModal.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'
import { onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quiz-master', title: 'Create quiz', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Create a new quiz as a quiz-master — add questions, settings and publish options.' } ] })

const tabConfig = [
  { key: 'details', label: 'Details', savedFlag: 'detailsSaved' },
  { key: 'settings', label: 'Settings', savedFlag: 'settingsSaved' },
  { key: 'questions', label: 'Questions', savedFlag: 'questionsSaved' },
]

const store = useCreateQuizStore()
if (!store.quiz || typeof store.quiz !== 'object') store.quiz = {}
const route = useRoute()
const router = useRouter()
const cfg = useRuntimeConfig()

function trySetTab(tab) {
  if (tab === 'details') {
    store.setTab('details');
    return;
  }
  if (tab === 'settings' || tab === 'questions') {
    if (!store.isDetailsValid) {
      alert.push({ type: 'warning', message: 'Please complete quiz details before proceeding.' });
      return;
    }
    store.setTab(tab);
  }
}

async function onPublish() {
  // Prevent publishing when no questions exist in the quiz
  if (!Array.isArray(store.questions) || store.questions.length === 0) {
    alert.push({ type: 'warning', message: 'Please add at least one question before publishing.' })
    store.setTab('questions')
    return
  }

  await store.submitQuiz()
}

async function saveDetails() {
  await store.saveDetails();
}

async function saveSettings() {
  await store.saveSettings();
}

const { fetchGrades, grades, subjects, topics, fetchSubjectsPage, fetchTopicsPage, addTopic, loadingSubjects, loadingTopics, levels, fetchLevels, loadingLevels } = useTaxonomy()
const alert = useAppAlert()

function debounce(fn, wait = 300) {
  let t = null
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const _doSubjectSearch = async (q) => {
  const g = store.quiz?.grade_id ?? null
  try { await fetchSubjectsPage({ gradeId: g, page: 1, perPage: 50, q: q || '' }) } catch (e) {}
}
const _doTopicSearch = async (q) => {
  const s = store.quiz?.subject_id ?? null
  if (!s) return
  try { await fetchTopicsPage({ subjectId: s, page: 1, perPage: 50, q: q || '' }) } catch (e) {}
}

const onSubjectSearch = debounce((q) => _doSubjectSearch(q), 350)
const onTopicSearch = debounce((q) => _doTopicSearch(q), 350)

// Prepare a slot for the cleanup function that will be set on client mount.
let _cleanup = null

// Register onBeforeUnmount during setup so Vue can associate the hook with this component.
onBeforeUnmount(() => {
  try { if (typeof _cleanup === 'function') _cleanup() } catch (e) {}
})

onMounted(async () => {
  // Set up cleanup handlers (client-only) and store the returned cleanup function.
  _cleanup = store.setupCleanup()
  
  try {
    await fetchGrades()
    try { await fetchLevels() } catch (e) {}
  } catch (e) {}
  try {
    const g = store.quiz.grade_id
    if (g) {
      try { await fetchSubjectsPage({ gradeId: g, page: 1, perPage: 50, q: '' }) } catch (e) {}
    }
    const s = store.quiz.subject_id
    if (s) {
      try { await fetchTopicsPage({ subjectId: s, page: 1, perPage: 50, q: '' }) } catch (e) {}
    }
  } catch (e) {}
  const incomingId = route.query.id
  if (incomingId && incomingId !== 'null' && !store.quizId) {
    try {
      const coerced = isNaN(Number(incomingId)) ? incomingId : Number(incomingId)
      await store.loadQuiz(coerced)
      const g = store.quiz.grade_id
      if (g) {
        try { await fetchSubjectsPage({ gradeId: g, page: 1, perPage: 50, q: '' }) } catch (e) {}
      }
      const s = store.quiz.subject_id
      if (s) {
        try { await fetchTopicsPage({ subjectId: s, page: 1, perPage: 50, q: '' }) } catch (e) {}
      }
      // Defensive: ensure the loaded topic object is present in the topics list
      try {
        const tId = store.quiz.topic_id
        if (tId) {
          const has = (topics.value || []).some(x => String(x?.id) === String(tId))
          if (!has) {
            // fetch single topic and insert into taxonomy list so picker can display it
            try {
              const api = useApi()
              const r = await api.get(`/api/topics/${tId}`)
              if (r.ok) {
                const d = await r.json().catch(() => null)
                const topicObj = d?.topic || d
                if (topicObj && topicObj.id) {
                  try { addTopic(topicObj) } catch (e) {}
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    } catch (e) {}
  }
})

const title = computed({ get: () => store.quiz.title, set: (v) => (store.quiz.title = v) })
const description = computed({ get: () => store.quiz.description, set: (v) => (store.quiz.description = v) })
const grade_id = computed({ get: () => store.quiz.grade_id, set: (v) => (store.quiz.grade_id = v) })
const subject_id = computed({ get: () => store.quiz.subject_id, set: (v) => (store.quiz.subject_id = v) })
const topic_id = computed({ get: () => store.quiz.topic_id, set: (v) => (store.quiz.topic_id = v) })
const youtube_url = computed({ get: () => store.quiz.youtube_url, set: (v) => (store.quiz.youtube_url = v) })
const attempts_allowed = computed({ get: () => store.quiz.attempts_allowed, set: (v) => (store.quiz.attempts_allowed = v) })
const timer_minutes = computed({ get: () => store.quiz.timer_minutes, set: (v) => (store.quiz.timer_minutes = v) })
const use_per_question_timer = computed({ get: () => store.quiz.use_per_question_timer, set: (v) => (store.quiz.use_per_question_timer = v) })

const showBuilder = ref(false)
const showTopicModal = ref(false)
const showCreatedModal = ref(false)
const createdPayload = ref(null)
const showPreview = ref(false)
const showQuestionBank = ref(false)

function openBuilder() { showBuilder.value = true }
function onCancel() { showBuilder.value = false }
// Use the store action which ensures normalization/uid assignment when a question
// is returned from the QuestionBuilder. This avoids missing uid/shape issues.
function onQuestionSaved(saved) { store.addQuestion(saved) }
function edit(q) {}
function onPreview() { showPreview.value = true }
function onOpenBank() { showQuestionBank.value = true }

function onAddFromBank(itemOrArray) {
  try {
    if (!itemOrArray) return
    if (Array.isArray(itemOrArray)) {
      for (const it of itemOrArray) store.questions.push(it)
    } else {
      store.questions.push(itemOrArray)
    }
    showQuestionBank.value = false
  } catch (e) {}
}

function openTopicModal() {
  showTopicModal.value = true
}

watch(() => store.lastCreated, (v) => {
  if (v) {
    createdPayload.value = v
    showCreatedModal.value = true
  }
})

async function onTopicCreated(created) {
  if (!created) { showTopicModal.value = false; return }
  try {
    if (Array.isArray(topics.value)) topics.value.unshift(created)
    try { addTopic(created) } catch (e) {}
    store.quiz.topic_id = created.id
    try { await fetchTopicsPage({ subjectId: created.subject_id || created.subjectId || created.subject || store.quiz.subject_id, page: 1, perPage: 50, q: '' }) } catch (e) {}
    try { alert.push({ type: 'success', message: `Topic "${created.name || 'Topic'}" created` }) } catch (e) {}
    if (created.is_approved) {
      store.detailsSaved = true
    }
  } catch (e) {}
  showTopicModal.value = false
}

watch(grade_id, (nv, ov) => {
  store.quiz.subject_id = null
  store.quiz.topic_id = null
  if (!nv || String(nv) === String(ov)) return
  try { fetchSubjectsPage({ gradeId: nv, page: 1, perPage: 50, q: '' }) } catch (e) {}
})

function onSelectSubject(item) {
  store.quiz.subject_id = item?.id ? (Number(item.id) || null) : null
  store.quiz.topic_id = null
  try { fetchTopicsPage({ subjectId: item?.id, page: 1, perPage: 50, q: '' }) } catch (e) {}
}

function onSelectTopic(item) {
  store.quiz.topic_id = item?.id ? (Number(item.id) || null) : null
}


</script>
