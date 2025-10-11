<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Create a New Quiz</h1>
        <div class="space-x-2">
          <button @click="newQuiz" type="button" class="px-3 py-2 bg-gray-100 rounded text-sm">New Quiz</button>
          <button @click="previewQuiz" type="button" class="px-3 py-2 bg-white border rounded text-sm">Preview</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#" @click.prevent="activeTab = 'details'" :class="tabClass('details')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Quiz Details</a>
          <a href="#" @click.prevent="activeTab = 'questions'" :class="tabClass('questions')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Questions</a>
          <a href="#" @click.prevent="activeTab = 'settings'" :class="tabClass('settings')" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Settings</a>
        </nav>
      </div>

      <form @submit.prevent="submit" class="space-y-6">
        <!-- Details -->
        <div v-show="activeTab === 'details'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Subject</label>
              <select v-model="selectedSubjectId" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                <option value="">-- Select Subject --</option>
                <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Topic</label>
              <select v-model="form.topic_id" class="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                <option value="">-- Select Topic --</option>
                <option v-for="t in filteredTopics" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>

          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" v-model="form.title" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="form.description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">YouTube Video URL (optional)</label>
              <input v-model="form.youtube_url" placeholder="https://youtube.com/..." class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Cover Image</label>
              <div class="mt-1 flex items-center gap-3">
                <input type="file" @change="onFile" accept="image/*" />
              </div>
            </div>
          </div>
        </div>

        <!-- Questions -->
        <div v-show="activeTab === 'questions'">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm text-gray-600">Questions: {{ questions.length }}</div>
            <div class="text-sm text-gray-600">Difficulty: {{ overallDifficulty.label }} ({{ overallDifficulty.avg }})</div>
          </div>

          <div v-if="successMessage" class="p-3 bg-green-50 text-green-800 rounded mb-3">{{ successMessage }}</div>

          <div class="space-y-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <button type="button" class="px-2 py-1 text-xs border rounded" @click="selectAll(true)">Select all</button>
                <button type="button" class="px-2 py-1 text-xs border rounded" @click="selectAll(false)">Clear</button>
                <div class="ml-4 text-sm text-gray-600">Bulk edit:</div>
                <input type="number" v-model.number="bulkMarks" placeholder="Marks" class="w-20 border rounded px-2 py-1 text-sm ml-2" />
                <select v-model.number="bulkDifficulty" class="text-sm border rounded px-2 py-1 ml-2">
                  <option :value="0">--</option>
                  <option :value="1">Easy</option>
                  <option :value="2">Medium</option>
                  <option :value="3">Hard</option>
                </select>
                <button type="button" class="px-2 py-1 text-xs bg-blue-600 text-white rounded ml-2" @click="applyBulkEdit">Apply</button>
                <button type="button" class="px-2 py-1 text-xs border rounded ml-4" @click="showBank = true">Add from Bank</button>
              </div>
              <div class="text-sm text-gray-500">Drag to reorder</div>
            </div>

            <Draggable v-model="questions" item-key="uid" handle=".drag-handle">
              <template #item="{ element: qItem, index: idx }">
                <QuestionEditor
                  :index="idx"
                  :model="qItem"
                  :errors="validationErrors[qItem.uid]"
                  @remove="removeQuestion(idx)"
                  @duplicate="duplicateQuestion(idx)"
                  @add-option="addOption(idx)"
                  @remove-option="(o)=> removeOption(idx, o)"
                />
              </template>
            </Draggable>
          </div>

          <div class="flex gap-3 mt-3">
            <button type="button" @click="addQuestion" class="px-3 py-2 bg-gray-100 rounded text-sm">+ Add Question</button>
            <button type="button" @click="resetQuestions" class="px-3 py-2 bg-yellow-50 rounded text-sm">Reset Questions</button>
          </div>

          <!-- Question bank modal -->
          <QuestionBankModal v-model="showBank" @add="addFromBank" />

          <!-- Visual preview modal -->
          <QuizPreviewModal v-model="showPreview" :quiz="{ ...form, questions }" />
        </div>

        <!-- Settings -->
        <div v-show="activeTab === 'settings'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Timer (minutes, optional)</label>
              <input type="number" v-model.number="form.timer_minutes" min="0" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Attempts Allowed</label>
              <select v-model="form.attempts_allowed" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <div class="col-span-1 md:col-span-2">
              <label class="inline-flex items-center mr-4"><input type="checkbox" v-model="form.shuffle_questions" class="mr-2" /> Shuffle Questions</label>
              <label class="inline-flex items-center"><input type="checkbox" v-model="form.shuffle_answers" class="mr-2" /> Shuffle Answer Choices</label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Access</label>
              <div class="mt-1">
                <label class="inline-flex items-center mr-4"><input type="radio" value="free" v-model="form.access" class="mr-2" /> Free</label>
                <label class="inline-flex items-center"><input type="radio" value="paywall" v-model="form.access" class="mr-2" /> Paywall</label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Visibility</label>
              <select v-model="form.visibility" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <div v-if="form.visibility === 'scheduled'" class="mt-2">
                <label class="block text-sm text-gray-700">Scheduled At</label>
                <input type="datetime-local" v-model="form.scheduled_at" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="flex items-center justify-end gap-3">
          <button type="button" @click="openPreview" class="px-3 py-2 bg-white border rounded">Open Preview</button>
          <button type="button" @click="saveDraft" class="px-4 py-2 bg-gray-100 rounded">Save Draft</button>
          <button :disabled="isSaving || !canPublish" type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Publish</button>
        </div>
      </form>
      <!-- LaTeX Insert Modal -->
      <div v-if="latexModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="bg-black/50 absolute inset-0" @click="latexModal.open = false"></div>
        <div class="relative bg-white rounded shadow-lg max-w-lg w-full p-6 z-10">
          <h3 class="text-lg font-medium mb-2">Insert LaTeX</h3>
          <textarea v-model="latexModal.value" rows="4" class="w-full border rounded p-2 mb-3" placeholder="Enter LaTeX e.g. \frac{a}{b}"></textarea>
          <div class="flex justify-end gap-2">
            <button class="px-3 py-2 bg-gray-100 rounded" @click="latexModal.open = false">Cancel</button>
            <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="() => insertLatex(latexModal.uid, latexModal.value)">Insert</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRuntimeConfig, useRoute } from '#imports'
