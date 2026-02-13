<template>
  <div class="bg-gray-50 pb-16 md:pb-0">
    <PageHero
      title="Edit Question"
      description="Modify the question details, options, and correct answers."
      :breadcrumbs="[
        { text: 'Dashboard', href: '/quiz-master/dashboard' },
        { text: 'Questions', href: '/quiz-master/questions' },
        { text: 'Edit', current: true }
      ]"
    />

    <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-600">Loading question...</p>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-500">
        <p>{{ error }}</p>
        <UButton to="/quiz-master/questions" class="mt-4">Back to Questions</UButton>
      </div>
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
        <!-- Reuse the QuestionBuilder component to edit the question in-place -->
        <QuestionBuilder ref="builder" :questions="builderQuestions" @update:questions="onBuilderUpdate" @saved="onBuilderSaved" />

        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <UButton type="button" color="gray" variant="ghost" @click="router.back()" class="w-full sm:w-auto">Back</UButton>
          <UButton type="button" :loading="saving" @click="saveQuestion" class="w-full sm:w-auto">Save Changes</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'quiz-master',
  meta: [ { name: 'robots', content: 'noindex, nofollow' } ]
})

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuizQuestionEditorForm from '~/components/quiz/QuestionEditorForm.vue' // Import the editor form component (kept for compatibility)
import QuestionBuilder from '~/components/quiz/QuestionBuilder.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()
const api = useApi()

const questionId = route.params.id
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const form = ref({
  // server-side shape
  id: null,
  body: '',
  type: 'mcq',
  grade_id: null,
  subject_id: null,
  topic_id: null,
  level_id: null,
  options: [],
  answers: [],
  parts: [],
  mode: 'single',
  explanation: '',
  difficulty: 2,
  marks: 1,
})

const builder = ref(null)
const builderQuestions = ref([]) // array with single question for builder

