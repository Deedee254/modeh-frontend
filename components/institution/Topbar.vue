<template>
  <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 h-14">
    <div class="flex items-center gap-3 w-full">
      <button @click="$emit('toggle-sidebar')" class="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-lg font-semibold">Modeh</NuxtLink>
        <span class="text-sm text-slate-500">Institution manager</span>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <!-- placeholder for notifications, profile -->
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({});
defineEmits(['toggle-sidebar']);
</script>

<style scoped>
/* keep minimal — layout controlled by Tailwind */
</style>
