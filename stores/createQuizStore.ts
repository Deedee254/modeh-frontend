
import { defineStore } from 'pinia'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

export const useCreateQuizStore = defineStore('createQuiz', () => {
  const api = useApi()
  const alert = useAppAlert()
  const router = useRouter()

  const initialForm = {
    title: '',
    description: '',
    grade_id: null,
    subject_id: null,
    topic_id: null,
    timer_minutes: 10,
    per_question_seconds: 30,
    use_per_question_timer: false,
    attempts_allowed: 1,
    shuffle_questions: true,
    shuffle_answers: true,
    access: 'free',
    visibility: 'public',
  }

  const quiz = ref({ ...initialForm })
  const questions = ref<any[]>([])
  const questionsErrors = ref<Record<string, string[]>>({})
  const quizId = ref(null)
  const detailsSaved = ref(false)
  const settingsSaved = ref(false)
  const questionsSaved = ref(false)
  const isSubmitting = ref(false)
  const isSaving = ref(false)
  const activeTab = ref('details')

  const isDetailsValid = computed(() => {
    return quiz.value.title && quiz.value.grade_id && quiz.value.subject_id && quiz.value.topic_id
  })

  // restore any saved draft on initialization
  if (typeof window !== 'undefined') {
    try { restoreProgress() } catch (e) { /* ignore */ }
  }

  // persist grade/subject/topic immediately when changed so other UIs (pickers) can rely on store state
  watch(() => quiz.value.grade_id, (nv) => { try { persistProgress() } catch (e) {} })
  watch(() => quiz.value.subject_id, (nv) => { try { persistProgress() } catch (e) {} })
  watch(() => quiz.value.topic_id, (nv) => { try { persistProgress() } catch (e) {} })

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
      // convert timer_minutes to timer_seconds to match backend expectations
      const payload: any = {
        ...quiz.value,
        timer_seconds: quiz.value.timer_minutes ? (Number(quiz.value.timer_minutes) * 60) : null,
      }
      // remove timer_minutes from payload to avoid confusion
      delete payload.timer_minutes

      // Determine if any questions contain local File objects; if so, send as multipart/form-data
      let hasFiles = false
      for (const q of questions.value) {
        for (const k in q) {
          try {
            // detect File objects that should be uploaded
            const v: any = (q as any)[k]
            if (typeof File !== 'undefined' && v instanceof File) {
              hasFiles = true
              break
            }
          } catch (e) {
            // ignore access errors
          }
        }
        if (hasFiles) break
      }

      let res: Response
      if (hasFiles) {
        const form = new FormData()
        // append quiz fields (scalars/objects). Objects/arrays are stringified.
        Object.keys(payload).forEach((k) => {
          const val = (payload as any)[k]
          if (val === null || typeof val === 'undefined') return
          if (typeof val === 'object') form.append(k, JSON.stringify(val))
          else form.append(k, String(val))
        })

        // append questions as a single JSON string; backend will decode it server-side
        const questionsPayload: any[] = []
        questions.value.forEach((q: any, idx: number) => {
          const qp: any = {}
          Object.keys(q).forEach((k) => {
            const v = q[k]
            // skip File objects from JSON representation
            if (typeof File !== 'undefined' && v instanceof File) return
            qp[k] = v
          })
          questionsPayload.push(qp)

          // append file(s) for this question using question_media[index]
          Object.keys(q).forEach((k) => {
            const v: any = q[k]
            if (typeof File !== 'undefined' && v instanceof File) {
              // server accepts question_media indexed by question index
              form.append(`question_media[${idx}]`, v)
              // also append under question uid if available (backend supports uid keys)
              if (q.uid) form.append(`question_media[${q.uid}]`, v)
            }
          })
        })

        form.append('questions', JSON.stringify(questionsPayload))

        // debug: log a summary of FormData keys being sent (avoid logging binary contents)
        try {
          const keys: string[] = []
          // FormData.entries is supported in modern browsers; iterate to gather keys
          for (const pair of (form as any).entries()) {
            keys.push(String(pair[0]))
          }
          // eslint-disable-next-line no-console
          console.debug('Submitting multipart FormData to /api/quizzes with keys:', keys)
        } catch (e) {
          // ignore logging errors
        }

        res = await api.postFormData('/api/quizzes', form)
      } else {
        // debug: log JSON payload
        try { console.debug('Submitting JSON to /api/quizzes', { ...payload, questions: questions.value }) } catch (e) {}
        res = await api.postJson('/api/quizzes', { ...payload, questions: questions.value })
      }
      if (api.handleAuthStatus(res)) {
        alert.push({ type: 'warning', message: 'Session expired — please sign in again' })
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Failed to create quiz.')

      quizId.value = data.quiz.id
      detailsSaved.value = true
      // persist progress to localStorage
      persistProgress()
      alert.push({ type: 'success', message: 'Quiz details saved!' })
      router.replace({ path: `/quiz-master/quizzes/create`, query: { id: quizId.value } })
      setTab('settings')
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
      // convert minutes to seconds for backend
      const payload: any = {
        timer_seconds: quiz.value.use_per_question_timer ? 0 : (quiz.value.timer_minutes ? Number(quiz.value.timer_minutes) * 60 : null),
        per_question_seconds: quiz.value.use_per_question_timer ? quiz.value.per_question_seconds : 0,
        use_per_question_timer: quiz.value.use_per_question_timer,
        attempts_allowed: quiz.value.attempts_allowed,
        shuffle_questions: quiz.value.shuffle_questions,
        shuffle_answers: quiz.value.shuffle_answers,
        access: quiz.value.access,
        visibility: quiz.value.visibility
      }
      const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)

      if (!res.ok) throw new Error('Failed to save quiz settings')

      alert.push({ type: 'success', message: 'Settings saved successfully!' })
  settingsSaved.value = true
      setTab('questions')
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
      // debug: log payload
      try { console.debug(`POST /api/quizzes/${quizId.value}/questions`, question) } catch (e) {}
      const res = await api.postJson(`/api/quizzes/${quizId.value}/questions`, question)
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
      // debug: log payload
      try { console.debug(`PATCH /api/quizzes/${quizId.value}/questions`, { questions: questions.value }) } catch (e) {}
      const res = await api.patchJson(`/api/quizzes/${quizId.value}/questions`, { questions: questions.value })
      if (api.handleAuthStatus && api.handleAuthStatus(res)) return
      if (!res.ok) throw new Error('Failed to save questions')
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

  // persist progress whenever the saved flags change
  watch([detailsSaved, settingsSaved, questionsSaved], () => {
    try { persistProgress() } catch (e) {}
  })

  async function submitQuiz() {
    isSubmitting.value = true
    try {
      // convert minutes to seconds and send questions in canonical shape
      const payload: any = {
        ...quiz.value,
        timer_seconds: quiz.value.timer_minutes ? Number(quiz.value.timer_minutes) * 60 : null,
        questions: questions.value,
        status: 'published'
      }
      delete payload.timer_minutes
  // debug: log publish payload
  try { console.debug(`PATCH /api/quizzes/${quizId.value} (publish)`, payload) } catch (e) {}
  const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)

      if (api.handleAuthStatus(res)) { 
        alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); 
        return 
      }

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Failed to publish quiz.')

      alert.push({ type: 'success', message: 'Quiz created successfully!' })
      reset()
      router.push(`/quiz-master/quizzes/${data.quiz.id}/edit`)
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

  return {
    quiz,
    questions,
    questionsErrors,
    quizId,
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
    loadQuiz
  }
})