import SkeletonList from '~/components/SkeletonList.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import Draggable from 'vuedraggable'
import QuestionEditor from '~/components/questions/QuestionEditor.vue'
import QuizPreviewModal from '~/components/preview/QuizPreviewModal.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'

// Simple debounce function
function debounce(func, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// TipTap will be dynamically imported on client to avoid SSR issues
let EditorClass = null
let StarterKitExt = null
let MathExt = null
const EditorContentComp = ref(null)
const tiptapLoaded = ref(false)

// set page layout meta for quiz-master
if (typeof definePageMeta === 'function') {
  definePageMeta({ layout: 'quiz-master' })
}

const router = useRouter()
const config = useRuntimeConfig()
const route = useRoute()

// If route query contains `id`, treat this as an edit — load the quiz and prefill the form/questions
onMounted(async () => {
  try {
    const editId = route?.query?.id || null
    if (!editId) return
    const id = String(editId)
    const res = await fetch(config.public.apiBase + '/api/quizzes/' + encodeURIComponent(id), { credentials: 'include' })
    if (!res.ok) return
    const json = await res.json().catch(() => null)
    const q = (json && (json.quiz || json)) || null
    if (!q) return
    // populate form fields
    form.value.topic_id = q.topic_id || q.topic_id === 0 ? q.topic_id : form.value.topic_id
    form.value.title = q.title || form.value.title
    form.value.description = q.description || form.value.description
    form.value.youtube_url = q.youtube_url || form.value.youtube_url
    form.value.timer_minutes = q.timer_minutes || form.value.timer_minutes
    form.value.attempts_allowed = q.attempts_allowed || form.value.attempts_allowed
    form.value.shuffle_questions = !!q.shuffle_questions
    form.value.shuffle_answers = !!q.shuffle_answers
    form.value.access = q.access || form.value.access
    form.value.visibility = q.visibility || form.value.visibility
    form.value.scheduled_at = q.scheduled_at || form.value.scheduled_at
    // questions array
    questions.value = Array.isArray(q.questions) ? q.questions : (q.questions || [])
    successMessage.value = 'Editing quiz — loaded from server'
    // ensure editors for each question are initialized
    await nextTick()
    questions.value.forEach(qItem => ensureEditor(qItem))
    restoreOpenState()
  } catch (e) {
    // ignore — we'll remain in create mode
    console.warn('Failed to load quiz for edit', e)
  }
})

const subjects = ref([])
const topics = ref([])
const loadingTopics = ref(false)
const selectedSubjectId = ref('')

const activeTab = ref('details')
const successMessage = ref('')
const isSaving = ref(false)

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

const questions = ref([])
const questionMedia = ref({}) // map idx -> File
const editors = ref({}) // uid -> Editor instance
const editorsProxy = computed(() => editors.value)
const validationErrors = ref({})
const showPreview = ref(false)
const previewJson = ref('')
const latexModal = ref({ open: false, uid: null, value: '' })
const bulkMarks = ref(null)
const bulkDifficulty = ref(0)
const showBank = ref(false)

// Autosave watchers
watch(form, () => debouncedAutoSave(), { deep: true })
watch(questions, () => debouncedAutoSave(), { deep: true })

function openPreview() {
  // shape payload like submit but without files
  const shaped = questions.value.map(q => ({ type: q.type, text: q.text, options: q.options, answers: q.corrects || (q.correct !== -1 ? [q.correct] : []), difficulty: q.difficulty, marks: q.marks }))
  const payload = { ...form.value, questions: shaped }
  previewJson.value = JSON.stringify(payload, null, 2)
  // attempt to render math in question text using KaTeX if available
  try {
    if (process.client) {
      import('katex').then(katex => {
        const renderMathInHtml = (html) => {
          // inline: \( ... \) , display: $$ ... $$
          let out = html.replace(/\$\$(.*?)\$\$/gs, (m, expr) => {
            try { return katex.renderToString(expr, { throwOnError: false, displayMode: true }) } catch (e) { return m }
          }).replace(/\\\((.*?)\\\)/gs, (m, expr) => {
            try { return katex.renderToString(expr, { throwOnError: false, displayMode: false }) } catch (e) { return m }
          })
          // replace inserted-math spans with data-latex
          out = out.replace(/<span[^>]*class=["']?[^>]*inserted-math[^>]*data-latex=["']([^"']+)["'][^>]*>.*?<\/span>/gms, (m, encoded) => {
            try {
              const latex = decodeURIComponent(encoded)
              return katex.renderToString(latex, { throwOnError: false, displayMode: false })
            } catch (e) { return m }
          })
          return out
        }
        // prepare rendered fields
        questions.value.forEach(q => { q._rendered_text = renderMathInHtml(q.text || '') })
      }).catch(e => { questions.value.forEach(q => { q._rendered_text = q.text }) })
    } else {
      questions.value.forEach(q => { q._rendered_text = q.text })
    }
  } catch (e) { questions.value.forEach(q => { q._rendered_text = q.text }) }
  showPreview.value = true
}

