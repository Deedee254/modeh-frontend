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

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GradeCard
              v-for="g in lvl.grades"
              :key="g.id"
              :grade="g"
              :actionLink="getGradeLink(g)"
              :actionLabel="g.type === 'course' ? 'Open course' : 'Explore grade'"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import GradeCard from '~/components/ui/GradeCard.vue'
import useTaxonomy from '~/composables/useTaxonomy'


// Use taxonomy composable; the API returns levels with nested grades so prefer the server shape
const { levels, fetchLevels, loadingLevels } = useTaxonomy()
const loading = loadingLevels

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

onMounted(async () => {
  // Load levels from the API. The server returns nested grades for each level, so prefer that shape.
  await fetchLevels()
})
</script>
