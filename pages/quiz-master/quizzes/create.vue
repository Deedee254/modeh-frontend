<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
    <div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-semibold">Create a new quiz</h1>
          <p class="text-sm text-gray-500">Quick multi-step wizard for quiz-masters</p>
        </div>
        <!-- Global Publish removed: publish is now triggered from the Questions tab/modal -->
      </div>

    </div>
  <div class="space-y-4">
  <nav class="mb-6 flex gap-2 overflow-x-auto rounded-lg bg-muted p-1">
        <button
          @click="trySetTab('details')"
          :class="[
            'min-w-[92px] sm:min-w-[110px] flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md',
            store.activeTab === 'details'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="font-semibold">Details</span>
            <span v-if="store.detailsSaved" class="text-xs text-emerald-600">✓</span>
          </div>
        </button>

        <button
          @click="trySetTab('settings')"
          :class="[
            'min-w-[92px] sm:min-w-[110px] flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md',
            store.activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="font-semibold">Settings</span>
            <span v-if="store.settingsSaved" class="text-xs text-emerald-600">✓</span>
          </div>
        </button>

        <button
          @click="trySetTab('questions')"
          :class="[
            'min-w-[92px] sm:min-w-[110px] flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md',
            store.activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="font-semibold">Questions</span>
            <span v-if="store.questionsSaved" class="text-xs text-emerald-600">✓</span>
          </div>
        </button>
      </nav>

      <div class="rounded-lg border bg-white dark:bg-gray-800 p-4">
        <div v-if="store.activeTab === 'questions'" class="mb-3 flex items-center gap-2">
          <div class="text-xs text-gray-500">Bank filters:</div>
          <div class="flex items-center gap-2">
            <span v-if="store.quiz?.level_id" class="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">Level: {{ (levels || []).find(l => String(l.id) === String(store.quiz?.level_id))?.name || store.quiz?.level_id }}</span>
            <span v-if="store.quiz?.grade_id" class="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">Grade: {{ (grades || []).find(g => String(g.id) === String(store.quiz?.grade_id))?.name || store.quiz?.grade_id }}</span>
            <span v-if="store.quiz?.subject_id" class="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">Subject: {{ (subjects || []).find(s => String(s.id) === String(store.quiz?.subject_id))?.name || store.quiz?.subject_id }}</span>
            <span v-if="store.quiz?.topic_id" class="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">Topic: {{ (topics || []).find(t => String(t.id) === String(store.quiz?.topic_id))?.name || store.quiz?.topic_id }}</span>
          </div>
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
          @createTopic="() => { showTopicModal = true }"
          @subject-search="onSubjectSearch"
          @topic-search="onTopicSearch"
          @save="async () => { await saveDetails(); if (store.detailsSaved) { store.setTab('settings') } }"
          @next="() => trySetTab('settings')"
          @approval-requested="async (id) => { try { await fetchTopicsPage({ subjectId: store.quiz?.subject_id ?? null, page: 1, perPage: 50, q: '' }) } catch (e) {} }"
        />

        <QuizSettingsTab
          v-else-if="store.activeTab === 'settings'"
          :model-value="store.quiz"
          :saving="store.isSubmitting"
          :errors="store.settingsErrors"
          @update:modelValue="(v) => (store.quiz = v)"
          @save="async () => { await saveSettings(); if (store.settingsSaved) { store.setTab('questions') } }"
          @next="() => trySetTab('questions')"
          @prev="() => trySetTab('details')"
        />

        <QuizQuestionsTab
          v-else
          :model-value="store.questions"
          :errors="store.questionsErrors"
          :saving="store.isSubmitting"
          @update:modelValue="(v) => (store.questions = v)"
          @save="store.saveAllQuestions"
          @open-builder="openBuilder"
          @open-bank="() => { showQuestionBank = true }"
          @edit="(q) => edit(q)"
          @preview="() => { showPreview.value = true }"
          @prev="() => store.setTab('settings')"
          @publish="onPublish"
        />
      </div>

      <div v-if="showBuilder" class="mt-4 rounded-xl border p-3 bg-white shadow-sm">
        <QuestionBuilder :subjectId="subject_id" :topicId="topic_id" @saved="onSaved" @cancel="onCancel" />
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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Quiz created</h3>
          </div>
          <div class="space-y-4">
            <div>
              <div class="text-xl font-bold">{{ createdPayload?.title || store.quiz?.title || '' }}</div>
              <div class="text-sm text-gray-600">{{ createdPayload?.description || store.quiz?.description || '' }}</div>
              <div class="text-sm text-gray-500">Topic: {{ createdPayload?.topic_name || store.quiz?.topic_id || '—' }}</div>
              <div class="text-sm text-gray-500">Questions: {{ store.questions.length }}</div>
            </div>
            <div class="flex gap-2 justify-end">
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
import { computed, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useCreateQuizStore } from '~/stores/createQuizStore'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import QuestionBuilder from '~/components/question/QuestionBuilder.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'
import UiCard from '~/components/ui/UiCard.vue'
import useTaxonomy from '~/composables/useTaxonomy'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import QuizDetailsTab from '~/components/quiz/QuizDetailsTab.vue'
import QuizSettingsTab from '~/components/quiz/QuizSettingsTab.vue'
import QuizQuestionsTab from '~/components/quiz/QuizQuestionsTab.vue'
import QuizPreviewModal from '~/components/preview/QuizPreviewModal.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'
import { onMounted } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

