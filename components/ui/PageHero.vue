<template>
  <section :class="[
    'relative overflow-hidden',
    padding,
    align === 'center' ? 'text-center' : 'text-left'
  ]">
    <!-- Adaptive gradient for dark mode -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950" />
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-indigo-900 dark:text-white">{{ title }}</h1>
      <p v-if="description" class="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-3xl" :class="align === 'center' ? 'mx-auto' : ''">{{ description }}</p>
      <div v-if="$slots.actions" class="mt-6" :class="align === 'center' ? 'flex flex-col sm:flex-row items-center justify-center gap-3' : 'flex flex-col sm:flex-row items-center gap-3'">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  align?: 'left' | 'center'
  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  align: 'left',
  padding: 'py-10'
})
</script>