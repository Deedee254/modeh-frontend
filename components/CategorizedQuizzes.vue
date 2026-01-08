<template>
  <section :class="['relative py-20 overflow-hidden', bgClass]">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
       <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand-50/40 rounded-full blur-3xl"></div>
       <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-50/40 rounded-full blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4">
             <span class="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
             {{ props.type === 'subject' ? 'Subjects' : props.type === 'topic' ? 'Topics' : 'Levels' }}
          </div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
             {{ props.title }}
          </h3>
          <p class="mt-4 text-lg text-slate-600 leading-relaxed font-medium">
             {{ props.subtitle }}
          </p>
        </div>
        
        <!-- Optional global view all link if appropriate, or just leave it to per-category -->
      </header>

      <!-- Categories Grid -->
      <div v-if="props.loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <svg class="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p class="text-slate-600 text-sm font-medium">Loading quizzes...</p>
        </div>
      </div>

      <div v-else :class="gridClasses">
        <template v-if="visibleLevels.length === 0">
          <div class="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
             <Icon name="heroicons:sparkles" class="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p class="text-slate-500 font-medium text-lg">New content arriving soon.</p>
          </div>
        </template>
        
        <div 
          v-else
          v-for="level in visibleLevels" 
          :key="level.id || level.slug || level.name" 
          class="group flex flex-col rounded-xl bg-white overflow-hidden border border-slate-300 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <!-- Category Header -->
          <div class="flex items-center justify-between mb-0 p-5 bg-[#800020] rounded-t-lg">
            <h4 class="font-bold text-white group-hover:text-white/90 transition-colors truncate pr-2">
               {{ level.name }}
            </h4>
            <NuxtLink 
              :to="makeQuizListRoute(level)"
              class="flex-shrink-0 text-[11px] font-bold uppercase tracking-tighter text-white/80 hover:text-white flex items-center gap-1 group/link"
            >
              All
              <Icon name="heroicons:arrow-right" class="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
            </NuxtLink>
          </div>

          
          <!-- Quiz Content -->
          <div class="flex-1 p-5">
            <div v-if="(levelQuizzes(level) || []).length === 0" class="h-40 flex items-center justify-center text-xs text-slate-400 font-medium italic">
               No quizzes yet
            </div>

            <div v-else class="space-y-3">
              <UiQuizCard
                v-for="(quiz, idx) in (levelQuizzes(level) || []).slice(0, 3)"
                :key="quiz.id || quiz.slug"
                :horizontal="true"
                :clean="false"
                :hide-image="true"
                :to="{ path: `/quizzes/${quiz.slug || quiz.id}` }"
                :title="quiz.title"
                :topic="quiz.topic?.name || quiz.topic_name"
                :likes="quiz.likes_count ?? quiz.likes ?? 0"
                :questions-count="quiz.questions_count ?? quiz.questions ?? quiz.items_count"
                :quiz-id="quiz.id"
                class="hover:translate-x-1 transition-transform"
              />
            </div>
          </div>

          <!-- Action Footer inside card -->
          <div class="mt-0 p-5 pt-4 border-t border-slate-200 flex items-center justify-between">
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {{ level.quizzes_count ?? level.items_count ?? (levelQuizzes(level) || []).length }} Quizzes
             </span>
             <NuxtLink 
               :to="makeQuizListRoute(level)"
               class="text-xs font-bold text-brand-700 hover:text-brand-800"
             >
                Explore
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'

