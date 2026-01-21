<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <div class="p-5 max-h-[85vh] overflow-auto">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Import Questions</h3>
          <p class="text-sm text-gray-500 mt-1">Upload a CSV or Excel file to bulk-import questions</p>
        </div>
        <UButton size="sm" variant="ghost" icon="i-heroicons-x-mark" @click="close" />
      </div>

      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-2">
          <UButton size="sm" variant="soft" icon="i-heroicons-arrow-down-tray" @click="downloadTemplate" class="flex-1 sm:flex-none">Download Template</UButton>
          <UButton size="sm" color="primary" icon="i-heroicons-folder-open" @click="openFilePicker" class="flex-1 sm:flex-none !bg-brand-600 hover:!bg-brand-700">Choose File</UButton>
          <input ref="fileInput" type="file" accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="hidden" @change="onFileSelected" />
        </div>

        <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-600 py-2">
          <Icon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
          <span>Processing file…</span>
        </div>

        <div v-if="createdCount !== null && createdCount > 0" class="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <Icon name="i-heroicons-check-circle" class="w-5 h-5" />
          <span>Successfully imported {{ createdCount }} question{{ createdCount !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="importErrors.length" class="border border-red-200 rounded-lg bg-red-50 p-4">
          <h4 class="text-sm font-semibold text-red-700 mb-2">Import Errors</h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="(e, idx) in importErrors" :key="idx" class="bg-white border border-red-200 rounded p-2.5">
              <div class="text-sm font-medium text-red-700 mb-1">Row {{ e.row }}</div>
              <ul class="list-disc list-inside text-sm text-red-600 space-y-0.5">
                <li v-for="(m, i2) in e.errors" :key="i2">{{ m }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <UButton size="sm" variant="soft" @click="close">Cancel</UButton>
          <UButton size="sm" color="primary" @click="finish" :disabled="loading" icon="i-heroicons-check" class="!bg-brand-600 hover:!bg-brand-700" @keydown.enter="!loading && finish">Done</UButton>
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
    
    // Log summary for debugging
    if (result.created > 0) {
      // Questions imported successfully
    }
    if (result.errors && result.errors.length > 0) {
      // Import errors encountered
    }
    
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
    // Clean the value - remove surrounding quotes if present, and trim
    let value = row[k]
    if (typeof value === 'string') {
      // Remove surrounding quotes (both single and double)
      value = value.replace(/^["']|["']$/g, '').trim()
    }
    out[nk] = value
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
  // Preserve empty option columns so numeric answer indexes remain aligned
  // Previously we filtered out empty values which shifted indexes and caused
  // numeric answers to point to the wrong option (often showing option one).
  const optionsFromColumns = optionKeys.map(entry => String(row[entry.key] ?? '').trim())
  const hasAnyOption = optionsFromColumns.some(val => val.length)
  const options = hasAnyOption ? optionsFromColumns : (optionsRaw ? optionsRaw.split('|').map(s => String(s || '').trim()) : [])
  let answers = []
  if (answersRaw) {
    const t = String(answersRaw || '').trim()
    // If the answers field looks like numeric indexes (e.g. "1" or "1,2" or "1|2")
    // split on comma/pipe and convert to numbers. Otherwise treat the whole
    // answers field as a single textual answer (it may contain commas).
    if (/^\s*\d+(?:\s*[,|]\s*\d+)*\s*$/.test(t)) {
      answers = t.split(/[,|]/).map(s => s.trim()).filter(Boolean).map(a => Number(a))
    } else if (t.includes('|')) {
      // explicit pipe-separated multiple textual answers
      answers = t.split('|').map(s => s.trim()).filter(Boolean)
    } else {
      // keep the entire field as a single textual answer (don't split on commas)
      answers = [t]
    }
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
  
  // Debug logging for CSV import
  if (type === 'mcq' && question.options && question.answers) {
    // CSV Import - Question processing
    console.log({
      text: text.substring(0, 50) + '...',
      options: question.options,
      answers: question.answers,
      answerType: typeof question.answers[0]
    });
  }

  // Convert answers to the format expected by the UI (answers array with string indexes)
  if (type === 'mcq') {
    if (Array.isArray(question.answers) && question.answers.length > 0) {
      const a = question.answers[0]
      let correctIndex = -1
      if (typeof a === 'number') {
        // Numeric answer (1-based from CSV) -> convert to 0-based index
        correctIndex = a - 1
        if (correctIndex >= 0 && question.options && question.options[correctIndex]) {
          question.answers = [String(correctIndex)]
        } else {
          question.answers = []
        }
      } else if (typeof a === 'string' && question.options) {
        // Textual answer -> find matching option index
        // Normalize both strings for comparison (trim, lowercase, normalize whitespace)
        const normalizeText = (text) => {
          return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ')
        }
        const normalizedAnswer = normalizeText(a)
        
        let idx = question.options.findIndex(o => {
          const optText = typeof o === 'string' ? o : (o?.text || '')
          return normalizeText(optText) === normalizedAnswer
        })
        
        // If exact match fails, try a more lenient match (contains check)
        if (idx < 0 && normalizedAnswer.length > 0) {
          idx = question.options.findIndex(o => {
            const optText = typeof o === 'string' ? o : (o?.text || '')
            const normalizedOpt = normalizeText(optText)
            // Check if answer is contained in option or vice versa (for partial matches)
            return normalizedOpt.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedOpt)
          })
        }
        
        if (idx >= 0) {
          question.answers = [String(idx)]
        } else {
          // If it's a numeric string like "1", "2", treat as 1-based index
          const numMatch = /^(\d+)$/.exec(String(a).trim())
          if (numMatch) {
            const numIdx = Number(numMatch[1]) - 1
            if (numIdx >= 0 && question.options && question.options[numIdx]) {
              question.answers = [String(numIdx)]
            } else {
              // Log warning for debugging
              // Could not match answer to option
              question.answers = []
            }
          } else {
            // Log warning for debugging
            // Could not match textual answer
            question.answers = []
          }
        }
      } else {
        question.answers = []
      }
    } else {
      question.answers = []
    }
  }

  if (type === 'multi' || type === 'fill_blank') {
    if (Array.isArray(question.answers) && question.answers.length > 0) {
      // Convert all answers to string indexes (0-based)
      const answerIndexes = question.answers.map(a => {
        if (typeof a === 'number') {
          // 1-based from CSV -> 0-based index
          return String(a - 1)
        } else if (typeof a === 'string') {
          // Check if it's a numeric string
          const numMatch = /^(\d+)$/.exec(String(a).trim())
          if (numMatch) {
            // 1-based from CSV -> 0-based index
            return String(Number(numMatch[1]) - 1)
          } else if (question.options) {
            // Textual answer -> find matching option index
            // Normalize both strings for comparison (trim, lowercase, normalize whitespace)
            const normalizeText = (text) => {
              return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ')
            }
            const normalizedAnswer = normalizeText(a)
            
            let idx = question.options.findIndex(o => {
              const optText = typeof o === 'string' ? o : (o?.text || '')
              return normalizeText(optText) === normalizedAnswer
            })
            
            // If exact match fails, try a more lenient match (contains check)
            if (idx < 0 && normalizedAnswer.length > 0) {
              idx = question.options.findIndex(o => {
                const optText = typeof o === 'string' ? o : (o?.text || '')
                const normalizedOpt = normalizeText(optText)
                return normalizedOpt.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedOpt)
              })
            }
            
            return idx >= 0 ? String(idx) : null
          }
        }
        return null
      }).filter(a => a !== null)
      question.answers = answerIndexes
    } else {
      question.answers = []
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
      // Robust inheritance: try direct ID first, then fall back to object.id
      q.grade_id = store.quiz?.grade_id ?? (store.quiz?.grade?.id ?? null)
      q.level_id = store.quiz?.level_id ?? (store.quiz?.level?.id ?? null)
      q.subject_id = store.quiz?.subject_id ?? (store.quiz?.subject?.id ?? null)
      q.topic_id = store.quiz?.topic_id ?? (store.quiz?.topic?.id ?? null)
    } catch (e) {
      // Error inheriting taxonomy from quiz store
    }

    // Ensure answers array is properly set for validation
    const tmp = JSON.parse(JSON.stringify(q))
    
    // Normalize answers array for validation
    if (tmp.type === 'mcq') {
      if (!Array.isArray(tmp.answers) || tmp.answers.length === 0) {
        // If no answers set, try to use correct field as fallback
        if (typeof tmp.correct !== 'undefined' && tmp.correct >= 0) {
          tmp.answers = [String(tmp.correct)]
        } else {
          tmp.answers = []
        }
      }
    } else if (tmp.type === 'multi' || tmp.type === 'fill_blank') {
      if (!Array.isArray(tmp.answers)) {
        // If no answers set, try to use corrects field as fallback
        if (Array.isArray(tmp.corrects) && tmp.corrects.length > 0) {
          tmp.answers = tmp.corrects.map(c => String(c))
        } else {
          tmp.answers = []
        }
      }
    }

    const verrors = getQuestionValidationErrors(tmp)
    if (verrors && verrors.length) { errors.push({ row: rowNumber, errors: verrors }); continue }

    // Ensure the question has proper structure before adding
    if (!q.answers || (Array.isArray(q.answers) && q.answers.length === 0)) {
      // If answers weren't set properly, set them from tmp
      q.answers = tmp.answers || []
    }

    store.addQuestion(q)
    created.push(q)
  }
  return { created: created.length, errors }
}
</script>

