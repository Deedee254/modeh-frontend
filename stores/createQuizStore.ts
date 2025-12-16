
import { defineStore } from 'pinia'
import { watchDebounced } from '@vueuse/core'
// Vue reactivity / types
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
// Nuxt auto-imported helpers (useRouter) are available via #imports in non-SFC modules
import { useRouter } from '#imports'
import { useAppAlert } from '~/composables/useAppAlert'
import { useApi } from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

export interface Quiz {
  id?: number | string | null;
  created_by?: number | null;
  title: string;
  description: string;
  youtube_url: string | null;
  level_id: number | string | null;
  grade_id: number | string | null;
  subject_id: number | string | null;
  topic_id: number | string | null;
  timer_minutes: number;
  per_question_seconds: number;
  use_per_question_timer: boolean;
  attempts_allowed: number | string | null; // string for '' (unlimited)
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  access: 'free' | 'paywall';
  one_off_price: number | null;
  visibility: 'draft' | 'published' | 'scheduled';
  cover?: any; // Can be a string (URL or tmp key) or File
  cover_image?: string;
  cover_file?: File;
  // Optional rich objects used by the UI (may be populated from server)
  level?: any;
  grade?: any;
  subject?: any;
  topic?: any;
}

export interface Question {
  id?: number;
  created_by?: number | null;
  uid?: string;
  type: string;
  body?: string;
  text?: string;
  options?: any[];
  answers?: any[];
  correct?: number | string | null;
  corrects?: (number | string)[];
  difficulty: number;
  marks: number;
  parts?: any[];
  fill_parts?: string[];
  media?: any; // Can be string (URL) or File
  media_file?: File;
  media_metadata?: Record<string, any>;
  youtube_url?: string;
  explanation?: string;
}

// API response types
interface ApiResponse<T> {
  data: T
  message?: string
  errors?: Record<string, string[]>
}

function validateApiResponse<T>(response: unknown): response is ApiResponse<T> {
  if (typeof response !== 'object' || response === null) return false
  if (!('data' in response)) return false

  if ('message' in response && typeof response.message !== 'string') return false
  if ('errors' in response) {
    const errors = (response as any).errors
    if (typeof errors !== 'object' || errors === null) return false
    for (const key in errors) {
      if (!Array.isArray(errors[key])) return false
      if (!errors[key].every(e => typeof e === 'string')) return false
    }
  }

  return true
}

interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) return false
  if (!('message' in error) || typeof (error as any).message !== 'string') return false

  if ('errors' in error) {
    const errors = (error as any).errors
    if (typeof errors !== 'object' || errors === null) return false
    for (const key in errors) {
      if (!Array.isArray(errors[key])) return false
      if (!errors[key].every(e => typeof e === 'string')) return false
    }
  }

  if ('status' in error && typeof (error as any).status !== 'number') return false

  return true
}

