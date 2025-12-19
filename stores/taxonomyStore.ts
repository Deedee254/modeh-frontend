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
  if (maybe.levels) {
    if (Array.isArray(maybe.levels)) return maybe.levels.filter(Boolean).map(normalizeItem)
    if (maybe.levels.data && Array.isArray(maybe.levels.data)) return maybe.levels.data.filter(Boolean).map(normalizeItem)
  }
  return []
}

// Cache management utilities
interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface CacheMetrics {
  hits: number
  misses: number
  inflight: number
}

function createCache<K, V>(ttlMs: number = 1000 * 60 * 5) {
  const memory = new Map<K, CacheEntry<any>>()
  const inflight = new Map<K, Promise<any>>()
  const metrics: CacheMetrics = { hits: 0, misses: 0, inflight: 0 }

  function isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > ttlMs
  }

  function set(key: K, value: any): void {
    memory.set(key, { data: value, timestamp: Date.now() })
  }

  function get(key: K): any {
    const entry = memory.get(key)
    if (!entry) {
      metrics.misses++
      return null
    }
    if (isExpired(entry)) {
      metrics.misses++
      return null
    }
    metrics.hits++
    return entry.data
  }

  function getStale(key: K): any {
    const entry = memory.get(key)
    return entry ? entry.data : null
  }

  function has(key: K): boolean {
    return get(key) !== null
  }

  function setInflight(key: K, promise: Promise<any>): void {
    inflight.set(key, promise)
    metrics.inflight++
  }

  function getInflight(key: K): Promise<any> | null {
    return inflight.get(key) ?? null
  }

  function clearInflight(key: K): void {
    inflight.delete(key)
    metrics.inflight = Math.max(0, metrics.inflight - 1)
  }

  function clear(): void {
    memory.clear()
    inflight.clear()
    metrics.hits = 0
    metrics.misses = 0
    metrics.inflight = 0
  }

  function clearExpired(): void {
    for (const [key, entry] of memory) {
      if (isExpired(entry)) memory.delete(key)
    }
  }

  function getMetrics(): CacheMetrics {
    return { ...metrics }
  }

  function getSize(): number {
    return memory.size
  }

  function logMetrics(name: string): void {
    const hitRate = metrics.hits + metrics.misses > 0
      ? ((metrics.hits / (metrics.hits + metrics.misses)) * 100).toFixed(2)
      : '0.00'
    console.log(
      `[Cache:${name}] Hits: ${metrics.hits}, Misses: ${metrics.misses}, Hit Rate: ${hitRate}%, Inflight: ${metrics.inflight}, Size: ${memory.size}`
    )
  }

  return { set, get, getStale, has, setInflight, getInflight, clearInflight, clear, clearExpired, getMetrics, getSize, logMetrics }
}

// localStorage persistence helper (client-only)
function persistToStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify({ data: value, timestamp: Date.now() }))
  } catch (e) {
    // ignore quota or security errors
  }
}

function readFromStorage(key: string, ttlMs: number = 1000 * 60 * 5): any {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > ttlMs) {
      localStorage.removeItem(key) // clean up expired
      return null
    }
    return parsed.data
  } catch (e) {
    return null
  }
}

function clearFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (e) {
    // ignore
  }
}

