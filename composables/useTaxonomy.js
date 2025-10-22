import { ref } from 'vue'

function normalizeList(maybe) {
  if (!maybe) return []

  // If caller passed a plain array of simple id-only objects (eg. [{id:1},{id:2}])
  // treat it as a pass-through for compatibility with older callers/tests.
  if (Array.isArray(maybe)) {
    const allSimpleIdOnly = maybe.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
    if (allSimpleIdOnly) return maybe
  }

  function normalizeItem(it) {
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
  if (maybe.data && Array.isArray(maybe.data)) {
    // If the inner array is already simple id-only objects, return as-is for compatibility
    const inner = maybe.data
    const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
    if (allSimpleIdOnly) return inner
    return inner.filter(Boolean).map(normalizeItem)
  }
  if (maybe.grades) {
    if (Array.isArray(maybe.grades)) {
      const inner = maybe.grades
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
    if (maybe.grades.data && Array.isArray(maybe.grades.data)) {
      const inner = maybe.grades.data
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
  }
  if (maybe.subjects) {
    if (Array.isArray(maybe.subjects)) {
      const inner = maybe.subjects
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
    if (maybe.subjects.data && Array.isArray(maybe.subjects.data)) {
      const inner = maybe.subjects.data
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
  }
  if (maybe.topics) {
    if (Array.isArray(maybe.topics)) {
      const inner = maybe.topics
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
    if (maybe.topics.data && Array.isArray(maybe.topics.data)) {
      const inner = maybe.topics.data
      const allSimpleIdOnly = inner.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
      if (allSimpleIdOnly) return inner
      return inner.filter(Boolean).map(normalizeItem)
    }
  }
  return []
}

export default function useTaxonomy() {
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

  

  const config = useRuntimeConfig()

  async function fetchGrades() {
    loadingGrades.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/grades`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      const list = normalizeList(data)
      grades.value = list
    } catch (e) {
      // ignore
    } finally {
      loadingGrades.value = false
    }
  }

  async function fetchSubjectsByGrade(gradeId) {
    // treat explicit null/undefined/empty-string as no-grade; allow 0 if it were valid
    if (gradeId === null || gradeId === undefined || gradeId === '') {
      subjects.value = []
      return
    }
    const key = String(gradeId)
    // return cached if available
    if (subjectsCache.has(key)) {
      subjects.value = subjectsCache.get(key)
      return
    }
    loadingSubjects.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/subjects?grade_id=${gradeId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
  const list = normalizeList(data)
    subjects.value = list
  subjectsCache.set(key, list)
        return
      }
      // fallback: fetch all subjects then filter
      const allRes = await fetch(`${config.public.apiBase}/api/subjects`, { credentials: 'include' })
      if (allRes.ok) {
        const allData = await allRes.json().catch(() => null)
        const list = normalizeList(allData)
        const filtered = list.filter(s => {
          const g = s.grade_id ?? s.grade ?? (s.grade && typeof s.grade === 'object' ? s.grade.id : null) ?? ''
          return String(g) === key
        })
        subjects.value = filtered
        subjectsCache.set(key, filtered)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingSubjects.value = false
    }
  }

  // Fetch all subjects (no grade filter) and populate subjects ref
  async function fetchAllSubjects() {
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

  // Fetch a page of subjects (keeps pagination on server)
  // opts: { gradeId, page = 1, perPage = 20, q }
  async function fetchSubjectsPage(opts = {}) {
    const { gradeId, page = 1, perPage = 20, q } = opts
    const key = `${gradeId || 'all'}|${page}|${perPage}|${q || ''}`
    if (subjectsPageCache.has(key)) return subjectsPageCache.get(key)
    loadingSubjects.value = true
    try {
      const params = new URLSearchParams()
  if (gradeId !== null && gradeId !== undefined && gradeId !== '') params.set('grade_id', String(gradeId))
      if (q) params.set('q', q)
      if (perPage) params.set('per_page', perPage)
      if (page) params.set('page', page)
  // debug: log constructed url to ensure grade_id param is passed
  try { console.debug('useTaxonomy.fetchSubjectsPage: fetching', `${config.public.apiBase}/api/subjects?${params.toString()}`) } catch (e) {}
  const res = await fetch(`${config.public.apiBase}/api/subjects?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) return { items: [], meta: null }
      const data = await res.json().catch(() => null)
      // normalizeList will extract the items array from paginator shapes
      const items = normalizeList(data)
  try { console.debug('useTaxonomy.fetchSubjectsPage: fetched items', items.length) } catch (e) {}
      // extract meta - support multiple shapes
      let meta = null
      if (data && data.subjects && data.subjects.meta) meta = data.subjects.meta
      else if (data && data.subjects && (data.subjects.current_page || data.subjects.last_page)) meta = {
        current_page: data.subjects.current_page || 1,
        last_page: data.subjects.last_page || 1,
        per_page: data.subjects.per_page || perPage,
        total: data.subjects.total || items.length
      }
      else if (data && data.meta) meta = data.meta
      const out = { items, meta }
  subjectsPageCache.set(key, out)
  // also populate the public subjects ref so callers that call this function
  // (eg. page preloaders) get immediate access to the items
  subjects.value = items
  return out
    } catch (e) {
      return { items: [], meta: null }
    } finally {
      loadingSubjects.value = false
    }
  }

  async function fetchTopicsBySubject(subjectId) {
    if (!subjectId) {
      topics.value = []
      return
    }
    const key = String(subjectId)
    if (topicsCache.has(key)) {
      topics.value = topicsCache.get(key)
      return
    }
    loadingTopics.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/api/subjects/${subjectId}/topics`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
  const list = normalizeList(data)
  topics.value = list
  topicsCache.set(key, list)
      }
    } catch (e) {
      // ignore
    } finally {
      loadingTopics.value = false
    }
  }

  // Fetch all topics (no subject filter)
  async function fetchAllTopics() {
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

  // Fetch a page of topics for a subject
  async function fetchTopicsPage(opts = {}) {
    const { subjectId, page = 1, perPage = 20, q } = opts
    if (!subjectId) return { items: [], meta: null }
    const key = `${subjectId}|${page}|${perPage}|${q || ''}`
    if (topicsPageCache.has(key)) return topicsPageCache.get(key)
    loadingTopics.value = true
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (perPage) params.set('per_page', perPage)
      if (page) params.set('page', page)
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
  // populate topics ref for consumers
  topics.value = items
  return out
    } catch (e) {
      return { items: [], meta: null }
    } finally {
      loadingTopics.value = false
    }
  }

  const addSubject = (subject) => {
    if (!subject || !subject.id) return
    subjects.value = [subject, ...subjects.value.filter(s => s.id !== subject.id)]
    const g = subject.grade_id || subject.grade
    if (g) {
      const key = String(g)
      const existing = subjectsCache.get(key) || []
      subjectsCache.set(key, [subject, ...existing.filter(s => s.id !== subject.id)])
    }
  }

  const addTopic = (topic) => {
    if (!topic || !topic.id) return
    topics.value = [topic, ...topics.value.filter(t => t.id !== topic.id)]
    const s = topic.subject_id
    if (s) {
      const existing = topicsCache.get(String(s)) || []
      topicsCache.set(String(s), [topic, ...existing.filter(t => t.id !== topic.id)])
    }
  }

  return {
    grades,
    subjects,
    topics,
    loadingGrades,
    loadingSubjects,
    loadingTopics,
    fetchGrades,
    fetchSubjectsByGrade,
    fetchAllSubjects,
    fetchSubjectsPage,
    fetchTopicsBySubject,
    fetchAllTopics,
    fetchTopicsPage,
    // allow runtime insertion of new subjects/topics into caches
    addSubject,
    addTopic,
    // helper exported for unit tests and other consumers
    normalizeList
  }
}

// named export for utility/helper usage in tests
export { normalizeList }
