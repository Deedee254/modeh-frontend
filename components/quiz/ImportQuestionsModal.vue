<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <div class="p-4 sm:p-6 max-h-[80vh] overflow-auto">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">Import Questions (CSV / Excel)</h3>
          <p class="text-sm text-gray-500">Upload a CSV or Excel file to bulk-import questions. See template download for headers.</p>
        </div>
        <div>
          <UButton size="sm" variant="ghost" @click="close">Close</UButton>
        </div>
      </div>

      <div class="mt-4 sm:mt-6 space-y-4">
        <div class="flex flex-col sm:flex-row gap-2">
          <UButton size="sm" variant="soft" @click="downloadTemplate">Download CSV Template</UButton>
          <UButton size="sm" color="primary" @click="openFilePicker">Choose File</UButton>
          <input ref="fileInput" type="file" accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="hidden" @change="onFileSelected" />
        </div>


        <div v-if="loading" class="text-sm text-gray-600">Processing file…</div>

        <div v-if="createdCount !== null" class="text-sm text-green-700">Imported {{ createdCount }} question(s).</div>

        <div v-if="importErrors.length" class="mt-2">
          <h4 class="text-sm font-medium text-red-700">Errors</h4>
          <div class="space-y-2 mt-2">
            <div v-for="(e, idx) in importErrors" :key="idx" class="p-2 bg-red-50 border rounded">
              <div class="text-sm font-medium text-red-700">Row {{ e.row }}</div>
              <ul class="list-disc list-inside text-sm text-red-600 mt-1">
                <li v-for="(m, i2) in e.errors" :key="i2">{{ m }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <UButton size="sm" variant="soft" @click="close">Cancel</UButton>
          <UButton size="sm" color="primary" class="ml-2" @click="finish" :disabled="loading">Done</UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCreateQuizStore } from '~/stores/createQuizStore'
import { useAppAlert } from '~/composables/useAppAlert'
import { getQuestionValidationErrors } from '~/composables/useQuestionValidation'

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})
const emit = defineEmits(['update:modelValue','imported'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const store = useCreateQuizStore()
const alert = useAppAlert()

const fileInput = ref(null)
const loading = ref(false)
const importErrors = ref([])
const createdCount = ref(null)

function close() { emit('update:modelValue', false) }

function finish() {
  emit('imported', { created: createdCount.value || 0, errors: importErrors.value })
  close()
}

function openFilePicker() {
  try { if (fileInput.value && typeof fileInput.value.click === 'function') fileInput.value.click() } catch (e) {}
}

function downloadTemplate() {
  const headers = ['type','text','option1','option2','option3','option4','answers','marks','difficulty','explanation','youtube_url','media']
  const samples = [
    ['mcq','What is the capital of Kenya?','Nairobi','Mombasa','Kisumu','Nakuru','Nairobi','1','2','Correct answer is Nairobi.','',''],
    ['multi','Select the even numbers less than six','1','2','3','4','2,4','2','2','Mark all even numbers.','',''],
    ['short','Name the longest river in Africa','','','','','Nile','2','2','','',''],
    ['numeric','What is 12 divided by 3?','','','','','4','1','1','','',''],
    ['fill_blank','Photosynthesis happens in the __ of plant cells','chloroplasts','mitochondria','nucleus','vacuole','chloroplasts','1','2','','','']
  ]
  const escapeValue = value => {
    const s = String(value ?? '')
    if (s.includes(',') || s.includes('"')) {
      return '"' + s.replace(/"/g,'""') + '"'
    }
    return s
  }
  const lines = [headers.join(','), ...samples.map(row => row.map(escapeValue).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'questions-template.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function onFileSelected(e) {
  const f = e?.target?.files?.[0]
  if (!f) return
  loading.value = true
  importErrors.value = []
  createdCount.value = null
  try {
    const name = String(f.name || '').toLowerCase()
    let rows = []
    if (name.endsWith('.csv') || f.type === 'text/csv' || name.endsWith('.txt')) {
      rows = await parseCsvFile(f)
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const XLSX = (await import('xlsx')).default
      rows = await parseExcelFile(f, XLSX)
    } else {
      const message = 'Unsupported file type. Please upload CSV or Excel.'
      alert.push({ type: 'error', message })
      return
    }

    const result = await handleParsedRows(rows)
    createdCount.value = result.created
    if (result.errors && result.errors.length) importErrors.value = result.errors
    const msg = `Imported ${result.created} question(s).`
    alert.push({ type: 'success', message: msg })
  } catch (err) {
    console.error(err)
    alert.push({ type: 'error', message: 'Import failed' })
  } finally {
    loading.value = false
    try { e.target.value = '' } catch (e) {}
  }
}

function normalizeHeader(h) {
  return String(h ?? '')
    // strip BOM
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function parseCsvFile(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const decoder = new TextDecoder('utf-8', { fatal: false })
      const text = decoder.decode(arrayBuffer)
      
      const PapaMod = await import('papaparse')
      const Papa = PapaMod && PapaMod.default ? PapaMod.default : PapaMod
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: normalizeHeader,
        transform: (value) => {
          if (value == null) return ''
          let str = String(value)
          str = str.replace(/\ufffd/g, '~')
          return str
        },
        complete: (results) => {
          const rows = Array.isArray(results.data) ? results.data.map(r => normalizeRowKeys(r)) : []
          resolve(rows)
        },
        error: (err) => reject(err)
      })
    } catch (err) { reject(err) }
  })
}

async function parseExcelFile(file, XLSX) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result)
        const wb = XLSX.read(data, { type: 'array', codepage: 65001 })
        const first = wb.SheetNames[0]
        const sheet = wb.Sheets[first]
        let rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        if (Array.isArray(rows)) rows = rows.map(r => normalizeRowKeys(r))
        resolve(rows)
      } catch (err) { reject(err) }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// csv parsing is handled by PapaParse (see parseCsvFile)