export const useTaxonomyStore = defineStore('taxonomy', () => {
  const config = useRuntimeConfig()

  const grades = ref<any[]>([])
  const subjects = ref<any[]>([])
  const topics = ref<any[]>([])
  const levels = ref<any[]>([])
  const courses = ref<any[]>([])

  const loadingGrades = ref(false)
  const loadingSubjects = ref(false)
  const loadingTopics = ref(false)
  const loadingLevels = ref(false)
  const loadingCourses = ref(false)

  // Default TTL: 5 minutes. Can be customized per store
  const ttl = ref(1000 * 60 * 5)

  // Create caches for each entity type
  const gradesCache = createCache<string, any[]>(ttl.value)
  const subjectsCache = createCache<string, any[]>(ttl.value)
  const topicsCache = createCache<string, any[]>(ttl.value)
  const levelsCache = createCache<string, any[]>(ttl.value)
  const coursesCache = createCache<string, any[]>(ttl.value)
  const subjectsPageCache = createCache<string, any>(ttl.value)
  const topicsPageCache = createCache<string, any>(ttl.value)

  const api = useApi()
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
    const cacheKey = 'all'
    // Try to get from cache first
    const cached = gradesCache.get(cacheKey)
    if (cached) {
      grades.value = cached
      return
    }
    // Check inflight to dedupe concurrent requests
    const inflight = gradesCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingGrades.value = true
    const promise = (async () => {
      try {
        const res = await api.get('/api/grades')
        if (!res.ok) return
        const data = await res.json()
        const list = normalizeList(data)
        grades.value = list
        gradesCache.set(cacheKey, list)
        persistToStorage('taxonomy:grades:all', list)
      } catch (e) {
        // Try stale cache from localStorage
        const stale = readFromStorage('taxonomy:grades:all', ttl.value * 2)
        if (stale) {
          grades.value = stale
          gradesCache.set(cacheKey, stale)
        }
      } finally {
        loadingGrades.value = false
        gradesCache.clearInflight(cacheKey)
      }
    })()
    
    gradesCache.setInflight(cacheKey, promise)
    return promise
  }

  // Fetch all courses (no grade filter)
  async function fetchCourses() {
    const cacheKey = 'all'
    const cached = coursesCache.get(cacheKey)
    if (cached) {
      courses.value = cached
      return
    }
    const inflight = coursesCache.getInflight(cacheKey)
    if (inflight) return inflight

    loadingCourses.value = true
    const promise = (async () => {
      try {
        const res = await api.get('/api/courses')
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        const list = normalizeList(data)
        courses.value = list
        coursesCache.set(cacheKey, list)
        persistToStorage('taxonomy:courses:all', list)
      } catch (e) {
        const stale = readFromStorage('taxonomy:courses:all', ttl.value * 2)
        if (stale) {
          courses.value = stale
          coursesCache.set(cacheKey, stale)
        }
      } finally {
        loadingCourses.value = false
        coursesCache.clearInflight(cacheKey)
      }
    })()

    coursesCache.setInflight(cacheKey, promise)
    return promise
  }

  async function fetchLevels() {
    const cacheKey = 'all'
    const cached = levelsCache.get(cacheKey)
    if (cached) {
      levels.value = cached
      return
    }
    const inflight = levelsCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingLevels.value = true
    const promise = (async () => {
      try {
        const res = await api.get('/api/levels')
        if (!res.ok) return
        const data = await res.json()
        const list = normalizeList(data)
        levels.value = list
        levelsCache.set(cacheKey, list)
        persistToStorage('taxonomy:levels:all', list)
      } catch (e) {
        const stale = readFromStorage('taxonomy:levels:all', ttl.value * 2)
        if (stale) {
          levels.value = stale
          levelsCache.set(cacheKey, stale)
        }
      } finally {
        loadingLevels.value = false
        levelsCache.clearInflight(cacheKey)
      }
    })()
    
    levelsCache.setInflight(cacheKey, promise)
    return promise
  }

  async function fetchGradesByLevel(levelId: any) {
    levelId = extractId(levelId)
    if (!levelId) {
      grades.value = []
      return
    }
    const key = String(levelId)
    const cached = gradesCache.get(key)
    if (cached) {
      grades.value = cached
      return
    }
    const inflight = gradesCache.getInflight(key)
    if (inflight) return inflight
    
    loadingGrades.value = true
    const promise = (async () => {
      try {
        const res = await api.get(`/api/grades?level_id=${encodeURIComponent(levelId)}`)
        if (!res.ok) {
          grades.value = []
          return
        }
        const data = await res.json()
        const list = normalizeList(data)
        grades.value = list
        gradesCache.set(key, list)
        persistToStorage(`taxonomy:grades:level:${key}`, list)
      } catch (e) {
        const stale = readFromStorage(`taxonomy:grades:level:${key}`, ttl.value * 2)
        if (stale) {
          grades.value = stale
          gradesCache.set(key, stale)
        } else {
          grades.value = []
        }
      } finally {
        loadingGrades.value = false
        gradesCache.clearInflight(key)
      }
    })()
    
    gradesCache.setInflight(key, promise)
    return promise
  }

  async function fetchAllSubjects() {
    const cacheKey = 'all'
    const cached = subjectsCache.get(cacheKey)
    if (cached) {
      subjects.value = cached
      return
    }
    const inflight = subjectsCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingSubjects.value = true
    const promise = (async () => {
      try {
        const res = await api.get('/api/subjects')
        if (!res.ok) return
        const data = await res.json()
        const list = normalizeList(data)
        subjects.value = list
        subjectsCache.set(cacheKey, list)
        persistToStorage('taxonomy:subjects:all', list)
      } catch (e) {
        const stale = readFromStorage('taxonomy:subjects:all', ttl.value * 2)
        if (stale) {
          subjects.value = stale
          subjectsCache.set(cacheKey, stale)
        }
      } finally {
        loadingSubjects.value = false
        subjectsCache.clearInflight(cacheKey)
      }
    })()
    
    subjectsCache.setInflight(cacheKey, promise)
    return promise
  }

  async function fetchSubjectsByGrade(gradeId: any) {
    gradeId = extractId(gradeId)
    if (!gradeId) {
      subjects.value = []
      return
    }
    const cacheKey = String(gradeId)
    const cached = subjectsCache.get(cacheKey)
    if (cached) {
      subjects.value = cached
      return
    }
    const inflight = subjectsCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingSubjects.value = true
    const promise = (async () => {
      try {
        const res = await api.get(`/api/subjects?grade_id=${gradeId}`)
        if (res.ok) {
          const data = await res.json()
          const list = normalizeList(data)
          subjects.value = list
          subjectsCache.set(cacheKey, list)
          persistToStorage(`taxonomy:subjects:grade:${cacheKey}`, list)
          return
        }
        // fallback: fetch all subjects then filter
        const allRes = await api.get('/api/subjects')
        if (allRes.ok) {
          const allData = await allRes.json()
          const list = normalizeList(allData)
          const filtered = list.filter((s: any) => {
            const g = s.grade_id ?? s.grade ?? (s.grade && typeof s.grade === 'object' ? s.grade.id : null) ?? ''
            return String(g) === String(gradeId)
          })
          subjects.value = filtered
          subjectsCache.set(cacheKey, filtered)
          persistToStorage(`taxonomy:subjects:grade:${cacheKey}`, filtered)
        }
      } catch (e) {
        const stale = readFromStorage(`taxonomy:subjects:grade:${cacheKey}`, ttl.value * 2)
        if (stale) {
          subjects.value = stale
          subjectsCache.set(cacheKey, stale)
        } else {
          subjects.value = []
        }
      } finally {
        loadingSubjects.value = false
        subjectsCache.clearInflight(cacheKey)
      }
    })()
    
    subjectsCache.setInflight(cacheKey, promise)
    return promise
  }

  async function fetchAllTopics() {
    const cacheKey = 'all'
    const cached = topicsCache.get(cacheKey)
    if (cached) {
      topics.value = cached
      return
    }
    const inflight = topicsCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingTopics.value = true
    const promise = (async () => {
      try {
        const res = await api.get('/api/topics')
        if (!res.ok) return
        const data = await res.json()
        const list = normalizeList(data)
        topics.value = list
        topicsCache.set(cacheKey, list)
        persistToStorage('taxonomy:topics:all', list)
      } catch (e) {
        const stale = readFromStorage('taxonomy:topics:all', ttl.value * 2)
        if (stale) {
          topics.value = stale
          topicsCache.set(cacheKey, stale)
        }
      } finally {
        loadingTopics.value = false
        topicsCache.clearInflight(cacheKey)
      }
    })()
    
    topicsCache.setInflight(cacheKey, promise)
    return promise
  }

  // Fetch a page of subjects (server-side pagination)
  async function fetchSubjectsPage(opts: { gradeId?: any, page?: number, perPage?: number, q?: string } = {}) {
    const { gradeId, page = 1, perPage = 20, q } = opts
    const key = `${gradeId || 'all'}|${page}|${perPage}|${q || ''}`
    
    const cached = subjectsPageCache.get(key)
    if (cached) return cached
    
    const inflight = subjectsPageCache.getInflight(key)
    if (inflight) return inflight
    
    loadingSubjects.value = true
    const promise = (async () => {
      try {
        const params = new URLSearchParams()
        if (gradeId) params.set('grade_id', String(gradeId))
        if (q) params.set('q', q)
        if (perPage) params.set('per_page', String(perPage))
        if (page) params.set('page', String(page))
        const res = await api.get(`/api/subjects?${params.toString()}`)
        if (!res.ok) return { items: [], meta: null }
        const data = await res.json()
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
        persistToStorage(`taxonomy:subjects:page:${key}`, out)
        return out
      } catch (e) {
        const stale = readFromStorage(`taxonomy:subjects:page:${key}`, ttl.value * 2)
        if (stale) {
          subjectsPageCache.set(key, stale)
          return stale
        }
        return { items: [], meta: null }
      } finally {
        loadingSubjects.value = false
        subjectsPageCache.clearInflight(key)
      }
    })()
    
    subjectsPageCache.setInflight(key, promise)
    return promise
  }

  // Fetch a page of topics for a subject
  async function fetchTopicsPage(opts: { subjectId?: any, page?: number, perPage?: number, q?: string } = {}) {
    const { subjectId, page = 1, perPage = 20, q } = opts
    if (!subjectId) return { items: [], meta: null }
    const key = `${subjectId}|${page}|${perPage}|${q || ''}`
    
    const cached = topicsPageCache.get(key)
    if (cached) return cached
    
    const inflight = topicsPageCache.getInflight(key)
    if (inflight) return inflight
    
    loadingTopics.value = true
    const promise = (async () => {
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (perPage) params.set('per_page', String(perPage))
        if (page) params.set('page', String(page))
        const res = await api.get(`/api/subjects/${subjectId}/topics?${params.toString()}`)
        if (!res.ok) return { items: [], meta: null }
        const data = await res.json()
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
        persistToStorage(`taxonomy:topics:page:${key}`, out)
        return out
      } catch (e) {
        const stale = readFromStorage(`taxonomy:topics:page:${key}`, ttl.value * 2)
        if (stale) {
          topicsPageCache.set(key, stale)
          return stale
        }
        return { items: [], meta: null }
      } finally {
        loadingTopics.value = false
        topicsPageCache.clearInflight(key)
      }
    })()
    
    topicsPageCache.setInflight(key, promise)
    return promise
  }

  async function fetchTopicsBySubject(subjectId: any) {
    subjectId = extractId(subjectId)
    if (!subjectId) {
      topics.value = []
      return
    }
    const cacheKey = String(subjectId)
    const cached = topicsCache.get(cacheKey)
    if (cached) {
      topics.value = cached
      return
    }
    const inflight = topicsCache.getInflight(cacheKey)
    if (inflight) return inflight
    
    loadingTopics.value = true
    const promise = (async () => {
      try {
        const res = await api.get(`/api/subjects/${subjectId}/topics`)
        if (!res.ok) {
          topics.value = []
          return
        }
        const data = await res.json()
        const list = normalizeList(data)
        topics.value = list
        topicsCache.set(cacheKey, list)
        persistToStorage(`taxonomy:topics:subject:${cacheKey}`, list)
      } catch (e) {
        const stale = readFromStorage(`taxonomy:topics:subject:${cacheKey}`, ttl.value * 2)
        if (stale) {
          topics.value = stale
          topicsCache.set(cacheKey, stale)
        } else {
          topics.value = []
        }
      } finally {
        loadingTopics.value = false
        topicsCache.clearInflight(cacheKey)
      }
    })()
    
    topicsCache.setInflight(cacheKey, promise)
    return promise
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

  // Cache control methods
  function setTTL(milliseconds: number) {
    ttl.value = milliseconds
  }

  function invalidateCache(type?: 'grades' | 'subjects' | 'topics' | 'levels' | 'courses' | 'all') {
    if (!type || type === 'all') {
      gradesCache.clear()
      subjectsCache.clear()
      topicsCache.clear()
      levelsCache.clear()
      coursesCache.clear()
      subjectsPageCache.clear()
      topicsPageCache.clear()
      // Clear localStorage
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:')) localStorage.removeItem(k)
      })
    } else if (type === 'grades') {
      gradesCache.clear()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:grades:')) localStorage.removeItem(k)
      })
    } else if (type === 'subjects') {
      subjectsCache.clear()
      subjectsPageCache.clear()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:subjects:')) localStorage.removeItem(k)
      })
    } else if (type === 'topics') {
      topicsCache.clear()
      topicsPageCache.clear()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:topics:')) localStorage.removeItem(k)
      })
    } else if (type === 'levels') {
      levelsCache.clear()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:levels:')) localStorage.removeItem(k)
      })
    } else if (type === 'courses') {
      coursesCache.clear()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('taxonomy:courses:')) localStorage.removeItem(k)
      })
    }
  }

  function clearExpiredCache() {
    gradesCache.clearExpired()
    subjectsCache.clearExpired()
    topicsCache.clearExpired()
    levelsCache.clearExpired()
    coursesCache.clearExpired()
    subjectsPageCache.clearExpired()
    topicsPageCache.clearExpired()
  }

  // SSR Hydration: Serialize cache for sending to client
  function serializeCache(): Record<string, any> {
    return {
      grades: grades.value,
      subjects: subjects.value,
      topics: topics.value,
      levels: levels.value,
      courses: courses.value,
    }
  }

  // SSR Hydration: Restore cache on client from server
  function hydrateCache(data: Record<string, any>) {
    if (data.grades && Array.isArray(data.grades)) {
      grades.value = data.grades
      gradesCache.set('all', data.grades)
      persistToStorage('taxonomy:grades:all', data.grades)
    }
    if (data.subjects && Array.isArray(data.subjects)) {
      subjects.value = data.subjects
      subjectsCache.set('all', data.subjects)
      persistToStorage('taxonomy:subjects:all', data.subjects)
    }
    if (data.topics && Array.isArray(data.topics)) {
      topics.value = data.topics
      topicsCache.set('all', data.topics)
      persistToStorage('taxonomy:topics:all', data.topics)
    }
    if (data.levels && Array.isArray(data.levels)) {
      levels.value = data.levels
      levelsCache.set('all', data.levels)
      persistToStorage('taxonomy:levels:all', data.levels)
    }
    if (data.courses && Array.isArray(data.courses)) {
      courses.value = data.courses
      coursesCache.set('all', data.courses)
      persistToStorage('taxonomy:courses:all', data.courses)
    }
  }

  // Cache metrics (dev tool)
  function getMetrics(): Record<string, any> {
    return {
      grades: gradesCache.getMetrics(),
      subjects: subjectsCache.getMetrics(),
      topics: topicsCache.getMetrics(),
      levels: levelsCache.getMetrics(),
      courses: coursesCache.getMetrics(),
      subjectsPage: subjectsPageCache.getMetrics(),
      topicsPage: topicsPageCache.getMetrics(),
    }
  }

  function printMetrics(): void {
    console.log('\n=== Taxonomy Store Cache Metrics ===')
    gradesCache.logMetrics('Grades')
    subjectsCache.logMetrics('Subjects')
    topicsCache.logMetrics('Topics')
    levelsCache.logMetrics('Levels')
    coursesCache.logMetrics('Courses')
    subjectsPageCache.logMetrics('SubjectsPage')
    topicsPageCache.logMetrics('TopicsPage')
    console.log('===================================\n')
  }

  return {
    grades,
    subjects,
    topics,
    levels,
    courses,
    loadingGrades,
    loadingSubjects,
    loadingTopics,
    loadingLevels,
    loadingCourses,
    ttl,
    fetchGrades,
    fetchLevels,
    fetchGradesByLevel,
    fetchAllSubjects,
    fetchSubjectsByGrade,
    fetchSubjectsPage,
    fetchAllTopics,
    fetchTopicsBySubject,
    fetchTopicsPage,
  fetchCourses,
    // selection state & actions
    selectedGrade,
    selectedSubject,
    selectedTopic,
    stepTwo,
    setSelectedGrade,
    setSelectedSubject,
    setSelectedTopic,
    saveStepTwo,
    // Cache control
    setTTL,
    invalidateCache,
    clearExpiredCache,
    // SSR & Hydration
    serializeCache,
    hydrateCache,
    // Metrics (dev)
    getMetrics,
    printMetrics,
  }
})
