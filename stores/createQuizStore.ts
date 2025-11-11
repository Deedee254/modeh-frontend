
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
    if (result.attempts_allowed === '') result.attempts_allowed = null
    if (result.per_question_seconds === '') result.per_question_seconds = null
    
    result.topic_id = result.topic_id ? (Number(result.topic_id) || null) : null
    result.subject_id = result.subject_id ? (Number(result.subject_id) || null) : null
    result.grade_id = result.grade_id ? (Number(result.grade_id) || null) : null
    result.level_id = result.level_id ? (Number(result.level_id) || null) : null
    
    result.attempts_allowed = (() => {
      const raw = result.attempts_allowed
      if (raw === '' || raw === null || typeof raw === 'undefined') return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    })()
    
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
    }
    
    if (includeTimers) {
      payload.timer_seconds = normalized.use_per_question_timer ? null : (normalized.timer_minutes ? Number(normalized.timer_minutes) * 60 : null)
      payload.per_question_seconds = normalized.use_per_question_timer ? Number(normalized.per_question_seconds || 0) : null
      payload.use_per_question_timer = Boolean(normalized.use_per_question_timer)
    }
    
    if (includeSettings) {
      payload.attempts_allowed = normalized.attempts_allowed
      payload.shuffle_questions = Boolean(normalized.shuffle_questions)
      payload.shuffle_answers = Boolean(normalized.shuffle_answers)
      payload.access = normalized.access
      payload.visibility = normalized.visibility
    }
    
    return payload
  }

  /**
   * Normalizes a question object for use in the editor components.
   * Ensures a consistent structure for options, correct answers, etc.
   * @param q The raw question object.
   * @returns A normalized question object.
   */
  function normalizeQuestionForEditor(q: any) {
    const question = JSON.parse(JSON.stringify(q || {}))

    // Ensure all necessary fields exist to prevent reactivity issues
    if (!question.uid) question.uid = Math.random().toString(36).substring(2);
    if (typeof question.open === 'undefined') question.open = true;
    if (typeof question.is_banked === 'undefined') question.is_banked = false;
    if (typeof question.difficulty === 'undefined') question.difficulty = 2;
    if (typeof question.marks === 'undefined') question.marks = 1;
    // Populate the editor text from common server-side fields if present.
    // Some API responses use `body` or `question` while the editor expects `text`.
    if (typeof question.text === 'undefined' || question.text === null) {
      if (typeof question.body === 'string' && question.body.trim() !== '') {
        question.text = question.body
      } else if (typeof question.question === 'string' && question.question.trim() !== '') {
        question.text = question.question
      } else {
        question.text = '<p></p>'
      }
    }

    // Ensure explanation is present for the editor. Some server responses may use
    // `explain` or `explanation` keys; prefer `explanation` but fall back to others.
    if (typeof question.explanation === 'undefined' || question.explanation === null) {
      if (typeof question.explain === 'string' && question.explain.trim() !== '') {
        question.explanation = question.explain
      } else if (typeof question.explanation === 'string') {
        // keep as-is (already string)
      } else {
        question.explanation = ''
      }
    }

    // Use a consistent structure for options: always array of objects for the editor
    if (Array.isArray(question.options)) {
      // If options are objects, derive answers from any `is_correct` flags.
      if (question.options.length > 0 && typeof question.options[0] === 'object') {
        const corrects: number[] = []
        question.options.forEach((opt: any, i: number) => {
          if (opt.is_correct) corrects.push(i)
        })
        if (question.type === 'mcq') {
          question.answers = corrects.length > 0 ? [String(corrects[0])] : (Array.isArray(question.answers) ? question.answers.map(String) : [])
        } else if (question.type === 'multi') {
          question.answers = corrects.length > 0 ? corrects.map(i => String(i)) : (Array.isArray(question.answers) ? question.answers.map(String) : [])
        }
      } else if (question.options.length > 0 && typeof question.options[0] === 'string') {
        // Convert string options to object format
        question.options = question.options.map((text: string) => ({ text: text || '', is_correct: false }))

        // If the source question supplied `correct` or `corrects` (from CSV/import or API), mark those indices
        // and populate `answers` so the editor and payload builders are consistent.
        const setCorrectIndices: number[] = []
        if (typeof question.correct === 'number') {
          setCorrectIndices.push(question.correct)
        } else if (Array.isArray(question.corrects)) {
          question.corrects.forEach((c: any) => {
            if (typeof c === 'number' || (typeof c === 'string' && /^\d+$/.test(c))) setCorrectIndices.push(Number(c))
          })
        } else if (Array.isArray(question.answers)) {
          // answers may be strings or numbers referencing option positions or option text
          question.answers.forEach((a: any) => {
            if (typeof a === 'number' || (typeof a === 'string' && /^\d+$/.test(a))) {
              setCorrectIndices.push(Number(a))
            } else if (typeof a === 'string') {
              const idx = question.options.findIndex((o: any) => String(o.text).trim() === String(a).trim())
              if (idx >= 0) setCorrectIndices.push(idx)
            }
          })
        }

        if (setCorrectIndices.length) {
          setCorrectIndices.forEach(i => {
            if (i >= 0 && i < question.options.length) question.options[i].is_correct = true
          })
          if (question.type === 'mcq') {
            question.answers = [String(setCorrectIndices[0])]
          } else if (question.type === 'multi') {
            question.answers = setCorrectIndices.map(i => String(i))
          }
        }
      }
    }

    if (!Array.isArray(question.options) || question.options.length === 0) {
      question.options = [
        { text: '', is_correct: true },
        { text: '', is_correct: false }
      ]
    }
    if (!Array.isArray(question.answers)) question.answers = []

    return question
  }
  function sanitizeQuestionForPayload(q: any) {
    try {
      if (!q || typeof q !== 'object') return q

      const copy: any = {
        type: q.type,
        body: q.body || q.text || '',
        explanation: q.explanation || null,
        difficulty: (typeof q.difficulty !== 'undefined' && q.difficulty !== null) ? Number(q.difficulty) : 3,
        marks: (typeof q.marks !== 'undefined' && q.marks !== null) ? Number(q.marks) : 1
      }

      // Preserve taxonomy ids when present so imported questions carry grade/level/subject/topic
      try {
        if (typeof q.grade_id !== 'undefined' && q.grade_id !== null) copy.grade_id = q.grade_id
        else if (q.grade && typeof q.grade.id !== 'undefined') copy.grade_id = q.grade.id

        if (typeof q.level_id !== 'undefined' && q.level_id !== null) copy.level_id = q.level_id
        else if (q.level && typeof q.level.id !== 'undefined') copy.level_id = q.level.id

        if (typeof q.subject_id !== 'undefined' && q.subject_id !== null) copy.subject_id = q.subject_id
        else if (q.subject && typeof q.subject.id !== 'undefined') copy.subject_id = q.subject.id

        if (typeof q.topic_id !== 'undefined' && q.topic_id !== null) copy.topic_id = q.topic_id
        else if (q.topic && typeof q.topic.id !== 'undefined') copy.topic_id = q.topic.id
      } catch (e) {}

    if (q.media_type) {
      copy.media_type = q.media_type
      if (q.media_path) copy.media_path = q.media_path
      if (q.youtube_url) copy.youtube_url = q.youtube_url;
      if (q.media_metadata) copy.media_metadata = { ...q.media_metadata };
    }

    if (Array.isArray(q.options)) {
      copy.options = q.options.map((opt: any) => {
        // Handle both string and object formats
        if (typeof opt === 'string') {
          return { text: opt, is_correct: false }
        }
        return {
          text: opt.text || '',
          is_correct: !!opt.is_correct
        }
      })
    }

    // Handle correct answer for MCQ
    if (Array.isArray(q.answers)) {
      // Ensure all answers are strings for consistency
      copy.answers = q.answers
        .filter((a: any) => a !== null && typeof a !== 'undefined')
        .map((a: any) => String(a))
    }

    if (Array.isArray(q.parts)) {
      if (q.type === 'math' || q.type === 'code') {
        copy.parts = q.parts.map((p: any) => ({
          text: typeof p === 'string' ? p : (p.text || ''),
          marks: q.type === 'math' ? (p.marks ? Number(p.marks) : 1) : undefined
        })).filter((p: { text: string }) => p.text.trim())
      } else if (q.type === 'fill_blank') {
        // Filter out any empty strings from the parts for fill_blank questions.
        copy.parts = q.parts.filter((p: any) => typeof p === 'string' && p.trim() !== '');
      }
    }

    return copy
    } catch (e) {
      // Defensive fallback: never throw from sanitizer. Return a minimal payload
      try { console.error('sanitizeQuestionForPayload:error', e) } catch (ex) {}
      // Include options in fallback as they are often required by MCQ-type questions
      const fallbackOptions = (q && Array.isArray(q.options)) ? q.options.map((opt: any) => {
        if (!opt) return { text: '', is_correct: false }
        if (typeof opt === 'string') return { text: opt, is_correct: false }
        return { text: String(opt.text ?? opt.value ?? ''), is_correct: Boolean(opt.is_correct) }
      }) : [ { text: '', is_correct: false }, { text: '', is_correct: false } ]

      return {
        type: (q && q.type) ? q.type : 'mcq',
        body: (q && (q.body || q.text)) ? (q.body || q.text) : '',
        difficulty: (q && typeof q.difficulty !== 'undefined' && q.difficulty !== null) ? q.difficulty : 3,
        marks: (q && typeof q.marks !== 'undefined' && q.marks !== null) ? q.marks : 1,
        options: fallbackOptions,
      }
    }
  }

  // restore any saved draft on initialization
  if (typeof window !== 'undefined') {
    try { restoreProgress() } catch (e) { /* ignore */ }
  }

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
          } catch (e) {}
          if (v && typeof v === 'object') stack.push({ cur: v, path: p })
        }
      }
    } catch (e) {}
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

  function setTab(tab: any) {
    activeTab.value = tab
  }

  function reset() {
    quiz.value = { ...initialForm }
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

      const method = quizId.value ? 'PATCH' : 'POST'
      const url = quizId.value ? `/api/quizzes/${quizId.value}` : '/api/quizzes'
      
      let res: Response;
      const coverFile = quiz.value.cover_file
      if (coverFile instanceof File) {
        const formData = new FormData()
        if (method === 'PATCH') formData.append('_method', 'PATCH')
        appendQuizDataToForm(formData, { ...payload, cover: coverFile })
        res = await api.postFormData(url, formData)
      } else {
        if (method === 'PATCH') {
          res = await api.patchJson(url, payload)
        } else {
          res = await api.postJson(url, payload)
        }
      }

      if (api.handleAuthStatus(res)) {
        alert.push({ type: 'warning', message: 'Session expired — please sign in again' })
        return false
      }
      const data = await res.json().catch(() => null)

      if (handleApiErrors(res, data, detailsErrors)) {
        return false
      }

      detailsErrors.value = {}

      try { console.debug('saveDetails: api response', data) } catch (e) {}
      const returnedQuiz = (data && (data.quiz || (data.data && data.data.quiz))) ? (data.quiz || data.data.quiz) : (data && data.data && data.data.id ? data.data : (data && data.id ? data : null))
      if (returnedQuiz && returnedQuiz.id) {
        quizId.value = returnedQuiz.id
        const { level, grade, subject, topic, level_id, grade_id, subject_id, topic_id } = quiz.value;
        quiz.value = { ...quiz.value, ...returnedQuiz, level, grade, subject, topic, level_id, grade_id, subject_id, topic_id };
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
      
      const method = quizId.value ? 'PATCH' : 'POST';
      const url = quizId.value ? `/api/quizzes/${quizId.value}` : '/api/quizzes';

      let res: Response;
      const coverFile = quiz.value.cover_file;
      const hasQuestionFiles = questions.value.some(q => q.media_file instanceof File);

      try {
        try { console.debug('saveQuiz: outgoing payload preview', { payload, questionsCount: sanitizedQuestions?.length, hasQuestionFiles }) } catch (e) {}
      } catch (e) {}

      if (coverFile instanceof File || hasQuestionFiles) {
        const formData = new FormData();
        if (method === 'PATCH') formData.append('_method', 'PATCH');
        
        const quizData = { ...payload };
        if (coverFile instanceof File) {
          quizData.cover = coverFile;
        }
        
        appendQuizDataToForm(formData, quizData, sanitizedQuestions);
        res = await api.postFormData(url, formData);
      } else {
        const finalPayload = { ...payload, questions: sanitizedQuestions };
        try { console.debug('saveQuiz: final JSON payload keys', Object.keys(finalPayload || {})) } catch (e) {}
        if (method === 'PATCH') {
          res = await api.patchJson(url, finalPayload);
        } else {
          res = await api.postJson(url, finalPayload);
        }
      }

      if (api.handleAuthStatus(res)) {
        alert.push({ type: 'warning', message: 'Session expired — please sign in again' });
        return false;
      }

      const data = await res.json().catch(() => null);

      if (handleApiErrors(res, data, detailsErrors)) {
        return false;
      }

      detailsErrors.value = {};
      try { console.debug('saveQuiz: api response', data) } catch (e) {}
      const returnedQuiz = (data && (data.quiz || (data.data && data.data.quiz))) ? (data.quiz || data.data.quiz) : (data && data.data && data.data.id ? data.data : (data && data.id ? data : null))
      if (returnedQuiz && returnedQuiz.id) {
        quizId.value = returnedQuiz.id;
        try { quiz.value = { ...quiz.value, ...returnedQuiz } } catch (e) {}
        if (Array.isArray(returnedQuiz.questions) && returnedQuiz.questions.length) {
          questions.value = returnedQuiz.questions.map((q: any, idx: number) => normalizeQuestionForEditor(q))
        }
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

      const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)
      const data = await res.json().catch(() => null)

      if (handleApiErrors(res, data, settingsErrors)) {
        return false
      }

      settingsErrors.value = {}
      alert.push({ type: 'success', message: 'Settings saved successfully!' })
      settingsSaved.value = true
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
      } catch (e) {}
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
      } catch (e) {}
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
      try { console.debug('saveQuestion:start', { quizId: quizId.value, uid: question?.uid || question?.id, type: question?.type }) } catch (e) {}
      
      const sanitizedQuestion = sanitizeQuestionForPayload(question)
      try { console.debug(`POST /api/quizzes/${quizId.value}/questions`, sanitizedQuestion) } catch (e) {}
      
      let res: Response
      const hasFile = questionContainsFile(question)
      
      if (hasFile) {
        const form = buildQuestionFormData(sanitizedQuestion, question)
        res = await api.postFormData(`/api/quizzes/${quizId.value}/questions`, form)
      } else {
        res = await api.postJson(`/api/quizzes/${quizId.value}/questions`, sanitizedQuestion)
      }
      
      if (api.handleAuthStatus(res)) return
      if (!res.ok) throw new Error('Failed to save question')
      
      const data = await res.json().catch(() => null)
      try { console.debug('saveQuestion:response', { status: res.status, body: data }) } catch (e) {}
      
      const idx = questions.value.findIndex(q => q.uid === question.uid || q.id === question.id)
      if (idx !== -1 && data?.question) {
        questions.value.splice(idx, 1, data.question)
      } else if (data?.question) {
        questions.value.push(data.question)
      }
      questionsSaved.value = true
      alert.push({ type: 'success', message: 'Question saved' })
    } catch (err: unknown) {
      try { console.debug('saveQuestion:error', { err: (err as any)?.message || String(err) }) } catch (e) {}
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
      } catch (ex) {}

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
    } catch (err: unknown) {
      const e = err as Error;
      alert.push({ type: 'error', message: e.message });
    } finally {
      isSubmitting.value = false;
    }
  }
  
  async function loadQuiz(id: any) {
    try {
      const res = await api.get(`/api/quizzes/${id}`)
      const { addTopic } = useTaxonomy()

      if(res.ok) {
        const data = await res.json()
        const serverQuiz = data.quiz || {}
        const loaded: any = { ...initialForm, ...serverQuiz }
        
        loaded.level_id = serverQuiz.level_id ?? serverQuiz.level?.id ?? serverQuiz.grade?.level?.id ?? serverQuiz.levelId ?? null
        loaded.grade_id = serverQuiz.grade_id ?? serverQuiz.grade?.id ?? null
        loaded.subject_id = serverQuiz.subject_id ?? serverQuiz.subject?.id ?? null
        loaded.topic_id = serverQuiz.topic_id ?? serverQuiz.topic?.id ?? null

        loaded.level = serverQuiz.level || serverQuiz.grade?.level || (serverQuiz.level_name ? { id: loaded.level_id, name: serverQuiz.level_name } : (serverQuiz.levelName ? { id: loaded.level_id, name: serverQuiz.levelName } : null));
        loaded.grade = serverQuiz.grade || (loaded.grade_id ? { id: loaded.grade_id, name: serverQuiz.grade_name } : null);
        loaded.subject = serverQuiz.subject || (loaded.subject_id ? { id: loaded.subject_id, name: serverQuiz.subject_name } : null);
        loaded.topic = serverQuiz.topic || (loaded.topic_id ? { id: loaded.topic_id, name: serverQuiz.topic_name } : null);
        
        const ts = serverQuiz.timer_seconds ?? serverQuiz.timer_minutes ?? null
        loaded.timer_minutes = ts ? Math.floor(Number(ts) / 60) : initialForm.timer_minutes

        loaded.per_question_seconds = serverQuiz.per_question_seconds ?? initialForm.per_question_seconds
        loaded.use_per_question_timer = serverQuiz.use_per_question_timer ?? initialForm.use_per_question_timer
        loaded.attempts_allowed = serverQuiz.attempts_allowed ?? initialForm.attempts_allowed
        loaded.shuffle_questions = serverQuiz.shuffle_questions ?? initialForm.shuffle_questions
        loaded.shuffle_answers = serverQuiz.shuffle_answers ?? initialForm.shuffle_answers
        loaded.access = serverQuiz.access ?? (serverQuiz.is_paid ? 'paywall' : initialForm.access)
        loaded.visibility = serverQuiz.visibility ?? initialForm.visibility

        if (serverQuiz.cover_image) {
          loaded.cover_image = serverQuiz.cover_image
          loaded.cover = serverQuiz.cover_image
        }
        
        loaded.topic = loaded.topic || (loaded.topic_id ? { id: loaded.topic_id } : null)
        loaded.subject = loaded.subject || (loaded.subject_id ? { id: loaded.subject_id } : null)
        loaded.grade = loaded.grade || (loaded.grade_id ? { id: loaded.grade_id } : null)
        loaded.level = loaded.level || (loaded.level_id ? { id: loaded.level_id } : null)

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
      }
    } catch(err: unknown) {
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

  // Persist progress to localStorage with a debounce to avoid excessive writes.
  // A deep watch ensures any change to the quiz or questions object triggers it.
  watchDebounced([quiz, questions], () => {
    persistProgress()
  }, { debounce: 500, deep: true })

  // Cleanup function to reset store state
  function cleanup() {
    quiz.value = { ...initialForm }
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
        try { window.removeEventListener('beforeunload', unloadHandler) } catch (e) {}
        try { cleanup() } catch (e) {}
      }
    }
    // If not running in client, return noop
    return () => {}
  }

  function addQuestion(q?: any) {
    const newQuestion = normalizeQuestionForEditor(q || {});
    questions.value.push(newQuestion);
  }

  return {
    quiz,
    questions,
    questionsErrors,
    detailsErrors,
    settingsErrors,
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
    addQuestion
  }
})
