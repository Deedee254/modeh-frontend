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
                :key="quiz.slug || idx"
                :quiz="quiz"
                :horizontal="true"
                :clean="false"
                :hide-image="true"
                :to="{ path: `/quizzes/${quiz.slug}` }"
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
import { computed, reactive } from 'vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
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

    // Check for quizzes_count field (all types: levels, subjects, topics)
    // This field should be returned by the backend with withCount('quizzes')
    if (typeof item.quizzes_count === 'number' && item.quizzes_count > 0) return true

    // For LEVELS: count quizzes from nested grades → subjects → topics
    if (props.type === 'level') {
      if (Array.isArray(item.grades)) {
        for (const grade of item.grades) {
          if (Array.isArray(grade.subjects)) {
            for (const subject of grade.subjects) {
              if (Array.isArray(subject.topics)) {
                if (subject.topics.some(t => (t?.quizzes_count || 0) > 0)) return true
              }
            }
          }
        }
      }
    }

    // Subject items may include topics with quizzes_count
    if (props.type === 'subject') {
      if (Array.isArray(item.topics) && item.topics.some(t => (t?.quizzes_count || 0) > 0)) return true
    }

    // Check cached fetched quizzes
    const cacheId = String(item.slug || item.id || item.name || '')
    const cached = levelQuizzesMap[cacheId]
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
  const slug = item?.slug || item?.id || item?.name || null
  if (!slug) return { path: '/quizzes' }

  // Prefer slugs as requested by the user
  const isNumeric = String(slug).match(/^\d+$/)
  
  if (props.type === 'subject') {
    return isNumeric ? { path: '/quizzes', query: { subject_id: String(slug) } } : { path: '/quizzes', query: { subject: String(slug) } }
  }
  if (props.type === 'topic') {
    return isNumeric ? { path: '/quizzes', query: { topic_id: String(slug) } } : { path: '/quizzes', query: { topic: String(slug) } }
  }
  // Default to level
  return isNumeric ? { path: '/quizzes', query: { level_id: String(slug) } } : { path: '/quizzes', query: { level: String(slug) } }
}

// Local cache mapping level id -> quizzes array (to avoid repeated network calls)
const levelQuizzesMap = reactive({})
const api = useApi()

// Track pending fetch requests to avoid duplicates
const pendingFetches = new Map()
let fetchAbortController = null
let pendingFetchTimer = null

function extractQuizzesFromLevel(level) {
  if (!level) return null
  // common fields where quizzes might be stored
  const quizzes = level.quizzes || level.top_quizzes || level.items || level.quizzes_list || null
  if (Array.isArray(quizzes) && quizzes.length > 0) return quizzes
  
  // For subjects: try to extract quizzes from embedded topics
  // (though we prefer fetching them directly from /api/quizzes endpoint)
  if (props.type === 'subject' && Array.isArray(level.topics)) {
    const topicQuizzes = []
    for (const topic of level.topics) {
      if (Array.isArray(topic.quizzes)) {
        topicQuizzes.push(...topic.quizzes)
      }
    }
    if (topicQuizzes.length > 0) return topicQuizzes
  }
  
  return null
}

