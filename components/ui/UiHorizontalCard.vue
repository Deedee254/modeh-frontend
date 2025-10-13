<template>
  <div :class="[
    'w-full rounded-lg border shadow-sm transition hover:shadow-md overflow-hidden',
    'bg-white border-gray-200 text-slate-900',
    'dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100'
  ]">
    <div class="flex flex-col sm:flex-row sm:items-stretch">
      <!-- Leading slot/icon/cover -->
      <div v-if="$slots.lead" class="shrink-0 p-4 flex items-center justify-center">
        <slot name="lead" />
      </div>
      <div class="flex-1 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400" v-if="eyebrow">{{ eyebrow }}</div>
            <h3 class="font-semibold leading-snug">{{ title }}</h3>
            <!-- prefer meta slot (chips) when provided, otherwise show subtitle -->
            <div v-if="$slots.meta" class="mt-1">
              <slot name="meta" />
            </div>
            <p v-else-if="subtitle" class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ subtitle }}</p>
          </div>
          <div v-if="badge" class="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{{ badge }}</div>
        </div>
        <div class="mt-3">
          <slot />
        </div>
        <div v-if="$slots.actions" class="mt-3">
          <slot name="actions" />
        </div>
        <!-- Optional unified CTA if detailsLink prop provided -->
        <div v-if="detailsLink" class="mt-3">
          <NuxtLink :to="detailsLink" class="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Details</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  eyebrow?: string
  badge?: string | number
  detailsLink?: string
}
withDefaults(defineProps<Props>(), {
  subtitle: '',
  eyebrow: '',
  badge: undefined
  , detailsLink: undefined
})
</script>