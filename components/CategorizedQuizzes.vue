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
      <div :class="gridClasses">
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

          <!-- Quiz Loading State -->
          <div v-if="loading" class="space-y-4 p-5">
            <div v-for="n in 3" :key="n" class="h-16 rounded-lg bg-slate-50 animate-pulse"></div>
          </div>

          <!-- Quiz Content -->
          <div v-else class="flex-1 p-5">
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
                {{ (levelQuizzes(level) || []).length }}+ Quizzes
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
const visibleLevels = computed(() => {
  return propsLevels.value.filter((item) => {
    if (!item) return false
    const embedded = extractQuizzesFromLevel(item)
    if (Array.isArray(embedded) && embedded.length > 0) return true
    const id = String(item.id ?? item.slug ?? item.name ?? '')
    const cached = levelQuizzesMap.value[id]
    return Array.isArray(cached) && cached.length > 0
  })
})

// computed grid classes based on columns prop
const gridClasses = computed(() => {
  if (props.columns === 4) {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
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
  if (props.type === 'subject') return { path: '/quizzes', query: { subject_id: String(id) } }
  if (props.type === 'topic') return { path: '/quizzes', query: { topic_id: String(id) } }
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
  const paramVal = encodeURIComponent(level.id || level.slug || '')
  const res = await api.get(`/api/quizzes?${paramName}=${paramVal}&per_page=${perPage}`)
    if (!res.ok) return []
    const data = await res.json().catch(() => null)
    const quizzes = (data && (data.quizzes?.data || data.quizzes || data.data)) || []
    levelQuizzesMap.value[String(id)] = quizzes
    return quizzes
  } catch (e) {
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
  if (!Array.isArray(newVal)) return
  for (const level of newVal) {
    // fire-and-forget: populate cache for UI to render
    fetchQuizzesForLevel(level, 3).catch(() => {})
  }
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