export const useCreateQuizStore = defineStore('createQuiz', () => {
  const api = useApi()
  const alert = useAppAlert()
  const router = useRouter()

  const initialForm: Quiz = {
    title: '',
    description: '',
    youtube_url: null,
    level_id: null,
    grade_id: null,
    subject_id: null,
    topic_id: null,
    timer_minutes: 10,
    per_question_seconds: 30,
    use_per_question_timer: false,
    attempts_allowed: 1,
    shuffle_questions: true,
    shuffle_answers: true,
    access: 'free' as 'free' | 'paywall',
    one_off_price: null,
    visibility: 'draft' as 'draft' | 'published' | 'scheduled',
    cover_image: undefined,
    cover: undefined,
    cover_file: undefined
  };

  const quiz = ref<Quiz>({ ...initialForm });
  const questions = ref<Question[]>([]);
  const questionsErrors = ref<Record<string, string[]>>({})
  const detailsErrors = ref<Record<string, string[]>>({})
  const settingsErrors = ref<Record<string, string[]>>({})
  const publishError = ref<{ message: string; details?: string[] } | null>(null)

  // Track pristine state for discard changes feature
  const originalForm = ref<Quiz | null>(null)

  const quizId = ref(null)
  const lastCreated = ref<any>(null)
  const detailsSaved = ref(false)
  const settingsSaved = ref(false)
  const questionsSaved = ref(false)
  const isSubmitting = ref(false)
  const isSaving = ref(false)
  const activeTab = ref('details')

  const isDetailsValid = computed(() => {
    return quiz.value.title && quiz.value.grade_id && quiz.value.subject_id && quiz.value.topic_id
  })

  /**
   * Consolidates quiz data normalization for sending to API.
   * Handles taxonomy IDs, timer conversions, and field validation.
   */
  function normalizeQuizForPayload(data: any) {
    const result: any = { ...data }

    if (result.grade_id === '') result.grade_id = null
    if (result.subject_id === '') result.subject_id = null
    if (result.level_id === '') result.level_id = null
    if (result.topic_id === '') result.topic_id = null

    result.topic_id = result.topic_id ? (Number(result.topic_id) || null) : null
    result.subject_id = result.subject_id ? (Number(result.subject_id) || null) : null
    result.grade_id = result.grade_id ? (Number(result.grade_id) || null) : null
    result.level_id = result.level_id ? (Number(result.level_id) || null) : null

    // Force timer values to be numbers
    result.per_question_seconds = result.per_question_seconds ? Number(result.per_question_seconds) : null
    result.timer_minutes = result.timer_minutes ? Number(result.timer_minutes) : null

    // Handle attempts_allowed: empty string means unlimited (null), otherwise convert to number
    result.attempts_allowed = (() => {
      const raw = result.attempts_allowed
      if (raw === '' || raw === null || typeof raw === 'undefined') return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    })()

    // Ensure boolean fields
    result.use_per_question_timer = Boolean(result.use_per_question_timer)
    result.shuffle_questions = Boolean(result.shuffle_questions)
    result.shuffle_answers = Boolean(result.shuffle_answers)

    return result
  }

  /**
   * Builds the API payload for saving quiz data.
   * Consolidates payload construction for both details and full save operations.
   */
  function buildQuizPayload(includeTimers = true, includeSettings = true): Record<string, any> {
    const normalized = normalizeQuizForPayload(quiz.value as any)

    const payload: any = {
      topic_id: normalized.topic_id,
      title: normalized.title,
      description: normalized.description || null,
      youtube_url: normalized.youtube_url || null,
      subject_id: normalized.subject_id,
      grade_id: normalized.grade_id,
      level_id: normalized.level_id,
      created_by: normalized.created_by,
    }

    if (includeTimers) {
      // If using per-question timer, set per_question_seconds and leave timer_seconds as null
      if (includeTimers) {
        // Send both timer values to backend to ensure data retention on mode switch
        payload.use_per_question_timer = normalized.use_per_question_timer
        payload.per_question_seconds = normalized.per_question_seconds || 30 // Default to 30s if null
        payload.timer_seconds = normalized.timer_minutes ? Number(normalized.timer_minutes) * 60 : null
      }
    }

    if (includeSettings) {
      payload.attempts_allowed = normalized.attempts_allowed
      payload.shuffle_questions = Boolean(normalized.shuffle_questions)
      payload.shuffle_answers = Boolean(normalized.shuffle_answers)
      payload.access = normalized.access
      payload.visibility = normalized.visibility
      payload.one_off_price = normalized.access === 'paywall' && normalized.one_off_price ? Number(normalized.one_off_price) : null

      // DEBUG: Log settings being added
      try {
        console.debug('buildQuizPayload: added settings', {
          shuffle_questions: payload.shuffle_questions,
          shuffle_answers: payload.shuffle_answers,
          attempts_allowed: payload.attempts_allowed,
          access: payload.access,
          visibility: payload.visibility,
        })
      } catch (e) { }
    }

    try {
      console.debug('buildQuizPayload: complete payload', { payload, includeTimers, includeSettings })
    } catch (e) { }

    return payload
  }

  /**
   * Normalizes a question object for use in the editor components.
   * Focuses on editor shape: ensures text, options, answers, and helper fields are present.
   * The backend returns properly normalized questions, so this just coerces the editor structure.
   * @param q The raw question object (from server or user input).
   * @returns A question object ready for the editor UI.
   */
  function normalizeQuestionForEditor(q: any) {
    const question = JSON.parse(JSON.stringify(q || {}))

    // Ensure editor helper fields exist to prevent reactivity issues
    if (!question.uid) question.uid = Math.random().toString(36).substring(2)
    if (typeof question.open === 'undefined') question.open = true
    if (typeof question.is_banked === 'undefined') question.is_banked = false
    if (typeof question.difficulty === 'undefined') question.difficulty = 2
    if (typeof question.marks === 'undefined') question.marks = 1

    // Ensure taxonomy fields are populated (inherit from quiz if not set on question)
    if (!question.grade_id && quiz.value?.grade_id) question.grade_id = quiz.value.grade_id
    if (!question.level_id && quiz.value?.level_id) question.level_id = quiz.value.level_id
    if (!question.subject_id && quiz.value?.subject_id) question.subject_id = quiz.value.subject_id
    if (!question.topic_id && quiz.value?.topic_id) question.topic_id = quiz.value.topic_id

    // Map server body/question keys to editor's expected 'text' key
    if (!question.text && question.body) question.text = question.body
    if (!question.text && question.question) question.text = question.question
    if (!question.text) question.text = '<p></p>'

    // Ensure explanation field (server may use explain, explanation, or omit it)
    if (!question.explanation && question.explain) question.explanation = question.explain
    if (!question.explanation) question.explanation = ''

    // Normalize options and answers for the editor
    // If options exist as array, ensure they are all objects with text and is_correct
    if (Array.isArray(question.options) && question.options.length > 0) {
      // First, convert options to objects if they're strings
      question.options = question.options.map((opt: any) => {
        if (typeof opt === 'string') {
          return { text: opt, is_correct: false }
        }
        return { text: opt.text || opt.value || '', is_correct: !!opt.is_correct }
      })

      // Sync is_correct flags with answers array (answers array takes precedence)
      // This handles CSV imports where answers are set but is_correct flags aren't
      if (Array.isArray(question.answers) && question.answers.length > 0) {
        // Reset all is_correct flags first
        question.options.forEach((opt: any) => {
          opt.is_correct = false
        })
        // Set is_correct to true for options referenced in answers array
        question.answers.forEach((answerIndex: any) => {
          const idx = typeof answerIndex === 'string' ? parseInt(answerIndex, 10) : Number(answerIndex)
          if (!isNaN(idx) && idx >= 0 && idx < question.options.length) {
            question.options[idx].is_correct = true
          }
        })
      } else {
        // Derive answers from is_correct flags if answers are missing
        const correctIndices: number[] = []
        question.options.forEach((opt: any, idx: number) => {
          if (opt.is_correct) correctIndices.push(idx)
        })
        if (correctIndices.length > 0) {
          question.answers = question.type === 'multi' ? correctIndices.map(i => String(i)) : [String(correctIndices[0])]
        }
      }
    }

    // Ensure answers is always an array
    if (!Array.isArray(question.answers)) question.answers = []

    // Ensure options exist even if empty (editor needs this)
    if (!Array.isArray(question.options)) {
      question.options = [
        { text: '', is_correct: true },
        { text: '', is_correct: false }
      ]
    }

    // Normalize option_mode for flexible option-based types
    if (question.type === 'mcq' || question.type === 'multi' || question.type === 'fill_blanks') {
      if (!question.option_mode) {
        // Set default based on type if not explicitly set
        question.option_mode = question.type === 'multi' ? 'multi' : 'single'
      }
    }

    // Normalize math parts: ensure part_type, options, and answers structure
    if (question.type === 'math' && Array.isArray(question.parts)) {
      question.parts = question.parts.map((p: any) => {
        const part: any = {
          text: typeof p === 'string' ? p : (p.text || ''),
          marks: typeof p === 'string' ? 1 : (p.marks || 1),
          part_type: (typeof p === 'string' ? 'text' : p.part_type) || 'text'  // text | mcq | multi
        }

        // If part has options, normalize them
        if (part.part_type !== 'text' && Array.isArray(p.options)) {
          part.options = p.options.map((opt: any) => {
            if (typeof opt === 'string') {
              return { text: opt, is_correct: false }
            }
            return {
              text: opt.text || opt.value || '',
              is_correct: !!opt.is_correct
            }
          })
        } else {
          part.options = []
        }

        // If part has answers, normalize them
        if (part.part_type !== 'text' && (Array.isArray(p.answers) || p.answers)) {
          part.answers = Array.isArray(p.answers) 
            ? p.answers.filter((a: any) => a !== null && typeof a !== 'undefined').map((a: any) => String(a))
            : []
        } else {
          part.answers = []
        }

        return part
      })
    }

    return question
  }
  function sanitizeQuestionForPayload(q: any) {
    // Minimal mapping: convert editor shape to backend-friendly keys.
    // The backend already inherits missing taxonomy fields from the quiz when provided,
    // so avoid re-implementing that logic here. Keep this function small and predictable
    // so CSV import and the question builder can produce straightforward payloads.
    if (!q || typeof q !== 'object') return q

    const copy: any = {
      type: q.type || 'mcq',
      body: q.body || q.text || q || '',
      explanation: q.explanation ?? null,
      difficulty: (typeof q.difficulty !== 'undefined' && q.difficulty !== null) ? Number(q.difficulty) : 3,
      marks: (typeof q.marks !== 'undefined' && q.marks !== null) ? Number(q.marks) : 1,
      created_by: q.created_by,
    }

    // Pass through taxonomy ids when explicitly present on the question object.
    // Pass through taxonomy ids when explicitly present on the question object.
    // Fallback to the current quiz taxonomy if the question doesn't have it set.
    // This ensures that questions added before the quiz details were finalized (or if sync failed) 
    // still get created with the correct parentage.

    // Grade ID
    if (typeof q.grade_id !== 'undefined' && q.grade_id !== null) copy.grade_id = q.grade_id
    else if (q.grade && typeof q.grade.id !== 'undefined') copy.grade_id = q.grade.id
    else if (quiz.value.grade_id) copy.grade_id = quiz.value.grade_id

    // Level ID
    if (typeof q.level_id !== 'undefined' && q.level_id !== null) copy.level_id = q.level_id
    else if (q.level && typeof q.level.id !== 'undefined') copy.level_id = q.level.id
    else if (quiz.value.level_id) copy.level_id = quiz.value.level_id

    // Subject ID
    if (typeof q.subject_id !== 'undefined' && q.subject_id !== null) copy.subject_id = q.subject_id
    else if (q.subject && typeof q.subject.id !== 'undefined') copy.subject_id = q.subject.id
    else if (quiz.value.subject_id) copy.subject_id = quiz.value.subject_id

    // Topic ID
    if (typeof q.topic_id !== 'undefined' && q.topic_id !== null) copy.topic_id = q.topic_id
    else if (q.topic && typeof q.topic.id !== 'undefined') copy.topic_id = q.topic.id
    else if (quiz.value.topic_id) copy.topic_id = quiz.value.topic_id

    if (q.media_type) {
      copy.media_type = q.media_type
      if (q.media_path) copy.media_path = q.media_path
      if (q.youtube_url) copy.youtube_url = q.youtube_url
      if (q.media_metadata) copy.media_metadata = { ...q.media_metadata }
    }

    // Handle option_mode by converting to appropriate type
    // MCQ with option_mode='multi' should be saved as type 'multi'
    // This reuses existing type field instead of adding new column
    if ((q.type === 'mcq' || q.type === 'multi') && q.option_mode === 'multi') {
      copy.type = 'multi'  // Convert to multi type when option_mode is multi
    } else if (q.type === 'multi' && q.option_mode === 'single') {
      copy.type = 'mcq'    // Convert to mcq type when option_mode is single
    }

    if (Array.isArray(q.options)) {
      copy.options = q.options.map((opt: any) => {
        if (typeof opt === 'string') return { text: opt, is_correct: false }
        return { text: opt.text || '', is_correct: !!opt.is_correct }
      })
    }

    if (Array.isArray(q.answers)) {
      copy.answers = q.answers.filter((a: any) => a !== null && typeof a !== 'undefined').map((a: any) => String(a))
    }

    if (Array.isArray(q.parts)) {
      if (q.type === 'math') {
        // Math parts now support options and answers per part
        copy.parts = q.parts.map((p: any) => {
          const part: any = {
            text: typeof p === 'string' ? p : (p.text || ''),
            marks: p.marks ? Number(p.marks) : 1,
            part_type: p.part_type || 'text'
          }
          // If part has options, include them
          if (p.part_type !== 'text' && Array.isArray(p.options)) {
            part.options = p.options.map((opt: any) => {
              if (typeof opt === 'string') return { text: opt, is_correct: false }
              return { text: opt.text || '', is_correct: !!opt.is_correct }
            })
            // Include answers for MCQ/Multi parts
            if (Array.isArray(p.answers)) {
              part.answers = p.answers.filter((a: any) => a !== null && typeof a !== 'undefined').map((a: any) => String(a))
            }
          }
          return part
        }).filter((p: any) => (p.text || '').trim())
      } else if (q.type === 'code') {
        copy.parts = q.parts.map((p: any) => ({ text: typeof p === 'string' ? p : (p.text || ''), marks: p.marks ? Number(p.marks) : undefined })).filter((p: any) => (p.text || '').trim())
      } else if (q.type === 'fill_blank') {
        copy.parts = q.parts.filter((p: any) => typeof p === 'string' && p.trim() !== '')
      }
    }

    return copy
  }

  // restore any saved draft on initialization
  // NOTE: defer calling restoreProgress until the helper and progressKey
  // are defined further below to avoid referencing uninitialized bindings.

  // Helper: find File objects nested anywhere inside an object
  function findFilesInObject(obj: any, prefix = ''): Array<{ key: string; file: File }> {
    const found: Array<{ key: string; file: File }> = []
    try {
      if (!obj || typeof obj !== 'object') return found
      const stack: Array<{ cur: any; path: string }> = [{ cur: obj, path: prefix }]
      while (stack.length) {
        const { cur, path } = stack.pop() as { cur: any; path: string }
        if (!cur || typeof cur !== 'object') continue
        for (const k of Object.keys(cur)) {
          const v = cur[k]
          const p = path ? (path + '.' + k) : k
          try {
            if (typeof File !== 'undefined' && v instanceof File) {
              found.push({ key: p, file: v })
              continue
            }
          } catch (e) { }
          if (v && typeof v === 'object') stack.push({ cur: v, path: p })
        }
      }
    } catch (e) { }
    return found
  }

  /**
   * Builds FormData for sending questions with optional media files.
   * Unified approach for handling question media uploads.
   */
  function buildQuestionsFormData(questionsPayload: any[]): FormData {
    const form = new FormData()
    form.append('questions', JSON.stringify(questionsPayload))

    for (let i = 0; i < questions.value.length; i++) {
      const file = questions.value[i]?.media_file
      if (file instanceof File) {
        form.append(`question_media[${i}]`, file)
      }
    }

    return form
  }

  /**
   * Appends quiz and question data to a FormData object, handling nested files.
   * @param form - The FormData instance.
   * @param quizPayload - The quiz data payload.
   * @param questionsPayload - The sanitized questions array.
   */
  function appendQuizDataToForm(form: FormData, quizPayload: Record<string, any>, questionsPayload?: any[]) {
    Object.keys(quizPayload).forEach((k) => {
      const val = quizPayload[k]
      if (val === null || typeof val === 'undefined') return
      if (typeof val === 'boolean') {
        form.append(k, val ? '1' : '0')
        return
      }
      if (typeof val === 'object' && !(val instanceof File)) form.append(k, JSON.stringify(val))
      else form.append(k, val)
    })

    if (questionsPayload) {
      form.append('questions', JSON.stringify(questionsPayload))

      for (let i = 0; i < questions.value.length; i++) {
        const file = questions.value[i]?.media_file
        if (file instanceof File) form.append(`question_media[${i}]`, file)
      }
    }
  }

  function handleApiErrors(res: Response, data: unknown, errorRef: Ref<Record<string, string[]>>): boolean {
    if (res.ok) {
      errorRef.value = {}
      return false
    }

    const mappedErrors: Record<string, string[]> = {}
    const rawMessages: string[] = []
    let alertMessage = `Request failed with status ${res.status}`
    let alertType: 'error' | 'warning' = 'error'

    if (isApiError(data)) {
      if (data.message) {
        alertMessage = data.message
        rawMessages.push(data.message)
      }
      if (data.errors) {
        const fieldMap: Record<string, string> = {
          title: '_title',
          name: '_title',
          grade: '_grade',
          grade_id: '_grade',
          subject: '_subject',
          subject_id: '_subject',
          topic: '_topic',
          topic_id: '_topic',
        }
        Object.entries(data.errors).forEach(([key, messages]) => {
          if (!Array.isArray(messages) || messages.length === 0) return
          const mappedKey = fieldMap[key] || key
          const current = mappedErrors[mappedKey] || []
          mappedErrors[mappedKey] = current.concat(messages)
          rawMessages.push(...messages)
        })
      }
    }

    if (res.status === 422) {
      if (!alertMessage || alertMessage === `Request failed with status ${res.status}`) {
        alertMessage = 'Please fix the highlighted errors.'
      }
    } else if (res.status === 403) {
      alertType = 'warning'
      if (mappedErrors._topic?.length) {
        rawMessages.push(...mappedErrors._topic)
      }
    }

    if (rawMessages.length) {
      mappedErrors._raw = Array.from(new Set(rawMessages))
    } else if (alertMessage) {
      mappedErrors._raw = [alertMessage]
    }

    errorRef.value = mappedErrors
    alert.push({
      type: alertType,
      message: alertMessage,
    })

    return true
  }

  /**
   * Helper to perform the actual API request for saving quiz data.
   * centralized logic for:
   * - determining POST vs PATCH
   * - handling FormData (files) vs JSON
   * - error handling
   */
  async function performSaveRequest(
    payload: any,
    questionsPayload: any[] | undefined,
    errorRef: Ref<Record<string, string[]>>,
    files: Array<File | undefined> = []
  ) {
    const method = quizId.value ? 'PATCH' : 'POST'
    const url = quizId.value ? `/api/quizzes/${quizId.value}` : '/api/quizzes'

    let res: Response
    // check if we have any actual files to upload
    const hasFiles = files.some(f => f instanceof File)

    if (hasFiles) {
      const formData = new FormData()
      if (method === 'PATCH') formData.append('_method', 'PATCH')

      // If we have questionsPayload, we pass it to the form builder
      // otherwise we just pass the quiz payload
      appendQuizDataToForm(formData, payload, questionsPayload)

      res = await api.postFormData(url, formData)
    } else {
      // JSON path
      const finalPayload = questionsPayload
        ? { ...payload, questions: questionsPayload }
        : payload

      if (method === 'PATCH') {
        res = await api.patchJson(url, finalPayload)
      } else {
        res = await api.postJson(url, finalPayload)
      }
    }

    if (api.handleAuthStatus(res)) {
      alert.push({ type: 'warning', message: 'Session expired — please sign in again' })
      return null
    }

    const data = await res.json().catch(() => null)

    if (handleApiErrors(res, data, errorRef)) {
      return null
    }

    return data
  }

  function setTab(tab: any) {
    activeTab.value = tab
  }

  function reset() {
    quiz.value = { ...initialForm }
    originalForm.value = null
    questions.value = []
    quizId.value = null
    activeTab.value = 'details'
  }

  async function saveDetails() {
    if (!isDetailsValid.value) {
      alert.push({ type: 'warning', message: 'Please fill in all quiz details.' })
      return false
    }
    isSubmitting.value = true
    try {
      const payload = buildQuizPayload(true, false)
      const coverFile = quiz.value.cover_file

      const data = await performSaveRequest(
        { ...payload, cover: coverFile }, // pass cover explicitly if needed by form builder, though appendQuizDataToForm handles keys
        undefined, // no questions for partial save
        detailsErrors,
        [coverFile]
      )

      if (!data) return false

      detailsErrors.value = {}

      const returnedQuiz = (data && (data.quiz || (data.data && data.data.quiz))) ? (data.quiz || data.data.quiz) : (data && data.data && data.data.id ? data.data : (data && data.id ? data : null))
      if (returnedQuiz && returnedQuiz.id) {
        quizId.value = returnedQuiz.id

        // Merge returned quiz data, ensuring taxonomy IDs are numbers
        const merged = { ...quiz.value, ...returnedQuiz }
        if (merged.grade_id) merged.grade_id = Number(merged.grade_id)
        if (merged.level_id) merged.level_id = Number(merged.level_id)
        if (merged.subject_id) merged.subject_id = Number(merged.subject_id)
        if (merged.topic_id) merged.topic_id = Number(merged.topic_id)

        // Ensure objects are preserved if not returned by server (server might return IDs but not full relations immediately)
        // But if server returns null for ID, we should likely clear the object too? 
        // For now, prioritize server IDs. If server returns IDs, we trust them.
        // If server response lacks relations (level, grade objects), keep local ones IF IDs match.
        // Actually, simplest fix for "parsing": ensure IDs are numbers.

        quiz.value = merged
        originalForm.value = JSON.parse(JSON.stringify(quiz.value))
        detailsSaved.value = true
      } else {
        console.error('API response missing quiz object:', data)
      }
      persistProgress()
      alert.push({ type: 'success', message: 'Quiz details saved!' })
      return true
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: e.message })
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function saveQuiz() {
    if (!isDetailsValid.value) {
      alert.push({ type: 'warning', message: 'Please fill in all quiz details.' });
      return false;
    }
    isSubmitting.value = true;
    try {
      const payload = buildQuizPayload(true, true);
      const sanitizedQuestions = questions.value.map(q => sanitizeQuestionForPayload(q));

      const coverFile = quiz.value.cover_file;
      // Collect all question media files
      const questionFiles = questions.value.map(q => q.media_file).filter(f => f instanceof File)
      const allFiles = (coverFile instanceof File) ? [coverFile, ...questionFiles] : questionFiles

      // If cover is file, ensure it's in payload
      if (coverFile instanceof File) {
        (payload as any).cover = coverFile
      }

      const data = await performSaveRequest(
        payload,
        sanitizedQuestions,
        detailsErrors, // Use detailsErrors for general main errors? or maybe separate? Reusing matching existing logic
        allFiles as File[]
      )

      if (!data) return false

      detailsErrors.value = {};
      const returnedQuiz = (data && (data.quiz || (data.data && data.data.quiz))) ? (data.quiz || data.data.quiz) : (data && data.data && data.data.id ? data.data : (data && data.id ? data : null))
      if (returnedQuiz && returnedQuiz.id) {
        quizId.value = returnedQuiz.id;
        try { quiz.value = { ...quiz.value, ...returnedQuiz } } catch (e) { }
        if (Array.isArray(returnedQuiz.questions) && returnedQuiz.questions.length) {
          questions.value = returnedQuiz.questions.map((q: any, idx: number) => normalizeQuestionForEditor(q))
        }
        originalForm.value = JSON.parse(JSON.stringify(quiz.value))
      } else {
        console.error('API response missing quiz object:', data);
      }
      detailsSaved.value = true;
      questionsSaved.value = true;
      persistProgress();
      alert.push({ type: 'success', message: 'Quiz saved successfully!' });
      return true;
    } catch (err: unknown) {
      const e = err as Error;
      alert.push({ type: 'error', message: e.message });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function saveSettings() {
    if (!quizId.value) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return false
    }
    isSubmitting.value = true
    try {
      const payload = buildQuizPayload(true, true)

      // Settings only updates, so it relies on existing quiz id.
      // Reuse performSaveRequest, passing undefined for questions.
      const data = await performSaveRequest(
        payload,
        undefined,
        settingsErrors
      )

      if (!data) return false

      settingsErrors.value = {}
      alert.push({ type: 'success', message: 'Settings saved successfully!' })
      settingsSaved.value = true

      // Update local state if needed (usually settings are already in sync because of v-model)
      originalForm.value = JSON.parse(JSON.stringify(quiz.value))

      persistProgress()
      return true
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: e.message })
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Helper: checks if a question object contains any File objects
   */
  function questionContainsFile(q: any): boolean {
    if (!q || typeof q !== 'object') return false
    for (const k in q) {
      try {
        if (typeof File !== 'undefined' && q[k] instanceof File) return true
      } catch (e) { }
    }
    return false
  }

  /**
   * Builds FormData for a single question with media.
   */
  function buildQuestionFormData(sanitizedQuestion: any, question: any): FormData {
    const form = new FormData()

    for (const k in question) {
      try {
        if (typeof File !== 'undefined' && question[k] instanceof File) {
          form.append('media', question[k])
        }
      } catch (e) { }
    }

    Object.keys(sanitizedQuestion).forEach((k) => {
      const v: any = sanitizedQuestion[k]
      if (v === null || typeof v === 'undefined') return
      if (typeof v === 'object') form.append(k, JSON.stringify(v))
      else form.append(k, String(v))
    })

    return form
  }

  async function saveQuestion(question: any) {
    if (!quizId.value) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return
    }
    try {
      try { console.debug('saveQuestion:start', { quizId: quizId.value, uid: question?.uid || question?.id, type: question?.type }) } catch (e) { }

      const sanitizedQuestion = sanitizeQuestionForPayload(question)
      try { console.debug('saveQuestion: payload', { quizId: quizId.value, sanitizedQuestion }) } catch (e) { }

      let res: Response
      const hasFile = questionContainsFile(question)

      // If the question has an existing server id, perform a per-question PATCH (partial update).
      // This keeps payloads small and uses the server's single-question update endpoint.
      if (question && question.id) {
        // Update existing question
        try { console.debug(`PATCH /api/questions/${question.id}`, sanitizedQuestion) } catch (e) { }
        if (hasFile) {
          const form = buildQuestionFormData(sanitizedQuestion, question)
          // multipart doesn't support PATCH verb reliably; emulate with _method
          form.append('_method', 'PATCH')
          res = await api.postFormData(`/api/questions/${question.id}`, form)
        } else {
          res = await api.patchJson(`/api/questions/${question.id}`, sanitizedQuestion)
        }
      } else {
        // Create new question under the quiz (existing behavior)
        try { console.debug(`POST /api/quizzes/${quizId.value}/questions`, sanitizedQuestion) } catch (e) { }
        if (hasFile) {
          const form = buildQuestionFormData(sanitizedQuestion, question)
          res = await api.postFormData(`/api/quizzes/${quizId.value}/questions`, form)
        } else {
          res = await api.postJson(`/api/quizzes/${quizId.value}/questions`, sanitizedQuestion)
        }
      }

      if (api.handleAuthStatus(res)) return
      if (!res.ok) throw new Error('Failed to save question')

      const data = await res.json().catch(() => null)
      try { console.debug('saveQuestion:response', { status: res.status, body: data }) } catch (e) { }

      const idx = questions.value.findIndex(q => q.uid === question.uid || (q.id && question.id && q.id === question.id))
      // prefer server-returned question payload when available
      const returned = data?.question || data?.data || data
      if (idx !== -1 && returned) {
        const norm = normalizeQuestionForEditor(returned)
        if (question.uid) norm.uid = question.uid
        questions.value.splice(idx, 1, norm)
      } else if (returned) {
        const norm = normalizeQuestionForEditor(returned)
        questions.value.push(norm)
      }
      questionsSaved.value = true
      alert.push({ type: 'success', message: 'Question saved' })
    } catch (err: unknown) {
      try { console.debug('saveQuestion:error', { err: (err as any)?.message || String(err) }) } catch (e) { }
      const e = err as Error
      try {
        if ((err as any)?.response && (err as any).response.status === 422) {
          const data = await (err as any).response.json().catch(() => null)
          if (data?.errors) {
            const uid = question.uid || question.id || Math.random().toString(36).slice(2)
            const msgs: string[] = []
            Object.keys(data.errors).forEach(k => {
              const arr = data.errors[k] || []
              msgs.push(...arr)
            })
            questionsErrors.value = { ...questionsErrors.value, [uid]: msgs }
          }
        }
      } catch (ex) { }

      alert.push({ type: 'error', message: e.message })
    }
  }



  async function submitQuiz() {
    isSubmitting.value = true;
    try {
      const success = await saveQuiz();
      if (success) {
        lastCreated.value = { ...quiz.value, id: quizId.value };
        alert.push({ type: 'success', message: 'Quiz published successfully!' });
        clearProgress();
      }
      return success;
    } catch (err: unknown) {
      const e = err as Error;
      alert.push({ type: 'error', message: e.message });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function loadQuiz(id: any) {
    try {
      const res = await api.get(`/api/quizzes/${id}`)
      const { addTopic, grades: taxGrades, levels: taxLevels, subjects: taxSubjects, topics: taxTopics } = useTaxonomy()

      if (res.ok) {
        const data = await res.json()
        const serverQuiz = data.quiz || data.data || data || {}
        const loaded: any = { ...initialForm, ...serverQuiz }

        loaded.level_id = serverQuiz.level_id ?? serverQuiz.level?.id ?? serverQuiz.grade?.level?.id ?? serverQuiz.levelId ?? null
        loaded.grade_id = serverQuiz.grade_id ?? serverQuiz.grade?.id ?? null
        loaded.subject_id = serverQuiz.subject_id ?? serverQuiz.subject?.id ?? null
        loaded.topic_id = serverQuiz.topic_id ?? serverQuiz.topic?.id ?? null

        loaded.level = serverQuiz.level || serverQuiz.grade?.level || (serverQuiz.level_name ? { id: loaded.level_id, name: serverQuiz.level_name } : (serverQuiz.levelName ? { id: loaded.level_id, name: serverQuiz.levelName } : null));
        loaded.grade = serverQuiz.grade || (loaded.grade_id ? { id: loaded.grade_id, name: serverQuiz.grade_name } : null);
        loaded.subject = serverQuiz.subject || (loaded.subject_id ? { id: loaded.subject_id, name: serverQuiz.subject_name } : null);
        loaded.topic = serverQuiz.topic || (loaded.topic_id ? { id: loaded.topic_id, name: serverQuiz.topic_name } : null);

        // Set timer mode first to determine which timer field to populate
        loaded.use_per_question_timer = serverQuiz.use_per_question_timer ?? initialForm.use_per_question_timer

        // Convert timer_seconds back to timer_minutes for the UI. 
        // When editing, if use_per_question_timer is true, timer_seconds will be null and we use timer_minutes default
        if (serverQuiz.use_per_question_timer) {
          // Per-question mode: use per_question_seconds from server
          loaded.per_question_seconds = serverQuiz.per_question_seconds ?? initialForm.per_question_seconds
          loaded.timer_minutes = initialForm.timer_minutes
        } else {
          // Overall timer mode: convert timer_seconds to minutes
          if (serverQuiz.timer_seconds && Number(serverQuiz.timer_seconds) > 0) {
            loaded.timer_minutes = Math.floor(Number(serverQuiz.timer_seconds) / 60)
          } else {
            loaded.timer_minutes = initialForm.timer_minutes
          }
          loaded.per_question_seconds = initialForm.per_question_seconds
        }
        loaded.attempts_allowed = serverQuiz.attempts_allowed ?? initialForm.attempts_allowed
        loaded.shuffle_questions = serverQuiz.shuffle_questions ?? initialForm.shuffle_questions
        loaded.shuffle_answers = serverQuiz.shuffle_answers ?? initialForm.shuffle_answers
        loaded.access = serverQuiz.access ?? (serverQuiz.is_paid ? 'paywall' : initialForm.access)
        loaded.one_off_price = serverQuiz.one_off_price ?? initialForm.one_off_price
        loaded.visibility = serverQuiz.visibility ?? initialForm.visibility

        if (serverQuiz.cover_image) {
          loaded.cover_image = serverQuiz.cover_image
          loaded.cover = serverQuiz.cover_image
        }

        loaded.topic = loaded.topic || (loaded.topic_id ? { id: loaded.topic_id } : null)
        loaded.subject = loaded.subject || (loaded.subject_id ? { id: loaded.subject_id } : null)
        loaded.grade = loaded.grade || (loaded.grade_id ? { id: loaded.grade_id } : null)
        loaded.level = loaded.level || (loaded.level_id ? { id: loaded.level_id } : null)

        // CRITICAL FIX: Add the loaded taxonomy objects to the composable caches
        // so they're available in the dropdowns/pickers when displaying the quiz
        // This ensures preselection works correctly

        // Ensure level is in the levels ref if it was loaded from server
        if (loaded.level && loaded.level.id) {
          try {
            if (!taxLevels.value.find((l: any) => String(l.id) === String(loaded.level.id))) {
              taxLevels.value = [...taxLevels.value, loaded.level]
            }
          } catch (e) { }
        }

        // Ensure grade is in the grades ref if it was loaded from server
        if (loaded.grade && loaded.grade.id) {
          try {
            if (!taxGrades.value.find((g: any) => String(g.id) === String(loaded.grade.id))) {
              taxGrades.value = [...taxGrades.value, loaded.grade]
            }
          } catch (e) { }
        }

        // Ensure subject is in the subjects ref if it was loaded from server
        if (loaded.subject && loaded.subject.id) {
          try {
            if (!taxSubjects.value.find((s: any) => String(s.id) === String(loaded.subject.id))) {
              taxSubjects.value = [...taxSubjects.value, loaded.subject]
            }
          } catch (e) { }
        }

        // If the specific topic is not in the initial list for the subject, fetch it directly
        // This ensures the TaxonomyPicker can display the selection correctly.
        if (loaded.topic_id && serverQuiz.topic) {
          try {
            // The useTaxonomy composable returns a singleton, so this updates the shared state
            addTopic(serverQuiz.topic)
          } catch (e) {
            // This might fail if useTaxonomy is not initialized, but it's a safe attempt.
          }
        }
        // Ensure the full topic object is on the quiz object for the picker
        if (loaded.topic_id && !loaded.topic) {
          loaded.topic = serverQuiz.topic || { id: loaded.topic_id, name: serverQuiz.topic_name || `Topic #${loaded.topic_id}` }
        }

        quiz.value = loaded

        const rawQuestions = Array.isArray(serverQuiz.questions) ? serverQuiz.questions : []
        // Normalize questions using the shared normalizer so fields like `open`, `text`, `options`,
        // and `uid` are consistently present for the editor UI. This fixes issues when editing
        // existing quizzes where the incoming question objects may not contain editor-specific
        // fields and the editor couldn't open or render correctly.
        questions.value = rawQuestions.map((q: any, idx: number) => normalizeQuestionForEditor(q))
        quizId.value = serverQuiz.id || id

        detailsSaved.value = !!(quiz.value.title && quiz.value.grade_id && quiz.value.subject_id && quiz.value.topic_id)
        settingsSaved.value = true
        questionsSaved.value = Array.isArray(questions.value) && questions.value.length > 0

        // Deep copy loaded state to originalForm
        originalForm.value = JSON.parse(JSON.stringify(quiz.value))
      }
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: 'Failed to load quiz data.' })
    }
  }

  // Persist progress flags locally so users don't lose progress on refresh
  const progressKey = computed(() => `quiz:create:progress:${quizId.value || 'draft'}`)

  function persistProgress() {
    try {
      const payload = {
        detailsSaved: detailsSaved.value,
        settingsSaved: settingsSaved.value,
        questionsSaved: questionsSaved.value,
        quiz: quiz.value,
        questions: questions.value
      }
      localStorage.setItem(progressKey.value, JSON.stringify(payload))
    } catch (e) {
      // ignore localStorage errors
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(progressKey.value)
    } catch (e) {
      // ignore
    }
  }

  function restoreProgress() {
    try {
      const raw = localStorage.getItem(progressKey.value)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.quiz) quiz.value = parsed.quiz
      if (Array.isArray(parsed?.questions)) questions.value = parsed.questions
      detailsSaved.value = !!parsed?.detailsSaved
      settingsSaved.value = !!parsed?.settingsSaved
      questionsSaved.value = !!parsed?.questionsSaved
    } catch (e) {
      // ignore parse errors
    }
  }

  // Restore any saved draft on initialization (client-side only).
  // We defer this call until progressKey and restoreProgress are defined.
  if (typeof window !== 'undefined') {
    try { restoreProgress() } catch (e) { /* ignore */ }
  }

  // Persist progress to localStorage with a debounce to avoid excessive writes.
  // A deep watch ensures any change to the quiz or questions object triggers it.
  watchDebounced([quiz, questions], () => {
    persistProgress()
  }, { debounce: 500, deep: true })

  // Cleanup function to reset store state
  function cleanup() {
    quiz.value = { ...initialForm }
    originalForm.value = null
    questions.value = []
    questionsErrors.value = {}
    detailsErrors.value = {}
    settingsErrors.value = {}
    quizId.value = null
    lastCreated.value = null
    detailsSaved.value = false
    settingsSaved.value = false
    questionsSaved.value = false
    isSubmitting.value = false
    isSaving.value = false
    activeTab.value = 'details'
    clearProgress()
  }

  // Setup cleanup handlers
  function setupCleanup() {
    if (process.client) {
      const unloadHandler = () => {
        // Only warn about navigation when creating a new quiz (no quizId)
        if (!quizId.value) {
          persistProgress()
        }
      }
      window.addEventListener('beforeunload', unloadHandler)

      // Return a cleanup function so the calling component can register
      // its own onBeforeUnmount and call this to remove listeners.
      return () => {
        try { window.removeEventListener('beforeunload', unloadHandler) } catch (e) { }
        try { cleanup() } catch (e) { }
      }
    }
    // If not running in client, return noop
    return () => { }
  }

  function addQuestion(q?: any) {
    const newQuestion = normalizeQuestionForEditor(q || {});
    questions.value.push(newQuestion);
  }

  /**
   * Validates the complete quiz before final submission.
   * Checks all three sections: details, settings, and questions.
   * @returns Object with validation result and error messages
   */
  function validateBeforeSubmit(): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    // Validate details
    if (!quiz.value.title || !quiz.value.title.trim()) {
      errors._title = ['Title is required']
    }
    if (!quiz.value.grade_id) {
      errors._grade = ['Grade is required']
    }
    if (!quiz.value.subject_id) {
      errors._subject = ['Subject is required']
    }
    if (!quiz.value.topic_id) {
      errors._topic = ['Topic is required']
    }

    // Validate settings
    // Check timer is properly configured (either total timer or per-question timer)
    const hasTotalTimer = Number(quiz.value.timer_minutes) > 0
    const hasPerQuestionTimer = quiz.value.use_per_question_timer && Number(quiz.value.per_question_seconds) > 0

    if (!hasTotalTimer && !hasPerQuestionTimer) {
      errors._timer = ['Please set a time limit or enable per-question timer']
    }

    // Debug: log validation state
    try {
      console.debug('validateBeforeSubmit: timer validation', {
        use_per_question_timer: quiz.value.use_per_question_timer,
        timer_minutes: quiz.value.timer_minutes,
        per_question_seconds: quiz.value.per_question_seconds,
        hasTotalTimer,
        hasPerQuestionTimer,
        hasTimerError: !!errors._timer
      })
    } catch (e) { }

    // Validate questions
    if (!Array.isArray(questions.value) || questions.value.length === 0) {
      errors._questions = ['At least one question is required']
    } else {
      // Validate individual questions
      const invalidQuestions: string[] = []
      for (let i = 0; i < questions.value.length; i++) {
        const q = questions.value[i]
        if (!q || !q.text || !q.text.trim()) {
          invalidQuestions.push(`Question ${i + 1}: Missing question text`)
        }
        if (q && (!q.options || q.options.length < 2) && ['mcq', 'multi'].includes(q.type)) {
          invalidQuestions.push(`Question ${i + 1}: Multiple choice needs at least 2 options`)
        }
        if (q && (!q.answers || q.answers.length === 0)) {
          invalidQuestions.push(`Question ${i + 1}: Missing correct answer(s)`)
        }
      }
      if (invalidQuestions.length > 0) {
        errors._questions = invalidQuestions
      }
    }

    const isValid = Object.keys(errors).length === 0

    if (!isValid) {
      try { console.debug('validateBeforeSubmit: validation failed', errors) } catch (e) { }
    }

    return { isValid, errors }
  }

  /**
   * Gets complete preview data for the review modal.
   * Consolidates all quiz information into a single object.
   * @returns Preview data object with quiz, questions, and stats
   */
  function getPreviewData() {
    const stats = {
      totalQuestions: questions.value.length,
      totalMarks: questions.value.reduce((sum, q) => sum + (Number(q.marks) || 0), 0),
      avgDifficulty: questions.value.length
        ? (questions.value.reduce((sum, q) => sum + (Number(q.difficulty) || 0), 0) / questions.value.length).toFixed(1)
        : 0
    }

    return {
      quiz: { ...quiz.value },
      questions: questions.value.map(q => ({
        uid: q.uid,
        type: q.type,
        text: q.text,
        marks: q.marks,
        difficulty: q.difficulty,
        options: q.options?.slice(0, 3) // Include first 3 options for preview
      })),
      stats
    }
  }

  /**
   * Final submission flow - validates completely then submits quiz.
   * This is the ultimate publish action after user confirms in preview modal.
   * @returns Promise resolving to success/failure
   */
  async function submitFinalPayload(): Promise<boolean> {
    // Clear any previous error
    publishError.value = null
    isSubmitting.value = true

    try {
      // Step 1: Validate everything
      const validation = validateBeforeSubmit()
      try { console.debug('submitFinalPayload: validation result', { isValid: validation.isValid, errors: validation.errors }) } catch (e) { }

      if (!validation.isValid) {
        // Set errors on appropriate error objects
        detailsErrors.value = { ...validation.errors }

        // Collect error messages for the user
        const errorMessages: string[] = []
        Object.entries(validation.errors).forEach(([key, msgs]) => {
          if (Array.isArray(msgs)) {
            errorMessages.push(...msgs)
          }
        })

        // Set publish error for modal display
        publishError.value = {
          message: 'Please fix the highlighted errors before publishing',
          details: errorMessages
        }

        alert.push({
          type: 'warning',
          message: 'Please fix the highlighted errors before publishing'
        })
        try { console.debug('submitFinalPayload: validation failed', { errors: validation.errors, errorMessages }) } catch (e) { }
        return false
      }

      // Step 2: Clear any previous errors
      detailsErrors.value = {}
      settingsErrors.value = {}
      questionsErrors.value = {}

      // Step 3: Attempt final submission
      try {
        const success = await submitQuiz()
        if (success) {
          try { console.debug('submitFinalPayload: quiz published successfully', { quizId: quizId.value }) } catch (e) { }
          alert.push({
            type: 'success',
            message: 'Quiz published successfully!'
          })
          publishError.value = null
        } else {
          // submitQuiz failed - set a generic error
          publishError.value = {
            message: 'Failed to publish quiz. Please try again.'
          }
        }
        return success
      } catch (err: unknown) {
        const e = err as Error
        publishError.value = {
          message: e.message || 'Failed to publish quiz'
        }
        alert.push({
          type: 'error',
          message: e.message || 'Failed to publish quiz'
        })
        try { console.debug('submitFinalPayload: error', e) } catch (err2) { }
        return false
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    quiz,
    originalForm,
    questions,
    questionsErrors,
    detailsErrors,
    settingsErrors,
    publishError,
    quizId,
    lastCreated,
    detailsSaved,
    settingsSaved,
    questionsSaved,
    isSubmitting,
    isSaving,
    activeTab,
    isDetailsValid,
    setTab,
    reset,
    saveDetails,
    saveSettings,
    saveQuestion,
    submitQuiz,
    loadQuiz,
    clearProgress,
    setupCleanup,
    addQuestion,
    validateBeforeSubmit,
    getPreviewData,
    submitFinalPayload
  }
})