const { fetchGrades, fetchAllSubjects, fetchAllTopics, fetchLevels, fetchGradesByLevel, grades, subjects, topics, levels } = useTaxonomy()
async function fetchQuestion() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/api/questions/${questionId}`)
    if (!res.ok) throw new Error('Question not found or you do not have permission to edit it.')
    const data = await res.json()
    const serverQuestion = data.question || data.data || data
    // normalize server -> builder/server shape
    form.value = {
      id: serverQuestion.id,
      body: serverQuestion.body || serverQuestion.question || serverQuestion.text || '',
      type: serverQuestion.type || serverQuestion.question_type || 'mcq',
      grade_id: serverQuestion.grade_id ?? null,
      subject_id: serverQuestion.subject_id ?? null,
      topic_id: serverQuestion.topic_id ?? null,
      level_id: serverQuestion.level_id ?? serverQuestion.levelId ?? null,
      options: serverQuestion.options || serverQuestion.answers || serverQuestion.options_list || [],
      answers: serverQuestion.answers || [],
      parts: Array.isArray(serverQuestion.parts) ? serverQuestion.parts : [],
      mode: serverQuestion.mode || 'single',
      explanation: serverQuestion.explanation || serverQuestion.explain || '',
      difficulty: serverQuestion.difficulty ?? 2,
      marks: serverQuestion.marks ?? 1,
    }

    // Prepare builderQuestions (QuestionBuilder expects a list of questions using 'text' field)
    builderQuestions.value = [normalizeToBuilder(form.value)]
  } catch (e) {
    error.value = e.message
    alert.push({ type: 'error', message: e.message })
  } finally {
    loading.value = false
  }
}

function normalizeToBuilder(q) {
  // Map server question shape to QuestionBuilder/QuestionEditorForm shape
  return {
    id: q.id,
    type: q.type || 'mcq',
    text: q.body || '',
    body: q.body || '',
    explanation: q.explanation || '',
    options: Array.isArray(q.options) ? q.options.map(o => ({ text: o.text ?? o.option ?? '', is_correct: !!o.is_correct })) : [],
    answers: q.answers || [],
    parts: Array.isArray(q.parts) ? q.parts : [],
    mode: q.mode || 'single',
    difficulty: q.difficulty ?? 2,
    marks: q.marks ?? 1,
    grade_id: q.grade_id,
    subject_id: q.subject_id,
    topic_id: q.topic_id,
    level_id: q.level_id
  }
}

function normalizeFromBuilder(bq) {
  // Map builder shape back to server payload
  // build canonical answers array as INDICES (not text)
  let answers = []
  const opts = Array.isArray(bq.options) ? bq.options : []

  if (bq.type === 'mcq') {
    const idx = Number(bq.correct)
    if (Number.isFinite(idx)) answers = [String(idx)]
  } else if (bq.type === 'multi') {
    if (Array.isArray(bq.corrects)) {
      answers = bq.corrects.map(i => String(Number(i)))
    }
  } else if (bq.type === 'fill_blank') {
    answers = Array.isArray(bq.answers) ? bq.answers : []
  } else {
    answers = bq.answers || []
  }

  const getOptText = (o) => {
    if (!o) return ''
    if (typeof o === 'string') return o
    return o.text ?? o.option ?? ''
  }

  return {
    id: bq.id,
    body: bq.text || bq.question || '',
    type: bq.type || 'mcq',
    explanation: bq.explanation || '',
    options: opts.map(o => ({ text: getOptText(o), is_correct: !!(o && o.is_correct) })),
    answers,
    parts: Array.isArray(bq.parts) ? bq.parts : [],
    mode: bq.mode || 'single',
    // preserve index-based correct markers as well so backend that expects them still receives them
    correct: (typeof bq.correct !== 'undefined' && bq.correct !== null) ? Number(bq.correct) : (bq.type === 'mcq' ? -1 : undefined),
  corrects: Array.isArray(bq.corrects) ? bq.corrects.map(c => Number(c)) : (bq.type === 'multi' ? [] : undefined),
    difficulty: bq.difficulty ?? 2,
    marks: bq.marks ?? 1,
    grade_id: bq.grade_id || null,
    subject_id: bq.subject_id || null,
    topic_id: bq.topic_id || null,
    level_id: bq.level_id || null
  }
}

function onBuilderUpdate(list) {
  // keep server-side form in sync with builder changes
  if (!Array.isArray(list) || !list[0]) return
  const bq = list[0]
  const normalized = normalizeFromBuilder(bq)
  form.value = { ...form.value, ...normalized }
}

function onBuilderSaved(saved) {
  // When builder emits saved, keep form updated and show toast
  if (!saved) return
  const normalized = normalizeFromBuilder(saved)
  form.value = { ...form.value, ...normalized }
  alert.push({ type: 'success', message: 'Question saved locally' })
}

async function saveQuestion() {
  saving.value = true
  try {
    // send normalized payload from builder/form
    const payload = normalizeFromBuilder(builderQuestions.value[0] || form.value)
    const res = await api.patchJson(`/api/questions/${questionId}`, payload)
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to save question.')
    }
    alert.push({ type: 'success', message: 'Question updated successfully!' })
    // Store optimistic update for the list page
    sessionStorage.setItem('question:updated', JSON.stringify(form.value))
    // do not redirect — stay on the editor so user can continue editing
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Parallelize fetchQuestion and fetchLevels (levels-first optimization)
  await Promise.all([fetchQuestion(), fetchLevels()])
  
  const preloads = []
  // if the question already has a level set, fetch grades filtered by that level;
  // otherwise fallback to the unfiltered grades list for backwards compatibility
  if (form.value && form.value.level_id) {
    preloads.push(fetchGradesByLevel(form.value.level_id))
  } else {
    preloads.push(fetchGrades())
  }
  
  // These can benefit from levels data if already loaded
  preloads.push(fetchAllSubjects())
  preloads.push(fetchAllTopics())
  
  await Promise.all(preloads)
})
</script>
