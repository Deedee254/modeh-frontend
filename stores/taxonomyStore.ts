import { defineStore } from 'pinia'

function normalizeList(maybe: any) {
  if (!maybe) return []

  function normalizeItem(it: any) {
    if (it === null || it === undefined) return null
    if (typeof it !== 'object') {
      return { id: String(it), name: String(it) }
    }
    const rawId = it.id ?? it._id ?? it.value ?? null
    const id = rawId == null ? null : String(rawId)
    const gradeRaw = it.grade_id ?? it.grade ?? it.gradeId ?? null
    const subjectRaw = it.subject_id ?? it.subject ?? it.subjectId ?? null
    const grade_id = gradeRaw == null ? null : String(gradeRaw)
    const subject_id = subjectRaw == null ? null : String(subjectRaw)
    const name = it.name ?? it.title ?? it.label ?? it.text ?? ''
    return { ...it, id, name, grade_id, subject_id }
  }

  if (Array.isArray(maybe)) return maybe.filter(Boolean).map(normalizeItem)
  if (maybe.data && Array.isArray(maybe.data)) return maybe.data.filter(Boolean).map(normalizeItem)
  if (maybe.grades) {
    if (Array.isArray(maybe.grades)) return maybe.grades.filter(Boolean).map(normalizeItem)
    if (maybe.grades.data && Array.isArray(maybe.grades.data)) return maybe.grades.data.filter(Boolean).map(normalizeItem)
  }
  if (maybe.subjects) {
    if (Array.isArray(maybe.subjects)) return maybe.subjects.filter(Boolean).map(normalizeItem)
    if (maybe.subjects.data && Array.isArray(maybe.subjects.data)) return maybe.subjects.data.filter(Boolean).map(normalizeItem)
  }
  if (maybe.topics) {
    if (Array.isArray(maybe.topics)) return maybe.topics.filter(Boolean).map(normalizeItem)
    if (maybe.topics.data && Array.isArray(maybe.topics.data)) return maybe.topics.data.filter(Boolean).map(normalizeItem)
  }
  return []
}

