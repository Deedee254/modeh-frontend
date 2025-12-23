import { ref, computed } from 'vue'
import useApi from '~/composables/useApi'

export default function useQuizzes(initial = {}) {
  const api = useApi()
  const paginator = ref(initial.paginator || null)
  const topics = ref(initial.topics || [])
  const loading = ref(false)

  function normalizeQuiz(item) {
    if (!item || typeof item !== 'object') return null
    return {
      id: item.id ?? null,
      slug: item.slug ?? null,
      title: item.title ?? 'Untitled',
      description: item.description ?? '',
      topic_id: item.topic_id ?? item.topic?.id ?? null,
      topic: {
        id: item.topic?.id ?? null,
        name: item.topic?.name ?? ''
      },
      cover_image: item.cover_image ?? '',
      questions_count: item.questions_count ?? 0,
      attempts_count: item.attempts_count ?? 0,
      difficulty: item.difficulty ?? 0,
      user_id: item.user_id ?? null,
      likes_count: item.likes_count ?? item.likes ?? 0,
      liked: !!item.liked,
      // Map user attempt metadata when provided by the API (common keys)
      attempted: Boolean(item.last_attempt || item.attempt || item.user_attempt || item.attempts?.length),
      attempt_score: (item.last_attempt && item.last_attempt.score) ?? (item.attempt && item.attempt.score) ?? (item.user_attempt && item.user_attempt.score) ?? null,
      attempt_correct: (item.last_attempt && item.last_attempt.correct) ?? (item.attempt && item.attempt.correct) ?? null,
      attempt_incorrect: (item.last_attempt && item.last_attempt.incorrect) ?? (item.attempt && item.attempt.incorrect) ?? null,
      attempt_id: (item.last_attempt && item.last_attempt.id) ?? (item.attempt && item.attempt.id) ?? null,
      raw: item
    }
  }

  const normalizedQuizzes = computed(() => {
    const data = paginator.value?.data || []
    if (!Array.isArray(data)) return []
    return data.map(normalizeQuiz).filter(Boolean)
  })

  async function fetchTopics() {
    try {
  const config = useRuntimeConfig()
  const res = await fetch(config.public.apiBase + '/api/topics?approved=1', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        let payload = json.topics || json.data || json || []
        if (!Array.isArray(payload)) payload = Array.isArray(payload.data) ? payload.data : []
        topics.value = (payload || []).filter(Boolean).map(t => ({ id: t?.id ?? null, name: t?.name ?? '' }))
      }
    } catch (e) {
      // ignore
    }
  }

  async function fetchItems(params = {}) {
    loading.value = true
    try {
      // allow caller to request a client-side merge of user's attempts
      const mergeAttempts = params.mergeAttempts === true
      // remove internal flag so it doesn't get sent to the API
      if (mergeAttempts) delete params.mergeAttempts
      const urlParams = new URLSearchParams()
      Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) urlParams.set(k, v) })
  const config = useRuntimeConfig()
  const url = config.public.apiBase + '/api/quizzes?approved=1' + (urlParams.toString() ? '&' + urlParams.toString() : '')
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        const payload = json.quizzes || json.data || json || {}
        let data = []
        if (Array.isArray(payload)) data = payload
        else if (Array.isArray(payload.data)) data = payload.data
        else data = []
        const normalized = (data || []).map(normalizeQuiz).filter(Boolean)
        paginator.value = Object.assign({}, payload, { data: normalized })

        // If requested, fetch current user's attempts and merge by quiz_id so the
        // listing reliably shows which quizzes the user already attempted.
        if (mergeAttempts) {
          try {
            // Use existing api helper for auth/error handling
            const attemptsRes = await api.get('/api/quiz-attempts?per_page=200')
            if (attemptsRes && attemptsRes.ok) {
              const body = await attemptsRes.json()
              // attempts may be nested under data/data or data or top-level
              let attemptsArray = []
              if (Array.isArray(body)) attemptsArray = body
              else if (Array.isArray(body.data)) attemptsArray = body.data
              else if (Array.isArray(body.data?.data)) attemptsArray = body.data.data
              else if (Array.isArray(body.attempts)) attemptsArray = body.attempts

              const latestByQuiz = new Map()
              for (const a of attemptsArray || []) {
                const qid = a.quiz_id ?? a.quiz?.id ?? null
                if (!qid) continue
                const existing = latestByQuiz.get(qid)
                // prefer newest by created_at if available, otherwise last seen
                if (!existing) latestByQuiz.set(qid, a)
                else {
                  const exDate = existing.created_at ? new Date(existing.created_at).getTime() : 0
                  const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
                  if (aDate >= exDate) latestByQuiz.set(qid, a)
                }
              }

              // merge into normalized list
              const merged = (paginator.value.data || []).map(item => {
                if (!item || !item.id) return item
                const attempt = latestByQuiz.get(item.id)
                if (!attempt) return item
                return {
                  ...item,
                  attempted: true,
                  attempt_score: attempt.score ?? item.attempt_score ?? null,
                  attempt_correct: attempt.correct ?? item.attempt_correct ?? null,
                  attempt_incorrect: attempt.incorrect ?? item.attempt_incorrect ?? null,
                  attempt_id: attempt.id ?? item.attempt_id ?? null,
                  // keep raw payload with last_attempt attached for downstream consumers
                  raw: { ...(item.raw || {}), last_attempt: attempt }
                }
              })
              paginator.value = Object.assign({}, paginator.value, { data: merged })
            }
          } catch (e) {
            // non-fatal: if attempts fetch fails just leave list as-is
            console.debug('Failed to merge attempts for quizzes list', e)
          }
        }
      }
    } catch (e) {
      // ignore network errors here; caller can inspect paginator/loading
    }
    loading.value = false
  }

  return {
    paginator,
    topics,
    loading,
    normalizedQuizzes,
    fetchItems,
    fetchTopics,
    normalizeQuiz
  }
}

