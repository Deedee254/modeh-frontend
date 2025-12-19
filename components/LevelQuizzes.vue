<template>
  <section class="py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header class="text-center max-w-2xl mx-auto mb-6">
        <div class="text-sm uppercase tracking-wide text-brand-600 font-semibold">Levels</div>
        <h3 class="mt-2 text-3xl font-bold text-slate-900">Learning levels with quizzes</h3>
        <p class="mt-3 text-slate-600">Explore popular learning levels and jump straight into quizzes curated for each level.</p>
      </header>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div v-for="level in propsLevels" :key="level.id || level.slug || level.name" class="rounded-lg bg-white/60 p-4 ring-1 ring-white/10">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-slate-800">{{ level.name }}</h4>
            <NuxtLink :to="`/levels/${level.slug || level.id}`" class="text-sm text-brand-600 hover:underline">View all</NuxtLink>
          </div>

          <div v-if="loading" class="space-y-3">
            <div v-for="n in 3" :key="n" class="h-16 rounded-md bg-gray-100 animate-pulse"></div>
          </div>

          <div v-else>
            <div v-if="(levelQuizzes(level) || []).length === 0" class="text-sm text-slate-500">Coming soon</div>

            <div v-else class="space-y-3">
              <UiQuizCard
                v-for="quiz in (levelQuizzes(level) || []).slice(0,3)"
                :key="quiz.id || quiz.slug"
                :horizontal="true"
                :to="'/quizee/quizzes/' + (quiz.slug || quiz.id)"
                :startLink="'/quizee/quizzes/' + (quiz.slug || quiz.id)"
                :takeLink="'/quizee/quizzes/take/' + (quiz.slug || quiz.id)"
                :title="quiz.title"
                :topic="quiz.topic?.name || quiz.topic_name"
                :cover="quiz.cover_image || quiz.cover"
                :palette="''"
                :likes="quiz.likes_count ?? quiz.likes ?? 0"
                :questions-count="quiz.questions_count ?? quiz.questions ?? quiz.items_count"
                :quiz-id="quiz.id"
              />
            </div>
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
  loading: { type: Boolean, default: false }
})

// Expose props as a safe array
const propsLevels = computed(() => Array.isArray(props.levels) ? props.levels : [])

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
    const res = await api.get(`/api/quizzes?level_id=${encodeURIComponent(level.id || level.slug || '')}&per_page=${perPage}`)
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
