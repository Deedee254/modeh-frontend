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
      topic_id: item.topic_id ?? null,
      topic_name: item.topic_name ?? '',
      subject_name: item.subject_name ?? '',
      grade_name: item.grade_name ?? '',
      level_name: item.level_name ?? '',
      cover_image: item.cover_image ?? '',
      questions_count: item.questions_count ?? 0,
      attempts_count: item.attempts_count ?? 0,
      likes_count: item.likes_count ?? 0,
      difficulty: item.difficulty ?? 0,
      liked: !!item.liked,
      attempted: !!item.last_attempt,
      attempt_score: item.last_attempt?.score ?? null,
      attempt_id: item.last_attempt?.id ?? null,
      raw: item
    }
  }

  const normalizedQuizzes = computed(() => {
    const data = paginator.value?.data || []
    if (!Array.isArray(data)) return []
    return data
  })

  async function fetchTopics(params = {}) {
    try {
      const config = useRuntimeConfig()
      const isPublic = params.public === true
      const res = isPublic ? await api.getPublic('/api/topics?approved=1') : await api.get('/api/topics?approved=1')
      
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
      const isPublic = params.public === true
      // remove internal flags so they don't get sent to the API
      const cleanParams = { ...params }
      if (cleanParams.mergeAttempts) delete cleanParams.mergeAttempts
      if (isPublic) delete cleanParams.public

      const urlParams = new URLSearchParams()
      Object.entries(cleanParams || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) urlParams.set(k, v) })
      
      const path = '/api/quizzes?approved=1' + (urlParams.toString() ? '&' + urlParams.toString() : '')
      
      const res = isPublic ? await api.getPublic(path) : await api.get(path)
      
      if (res.ok) {
        const json = await res.json()
        // API Resource returns data wrapped in { data: [...] } or direct if not paginated
        // But QuizController@index returns a paginated response via QuizResource::collection
        // which matches the paginator structure expected.
        const payload = json || {}
        let data = payload.data || []
        
        const normalized = (data || []).map(normalizeQuiz).filter(Boolean)
        paginator.value = Object.assign({}, payload, { data: normalized })
      }
    } catch (e) {
      // ignore network errors
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