export const useTaxonomyStore = defineStore('taxonomy', () => {
  const config = useRuntimeConfig()

  const grades = ref([])
  const subjects = ref([])
  const topics = ref([])

  const loadingGrades = ref(false)
  const loadingSubjects = ref(false)
  const loadingTopics = ref(false)

  const subjectsCache = new Map()
  const topicsCache = new Map()
  const subjectsPageCache = new Map()
  const topicsPageCache = new Map()
  function extractId(v: any) {
    if (v === null || v === undefined) return null
    if (typeof v === 'object') return v.id ?? v.value ?? null
    return v
  }
  // selection state for multi-step flow
  const selectedGrade = ref(null)
  const selectedSubject = ref(null)
  const selectedTopic = ref(null)
  const stepTwo = ref<{ grade_id: any; subject_id: any; topic_id: any; } | null>(null)

  async function fetchGrades() {
    if (grades.value.length) {
      return
    }
    loadingGrades.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/grades`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      grades.value = normalizeList(data)
    } catch (e) {
      // ignore
    } finally {
      loadingGrades.value = false
    }
  }

  async function fetchAllSubjects() {
    if (subjects.value.length) {
      return
    }
    loadingSubjects.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/subjects`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        subjects.value = normalizeList(data)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingSubjects.value = false
    }
  }

  async function fetchSubjectsByGrade(gradeId: any) {
    if (!gradeId) {
      subjects.value = []
      return
    }
    if (subjectsCache.has(gradeId)) {
      subjects.value = subjectsCache.get(gradeId)
      return
    }
    loadingSubjects.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/subjects?grade_id=${gradeId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        const list = normalizeList(data)
        subjects.value = list
        subjectsCache.set(gradeId, list)
        return
      }
      // fallback: fetch all subjects then filter
      const allRes = await fetch(`${config.public.apiBase}/api/subjects`, { credentials: 'include' })
      if (allRes.ok) {
        const allData = await allRes.json().catch(() => null)
        const list = normalizeList(allData)
        const filtered = list.filter((s: any) => {
          const g = s.grade_id ?? s.grade ?? (s.grade && typeof s.grade === 'object' ? s.grade.id : null) ?? ''
          return String(g) === String(gradeId)
        })
          subjects.value = filtered
          subjectsCache.set(gradeId, filtered)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingSubjects.value = false
    }
  }

  async function fetchAllTopics() {
    if (topics.value.length) {
      return
    }
    loadingTopics.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/topics`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        topics.value = normalizeList(data)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingTopics.value = false
    }
  }

  // Fetch a page of subjects (server-side pagination)
  async function fetchSubjectsPage(opts: { gradeId?: any, page?: number, perPage?: number, q?: string } = {}) {
    const { gradeId, page = 1, perPage = 20, q } = opts
    const key = `${gradeId || 'all'}|${page}|${perPage}|${q || ''}`
    if (subjectsPageCache.has(key)) return subjectsPageCache.get(key)
    loadingSubjects.value = true
    try {
      const params = new URLSearchParams()
      if (gradeId) params.set('grade_id', String(gradeId))
      if (q) params.set('q', q)
      if (perPage) params.set('per_page', String(perPage))
      if (page) params.set('page', String(page))
      const res = await fetch(`${config.public.apiBase}/api/subjects?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) return { items: [], meta: null }
      const data = await res.json().catch(() => null)
      const items = normalizeList(data)
      let meta = null
      if (data && data.subjects && data.subjects.meta) meta = data.subjects.meta
      else if (data && data.meta) meta = data.meta
      else if (data && data.subjects && (data.subjects.current_page || data.subjects.last_page)) meta = {
        current_page: data.subjects.current_page || 1,
        last_page: data.subjects.last_page || 1,
        per_page: data.subjects.per_page || perPage,
        total: data.subjects.total || items.length
      }
      const out = { items, meta }
      subjectsPageCache.set(key, out)
      return out
    } catch (e) {
      return { items: [], meta: null }
    } finally {
      loadingSubjects.value = false
    }
  }

  // Fetch a page of topics for a subject
  async function fetchTopicsPage(opts: { subjectId?: any, page?: number, perPage?: number, q?: string } = {}) {
    const { subjectId, page = 1, perPage = 20, q } = opts
    if (!subjectId) return { items: [], meta: null }
    const key = `${subjectId}|${page}|${perPage}|${q || ''}`
    if (topicsPageCache.has(key)) return topicsPageCache.get(key)
    loadingTopics.value = true
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (perPage) params.set('per_page', String(perPage))
      if (page) params.set('page', String(page))
      const res = await fetch(`${config.public.apiBase}/api/subjects/${subjectId}/topics?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) return { items: [], meta: null }
      const data = await res.json().catch(() => null)
      const items = normalizeList(data)
      let meta = null
      if (data && data.meta) meta = data.meta
      else if (data && data.topics && data.topics.meta) meta = data.topics.meta
      else if (data && data.topics && (data.topics.current_page || data.topics.last_page)) meta = {
        current_page: data.topics.current_page || 1,
        last_page: data.topics.last_page || 1,
        per_page: data.topics.per_page || perPage,
        total: data.topics.total || items.length
      }
      const out = { items, meta }
      topicsPageCache.set(key, out)
      return out
    } catch (e) {
      return { items: [], meta: null }
    } finally {
      loadingTopics.value = false
    }
  }

  async function fetchTopicsBySubject(subjectId: any) {
    if (!subjectId) {
      topics.value = []
      return
    }
    if (topicsCache.has(subjectId)) {
      topics.value = topicsCache.get(subjectId)
      return
    }
    loadingTopics.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/subjects/${subjectId}/topics`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
  const list = normalizeList(data)
  topics.value = list
  topicsCache.set(subjectId, list)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingTopics.value = false
    }
  }

  // selection setters and saver for step two
  function setSelectedGrade(id: any) {
    selectedGrade.value = extractId(id)
  }

  function setSelectedSubject(id: any) {
    selectedSubject.value = extractId(id)
  }

  function setSelectedTopic(id: any) {
    selectedTopic.value = extractId(id)
  }

  function saveStepTwo(payload: { grade_id?: any, subject_id?: any, topic_id?: any } = {}) {
    stepTwo.value = {
      grade_id: extractId(payload.grade_id ?? selectedGrade.value),
      subject_id: extractId(payload.subject_id ?? selectedSubject.value),
      topic_id: extractId(payload.topic_id ?? selectedTopic.value),
    }
    return stepTwo.value
  }

  return {
    grades,
    subjects,
    topics,
    loadingGrades,
    loadingSubjects,
    loadingTopics,
    fetchGrades,
    fetchAllSubjects,
    fetchSubjectsByGrade,
    fetchSubjectsPage,
    fetchAllTopics,
    fetchTopicsBySubject,
    fetchTopicsPage,
    // selection state & actions
    selectedGrade,
    selectedSubject,
    selectedTopic,
    stepTwo,
    setSelectedGrade,
    setSelectedSubject,
    setSelectedTopic,
    saveStepTwo,
  }
})
