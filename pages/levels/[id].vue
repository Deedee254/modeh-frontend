<template>
  <div>
    <PageHero
      :title="level.name || 'Level'"
      :description="level.description || level.summary || `Browse grades and courses for ${level.name || 'this level'}`"
      :flush="true"
      @search="onSearch"
    >
      <template #eyebrow>
        Level detail
      </template>

      <template #actions>
        <div class="flex items-center gap-3">
          <NuxtLink to="/grades" class="inline-flex items-center justify-center rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">Browse grades</NuxtLink>
        </div>
      </template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div v-if="loading" class="mt-6"><UiSkeleton :count="6" /></div>
      <div v-else-if="error" class="mt-6 text-red-600">Failed to load level data.</div>

      <div v-else>
        <header class="text-center mb-6">
          <p class="text-sm uppercase tracking-wide text-indigo-500 font-semibold">{{ level.type || 'Level' }}</p>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">{{ level.name }}</h2>
          <p class="mt-2 text-slate-600">{{ level.description || level.summary || '' }}</p>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GradeCard
            v-for="g in levelGrades"
            :key="g.id"
            :to="`/grades/${g.id}`"
            :title="g.name || g.title || g.id"
            :grade="g"
            :quizzes_count="g.quizzes_count || g.count || 0"
            :subjects_count="g.subjects_count || 0"
            actionLabel="Explore Grade"
            :actionLink="`/grades/${g.id}`"
          />
        </div>

        <div v-if="!levelGrades.length" class="mt-6 text-center text-sm text-gray-600">No grades or courses found for this level.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const route = useRoute()
const id = route.params.id
const config = useRuntimeConfig()

const level = ref({})
const loading = ref(true)
const error = ref(null)

const { grades: taxGrades, fetchGrades } = useTaxonomy()

const levelGrades = computed(() => {
  // Prefer server-provided nested grades when available
  if (Array.isArray(level.value?.grades) && level.value.grades.length) return level.value.grades

  const arr = Array.isArray(taxGrades.value) ? taxGrades.value : []
  if (!arr || !arr.length) return []
  // Match grades where grade.level_id === id or grade.level?.id === id
  return arr.filter(g => {
    if (!g) return false
    if (g.level_id && String(g.level_id) === String(id)) return true
    if (g.level && (String(g.level.id) === String(id) || String(g.level) === String(id))) return true
    // fallback: some grades may include a 'levels' array
    if (Array.isArray(g.levels) && g.levels.some(l => String(l.id || l) === String(id))) return true
    return false
  })
})

function onSearch() { /* no-op: PageHero search not used here */ }

onMounted(async () => {
  loading.value = true
  try {
    // fetch level metadata from API if available
    try {
      const res = await $fetch(`${config.public.apiBase}/api/levels/${id}`)
      level.value = (res && res.level) ? res.level : (res || {})
    } catch (e) {
      // ignore level fetch error; we will still try to render grades from taxonomy
      level.value = { id }
    }

    // ensure taxonomy grades are loaded only if the server didn't return nested grades
    try {
      if (!Array.isArray(level.value?.grades) || !level.value.grades.length) {
        await fetchGrades()
      }
    } catch (e) {}
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* keep styles minimal — cards inherit UI behavior */
</style>