function openLatexModal(uid) {
  latexModal.value = { open: true, uid, value: '' }
}

// Persist accordion open state per-editor using localStorage key
const LS_KEY = 'quiz_editor_state_v1'
function saveOpenState() {
  try {
    const state = questions.value.map(q => ({ uid: q.uid, open: !!q.open }))
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch (e) {}
}

function restoreOpenState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    const state = JSON.parse(raw || '[]')
    state.forEach(s => {
      const q = questions.value.find(x => x.uid === s.uid)
      if (q) q.open = !!s.open
    })
  } catch (e) {}
}

function selectAll(flag) {
  questions.value.forEach(q => q._selected = !!flag)
}

function applyBulkEdit() {
  questions.value.forEach(q => {
    if (!q._selected) return
    if (bulkMarks.value !== null && bulkMarks.value !== undefined) q.marks = Number(bulkMarks.value)
    if (bulkDifficulty.value && [1,2,3].includes(Number(bulkDifficulty.value))) q.difficulty = Number(bulkDifficulty.value)
  })
}

function moveQuestionUp(i) {
  if (i <= 0) return
  const arr = questions.value
  const item = arr.splice(i, 1)[0]
  arr.splice(i-1, 0, item)
  saveOpenState()
}

function moveQuestionDown(i) {
  const arr = questions.value
  if (i >= arr.length - 1) return
  const item = arr.splice(i, 1)[0]
  arr.splice(i+1, 0, item)
  saveOpenState()
}

