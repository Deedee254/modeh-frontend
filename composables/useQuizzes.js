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
      title: item.title ?? 'Untitled',
      description: item.description ?? '',
      topic_id: item.topic_id ?? item.topic?.id ?? null,
      topic: {
        id: item.topic?.id ?? null,
        name: item.topic?.name ?? ''
      },
      cover_image: item.cover_image ?? '',
      questions_count: item.questions_count ?? 0,
      difficulty: item.difficulty ?? 0,
      user_id: item.user_id ?? null,
      likes_count: item.likes_count ?? item.likes ?? 0,
      liked: !!item.liked,
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

