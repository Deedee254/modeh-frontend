import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import useApi from '~/composables/useApi'

// singleton instance so multiple components share the same taxonomy state
let _singleton = null

function normalizeList(maybe) {
  if (!maybe) return []
  
  // API Resource returns data wrapped in { data: [...] }
  if (maybe.data && Array.isArray(maybe.data)) {
    return maybe.data
  }
  
  if (Array.isArray(maybe)) return maybe

  // Handle legacy shapes just in case
  if (maybe.subjects) return Array.isArray(maybe.subjects) ? maybe.subjects : (maybe.subjects.data || [])
  if (maybe.topics) return Array.isArray(maybe.topics) ? maybe.topics : (maybe.topics.data || [])
  if (maybe.grades) return Array.isArray(maybe.grades) ? maybe.grades : (maybe.grades.data || [])
  if (maybe.levels) return Array.isArray(maybe.levels) ? maybe.levels : (maybe.levels.data || [])

  return []
}

export default function useTaxonomy() {
  if (_singleton) return _singleton

  const grades = ref([])
  const subjects = ref([])
  const topics = ref([])
  const levels = ref([])

  const loadingLevels = ref(false)

  const loadingGrades = ref(false)
  const loadingSubjects = ref(false)
  const loadingTopics = ref(false)

  const subjectsCache = new Map()
  const topicsCache = new Map()
  const subjectsPageCache = new Map()
  const topicsPageCache = new Map()
  const gradesCache = new Map()
  const MAX_CACHE_ENTRIES = 150

  function isSimpleIdOnlyArray(arr) {
    if (!Array.isArray(arr)) return false
    return arr.every(it => it && typeof it === 'object' && Object.keys(it).length === 1 && Object.prototype.hasOwnProperty.call(it, 'id'))
  }

  function setCacheWithLimit(map, key, value) {
    try {
      if (map.size >= MAX_CACHE_ENTRIES) {
        // delete oldest entry (Map preserves insertion order)
        const firstKey = map.keys().next().value
        if (firstKey !== undefined) map.delete(firstKey)
      }
      map.set(key, value)
    } catch (e) {
      map.set(key, value)
    }
  }

  const config = useRuntimeConfig()
  const api = useApi()
  // promise used to coordinate concurrent fetchLevels callers (avoid busy-wait polling)
  let _levelsPromise = null

  async function fetchGrades() {
    // Ensure levels are loaded first — levels are the top-most taxonomy and
    // may contain nested grades. This makes fetchGrades() levels-first by
    // default so callers don't need to orchestrate fetchLevels() themselves.
    try {
      if ((!levels.value || !levels.value.length) && !loadingLevels.value) {
        await fetchLevels()
      }
    } catch (e) {
      // ignore fetchLevels errors and fall back to grades endpoint
    }
    loadingGrades.value = true
    try {
      // If a levels fetch is currently running, wait for it to finish so
      // we can reuse nested grades (this avoids two concurrent requests
      // for the same logical data and reduces SSR/CSR mismatch risk).
      // If a levels fetch is currently running, await the promise instead of busy-waiting
      if (loadingLevels.value && (!levels.value || !levels.value.length) && _levelsPromise) {
        try { await _levelsPromise } catch (e) { /* ignore */ }
      }

      // If levels were already loaded and include nested grades, prefer
      // deriving the flat grades list from `levels` instead of calling
      // the grades endpoint to avoid redundant requests.
      if (levels.value && levels.value.length) {
        const flat = []
        for (const l of levels.value) {
          const gList = (l.grades && Array.isArray(l.grades)) ? l.grades : []
          for (const g of gList) {
            // ensure id is string for consistency with normalizeList
            flat.push({ ...g, id: g.id ? String(g.id) : null })
          }
        }
        grades.value = flat
        return
      }

      const res = await api.get('/api/grades')
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

  async function fetchLevels() {
    // avoid refetching if we already have levels
    if (levels.value && levels.value.length) return
    // If a fetch is already in-flight, return that promise so callers can await it
    if (_levelsPromise) return _levelsPromise
    
    loadingLevels.value = true

    _levelsPromise = (async () => {
      try {
        const res = await api.get('/api/levels')
        if (!res.ok) {
          try { console.error('useTaxonomy.fetchLevels: response not ok', res.status) } catch (e) {}
          return
        }
        const data = await res.json().catch(() => null)
        if (!data) {
          try { console.error('useTaxonomy.fetchLevels: no data in response') } catch (e) {}
          return
        }
        
        // LevelResource::collection returns array directly, not wrapped in {data: []}
        const list = Array.isArray(data) ? data : (data.data || data.levels || [])
        
        levels.value = list.map(l => ({
          ...l,
          id: l.id ? String(l.id) : null,
          grades: (l.grades || []).map(g => ({ ...g, id: g.id ? String(g.id) : null }))
        }))
      } catch (e) {
        try { console.error('useTaxonomy.fetchLevels error:', e) } catch (err) {}
      } finally {
        loadingLevels.value = false
      }
    })()

    try {
      await _levelsPromise
    } finally {
      // Clear the promise reference after it settles so later calls start fresh
      _levelsPromise = null
    }
  }

  // Friendly header list: small objects with id,name,slug (slug optional)
  const headerLevels = computed(() => {
    if (!levels.value) return []
    return (levels.value || []).map(l => ({ id: l.id ? String(l.id) : l.id, name: l.name || l.display_name || '', slug: l.slug || null }))
  })

  async function fetchSubjectsByGrade(gradeId, levelId) {
    if (gradeId === null || gradeId === undefined || gradeId === '') {
      subjects.value = []
      return
    }
    const key = String(gradeId) + (levelId ? `|${levelId}` : '')
    if (subjectsCache.has(key)) {
      subjects.value = subjectsCache.get(key)
      return
    }
    loadingSubjects.value = true
    try {
      let url = `/api/subjects?grade_id=${encodeURIComponent(gradeId)}`
      if (levelId) {
        url += `&level_id=${encodeURIComponent(levelId)}`
      }
      const res = await api.get(url)
      if (!res.ok) {
        subjects.value = []
        subjectsCache.delete(key)
        return
      }
      const data = await res.json().catch(() => null)
      const list = normalizeList(data)
      const filtered = list.filter((s) => {
        if (!s) return false
        const gradeRef = s.grade_id ?? (s.grade && typeof s.grade === 'object' ? s.grade.id : null)
        if (gradeRef == null) return false
        return String(gradeRef) === String(gradeId)
      })
      subjects.value = filtered
      setCacheWithLimit(subjectsCache, key, filtered)
    } catch (e) {
      subjects.value = []
      subjectsCache.delete(key)
    } finally {
      loadingSubjects.value = false
    }
  }

  // Fetch grades filtered by level (server-side). Cached by levelId.
  async function fetchGradesByLevel(levelId) {
    if (levelId === null || levelId === undefined || levelId === '') {
      grades.value = []
      return
    }
    const key = String(levelId)
    if (gradesCache.has(key)) {
      grades.value = gradesCache.get(key)
      return
    }
    loadingGrades.value = true
    try {
      const res = await api.get(`/api/grades?level_id=${encodeURIComponent(levelId)}`)
      if (!res.ok) {
        grades.value = []
        return
      }
      const data = await res.json().catch(() => null)
      const list = normalizeList(data)
  grades.value = list
  setCacheWithLimit(gradesCache, key, list)
    } catch (e) {
      grades.value = []
    } finally {
      loadingGrades.value = false
    }
  }

  // Fetch all subjects (no grade filter) and populate subjects ref
  async function fetchAllSubjects() {
    loadingSubjects.value = true
    try {
      // If a levels fetch is currently running, wait for it to finish so
      // we can reuse nested subjects (avoids duplicate requests and keeps
      // the client state consistent between SSR and CSR).
      if (loadingLevels.value && (!levels.value || !levels.value.length)) {
        const start = Date.now()
        while (loadingLevels.value && Date.now() - start < 5000) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 50))
        }
      }

      // If levels were loaded and contain nested subjects, build the flat
      // subjects list from levels -> grades -> subjects to avoid an extra
      // API call and keep data consistent.
      if (levels.value && levels.value.length) {
        const flat = []
        for (const l of levels.value) {
          const gList = (l.grades && Array.isArray(l.grades)) ? l.grades : []
          for (const g of gList) {
            const sList = (g.subjects && Array.isArray(g.subjects)) ? g.subjects : []
            for (const s of sList) {
              flat.push({ ...s, id: s.id ? String(s.id) : null, grade_id: g.id ? String(g.id) : (s.grade_id ? String(s.grade_id) : null) })
            }
          }
        }
        subjects.value = flat
        return
      }

      const res = await api.get('/api/subjects')
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
  const res = await api.get(`/api/subjects?${params.toString()}`)
      if (!res.ok) return { items: [], meta: null }
      const data = await res.json().catch(() => null)
      // normalizeList will extract the items array from paginator shapes
      const items = normalizeList(data)
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
  setCacheWithLimit(subjectsPageCache, key, out)
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
      const res = await api.get(`/api/subjects/${subjectId}/topics`)
      if (res.ok) {
        const data = await res.json().catch(() => null)
    const list = normalizeList(data)
    topics.value = list
    setCacheWithLimit(topicsCache, key, list)
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
      // Request a large per_page limit to get all topics in one request
      // Backend limits max to 50, so we request 100 which gets capped at 50 per page
      // For most use cases, 50 topics per page is sufficient
      const res = await api.get('/api/topics?per_page=100')
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
      const res = await api.get(`/api/subjects/${subjectId}/topics?${params.toString()}`)
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
  setCacheWithLimit(topicsPageCache, key, out)
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

  _singleton = {
    grades,
    subjects,
    topics,
    levels,
    headerLevels,
    loadingGrades,
    loadingSubjects,
    loadingTopics,
    loadingLevels,
    fetchGrades,
    fetchGradesByLevel,
    fetchLevels,
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

  return _singleton
}

// named export for utility/helper usage in tests
export { normalizeList }

