<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">Education Levels</h1>
    <div v-if="loading">Loading levels…</div>
    <div v-else>
      <div v-for="lvl in levels" :key="lvl.id" class="mb-6 border rounded-lg p-4">
        <h2 class="text-lg font-semibold">{{ lvl.name }}</h2>
        <p class="text-sm text-gray-500" v-if="lvl.description">{{ lvl.description }}</p>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="g in lvl.grades" :key="g.id" class="p-3 border rounded">
            <NuxtLink :to="`/grades/${g.id}`" class="font-medium">{{ g.name }}</NuxtLink>
            <div class="text-xs text-gray-500">{{ g.type === 'course' ? 'Course' : 'Grade' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useTaxonomy from '~/composables/useTaxonomy'
const { levels, fetchLevels, loadingLevels } = useTaxonomy()
const loading = loadingLevels
onMounted(async () => {
  await fetchLevels()
})
</script>