function normalizeRowKeys(row) {
  if (!row || typeof row !== 'object') return row
  const out = {}
  for (const k in row) {
    if (!Object.prototype.hasOwnProperty.call(row, k)) continue
    const nk = String(k ?? '')
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
    out[nk] = row[k]
  }
  return out
}

// parseCsvLine removed; PapaParse replaces custom parsing

function buildQuestionFromRow(row) {
  if (!row || typeof row !== 'object') return null
  const type = String((row.type || row.Type || row.TYPE || '')).trim() || 'mcq'
  const text = String(row.text || row.Text || row.body || row.Body || '').trim()
  const marks = Number(row.marks ?? row.Marks ?? 1) || 1
  const difficulty = Number(row.difficulty ?? row.Difficulty ?? 2) || 2

  const optionsRaw = String(row.options || row.Options || '')
  const answersRaw = String(row.answers || row.Answers || '')

  const optionKeys = Object.keys(row || {}).map(key => {
    const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g,'')
    return { key, match: /^option(\d+)$/.exec(normalized) }
  }).filter(entry => entry.match)
  optionKeys.sort((a, b) => Number(a.match[1]) - Number(b.match[1]))
  const optionsFromColumns = optionKeys.map(entry => String(row[entry.key] ?? '').trim()).filter(val => val.length)
  const options = optionsFromColumns.length ? optionsFromColumns : (optionsRaw ? optionsRaw.split('|').map(s => String(s || '').trim()) : [])
  let answers = []
  if (answersRaw) {
    answers = answersRaw.split(/[,|]/).map(s => s.trim()).filter(Boolean)
    answers = answers.map(a => (/^\d+$/.test(a) ? Number(a) : a))
  }

  const question = {
    uid: Math.random().toString(36).substring(2),
    type,
    text: text || '<p></p>',
    marks: marks,
    difficulty: difficulty,
    options: options.length ? options : undefined,
    answers: answers.length ? answers : undefined,
    open: true,
  }

  if (type === 'mcq') {
    if (Array.isArray(question.answers)) {
      const a = question.answers[0]
      if (typeof a === 'number') question.correct = a - 1
      else if (typeof a === 'string' && question.options) {
        const idx = question.options.findIndex(o => String(o).trim() === String(a).trim())
        question.correct = idx >= 0 ? idx : -1
      }
      delete question.answers
    }
  }

  if (type === 'multi' || type === 'fill_blank') {
    if (Array.isArray(question.answers)) {
      question.corrects = question.answers.map(a => (typeof a === 'number' ? a - 1 : (typeof a === 'string' && /^\d+$/.test(a) ? Number(a) - 1 : a)))
      delete question.answers
    }
  }

  return question
}

// validation handled by shared composable `useQuestionValidation`

async function handleParsedRows(rows) {
  const created = []
  const errors = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const q = buildQuestionFromRow(row)
    const rowNumber = i + 2
    if (!q) { errors.push({ row: rowNumber, errors: ['Failed to parse row'] }); continue }

    if (row.explanation || row.Explanation) q.explanation = row.explanation || row.Explanation
    if (row.youtube_url || row.Youtube_url || row.YOUTUBE_URL) q.youtube_url = row.youtube_url || row.Youtube_url || row.YOUTUBE_URL
    if (row.media || row.Media) q.media = row.media || row.Media

    q.is_banked = true
    q.is_approved = true
    // Ensure imported questions inherit the current quiz taxonomy so server-side created
    // questions already have grade/level/subject/topic set when the quiz is saved.
    try {
      q.grade_id = store.quiz?.grade_id ?? null
      q.level_id = store.quiz?.level_id ?? null
      q.subject_id = store.quiz?.subject_id ?? null
      q.topic_id = store.quiz?.topic_id ?? null
    } catch (e) {}

    const tmp = JSON.parse(JSON.stringify(q))
    if (tmp.type === 'mcq') { if (typeof tmp.correct !== 'undefined') tmp.answers = [String(tmp.correct)] }
    if (tmp.type === 'multi') { if (Array.isArray(tmp.corrects)) tmp.answers = tmp.corrects.map(c => String(c)) }

    const verrors = getQuestionValidationErrors(tmp)
    if (verrors && verrors.length) { errors.push({ row: rowNumber, errors: verrors }); continue }

    store.addQuestion(q)
    created.push(q)
  }
  return { created: created.length, errors }
}
</script>