definePageMeta({ layout: 'quiz-master', title: 'Create quiz',
  // dynamic description hooked to store state below via functions in template consumers
})

const store = useCreateQuizStore()
if (!store.quiz || typeof store.quiz !== 'object') store.quiz = {}
const route = useRoute()
const router = useRouter()
const cfg = useRuntimeConfig()

// don't load quiz here yet; wait until taxonomy helpers & watchers are set up below

function tabClass(t) {
  // Return a string of classes since template concatenates with other classes
  if (store.activeTab === t) {
    return 'text-sm rounded-md bg-indigo-600 text-white shadow'
  }
  return 'text-sm rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
}

function trySetTab(tab) {
  // details tab is always allowed
  if (tab === 'details') { store.setTab('details'); return }

  // moving to settings requires details to be complete (but not auto-saved)
  if (tab === 'settings') {
    if (!store.isDetailsValid) {
      alert.push({ type: 'warning', message: 'Please complete quiz details before moving to settings.' })
      return
    }
    // allow if details are valid; prefer user to explicitly Save
    store.setTab('settings')
    return
  }

  // moving to questions requires detailsSaved and settingsSaved
  if (tab === 'questions') {
    if (!store.detailsSaved) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return
    }
    if (!store.settingsSaved) {
      alert.push({ type: 'warning', message: 'Please save settings before adding questions.' })
      return
    }
    store.setTab('questions')
    return
  }
}

async function onPublish() {
  // ensure details saved
  if (!store.quizId) await store.saveDetails()
  // ensure settings saved
  await store.saveSettings()
  // submit full quiz (sends questions)
  await store.submitQuiz()
}

// --- Inline subcomponents ---
// fetch grades and expose helpers for use in template (avoid runtime templates)
// also expose loading flags so child components can render spinners/placeholders
const { fetchGrades, grades, subjects, topics, fetchSubjectsPage, fetchTopicsPage, addTopic, loadingSubjects, loadingTopics, levels, fetchLevels, loadingLevels } = useTaxonomy()
const alert = useAppAlert()

// local debounce helper for search handlers
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

