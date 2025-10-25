<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
    <div class="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white">
          {{ editId ? 'Edit Question' : 'Create Question' }}
        </h3>
        <div class="flex items-center gap-2">
          <button @click="$emit('cancel')" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-2 py-1">Cancel</button>
          <button @click.prevent="showHtmlSource = !showHtmlSource" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-2 py-1">{{ showHtmlSource ? 'Hide HTML' : 'Show HTML' }}</button>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-xs text-gray-700 dark:text-gray-300">Question text (use __ for blanks)</label>
        <div class="flex flex-wrap items-center gap-2 mt-2 mb-2">
          <button type="button" @click="focusEditor" class="ml-auto text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-200 mt-2 sm:mt-0">Focus editor</button>
        </div>
        <RichTextEditor ref="editorRef" v-model="form.body" :features="{ math: true, code: true }" @error="onEditorError" />
        <div v-if="showHtmlSource" class="mt-3">
          <label class="text-xs text-gray-500 dark:text-gray-300">HTML source</label>
          <div class="mt-2 relative">
            <pre class="whitespace-pre-wrap rounded border bg-gray-50 dark:bg-black/60 p-3 text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-48">{{ escapedBody }}</pre>
            <button @click.prevent="copyHtml" class="absolute top-2 right-2 text-xs bg-white/90 dark:bg-slate-800/80 px-2 py-1 rounded border">Copy</button>
          </div>
        </div>
      </div>

      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div class="flex items-center gap-4">
            <select v-model="form.type" class="w-full rounded px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">
              <option value="mcq">Multiple Choice (single correct)</option>
              <option value="multi">Multiple Select (multiple correct)</option>
              <option value="short">Short Answer</option>
              <option value="numeric">Numeric Answer</option>
              <option value="fill_blank">Fill in the Blanks</option>
              <option value="image_mcq">Image Multiple Choice</option>
              <option value="audio_mcq">Audio Multiple Choice</option>
              <option value="video_mcq">Video Multiple Choice</option>
            </select>
            <div class="flex items-center">
              <span class="text-xs text-gray-500 dark:text-gray-400 mr-2">Multi-select</span>
              <UToggle v-model="isMultiSelect" />
            </div>
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-400 dark:text-gray-500">Difficulty (1-5)</label>
          <input type="range" v-model.number="form.difficulty" min="1" max="5" class="w-full" />
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Level: {{ form.difficulty }}</div>
        </div>
      </div>

      <div class="mt-3">
        <label class="text-xs text-gray-500 dark:text-gray-300">Explanation (optional)</label>
        <textarea v-model="form.explanation" rows="3" class="w-full mt-2 rounded px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200" placeholder="Add an explanation or further reading for the answer"></textarea>
      </div>

      <div v-if="form.type === 'fill_blank'" class="mt-3">
        <label class="text-xs text-gray-500 dark:text-gray-300">Answers for blanks</label>
        <div class="space-y-2 mt-2">
          <div v-for="(answer, idx) in fillInTheBlankAnswers" :key="idx" class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Blank {{ idx + 1 }}:</span>
            <input v-model="form.answers[idx]" placeholder="Correct answer" class="w-full sm:flex-1 rounded px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200" />
          </div>
        </div>
      </div>

      <div v-if="requiresOptions && form.type !== 'fill_blank'" class="mt-3">
        <label class="text-xs text-gray-500 dark:text-gray-300">Options</label>
        <div class="space-y-2 mt-2">
          <div v-for="(opt, idx) in form.options" :key="`${idx}-${opt}`" class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input data-qb-option-input v-model="form.options[idx]" placeholder="Option text" class="w-full sm:flex-1 rounded px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200" />
            <div class="flex items-center gap-2">
              <template v-if="form.type === 'multi'">
                <input type="checkbox" :checked="(form.answers || []).includes(form.options[idx])" @change="() => toggleAnswer(idx)" title="Mark correct" />
              </template>
              <template v-else>
                <input type="radio" name="single-correct" :checked="(form.answers || [])[0] === form.options[idx]" @change="() => setSingleAnswer(idx)" title="Mark correct" />
              </template>
              <button @click="removeOption(idx)" class="text-xs text-rose-500 dark:text-rose-400 hover:underline">Remove</button>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
            <button type="button" @click="addOption" class="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">Add option</button>
            <div class="text-xs text-gray-500 dark:text-gray-400 self-center">(Use checkboxes for multi-select questions)</div>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div v-if="['image_mcq','image'].includes(form.type)" class="space-y-2">
          <label class="text-xs text-gray-500 dark:text-gray-300">Image file (optional)</label>
          <div class="flex items-center gap-2 text-sm">
            <input type="file" accept="image/*" @change="onImageChange" class="text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          <div v-if="imageFile" class="text-xs text-gray-500 dark:text-gray-400">{{ imageFile.name }}</div>
        </div>

        <div v-if="['audio_mcq','audio'].includes(form.type)" class="space-y-2">
          <label class="text-xs text-gray-500 dark:text-gray-300">Audio file (optional)</label>
          <div class="flex items-center gap-2 text-sm">
            <input type="file" accept="audio/*" @change="onAudioChange" class="text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          <div v-if="audioFile" class="text-xs text-gray-500 dark:text-gray-400">{{ audioFile.name }}</div>
        </div>

        <div v-if="['video_mcq','video'].includes(form.type)" class="space-y-2 col-span-1 sm:col-span-2">
          <label class="text-xs text-gray-500 dark:text-gray-300">YouTube URL (optional)</label>
          <input v-model="form.youtube_url" placeholder="https://youtube.com/..." class="w-full rounded px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600" />
        </div>
      </div>

      <div class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button @click="onReset" class="text-xs text-gray-500 dark:text-gray-300 w-full sm:w-auto px-4 py-2">Reset</button>
        <button @click="onSave" :disabled="submitting" class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-semibold w-full sm:w-auto">
          <span v-if="submitting">Saving…</span>
          <span v-else>{{ editId ? 'Update Question' : 'Save Question' }}</span>
        </button>
      </div>
    </div>

    <!-- Preview / Actions Column -->
    <aside class="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
      <header class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-gray-800 dark:text-white">Live preview</h4>
        <span class="text-xs text-gray-400 dark:text-gray-500">quiz view</span>
      </header>

      <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/20 p-3 mb-3">
        <div v-html="form.body || '<em class=\'text-gray-500 dark:text-gray-400\'>Start typing your question…</em>'" class="prose prose-sm dark:prose-invert max-w-none"></div>
      </div>

      <div v-if="requiresOptions && form.type !== 'fill_blank'" class="mb-3">
        <label class="text-xs font-semibold text-gray-500 dark:text-gray-300">Options</label>
        <div class="space-y-2 mt-2">
          <div v-for="(opt, i) in form.options" :key="i" class="rounded-md bg-white dark:bg-gray-900/30 p-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2"><span class="font-semibold text-xs text-gray-500 dark:text-gray-400">{{ i + 1 }}</span><div class="text-sm" v-text="opt || ('Option ' + (i+1))"></div></div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900/30">
        <div class="flex items-center justify-between mb-2"><span class="text-xs text-gray-500 dark:text-gray-400">Difficulty</span><span class="text-sm font-semibold text-gray-800 dark:text-white">{{ form.difficulty }}</span></div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Use the slider to tune difficulty (1–5).</div>
      </div>

      <!-- Confirmation area after save -->
      <div v-if="lastSavedQuestion" class="mt-4 border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-emerald-300">Question Saved!</div>
          <div class="text-xs text-slate-400">ID: {{ lastSavedQuestion.id }}</div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">The form has been reset. You can now add another question.</p>
        <div class="flex gap-2">
          <button @click="shareSaved" class="text-xs bg-indigo-600 px-2 py-1 rounded text-white">Share Last</button>
          <button @click="$emit('cancel')" class="text-xs bg-slate-700 px-2 py-1 rounded text-white">Done</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAppAlert } from '~/composables/useAppAlert'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'

