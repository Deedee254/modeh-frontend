<template>
  <div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center font-bold">“”</div>
      <div>
        <p class="text-gray-800 dark:text-gray-200">{{ quote }}</p>
        <div class="mt-3 text-sm text-gray-500">— {{ name }}, {{ role }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: '' }
})
</script>