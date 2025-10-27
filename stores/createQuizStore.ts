
import { defineStore } from 'pinia'
import { watchDebounced } from '@vueuse/core'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

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

  function sanitizeQuestionForPayload(q: any) {
    if (!q || typeof q !== 'object') return q
    
    const copy: any = {
      type: q.type,
      body: q.body || q.text || '',
      explanation: q.explanation || null,
      difficulty: q.difficulty || 3,
      marks: q.marks || 1
    }

    if (q.media_type) {
      copy.media_type = q.media_type
      if (q.media_path) copy.media_path = q.media_path
      if (q.youtube_url) copy.youtube_url = q.youtube_url;
      if (q.media_metadata) copy.media_metadata = { ...q.media_metadata };
    }

    if (Array.isArray(q.options)) {
      copy.options = q.options.map((opt: any) => ({
        text: opt.text || '',
        is_correct: !!opt.is_correct
      }))
    }

    if (Array.isArray(q.answers)) {
      copy.answers = q.answers.filter((a: any) => a !== null && typeof a !== 'undefined')
    }

    if (Array.isArray(q.corrects)) {
      copy.corrects = q.corrects.filter((c: any) => typeof c === 'number' || !isNaN(Number(c)))
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
   * Appends quiz and question data to a FormData object, handling nested files.
   * @param form - The FormData instance.
   * @param quizPayload - The quiz data payload.
   * @param questionsPayload - The sanitized questions array.
   */
  function appendQuizDataToForm(form: FormData, quizPayload: Record<string, any>, questionsPayload?: any[]) {
    // Append quiz fields
    Object.keys(quizPayload).forEach((k) => {
      const val = quizPayload[k]
      if (val === null || typeof val === 'undefined') return
      if (typeof val === 'object' && !(val instanceof File)) form.append(k, JSON.stringify(val))
      else form.append(k, val)
    })

    if (questionsPayload) {
      // Append questions as a JSON string
      form.append('questions', JSON.stringify(questionsPayload))

      // Append any File objects found in questions
      for (let i = 0; i < questions.value.length; i++) {
        const file = questions.value[i]?.media_file
        if (file instanceof File) form.append(`question_media[${i}]`, file)
      }
    }
  }

  /**
   * Parses API error responses and updates the appropriate error state ref.
   * @param res - The raw Response object.
   * @param data - The parsed JSON body from the response.
   * @param errorRef - The ref to update with parsed errors (e.g., detailsErrors).
   * @returns True if an error was handled, otherwise false.
   */
    function handleApiErrors(res: Response, data: unknown, errorRef: Ref<Record<string, string[]>>): boolean {
    if (res.ok) {
      errorRef.value = {}
      return false
    }

    const mappedErrors: Record<string, string[]> = {}
    let alertMessage: string
    let alertType: 'error' | 'warning' = 'error'

    if (isApiError(data)) {
      alertMessage = data.message
      if (data.errors) {
        Object.entries(data.errors).forEach(([key, messages]) => {
          mappedErrors[key] = messages
        })
      }

      // Handle specific status codes
      if (res.status === 422) {
        alertMessage = 'Please fix the highlighted errors.'
      } else if (res.status === 403) {
        alertType = 'warning'
        if (data.message.toLowerCase().includes('topic') && data.message.toLowerCase().includes('approve')) {
          mappedErrors._topic = [data.message]
        }
      }
    } else {
      alertMessage = `Request failed with status ${res.status}`
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
      return
    }
    isSubmitting.value = true
    try {
      // Normalize empty strings into nulls for numeric ids coming from selects
      if ((quiz.value as any).grade_id === '') (quiz.value as any).grade_id = null
      if ((quiz.value as any).subject_id === '') (quiz.value as any).subject_id = null
      if ((quiz.value as any).level_id === '') (quiz.value as any).level_id = null
      if ((quiz.value as any).topic_id === '') (quiz.value as any).topic_id = null
      // convert timer_minutes to timer_seconds to match backend expectations
      const payload: any = {
        topic_id: quiz.value.topic_id ? (Number(quiz.value.topic_id) || null) : null,
        title: quiz.value.title,
        description: quiz.value.description || null,
        youtube_url: quiz.value.youtube_url || null,
        timer_seconds: quiz.value.use_per_question_timer ? null : (quiz.value.timer_minutes ? Number(quiz.value.timer_minutes) * 60 : null),
        per_question_seconds: quiz.value.use_per_question_timer ? Number(quiz.value.per_question_seconds || 0) : null,
        subject_id: quiz.value.subject_id ? (Number(quiz.value.subject_id) || null) : null, // This is correct
        grade_id: quiz.value.grade_id ? (Number(quiz.value.grade_id) || null) : null,
        level_id: quiz.value.level_id ? (Number(quiz.value.level_id) || null) : null,
        use_per_question_timer: quiz.value.use_per_question_timer,
        // Normalize attempts_allowed: '' (select for unlimited) -> null, numeric strings -> Number
        attempts_allowed: (() => {
          const raw: any = quiz.value.attempts_allowed
          if (raw === '' || raw === null || typeof raw === 'undefined') return null
          const n = Number(raw)
          return Number.isFinite(n) ? n : null
        })(),
        shuffle_questions: Boolean(quiz.value.shuffle_questions),
        shuffle_answers: Boolean(quiz.value.shuffle_answers),
        access: quiz.value.access,
        visibility: quiz.value.visibility,
      }

      // Use PATCH if we have a quizId, otherwise POST to create.
      const method = quizId.value ? 'PATCH' : 'POST'
      const url = quizId.value ? `/api/quizzes/${quizId.value}` : '/api/quizzes'
      
      let res: Response;
      const coverFile = (quiz.value as any).cover_file
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
        return
      }
      const data = await res.json().catch(() => null)

      if (handleApiErrors(res, data, detailsErrors)) {
        return // Stop execution if errors were handled
      }


      // clear any previously stored validation errors
      detailsErrors.value = {}

      quizId.value = data.quiz.id
      detailsSaved.value = true
      // persist progress to localStorage
      persistProgress()
      alert.push({ type: 'success', message: 'Quiz details saved!' })
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: e.message })
    } finally {
      isSubmitting.value = false
    }
  }

  async function saveSettings() {
    if (!quizId.value) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return
    }
    isSubmitting.value = true
    try {
      // normalize numeric empty strings
  if ((quiz.value as any).attempts_allowed === '') (quiz.value as any).attempts_allowed = null
  if ((quiz.value as any).per_question_seconds === '') (quiz.value as any).per_question_seconds = null
      const payload: any = {
        timer_seconds: quiz.value.use_per_question_timer ? null : (quiz.value.timer_minutes ? Number(quiz.value.timer_minutes) * 60 : null),
        per_question_seconds: quiz.value.use_per_question_timer ? Number(quiz.value.per_question_seconds || 0) : null,
        use_per_question_timer: Boolean(quiz.value.use_per_question_timer),
        attempts_allowed: (() => {
          const raw: any = quiz.value.attempts_allowed
          if (raw === '' || raw === null || typeof raw === 'undefined') return null
          const n = Number(raw)
          return Number.isFinite(n) ? n : null
        })(),
        shuffle_questions: Boolean(quiz.value.shuffle_questions),
        shuffle_answers: Boolean(quiz.value.shuffle_answers),
        access: quiz.value.access,
        visibility: quiz.value.visibility,
      }

      const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)
      const data = await res.json().catch(() => null)

      if (handleApiErrors(res, data, settingsErrors)) {
        return // Stop execution if errors were handled
      }

      settingsErrors.value = {}
      alert.push({ type: 'success', message: 'Settings saved successfully!' })
      settingsSaved.value = true
      persistProgress()
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: e.message })
    } finally {
      isSubmitting.value = false
    }
  }

  async function saveQuestion(question: any) {
    if (!quizId.value) {
      alert.push({ type: 'warning', message: 'Please save quiz details first.' })
      return
    }
    try {
      // sanitize payload for sending
      const sanitizedQuestion = sanitizeQuestionForPayload(question)
      // debug: log payload
      try { console.debug(`POST /api/quizzes/${quizId.value}/questions`, sanitizedQuestion) } catch (e) {}
      let res: Response
      // If question contains a File (media), send as FormData with 'media' key
      let containsFile = false
      for (const k in question) {
        try {
          const v: any = question[k]
          if (typeof File !== 'undefined' && v instanceof File) { containsFile = true; break }
        } catch (e) {}
      }
      if (containsFile) {
        const form = new FormData()
        // Append any File objects from the original question under 'media' (preserve original file refs)
        for (const k in question) {
          try {
            const v: any = (question as any)[k]
            if (v && typeof File !== 'undefined' && v instanceof File) {
              form.append('media', v)
            }
          } catch (e) {}
        }
        // append sanitized scalar fields; arrays/objects stringified
        Object.keys(sanitizedQuestion).forEach((k) => {
          const v: any = (sanitizedQuestion as any)[k]
          if (v === null || typeof v === 'undefined') return
          if (typeof v === 'object') form.append(k, JSON.stringify(v))
          else form.append(k, String(v))
        })
        res = await api.postFormData(`/api/quizzes/${quizId.value}/questions`, form)
      } else {
        const res2 = await api.postJson(`/api/quizzes/${quizId.value}/questions`, sanitizedQuestion)
        res = res2
      }
      if (api.handleAuthStatus(res)) return
      if (!res.ok) throw new Error('Failed to save question')
      const data = await res.json().catch(()=>null)
      
      const idx = questions.value.findIndex(q => q.uid === question.uid || q.id === question.id)
      if (idx !== -1 && data?.question) {
        questions.value.splice(idx, 1, data.question)
      } else if (data?.question) {
        questions.value.push(data.question)
      }
      questionsSaved.value = true
      alert.push({ type: 'success', message: 'Question saved' })
    } catch (err: unknown) {
      const e = err as Error
      // if validation error from server, map to field-level errors
      try {
        if ((err as any)?.response && (err as any).response.status === 422) {
          const data = await (err as any).response.json().catch(() => null)
          if (data?.errors) {
            // assign all messages to this question's uid (best-effort)
            const uid = question.uid || question.id || Math.random().toString(36).slice(2)
            const msgs: string[] = []
            Object.keys(data.errors).forEach(k => {
              const arr = data.errors[k] || []
              msgs.push(...arr)
            })
            questionsErrors.value = { ...questionsErrors.value, [uid]: msgs }
          }
        }
      } catch (ex) {
        // ignore mapping errors
      }

      alert.push({ type: 'error', message: e.message })
    }
  }

  async function saveAllQuestions() {
    if (!quizId.value) { 
      alert.push({ type: 'warning', message: 'Please save quiz details first.' }); 
      return 
    }
    try {
      // build sanitized question list and debug
      const sanitizedQuestions = (questions.value || []).map((q: any) => sanitizeQuestionForPayload(q))
      try { console.debug(`PATCH /api/quizzes/${quizId.value}/questions`, { questions: sanitizedQuestions }) } catch (e) {}
      // detect File objects inside questions; if present send as multipart/form-data
      const hasFiles = questions.value.some(q => q.media_file instanceof File)

      let res: Response
      if (hasFiles) {
        const form = new FormData()
        // The backend route for bulk question updates is PATCH, but FormData with PATCH is tricky.
        // Laravel supports a `_method` field to tunnel PATCH requests over POST.
        // The `bulkUpdateForQuiz` method in the backend controller handles this.
        form.append('_method', 'PATCH')
        appendQuizDataToForm(form, {}, sanitizedQuestions)
        // We use postFormData which sends a POST request. The backend will interpret it as PATCH.
        res = await api.postFormData(`/api/quizzes/${quizId.value}/questions`, form)
      } else {
        res = await api.patchJson(`/api/quizzes/${quizId.value}/questions`, { questions: sanitizedQuestions })
      }

      if (api.handleAuthStatus && api.handleAuthStatus(res)) return
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Failed to save questions')
      }
      questionsSaved.value = true
      persistProgress()
      alert.push({ type: 'success', message: 'All questions saved' })
    } catch (err: unknown) {
      const e = err as Error
      try {
        // attempt to parse validation errors and map to per-question entries
        if ((err as any)?.response && (err as any).response.status === 422) {
          const data = await (err as any).response.json().catch(() => null)
          if (data?.errors) {
            // Laravel returns keys like 'questions.0.title' - map them
            const mapped: Record<string, string[]> = { ...questionsErrors.value }
            Object.keys(data.errors).forEach(key => {
              const m = key.match(/^questions\.(\d+)\.(.+)$/)
              if (m) {
                const idx = Number(m[1])
                const q = questions.value[idx]
                const uid = q?.uid || q?.id
                if (uid) {
                  mapped[uid] = [...(mapped[uid] || []), ...(data.errors[key] || [])]
                }
              }
            })
            questionsErrors.value = mapped
          }
        }
      } catch (ex) {}

      alert.push({ type: 'error', message: e.message })
    }
  }

  async function submitQuiz() {
    isSubmitting.value = true
    try {
      // Validate quiz data before submission
      const validationErrors: string[] = []
      
      if (!quiz.value.title?.trim()) {
        validationErrors.push('Quiz title is required')
      }
      if (!quiz.value.topic_id) {
        validationErrors.push('Please select a topic')
      }
      if (!questions.value.length) {
        validationErrors.push('Quiz must have at least one question')
      }
      
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          alert.push({ type: 'error', message: error })
        })
        return false
      }
      // First, ensure all details and questions are saved, especially if files are involved.
      // This re-uses the logic that handles multipart/form-data correctly.
      await saveDetails()
      if (detailsErrors.value && Object.keys(detailsErrors.value).length > 0) {
        // saveDetails failed validation, so we stop here.
        return
      }
      await saveAllQuestions()
      if (questionsErrors.value && Object.keys(questionsErrors.value).length > 0) {
        // saveAllQuestions failed, stop here.
        alert.push({ type: 'error', message: 'Could not save all questions before publishing.' })
        return
      }

      // Now, simply update the visibility to publish the quiz.
      const payload = { visibility: 'published' }
      const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)

      if (api.handleAuthStatus(res)) { 
        alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); 
        return 
      }

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Failed to publish quiz.')

      // expose the created quiz payload so UI can show a created modal
      lastCreated.value = data.quiz || data
      alert.push({ type: 'success', message: 'Quiz published successfully!' })
      // Clear the local draft since it's now published.
      clearProgress()
      // Note: do not reset or navigate here. Let the page show the created modal and navigate when the user clicks View/Edit.
    } catch (err: unknown) {
      const e = err as Error
      alert.push({ type: 'error', message: e.message })
    } finally {
      isSubmitting.value = false
    }
  }
  
  async function loadQuiz(id: any) {
    try {
      const res = await api.get(`/api/quizzes/${id}`)
      if(res.ok) {
        const data = await res.json()
        const serverQuiz = data.quiz || {}
        // Build a frontend-friendly quiz object, converting timer_seconds -> timer_minutes
        const loaded: any = { ...initialForm, ...serverQuiz }
          // normalize level fields if present on server payload
          loaded.level_id = serverQuiz.level_id ?? serverQuiz.level?.id ?? serverQuiz.levelId ?? null
          loaded.grade_id = serverQuiz.grade_id ?? serverQuiz.grade?.id ?? null
          loaded.subject_id = serverQuiz.subject_id ?? serverQuiz.subject?.id ?? null
          loaded.topic_id = serverQuiz.topic_id ?? serverQuiz.topic?.id ?? null

          loaded.level = serverQuiz.level || (serverQuiz.level_name ? { id: loaded.level_id, name: serverQuiz.level_name } : (serverQuiz.levelName ? { id: loaded.level_id, name: serverQuiz.levelName } : null))
        // convert timer_seconds (server) to timer_minutes (client UI)
        const ts = serverQuiz.timer_seconds ?? serverQuiz.timer_minutes ?? null
        loaded.timer_minutes = ts ? Math.floor(Number(ts) / 60) : initialForm.timer_minutes
        // copy settings that the UI expects
        loaded.per_question_seconds = serverQuiz.per_question_seconds ?? loaded.per_question_seconds
        loaded.use_per_question_timer = !!serverQuiz.use_per_question_timer
        loaded.attempts_allowed = serverQuiz.attempts_allowed ?? loaded.attempts_allowed
        loaded.shuffle_questions = typeof serverQuiz.shuffle_questions !== 'undefined' ? !!serverQuiz.shuffle_questions : loaded.shuffle_questions
        loaded.shuffle_answers = typeof serverQuiz.shuffle_answers !== 'undefined' ? !!serverQuiz.shuffle_answers : loaded.shuffle_answers
        loaded.access = serverQuiz.is_paid ? 'paywall' : (serverQuiz.access ?? loaded.access)
        loaded.visibility = serverQuiz.visibility ?? loaded.visibility

        // map cover image to both cover_image (server URL) and cover (url for UI)
        if (serverQuiz.cover_image) {
          loaded.cover_image = serverQuiz.cover_image
          loaded.cover = serverQuiz.cover_image
        }

        quiz.value = loaded
        questions.value = serverQuiz.questions || []
        quizId.value = serverQuiz.id || id

        // set saved flags conservatively
        detailsSaved.value = !!(quiz.value.title && quiz.value.grade_id && quiz.value.subject_id && quiz.value.topic_id)
        settingsSaved.value = true // loaded quiz implies settings exist on server
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
        persistProgress()
      }
      window.addEventListener('beforeunload', unloadHandler)
      
      onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', unloadHandler)
        cleanup()
      })
    }
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
    saveAllQuestions,
    submitQuiz,
    loadQuiz,
    clearProgress,
    setupCleanup
  }
})