const props = defineProps({
  subjectId: { type: Number, default: null },
  topicId: { type: Number, default: null },
  prefill: { type: Object, default: null },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['saved','cancel'])

const cfg = useRuntimeConfig()
const alert = useAppAlert()

const getInitialFormState = () => {
  const initialOptions = props.prefill?.options ? [...props.prefill.options] : ['', '']
  const initialAnswers = (() => {
    const a = props.prefill?.answers ? [...props.prefill.answers] : []
    if (Array.isArray(a) && a.length && a.every(x => typeof x === 'number')) {
      return a.map(i => initialOptions[i]).filter(v => v !== undefined && v !== null)
    }
    return a
  })()

  return {
    body: props.prefill?.body || '<p></p>',
    type: props.prefill?.type || 'mcq',
    options: initialOptions,
    answers: initialAnswers,
    difficulty: props.prefill?.difficulty || 2,
    subject_id: props.subjectId || props.prefill?.subject_id || undefined,
    topic_id: props.topicId || props.prefill?.topic_id || undefined,
    youtube_url: props.prefill?.youtube_url || '',
    explanation: props.prefill?.explanation || '',
    solution_steps: props.prefill?.solution_steps ? [...props.prefill.solution_steps] : []
  }
}

const form = ref(getInitialFormState())
const imageFile = ref(null)
const audioFile = ref(null)
const editorRef = ref(null)
const showHtmlSource = ref(false)
const submitting = ref(false)
const lastSavedQuestion = ref(null)

const requiresOptions = computed(() => ['mcq','multi','image_mcq','audio_mcq','video_mcq'].includes(form.value.type))

const isMultiSelect = computed({
  get: () => form.value.type === 'multi',
  set: (value) => {
    form.value.type = value ? 'multi' : 'mcq'
  }
})

const fillInTheBlankAnswers = computed(() => {
  const blankCount = (form.value.body.match(/__/g) || []).length
  const answers = Array.isArray(form.value.answers) ? form.value.answers : []
  if (answers.length !== blankCount) {
    const newAnswers = new Array(blankCount).fill('')
    for (let i = 0; i < Math.min(answers.length, blankCount); i++) {
      newAnswers[i] = answers[i]
    }
    form.value.answers = newAnswers
  }
  return form.value.answers
})

watch(() => form.value.body, () => {
  if (form.value.type === 'fill_blank') {
    const blankCount = (form.value.body.match(/__/g) || []).length
    const newAnswers = new Array(blankCount).fill('')
    for (let i = 0; i < Math.min(form.value.answers.length, blankCount); i++) {
      newAnswers[i] = form.value.answers[i]
    }
    form.value.answers = newAnswers
  }
})

function toggleAnswer(i) {
  const opt = form.value.options?.[i]
  if (opt === undefined) return
  const arr = Array.isArray(form.value.answers) ? [...form.value.answers] : []
  const idx = arr.indexOf(opt)
  if (idx === -1) arr.push(opt)
  else arr.splice(idx, 1)
  form.value.answers = arr
}

function setSingleAnswer(i) {
  const opt = form.value.options?.[i]
  form.value.answers = opt === undefined ? [] : [opt]
}

function addOption() {
  // Use immutable update to ensure reactivity and then focus the new input
  form.value.options = [...(form.value.options || []), '']
  nextTick(() => {
    try {
      const inputs = document.querySelectorAll('[data-qb-option-input]')
      const last = inputs[inputs.length - 1]
      if (last && typeof last.focus === 'function') last.focus()
    } catch (e) {}
  })
}
function removeOption(i) {
  if (form.value.options.length > 1) {
    const removed = form.value.options.splice(i,1)[0]
    if (Array.isArray(form.value.answers) && removed !== undefined) {
      form.value.answers = form.value.answers.filter(a => a !== removed)
    }
  }
}

function onImageChange(e) { imageFile.value = e.target.files?.[0] || null }
function onAudioChange(e) { audioFile.value = e.target.files?.[0] || null }

function onEditorError(err) { alert.push({ message: 'Editor error: ' + (err?.message || err), type: 'error' }) }
function focusEditor() { try { editorRef.value?.focus?.() } catch (e) {} }

async function onSave() {
  if (!form.value.body || !String(form.value.body).trim()) { alert.push({ message: 'Enter question text', type: 'warning' }); return }
  if (requiresOptions.value && (!Array.isArray(form.value.options) || form.value.options.length < 2)) { alert.push({ message: 'Provide at least 2 options', type: 'warning' }); return }

  submitting.value = true
  try {
    const payload = { ...form.value }
    const formData = new FormData()

    for (const key in payload) {
      const value = payload[key]
      if (value === null || value === undefined) continue

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else {
        formData.append(key, value)
      }
    }

    if (imageFile.value) formData.append('media', imageFile.value)
    if (audioFile.value) formData.append('media', audioFile.value)

    const endpoint = props.editId ? `${cfg.public.apiBase}/api/questions/${props.editId}` : `${cfg.public.apiBase}/api/questions`
    const method = props.editId ? 'POST' : 'POST'
    if (props.editId) {
      formData.append('_method', 'PATCH')
    }

    const res = await fetch(endpoint, { method, credentials: 'include', body: formData })

    if (res.ok) {
      const json = await res.json()
      const saved = json.question || json
      lastSavedQuestion.value = saved
      emit('saved', saved)
      
      if (props.editId) {
        alert.push({ message: 'Question updated successfully!', type: 'success' })
        emit('cancel')
      } else {
        alert.push({ message: `Question "${saved.id}" saved. You can add another.`, type: 'success' })
        onReset()
      }
    } else {
      const text = await res.text().catch(() => '')
      alert.push({ message: 'Failed to save question: ' + (text || res.statusText), type: 'error' })
    }
  } catch (e) {
    console.error(e)
    alert.push({ message: 'Network error saving question: ' + e.message, type: 'error' })
  } finally {
    submitting.value = false
  }
}

function onReset() {
  form.value = {
    body: '<p></p>',
    type: 'mcq',
    options: ['', ''],
    answers: [],
    difficulty: 2,
    subject_id: props.subjectId,
    topic_id: props.topicId,
    youtube_url: '',
    explanation: '',
    solution_steps: []
  }
  imageFile.value = null
  audioFile.value = null
  if (editorRef.value) {
    editorRef.value.setContent('<p></p>')
  }
}

const escapedBody = computed(() => {
  try {
    return String(form.value.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  } catch (e) {
    return ''
  }
})

function copyHtml() {
  try {
    const txt = String(form.value.body || '')
    navigator.clipboard.writeText(txt)
    alert.push({ message: 'Raw HTML copied to clipboard', type: 'success' })
  } catch (e) {
    alert.push({ message: 'Unable to copy HTML', type: 'error' })
  }
}

function shareSaved() {
  if (!lastSavedQuestion.value) return
  const id = lastSavedQuestion.value.id || lastSavedQuestion.value._id || lastSavedQuestion.value.uuid
  const url = id ? `${window.location.origin}/questions/${id}` : window.location.href
  try {
    navigator.clipboard.writeText(url)
    alert.push({ message: 'Share link copied to clipboard', type: 'success' })
  } catch (e) {
    alert.push({ message: 'Unable to copy link, please share manually: ' + url, type: 'info' })
  }
}
</script>