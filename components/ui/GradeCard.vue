<template>
  <div class="w-full group block rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 overflow-hidden relative">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Header: cover image or palette -->
    <div class="relative h-24 sm:h-32 overflow-hidden">
      <div class="absolute inset-0" :class="cover ? '' : paletteClass">
        <img v-if="cover" :src="cover" alt="" class="w-full h-full object-cover" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>

      <div class="absolute left-4 right-4 bottom-4 z-10 text-white">
        <h4 class="text-lg sm:text-xl font-semibold line-clamp-2">{{ title }}</h4>
      </div>
    </div>

    <!-- Body: compact metadata and CTA -->
    <div class="p-3 sm:p-4 relative z-10 flex flex-col gap-3">
      <div class="text-sm text-gray-600">{{ subtitle }}</div>

      <div class="flex items-center justify-between text-sm text-gray-700">
        <div class="flex items-center gap-3">
          <div class="font-semibold text-indigo-700">{{ quizzes_count }}</div>
          <div class="text-gray-500">quizzes</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="font-semibold text-indigo-700">{{ subjects_count }}</div>
          <div class="text-gray-500">subjects</div>
        </div>
      </div>

      <div v-if="description" class="text-sm text-gray-700 line-clamp-3">{{ description }}</div>

      <div class="mt-auto">
        <NuxtLink v-if="actionLink" :to="actionLink" class="w-full inline-flex justify-center items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold">{{ actionLabel }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  quizzes_count: { type: [Number, String], default: 0 },
  subjects_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore Grade' },
  cover: { type: String, default: '' },
  description: { type: String, default: '' }
})

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-indigo-400 to-indigo-600')
</script>