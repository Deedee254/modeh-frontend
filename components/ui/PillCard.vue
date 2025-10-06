<template>
  <div class="group rounded-2xl bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg transition transform hover:-translate-y-0.5">
    <div class="w-full h-36 bg-gray-100 overflow-hidden">
      <template v-if="image">
        <img :src="image" alt="" class="w-full h-full object-cover" />
      </template>
      <template v-else>
        <div :class="['w-full h-full grid place-items-center font-bold', paletteClass]">
          <span class="text-white text-2xl">{{ badgeText || (title||'').charAt(0).toUpperCase() }}</span>
        </div>
      </template>
    </div>
    <div class="p-4 sm:p-5">
      <div class="min-w-0">
        <div class="text-xs text-gray-500">{{ eyebrow }}</div>
        <h3 class="font-semibold truncate text-indigo-900 dark:text-indigo-200">{{ title }}</h3>
        <div v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</div>
      </div>
      <div class="mt-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'indigo' },
  badgeText: { type: String, default: '' },
  image: { type: String, default: '' },
  fallback: { type: String, default: '/images/subject-icon.svg' },
  // Optional: an explicit palette/class string to use for the fallback tile
  palette: { type: String, default: '' }
})

const palettes = {
  indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
  emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  violet: 'bg-gradient-to-br from-violet-400 to-violet-600',
  sky: 'bg-gradient-to-br from-sky-300 to-sky-500',
  amber: 'bg-gradient-to-br from-amber-300 to-amber-500',
  rose: 'bg-gradient-to-br from-rose-300 to-rose-500',
  green: 'bg-gradient-to-br from-green-300 to-green-500'
}

const paletteClass = computed(() => {
  if (props.palette && typeof props.palette === 'string' && props.palette.trim().length) return props.palette
  return palettes[props.color] || palettes.indigo
})
</script>