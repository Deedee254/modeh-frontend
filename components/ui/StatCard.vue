<template>
  <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ label }}</p>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ value }}</p>
        <p v-if="trend != null" class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span :class="trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ trend >= 0 ? '+' : '' }}{{ trend }}%
          </span>
          from last month
        </p>
        <p v-if="description" class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ description }}</p>
      </div>
      <div v-if="icon" class="text-slate-400 dark:text-slate-500">
        <Icon :name="icon" class="w-8 h-8" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: Number, default: null },
  description: { type: String, default: '' },
  icon: { type: String, default: '' }
})
</script>