import { ref, watch, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import useApi from '~/composables/useApi'

const props = defineProps({
  levels: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  // type of taxonomy items: 'level' | 'subject' | 'topic'
  type: { type: String, default: 'level' },
  // number of columns on large screens (3 or 4)
  columns: { type: Number, default: 3 },
  // title/subtitle overrides for reuse
  title: { type: String, default: 'Learning levels with quizzes' },
  subtitle: { type: String, default: 'Explore popular learning levels and jump straight into quizzes curated for each level.' }
  ,
  bgClass: { type: String, default: 'bg-gradient-to-tr from-[#800020]/8 via-white to-[#800020]/4' }
})

// Expose props as a safe array
const propsLevels = computed(() => Array.isArray(props.levels) ? props.levels : [])

// Only show items that actually have quizzes. We prefer embedded quizzes but
// also consult the local cache populated by `fetchQuizzesForLevel`.
// Show all provided levels/categories. Each card will display "No quizzes yet"
// when there are no quizzes. This ensures Subject/Topic sections render even
// when quizzes are not available yet and improves perceived UX on the
// homepage where taxonomy items are often shown before their quizzes are
// populated.
// Only show taxonomy items that have quizzes (either embedded, topic counts, or cached)
const visibleLevels = computed(() => {
  return propsLevels.value.filter((item) => {
    if (!item) return false
    // Embedded quizzes present
    const embedded = extractQuizzesFromLevel(item)
    if (Array.isArray(embedded) && embedded.length > 0) return true

    // Subject items may include quizzes_count or topics with quizzes_count
    if (props.type === 'subject') {
      if (typeof item.quizzes_count === 'number' && item.quizzes_count > 0) return true
      if (Array.isArray(item.topics) && item.topics.some(t => (t?.quizzes_count || 0) > 0)) return true
    }

    // Topic items may include quizzes_count
    if (props.type === 'topic') {
      if (typeof item.quizzes_count === 'number' && item.quizzes_count > 0) return true
    }

    // Check cached fetched quizzes
    const id = String(item.id ?? item.slug ?? item.name ?? '')
    const cached = levelQuizzesMap.value[id]
    if (Array.isArray(cached) && cached.length > 0) return true

    // Otherwise exclude (we may trigger a background fetch to populate cache elsewhere)
    return false
  })
})

// computed grid classes based on columns prop
const gridClasses = computed(() => {
  if (props.columns === 4) {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6'
  }
  // Default/Auto magic density
  return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
})

// Build a route object that navigates to the quizzes listing filtered by the
// current taxonomy item (level/subject/topic). Using route objects avoids
// manual string concatenation and ensures proper encoding.
function makeQuizListRoute(item) {
  const id = item?.id ?? item?.slug ?? item?.name ?? null
  if (!id) return { path: '/quizzes' }
  // Prefer numeric IDs for backend filters; if we only have a slug use the
  // slug-based query param so the quizzes listing can handle it.
  const isNumeric = String(id).match(/^\d+$/)
  if (props.type === 'subject') return isNumeric ? { path: '/quizzes', query: { subject_id: String(id) } } : { path: '/quizzes', query: { subject: String(id) } }
  if (props.type === 'topic') return isNumeric ? { path: '/quizzes', query: { topic_id: String(id) } } : { path: '/quizzes', query: { topic: String(id) } }
  return { path: '/quizzes', query: { level_id: String(id) } }
}

// Local cache mapping level id -> quizzes array (to avoid repeated network calls)
const levelQuizzesMap = ref({})
const api = useApi()

function extractQuizzesFromLevel(level) {
  if (!level) return null
  // common fields where quizzes might be stored
  return level.quizzes || level.top_quizzes || level.items || level.quizzes_list || null
}

const slugIdCache = ref({})

async function resolveSlugToId(type, slug) {
  if (!slug) return null
  const key = `${type}:${slug}`
  if (slugIdCache.value[key]) return slugIdCache.value[key]

  try {
    const apiRef = useApi()
    const taxonomy = useTaxonomy()

    // 1) Check in-memory taxonomy caches first (fast, avoids network)
    try {
      if (type === 'subject') {
        const list = taxonomy.subjects?.value || []
        const found = list.find(s => String(s.slug) === String(slug) || String(s.name) === String(slug))
        if (found?.id) {
          slugIdCache.value[key] = found.id
          console.debug('[CategorizedQuizzes] resolveSlugToId (cache) found', { type, slug, id: found.id })
          return found.id
        }
      } else if (type === 'topic') {
        const list = taxonomy.topics?.value || []
        const found = list.find(t => String(t.slug) === String(slug) || String(t.name) === String(slug))
        if (found?.id) {
          slugIdCache.value[key] = found.id
          console.debug('[CategorizedQuizzes] resolveSlugToId (cache) found', { type, slug, id: found.id })
          return found.id
        }
      }
    } catch (e) {
      // ignore cache lookup errors
    }

    // 2) Fallback to paginated API lookup. Try q search first then brute-force pages.
    const plural = type === 'subject' ? 'subjects' : 'topics'
    const perPage = 50
    let page = 1
    const maxPages = 5

    // Try a q-based search (if supported by backend) as a cheap first attempt
    try {
      const qRes = await apiRef.get(`/api/${plural}?per_page=${perPage}&q=${encodeURIComponent(String(slug))}`)
      if (qRes.ok) {
        const qData = await qRes.json().catch(() => null)
        const list = (qData && (qData[plural] || qData.data || [])) || []
        const candidate = (Array.isArray(list) && list.find(item => String(item.slug) === String(slug) || String(item.name) === String(slug))) || null
        if (candidate?.id) {
          slugIdCache.value[key] = candidate.id
          console.debug('[CategorizedQuizzes] resolveSlugToId (q) found', { type, slug, id: candidate.id })
          return candidate.id
        }
      }
    } catch (e) {
      // ignore q search errors
    }

    // If q search didn't find it, iterate pages (safe but limited)
    for (; page <= maxPages; page++) {
      try {
        const res = await apiRef.get(`/api/${plural}?per_page=${perPage}&page=${page}`)
        if (!res.ok) break
        const data = await res.json().catch(() => null)
        const list = (data && (data[plural] || data.data || [])) || []
        if (!Array.isArray(list) || list.length === 0) break
        const candidate = list.find(item => String(item.slug) === String(slug) || String(item.name) === String(slug)) || null
        if (candidate?.id) {
          slugIdCache.value[key] = candidate.id
          console.debug('[CategorizedQuizzes] resolveSlugToId (paged) found', { type, slug, id: candidate.id, page })
          return candidate.id
        }
      } catch (e) {
        // break out on network issues
        break
      }
    }
  } catch (e) {
    console.warn('[CategorizedQuizzes] resolveSlugToId error', e)
  }
  console.warn('[CategorizedQuizzes] resolveSlugToId not found', { type, slug })
  return null
}

async function fetchQuizzesForLevel(level, perPage = 3) {
  if (!level) return []
  const id = level.id ?? level.slug ?? level.name
  if (!id) return []
  // already have embedded quizzes
  const embedded = extractQuizzesFromLevel(level)
  if (embedded && Array.isArray(embedded) && embedded.length) {
    levelQuizzesMap.value[String(id)] = embedded
    return embedded
  }

  // if cached, return
  if (levelQuizzesMap.value[String(id)]) return levelQuizzesMap.value[String(id)]

  try {
    const paramName = props.type === 'subject' ? 'subject_id' : (props.type === 'topic' ? 'topic_id' : 'level_id')
    let paramValRaw = level.id || level.slug || ''

    // If we received a slug (non-numeric) for subject/topic, resolve it to numeric id
    if ((paramName === 'subject_id' || paramName === 'topic_id') && paramValRaw && String(paramValRaw).match(/[^0-9]/)) {
      const resolved = await resolveSlugToId(props.type, String(paramValRaw))
      if (resolved) paramValRaw = resolved
      // else leave as-is; backend will return empty set
    }

    const paramVal = encodeURIComponent(paramValRaw || '')
    const endpoint = `/api/quizzes?${paramName}=${paramVal}&per_page=${perPage}`
    // Debug logs to help diagnose homepage taxonomy/quizzes issues
    console.debug('[CategorizedQuizzes] fetchQuizzesForLevel', { level: level && (level.id || level.slug || level.name), paramName, paramVal, endpoint })
    const res = await api.get(endpoint)
    console.debug('[CategorizedQuizzes] fetch response', { status: res.status })
    if (!res.ok) {
      levelQuizzesMap.value[String(id)] = []
      return []
    }
    const data = await res.json().catch(() => null)
    const quizzes = (data && (data.quizzes?.data || data.quizzes || data.data)) || []
    // store an empty array if no quizzes to avoid re-fetching repeatedly
    levelQuizzesMap.value[String(id)] = quizzes
    console.debug('[CategorizedQuizzes] fetched quizzes count', { id: String(id), count: quizzes.length })
    return quizzes
  } catch (e) {
    console.warn('[CategorizedQuizzes] fetchQuizzesForLevel error', e)
    levelQuizzesMap.value[String(id)] = []
    return []
  }
}

// Public accessor used by template: prefer embedded quizzes, else our fetched cache
function levelQuizzes(level) {
  if (!level) return []
  const embedded = extractQuizzesFromLevel(level)
  if (embedded && Array.isArray(embedded)) return embedded
  const id = level.id ?? level.slug ?? level.name
  if (!id) return []
  return levelQuizzesMap.value[String(id)] || []
}

// Watch incoming levels prop and fetch a small number of quizzes for each level
watch(propsLevels, (newVal) => {
  if (!Array.isArray(newVal) || newVal.length === 0) return

  // Only fetch levels that don't already have embedded quizzes or a cached value.
  const levelsToFetch = newVal.filter((level) => {
    if (!level) return false
    const embedded = extractQuizzesFromLevel(level)
    if (Array.isArray(embedded) && embedded.length) return false
    const id = String(level.id ?? level.slug ?? level.name ?? '')
    const cached = levelQuizzesMap.value[id]
    return !(Array.isArray(cached) && cached.length > 0)
  })

  if (levelsToFetch.length === 0) return

  // Limit concurrency to avoid flooding the backend and improve perceived load time.
  const batchSize = 4
  const perPage = 3

  ;(async () => {
    try {
      for (let i = 0; i < levelsToFetch.length; i += batchSize) {
        const batch = levelsToFetch.slice(i, i + batchSize)
        await Promise.all(batch.map(level => fetchQuizzesForLevel(level, perPage).catch(() => {})))
        // small delay between batches can help in very slow networks / backends
        // await new Promise(r => setTimeout(r, 50))
      }
    } catch (e) {
      // ignore individual fetch errors; UI will render placeholders where needed
    }
  })()
}, { immediate: true })

onMounted(() => {
  // ensure any initial prop levels are fetched (watch with immediate handles this too)
})
</script>

<style scoped>
.animate-pulse { /* simple pulse skeleton */
  animation: pulse 1.2s infinite ease-in-out;
}
@keyframes pulse {
  0% { opacity: 1 }
  50% { opacity: 0.5 }
  100% { opacity: 1 }
}
</style>