// If route contains an id, load the quiz after initial taxonomy fetch is ready
onMounted(async () => {
  // ensure grades are loaded before attempting to load a quiz and its dependent subjects/topics
  try {
    await fetchGrades()
    // ensure levels are also loaded so level->grade relationships are available
    try { await fetchLevels() } catch (e) {}
  } catch (e) {
    // ignore grade fetch errors; downstream fetches will also handle failures
  }

  // If the store restored an in-progress draft (no server id) then preload subjects/topics
  // so the TaxonomyPicker components can resolve the persisted subject/topic selections.
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
  // guard against query id being the string 'null' or empty
  if (incomingId && incomingId !== 'null' && !store.quizId) {
    try {
      // coerce to number when possible
      const coerced = isNaN(Number(incomingId)) ? incomingId : Number(incomingId)
      await store.loadQuiz(coerced)
      // after loading quiz data, ensure subjects/topics are loaded for the preselected grade/subject
      const g = store.quiz.grade_id
      if (g) {
        try { await fetchSubjectsPage({ gradeId: g, page: 1, perPage: 50, q: '' }) } catch (e) {}
      }
      const s = store.quiz.subject_id
      if (s) {
        try { await fetchTopicsPage({ subjectId: s, page: 1, perPage: 50, q: '' }) } catch (e) {}
      }
    } catch (e) {
      // ignore load errors here; store.loadQuiz reports alerts
    }
  }
})

// create computed bindings for form fields so v-model works reliably with the store
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
function onSaved(saved) { showBuilder.value = false; store.questions.push(saved) }
function edit(q) { /* navigate to dedicated question editor if desired */ }

function onAddFromBank(itemOrArray) {
  try {
    if (!itemOrArray) return
    if (Array.isArray(itemOrArray)) {
      for (const it of itemOrArray) store.questions.push(it)
    } else {
      store.questions.push(itemOrArray)
    }
    // close modal after adding
    showQuestionBank.value = false
  } catch (e) {}
}

function openTopicModal() {
  showTopicModal.value = true
}

// watch for newly created quiz payload from the store and show a modal
watch(() => store.lastCreated, (v) => {
  if (v) {
    createdPayload.value = v
    showCreatedModal.value = true
  }
})

async function onTopicCreated(created) {
  if (!created) { showTopicModal.value = false; return }
  // ensure topics list includes the new topic and select it
  try {
    // topics is a ref from useTaxonomy
    if (Array.isArray(topics.value)) topics.value.unshift(created)
    // also insert into taxonomy cache so it's available elsewhere in the app
    try { addTopic(created) } catch (e) {}
    store.quiz.topic_id = created.id
    // force a server-side refetch for this subject to fully sync caches (optional but recommended)
    try { await fetchTopicsPage({ subjectId: created.subject_id || created.subjectId || created.subject || store.quiz.subject_id, page: 1, perPage: 50, q: '' }) } catch (e) {}
    // show a toast confirmation
    try { alert.push({ type: 'success', message: `Topic "${created.name || 'Topic'}" created` }) } catch (e) {}
    // If the topic was auto-approved (subject auto_approve) then mark it approved locally
    if (created.is_approved) {
      // mark details as saved so the user can move to settings immediately
      store.detailsSaved = true
    }
  } catch (e) {
    // ignore
  }
  showTopicModal.value = false
}

// When the selected grade changes, fetch subjects for that grade
watch(grade_id, (nv, ov) => {
  // clear existing subject/topic selection in the quiz
  store.quiz.subject_id = null
  store.quiz.topic_id = null
  // don't fetch if value didn't actually change (avoid unnecessary calls)
  if (!nv || String(nv) === String(ov)) return
  try { fetchSubjectsPage({ gradeId: nv, page: 1, perPage: 50, q: '' }) } catch (e) { /* ignore preload errors */ }
})

// handlers invoked by TaxonomyPicker emits
function onSelectSubject(item) {
  // TaxonomyPicker emits an object (subject). store expects subject_id
  store.quiz.subject_id = item?.id ? (Number(item.id) || null) : null
  // clear topic when subject changes
  store.quiz.topic_id = null
  // proactively preload topics for the selected subject so the Topics picker shows results immediately
  try { fetchTopicsPage({ subjectId: item?.id, page: 1, perPage: 50, q: '' }) } catch (e) { /* ignore preload errors */ }
}

function onSelectTopic(item) {
  store.quiz.topic_id = item?.id ? (Number(item.id) || null) : null
}

function saveDetails() { return store.saveDetails() }
function saveSettings() { return store.saveSettings() }
</script>

<style scoped>
.tab-active { background: #4f46e5; color: white }
</style>