function insertLatex(uid, latex) {
  const ed = editors.value[uid]
  if (!ed) return
  // insert a span with class and data-latex; preview will render with KaTeX
  const safe = String(latex || '')
  const html = `<span class="inserted-math" data-latex="${encodeURIComponent(safe)}">\\(${safe}\\)</span>`
  try {
    ed.chain().focus().insertContent({ type: 'html', content: html }).run()
  } catch (e) {
    // fallback: append text
    ed.commands.insertContent(`\\(${safe}\\)`)
  }
  latexModal.value.open = false
}

function tabClass(t) {
  return activeTab.value === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}

function makeQuestion() {
  return {
    uid: Math.random().toString(36).slice(2),
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
}

function resetQuestions() {
  questions.value = [makeQuestion()]
  nextTick(() => { questions.value.forEach(q => ensureEditor(q)); restoreOpenState() })
}

function addQuestion() { const q = makeQuestion(); questions.value.push(q); nextTick(() => ensureEditor(q)) }
function duplicateQuestion(i) { const copy = JSON.parse(JSON.stringify(questions.value[i])); copy.uid = Math.random().toString(36).slice(2); questions.value.splice(i+1, 0, copy); nextTick(() => ensureEditor(copy)) }
function removeQuestion(i) { const q = questions.value.splice(i, 1)[0]; if (q) destroyEditor(q.uid); saveOpenState() }

function ensureEditor(q) {
  if (!q || editors.value[q.uid]) return
  if (!EditorClass) return
  const exts = [StarterKitExt?.default || StarterKitExt]
  if (MathExt) exts.push(MathExt?.default || MathExt)
  editors.value[q.uid] = new EditorClass({
    content: q.text || '<p></p>',
    extensions: exts,
    onUpdate: ({ editor }) => { q.text = editor.getHTML() }
  })
}

function destroyEditor(uid) {
  if (!editors.value[uid]) return
  try { editors.value[uid].destroy() } catch (e) {}
  delete editors.value[uid]
}
function addOption(qIdx) { questions.value[qIdx].options.push('') }
function removeOption(qIdx, oIdx) { questions.value[qIdx].options.splice(oIdx, 1) }
function toggleCorrectMultiple(qIdx, oIdx) {
  const arr = questions.value[qIdx].corrects || []
  const pos = arr.indexOf(oIdx)
  if (pos === -1) arr.push(oIdx)
  else arr.splice(pos, 1)
  questions.value[qIdx].corrects = arr
}
function setQuestionMedia(idx, file) { questions.value[idx].media = file; questionMedia.value[idx] = file }
function addFromBank(q) { questions.value.push(q) }

function runCommand(uid, cmd) {
  const ed = editors.value[uid]
  if (!ed) return
  try {
    if (cmd === 'toggleBold') ed.chain().focus().toggleBold().run()
    else if (cmd === 'toggleItalic') ed.chain().focus().toggleItalic().run()
    else if (cmd === 'toggleCode') ed.chain().focus().toggleCode().run()
    else if (cmd === 'toggleCodeBlock') ed.chain().focus().toggleCodeBlock().run()
    else if (cmd === 'insertMathInline') ed.chain().focus().insertContent('\\(a = b + c\\)').run()
    else if (cmd === 'insertMathBlock') ed.chain().focus().insertContent('$$E = mc^2$$').run()
  } catch (e) { console.warn('Editor command failed', e) }
}

const overallDifficulty = computed(() => {
  if (!questions.value.length) return { avg: 0, label: 'N/A' }
  const sum = questions.value.reduce((s, q) => s + (Number(q.difficulty) || 0), 0)
  const avg = +(sum / questions.value.length).toFixed(2)
  const label = avg <= 1.6 ? 'Easy' : avg <= 2.3 ? 'Medium' : 'Hard'
  return { avg, label }
})

function validateQuestion(q) {
  const errs = []
  if (!q.text || !String(q.text).trim()) errs.push('Question text required')
  if (q.type && q.type.startsWith('mcq')) {
    if (!Array.isArray(q.options) || q.options.length < 2) errs.push('Provide at least 2 options')
    const nonEmpty = (q.options || []).filter(o => String(o || '').trim())
    if (nonEmpty.length < 2) errs.push('Provide at least two non-empty options')
    if (q.type === 'mcq-single') {
      if (q.correct === -1) errs.push('Select correct option')
    } else {
      if (!q.corrects || q.corrects.length === 0) errs.push('Select at least one correct option')
    }
  } else if (q.type === 'tf') {
    if (q.correct !== 0 && q.correct !== 1 && q.correct !== 2 && q.correct !== 3) errs.push('Select True/False/Both/None')
  } else if (q.type === 'fill') {
    if ((!q.corrects || !q.corrects.length) && !(Array.isArray(q.fill_parts) && (String(q.fill_parts[0]||'').trim() || String(q.fill_parts[1]||'').trim()))) errs.push('Provide one or more expected answers or fill parts')
  } else if (q.type === 'image') {
    if (!q.media && (!q.text || !String(q.text).trim())) errs.push('Image question requires either media or text')
  }
  return errs
}

function runValidation() {
  const out = {}
  if (!form.value.title || !String(form.value.title).trim()) out._title = 'Title required'
  if (!form.value.topic_id) out._topic = 'Topic required'
  questions.value.forEach(q => {
    const e = validateQuestion(q)
    if (e.length) out[q.uid] = e
  })
  validationErrors.value = out
  return out
}

const canPublish = computed(() => Object.keys(runValidation()).length === 0)

function onFile(e) { form.value.cover = e.target.files[0] }

async function submit() {
  const errs = runValidation()
  if (Object.keys(errs).length) { alert('Please fix validation errors before publishing'); activeTab.value = 'questions'; return }

  isSaving.value = true
  const data = new FormData()
  // append form fields
  const simple = ['topic_id','title','description','youtube_url']
  simple.forEach(k => { if (form.value[k] !== undefined && form.value[k] !== null) data.append(k, form.value[k]) })
  if (form.value.cover) data.append('cover', form.value.cover)

  // settings
  if (form.value.timer_minutes && Number(form.value.timer_minutes) > 0) data.set('timer_seconds', String(Number(form.value.timer_minutes) * 60))
  // map attempts: 'unlimited' => empty (backend treats missing or null as unlimited)
  if (form.value.attempts_allowed === 'unlimited') {
    // don't append attempts_allowed
  } else {
    data.set('attempts_allowed', String(form.value.attempts_allowed))
  }
  data.set('shuffle_questions', form.value.shuffle_questions ? '1' : '0')
  data.set('shuffle_answers', form.value.shuffle_answers ? '1' : '0')
  data.set('access', form.value.access)
  data.set('visibility', form.value.visibility)
  if (form.value.scheduled_at) data.set('scheduled_at', form.value.scheduled_at)

  // shape questions and append
  const shaped = questions.value.map((q, idx) => {
    // Convert local index-based correct/corrects into canonical answer values (option strings)
    const mapIndexToValue = (index) => {
      if (!Array.isArray(q.options)) return String(index)
      if (index === -1) return null
      return q.options[index] !== undefined ? q.options[index] : String(index)
    }

    let answers = []
    if (q.type === 'mcq-single') {
      answers = q.correct === -1 ? [] : ([ mapIndexToValue(q.correct) ].filter(v => v !== null))
    } else if (q.type === 'mcq-multiple') {
      answers = (q.corrects || []).map(i => mapIndexToValue(i)).filter(v => v !== null)
    } else if (q.type === 'tf') {
      // TF uses numeric codes 0/1 etc; keep as-is (backend understands these)
      answers = (q.correct === 1 ? [1] : q.correct === 0 ? [0] : (q.correct === 2 ? [0,1] : []))
    } else if (q.type === 'fill') {
      answers = q.corrects || []
    } else {
      answers = q.corrects && q.corrects.length ? q.corrects : (q.correct === -1 ? [] : [q.correct])
    }

    return {
      type: q.type.startsWith('mcq') ? 'mcq' : q.type,
      text: q.text || '',
      explanation: q.explanation || null,
      options: q.options || null,
      answers,
      difficulty: Number(q.difficulty) || 2,
      marks: Number(q.marks) || 1,
      fill_parts: q.fill_parts || null,
      media_present: !!q.media,
      is_banked: q.is_banked ? 1 : 0,
    }
  })
  data.append('questions', JSON.stringify(shaped))

  // append per-question media files as question_media[index]
  Object.keys(questionMedia.value).forEach(k => {
    const file = questionMedia.value[k]
    if (file) data.append(`question_media[${k}]`, file)
  })

  try {
    const res = await fetch(config.public.apiBase + '/api/quizzes', { method: 'POST', body: data, credentials: 'include' })
    if (res.ok) {
      successMessage.value = 'Quiz published — submitted for approval if required'
      setTimeout(() => router.push('/quiz-master/quizzes'), 900)
    } else {
      let errText = 'Error'
      try { const err = await res.json(); errText = JSON.stringify(err) } catch (e) { errText = await res.text() }
      alert('Error: ' + errText)
    }
  } finally {
    isSaving.value = false
  }
}

const debouncedAutoSave = debounce(async () => {
  if (!form.value.title || isSaving.value) return
  isSaving.value = true
  const data = new FormData()
  const simple = ['topic_id','title','description','youtube_url']
  simple.forEach(k => { if (form.value[k] !== undefined && form.value[k] !== null) data.append(k, form.value[k]) })
  if (form.value.cover) data.append('cover', form.value.cover)

  const shaped = questions.value.map((q) => {
    const mapIndexToValue = (index) => {
      if (!Array.isArray(q.options)) return String(index)
      if (index === -1) return null
      return q.options[index] !== undefined ? q.options[index] : String(index)
    }
    const answers = q.type === 'mcq-single' ? (q.correct===-1?[]:[ mapIndexToValue(q.correct) ].filter(v=>v!==null)) : (q.type.startsWith('mcq') ? (q.corrects||[]).map(i=>mapIndexToValue(i)).filter(v=>v!==null) : (q.corrects||[]))
    return { type: q.type.startsWith('mcq') ? 'mcq' : q.type, text: q.text || '', explanation: q.explanation || null, options: q.options || null, answers, difficulty: Number(q.difficulty) || 2, marks: Number(q.marks) || 1, is_banked: q.is_banked ? 1 : 0 }
  })
  data.append('questions', JSON.stringify(shaped))
  data.append('is_draft', '1')

  if (form.value.timer_minutes && Number(form.value.timer_minutes) > 0) data.set('timer_seconds', String(Number(form.value.timer_minutes) * 60))
  if (form.value.attempts_allowed !== 'unlimited') data.set('attempts_allowed', String(form.value.attempts_allowed))
  data.set('shuffle_questions', form.value.shuffle_questions ? '1' : '0')
  data.set('shuffle_answers', form.value.shuffle_answers ? '1' : '0')
  data.set('access', form.value.access)
  data.set('visibility', form.value.visibility)
  if (form.value.scheduled_at) data.set('scheduled_at', form.value.scheduled_at)

  Object.keys(questionMedia.value).forEach(k => {
    const file = questionMedia.value[k]
    if (file) data.append(`question_media[${k}]`, file)
  })

  try {
    const res = await fetch(config.public.apiBase + '/api/quizzes', { method: 'POST', body: data, credentials: 'include' })
    if (res.ok) {
      console.log('Autosave successful')
    } else {
      console.warn('Autosave failed')
    }
  } catch (e) {
    console.warn('Autosave error', e)
  } finally {
    isSaving.value = false
  }
}, 5000) // 5 second delay

async function saveDraft() {
  if (!form.value.title) { alert('Please enter a title before saving draft'); return }
  isSaving.value = true
  const data = new FormData()
  const simple = ['topic_id','title','description','youtube_url']
  simple.forEach(k => { if (form.value[k] !== undefined && form.value[k] !== null) data.append(k, form.value[k]) })
  if (form.value.cover) data.append('cover', form.value.cover)

  const shaped = questions.value.map((q) => {
    const mapIndexToValue = (index) => {
      if (!Array.isArray(q.options)) return String(index)
      if (index === -1) return null
      return q.options[index] !== undefined ? q.options[index] : String(index)
    }
    const answers = q.type === 'mcq-single' ? (q.correct===-1?[]:[ mapIndexToValue(q.correct) ].filter(v=>v!==null)) : (q.type.startsWith('mcq') ? (q.corrects||[]).map(i=>mapIndexToValue(i)).filter(v=>v!==null) : (q.corrects||[]))
    return { type: q.type.startsWith('mcq') ? 'mcq' : q.type, text: q.text || '', explanation: q.explanation || null, options: q.options || null, answers, difficulty: Number(q.difficulty) || 2, marks: Number(q.marks) || 1, is_banked: q.is_banked ? 1 : 0 }
  })
  data.append('questions', JSON.stringify(shaped))
  data.append('is_draft', '1')

  if (form.value.timer_minutes && Number(form.value.timer_minutes) > 0) data.set('timer_seconds', String(Number(form.value.timer_minutes) * 60))
  if (form.value.attempts_allowed !== 'unlimited') data.set('attempts_allowed', String(form.value.attempts_allowed))
  data.set('shuffle_questions', form.value.shuffle_questions ? '1' : '0')
  data.set('shuffle_answers', form.value.shuffle_answers ? '1' : '0')
  data.set('access', form.value.access)
  data.set('visibility', form.value.visibility)
  if (form.value.scheduled_at) data.set('scheduled_at', form.value.scheduled_at)

  Object.keys(questionMedia.value).forEach(k => {
    const file = questionMedia.value[k]
    if (file) data.append(`question_media[${k}]`, file)
  })

  try {
    const res = await fetch(config.public.apiBase + '/api/quizzes', { method: 'POST', body: data, credentials: 'include' })
    if (res.ok) {
      successMessage.value = 'Draft saved successfully'
      setTimeout(() => { successMessage.value = ''; router.push('/quiz-master/quizzes') }, 1100)
    } else {
      let errText = 'Error'
      try { const err = await res.json(); errText = JSON.stringify(err) } catch (e) { errText = await res.text() }
      alert('Error saving draft: ' + errText)
    }
  } finally {
    isSaving.value = false
  }
}

function newQuiz() {
  form.value = { topic_id: '', title: '', description: '', youtube_url: '', cover: null, timer_minutes: null, attempts_allowed: 1, shuffle_questions: false, shuffle_answers: false, access: 'free', visibility: 'draft', scheduled_at: null }
  selectedSubjectId.value = ''
  resetQuestions()
  activeTab.value = 'details'
}

function previewQuiz() {
  showPreview.value = true
}

onMounted(async () => {
  // dynamically load TipTap only on client
  if (process.client) {
    try {
      try {
        const [{ Editor: E }, { default: SK }, tipVue, mathExt] = await Promise.all([
          import('@tiptap/core'),
          import('@tiptap/starter-kit'),
          import('@tiptap/vue-3'),
          // math extension is optional; wrap in try/catch so missing package doesn't break build
          import(/* @vite-ignore */ 'tiptap-extension-math-katex')
        ])
        EditorClass = E
        StarterKitExt = SK
        MathExt = mathExt?.default || mathExt
        EditorContentComp.value = tipVue.EditorContent
      } catch (e) {
        // fallback: import core parts without math extension
        const [{ Editor: E }, { default: SK }, tipVue] = await Promise.all([
          import('@tiptap/core'),
          import('@tiptap/starter-kit'),
          import('@tiptap/vue-3')
        ])
        EditorClass = E
        StarterKitExt = SK
        MathExt = null
        EditorContentComp.value = tipVue.EditorContent
      }
      tiptapLoaded.value = true
    } catch (e) {
      console.warn('TipTap failed to load', e)
    }
  }

  try {
    const [sRes, tRes] = await Promise.all([
      fetch(config.public.apiBase + '/api/subjects', { credentials: 'include' }),
      fetch(config.public.apiBase + '/api/topics?approved=1', { credentials: 'include' }),
    ])
    if (sRes.ok) { const sjson = await sRes.json(); subjects.value = sjson.subjects || sjson.data || [] }
    if (tRes.ok) { const tjson = await tRes.json(); topics.value = tjson.topics || tjson.data || [] }
  } catch (e) {}

  resetQuestions()
})

onBeforeUnmount(() => {
  Object.keys(editors.value).forEach(k => { try { editors.value[k].destroy() } catch (e) {} })
  editors.value = {}
})

const filteredTopics = computed(() => {
  if (!selectedSubjectId.value) return topics.value
  return topics.value.filter(t => String(t.subject_id || t.subject?.id) === String(selectedSubjectId.value))
})
</script>

<style scoped>
</style>
