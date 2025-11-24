<template>
  <NuxtLink v-if="to" :to="to" class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900 border border-slate-100 dark:border-slate-800/20">
    <!-- Header with Light Teal/Cyan Background -->
    <div class="bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-100 dark:from-teal-900/30 dark:via-cyan-900/30 dark:to-emerald-900/30 px-5 py-6">
      <div class="flex items-start justify-between">
        <!-- Icon -->
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-200/50 dark:bg-teal-800/50">
          <Icon name="heroicons:chart-bar" class="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>

        <!-- Title -->
        <h3 class="flex-1 ml-3 text-xl font-bold text-slate-900 dark:text-slate-50">
          {{ displayTitle }}
        </h3>
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Description -->
      <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
        {{ displayDescription }}
      </p>

      <!-- Grades Count -->
      <div class="mt-auto pt-4">
        <p class="text-base font-semibold text-slate-900 dark:text-slate-100">
          <span class="text-teal-600 dark:text-teal-400">{{ gradesCountNumber }}</span> grades/courses
        </p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  palette: { type: String, default: '' },
  grades_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore Level' },
  level: { type: Object, default: null }
})

const displayTitle = computed(() => props.title || props.level?.name || 'Level')
const displayDescription = computed(() => props.description || props.subtitle || props.level?.description || '')

const gradesCountNumber = computed(() => {
  const value = Number(props.grades_count)
  if (Number.isNaN(value)) return 0
  return value
})
</script>
