<template>
  <div>
    <PageHero
      title="Education levels"
      description="Browse learning levels and discover curated assessments and pathways appropriate for each level."
      :breadcrumbs="[{ text: 'Home', href: '/' }, { text: 'Levels', current: true }]"
    />

    <div class="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="text-center py-12">Loading levels…</div>

      <div v-else>
        <section v-for="lvl in levels" :key="lvl.id" class="mb-12">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-extrabold">{{ lvl.name }}</h2>
              <p v-if="lvl.description" class="text-sm text-slate-500">{{ lvl.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <GradeCard
              v-for="g in lvl.grades"
              :key="g.id"
              :grade="g"
              :actionLink="getGradeLink(g)"
              :actionLabel="g.type === 'course' ? 'Open course' : 'Explore grade'"
              class="compact-view"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import { useTaxonomyHydration, useMetricsDebug } from '~/composables/useTaxonomyHydration'

const store = useTaxonomyStore()
const { print: printMetrics } = useMetricsDebug()

// SSR hydration: pre-fetch levels and grades
const { data } = await useTaxonomyHydration({
  fetchLevels: true,
  fetchGrades: true
})

// Compute nested levels with grades: group grades by level_id
const levels = computed(() => {
  const levelMap = new Map()
  
  // Initialize with all levels
  if (Array.isArray(store.levels)) {
    store.levels.forEach(lvl => {
      if (!levelMap.has(lvl.id)) {
        levelMap.set(lvl.id, { ...lvl, grades: [] })
      }
    })
  }
  
  // Populate grades for each level
  if (Array.isArray(store.grades)) {
    store.grades.forEach(grade => {
      const lvlId = grade.level_id || grade.level
      if (lvlId && levelMap.has(lvlId)) {
        levelMap.get(lvlId).grades.push(grade)
      }
    })
  }
  
  return Array.from(levelMap.values())
})

const loading = computed(() => !store.levels.length || !store.grades.length)

function getGradeLink(g) {
  // If the grade is a tertiary/course, link to the courses route; otherwise use grades
  try {
    const t = String(g.type || '').toLowerCase()
    if (t === 'course' || t === 'tertiary') return `/courses/${g.id}`
  } catch (e) {
    // ignore and fallback
  }
  return `/grades/${g.id}`
}

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => printMetrics(), 2000)
  }
})
</script>
