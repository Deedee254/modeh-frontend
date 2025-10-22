<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white">Create question</h3>
        <div class="flex items-center gap-2">
          <button @click="$emit('cancel')" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">Cancel</button>
        </div>
      </div>

      <div class="space-y-3">
  <label class="text-xs text-gray-700 dark:text-gray-300">Question text (use __ for blanks)</label>

        <div class="flex flex-wrap items-center gap-2 mt-2 mb-2">
          <button type="button" @click="focusEditor" class="ml-auto text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-200 mt-2 sm:mt-0">Focus editor</button>
        </div>

        <RichTextEditor ref="editorRef" v-model="form.body" @error="onEditorError" />
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
          <div v-for="(opt, idx) in form.options" :key="idx" class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input v-model="form.options[idx]" placeholder="Option text" class="w-full sm:flex-1 rounded px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200" />
            <div class="flex items-center gap-2">
              <template v-if="form.type === 'multi'">
                <input type="checkbox" :checked="(form.answers || []).includes(idx)" @change="() => toggleAnswer(idx)" title="Mark correct" />
              </template>
              <template v-else>
                <input type="radio" name="single-correct" :checked="(form.answers || [])[0] === idx" @change="() => setSingleAnswer(idx)" title="Mark correct" />
              </template>
              <button @click="removeOption(idx)" class="text-xs text-rose-500 dark:text-rose-400 hover:underline">Remove</button>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="addOption" class="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">Add option</button>
              <div class="text-xs text-gray-500 dark:text-gray-400 self-center">(Use checkboxes for multi-select questions)</div>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
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

      <div class="mt-4 flex items-center justify-end gap-3">
        <button @click="onReset" class="text-xs text-gray-500 dark:text-gray-300">Reset</button>
        <button @click="onSave" :disabled="submitting" class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-semibold">
          <span v-if="submitting">Saving…</span>
          <span v-else>Save question</span>
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
      <div v-if="savedQuestion" class="mt-4 border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-emerald-300">Question saved</div>
          <div class="text-xs text-slate-400">ID: {{ savedQuestion.id }}</div>
        </div>
        <div class="flex gap-2">
          <button @click="shareSaved" class="text-xs bg-indigo-600 px-2 py-1 rounded text-white">Share</button>
          <button @click="createAnother" class="text-xs bg-slate-700 px-2 py-1 rounded text-white">Create another</button>
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
// RichTextEditor will handle math/code rendering; no katex auto-render here

const props = defineProps({
  subjectId: { type: Number, default: null },
  topicId: { type: Number, default: null },
  prefill: { type: Object, default: null },
  // Optional: when provided, the builder will PATCH to /api/questions/:editId instead of creating
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['saved','cancel'])

const cfg = useRuntimeConfig()
const alert = useAppAlert()

const form = ref({
  body: props.prefill?.body || '<p></p>',
  type: props.prefill?.type || 'mcq',
  options: props.prefill?.options ? [...props.prefill.options] : ['', ''],
  answers: props.prefill?.answers ? [...props.prefill.answers] : [],
  difficulty: props.prefill?.difficulty || 2,
  subject_id: props.subjectId || props.prefill?.subject_id || undefined,
  topic_id: props.topicId || props.prefill?.topic_id || undefined,
  youtube_url: props.prefill?.youtube_url || '',
  explanation: props.prefill?.explanation || '',
  solution_steps: props.prefill?.solution_steps ? [...props.prefill.solution_steps] : []
})

const imageFile = ref(null)
const audioFile = ref(null)
// ref to the RichTextEditor component to call exposed commands
const editorRef = ref(null)
// which solution step is expanded (-1 = none)
const expandedStep = ref(-1)
const submitting = ref(false)
const savedQuestion = ref(null)

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
  // Ensure the answers array has the same length as the number of blanks
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

// Helpers for correct answer selection
function toggleAnswer(i) {
  const arr = Array.isArray(form.value.answers) ? form.value.answers : []
  const idx = arr.indexOf(i)
  if (idx === -1) arr.push(i)
  else arr.splice(idx, 1)
  form.value.answers = arr
}

function setSingleAnswer(i) {
  form.value.answers = [i]
}

function addOption() { form.value.options.push('') }
function removeOption(i) { if (form.value.options.length > 1) form.value.options.splice(i,1) }

function onImageChange(e) { imageFile.value = e.target.files?.[0] || null }
function onAudioChange(e) { audioFile.value = e.target.files?.[0] || null }

function onEditorError(err) { alert.push({ message: 'Editor error: ' + (err?.message || err), type: 'error' }) }

// Editor helper wrapper - focus editor
function focusEditor() { try { editorRef.value?.focus?.() } catch (e) {} }

async function onSave() {
  // basic validation
  if (!form.value.body || !String(form.value.body).trim()) { alert.push({ message: 'Enter question text', type: 'warning' }); return }
  if (requiresOptions.value && (!Array.isArray(form.value.options) || form.value.options.length < 2)) { alert.push({ message: 'Provide at least 2 options', type: 'warning' }); return }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('body', form.value.body)
    formData.append('type', form.value.type)
    formData.append('difficulty', form.value.difficulty)
    if (form.value.subject_id) formData.append('subject_id', form.value.subject_id)
    if (form.value.topic_id) formData.append('topic_id', form.value.topic_id)
    if (form.value.youtube_url) formData.append('youtube_url', form.value.youtube_url)

    if (form.value.type === 'fill_blank') {
      fillInTheBlankAnswers.value.forEach((answer, index) => {
        formData.append(`answers[${index}]`, answer)
      })
    } else if (requiresOptions.value) {
      form.value.options.forEach((option, index) => {
        formData.append(`options[${index}]`, option)
      })
      if (Array.isArray(form.value.answers)) {
        form.value.answers.forEach((answer, index) => {
          formData.append(`answers[${index}]`, answer)
        })
      }
    }

    // Append explanation and solution steps if present
    if (form.value.explanation) {
      formData.append('explanation', form.value.explanation)
    }
    if (Array.isArray(form.value.solution_steps) && form.value.solution_steps.length) {
      form.value.solution_steps.forEach((s, i) => {
        formData.append(`solution_steps[${i}]`, s)
      })
    }

    if (imageFile.value) {
      formData.append('media', imageFile.value)
    } else if (audioFile.value) {
      formData.append('media', audioFile.value)
    }

    const endpoint = props.editId ? cfg.public.apiBase + `/api/questions/${props.editId}` : cfg.public.apiBase + '/api/questions'
    // Note: When using FormData with PATCH, some backends have issues. Laravel handles it with a _method field.
    const method = props.editId ? 'POST' : 'POST' // Using POST for updates with _method field
    if (props.editId) {
      formData.append('_method', 'PATCH')
    }

    const res = await fetch(endpoint, {
      method,
      credentials: 'include',
      body: formData
    })

    if (res.ok) {
      const json = await res.json()
      alert.push({ message: 'Question saved', type: 'success' })
      const saved = json.question || json
      savedQuestion.value = saved
      // emit saved so parent can append to quiz
      emit('saved', saved)
    } else {
      const text = await res.text().catch(() => '')
      alert.push({ message: 'Failed to save question: ' + (text || res.statusText), type: 'error' })
    }
  } catch (e) {
    alert.push({ message: 'Network error saving question', type: 'error' })
  } finally { submitting.value = false } 
}