async function fetchQuizzesForLevel(level, perPage = 3) {
  if (!level) return []
  const cacheId = String(level.slug || level.id || level.name || '')
  if (!cacheId) return []
  
  // already have embedded quizzes
  const embedded = extractQuizzesFromLevel(level)
  if (embedded) {
    levelQuizzesMap[cacheId] = embedded
    return embedded
  }

  // if cached, return
  if (levelQuizzesMap[cacheId]) return levelQuizzesMap[cacheId]

  // if already fetching, return the pending promise
  if (pendingFetches.has(cacheId)) {
    return pendingFetches.get(cacheId)
  }

  try {
    // Use ID by default for more reliable filtering; fall back to slug
    const identifier = level.id || level.slug
    if (!identifier) {
      levelQuizzesMap[cacheId] = []
      return []
    }
    
    const isNumeric = String(identifier).match(/^\d+$/)
    
    let paramName = ''
    if (props.type === 'subject') {
      paramName = isNumeric ? 'subject_id' : 'subject'
    } else if (props.type === 'topic') {
      paramName = isNumeric ? 'topic_id' : 'topic'
    } else {
      paramName = isNumeric ? 'level_id' : 'level'
    }

    const fetchPromise = (async () => {
      try {
        const res = await api.get(`/api/quizzes?${paramName}=${encodeURIComponent(identifier)}&per_page=${perPage}&approved=1`)
        if (!res.ok) {
          levelQuizzesMap[cacheId] = []
          return []
        }
        const data = await res.json().catch(() => ({}))
        // Handle both paginated and direct array responses
        const quizzes = (data && (data.quizzes?.data || data.data || (Array.isArray(data.quizzes) ? data.quizzes : (Array.isArray(data) ? data : [])))) || []
        levelQuizzesMap[cacheId] = quizzes
        return quizzes
      } catch (e) {
        console.error(`[CategorizedQuizzes] Error fetching quizzes for ${props.type}:`, e)
        levelQuizzesMap[cacheId] = []
        return []
      } finally {
        pendingFetches.delete(cacheId)
      }
    })()

    pendingFetches.set(cacheId, fetchPromise)
    return fetchPromise
  } catch (e) {
    console.error(`[CategorizedQuizzes] Error in fetchQuizzesForLevel:`, e)
    levelQuizzesMap[cacheId] = []
    return []
  }
}

// Public accessor used by template: prefer embedded quizzes, else our fetched cache
function levelQuizzes(level) {
  if (!level) return []
  const embedded = extractQuizzesFromLevel(level)
  if (embedded) return embedded
  const cacheId = String(level.slug || level.id || level.name || '')
  return levelQuizzesMap[cacheId] || []
}

// Debounced batch fetch to avoid hammering the API on rapid prop changes
function scheduleBatchFetch(levelsToFetch) {
  if (pendingFetchTimer) {
    clearTimeout(pendingFetchTimer)
  }

  pendingFetchTimer = setTimeout(() => {
    const MAX_CONCURRENT = 3
    const perPage = 3

    // Fetch all in parallel with concurrency limit
    ;(async () => {
      const queue = [...levelsToFetch]
      const active = []

      while (queue.length > 0 || active.length > 0) {
        // Add new requests up to MAX_CONCURRENT limit
        while (active.length < MAX_CONCURRENT && queue.length > 0) {
          const level = queue.shift()
          const promise = fetchQuizzesForLevel(level, perPage).catch(() => {})
          active.push(promise)
        }

        // Wait for at least one to complete before adding more
        if (active.length > 0) {
          await Promise.race(active)
          active.splice(active.findIndex(p => p.then(() => true).catch(() => false)), 1)
        }
      }
    })().catch(() => {})

    pendingFetchTimer = null
  }, 50) // Reduced debounce to 50ms to avoid perceived slowness
}

// Watch incoming levels prop and fetch a small number of quizzes for each level
watch(propsLevels, (newVal) => {
  if (!Array.isArray(newVal) || newVal.length === 0) return

  // Only fetch levels that don't already have embedded quizzes or a cached value.
  const levelsToFetch = newVal.filter((level) => {
    if (!level) return false
    const embedded = extractQuizzesFromLevel(level)
    if (embedded) return false
    const cacheId = String(level.slug || level.id || level.name || '')
    return !levelQuizzesMap[cacheId] && !pendingFetches.has(cacheId)
  })

  if (levelsToFetch.length === 0) return

  // Debounce and batch fetch requests
  scheduleBatchFetch(levelsToFetch)
}, { immediate: true })

onMounted(() => {
  // ensure any initial prop levels are fetched (watch with immediate handles this too)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (pendingFetchTimer) {
    clearTimeout(pendingFetchTimer)
  }
  pendingFetches.clear()
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