function onReset() {
  form.value = { body: '<p></p>', type: 'mcq', options: ['', ''], answers: [], difficulty: 2, youtube_url: '', explanation: '' }
  imageFile.value = null
  audioFile.value = null
}

function addSolutionStep() {
  if (!Array.isArray(form.value.solution_steps)) form.value.solution_steps = []
  form.value.solution_steps.push('')
}

function addAndOpen() {
  addSolutionStep()
  // open the newly added step
  expandedStep.value = form.value.solution_steps.length - 1
}

function removeSolutionStep(idx) {
  if (!Array.isArray(form.value.solution_steps)) return
  form.value.solution_steps.splice(idx, 1)
}

function moveStepUp(idx) {
  if (idx <= 0) return
  const arr = form.value.solution_steps || []
  const temp = arr[idx-1]
  arr[idx-1] = arr[idx]
  arr[idx] = temp
  form.value.solution_steps = [...arr]
}

function moveStepDown(idx) {
  const arr = form.value.solution_steps || []
  if (idx >= arr.length - 1) return
  const temp = arr[idx+1]
  arr[idx+1] = arr[idx]
  arr[idx] = temp
  form.value.solution_steps = [...arr]
}

function toggleStep(idx) {
  if (expandedStep.value === idx) expandedStep.value = -1
  else expandedStep.value = idx
}

function collapsedPreview(html) {
  if (!html) return '<em class="text-gray-400">(empty)</em>'
  // strip tags for a short preview (simple approach)
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  const preview = text.length > 140 ? text.slice(0, 137) + '…' : text
  return preview.replace(/\n/g, ' ')
}

// keep solution steps watcher for preview updates (no katex processing here)
watch([
  () => form.value.solution_steps,
  () => expandedStep.value
], async () => {
  await nextTick()
  // Preview updates are handled by the RichTextEditor; nothing extra required here
})

function createAnother() {
  savedQuestion.value = null
  onReset()
  // keep builder open for additional creation
}

function shareSaved() {
  if (!savedQuestion.value) return
  // Simple share: copy URL to clipboard if available
  const id = savedQuestion.value.id || savedQuestion.value._id || savedQuestion.value.uuid
  const url = id ? `${window.location.origin}/questions/${id}` : window.location.href
  try {
    navigator.clipboard.writeText(url)
    alert.push({ message: 'Share link copied to clipboard', type: 'success' })
  } catch (e) {
    alert.push({ message: 'Unable to copy link, please share manually: ' + url, type: 'info' })
  }
}
</script>

<style scoped>
/* minimal styles carried from page */
</style>
