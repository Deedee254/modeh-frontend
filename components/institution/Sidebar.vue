<template>
  <aside class="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-64 min-h-screen p-4">
    <div class="mb-6">
      <NuxtLink to="/institution/dashboard" class="block text-lg font-semibold">Dashboard</NuxtLink>
    </div>

    <nav class="space-y-2 text-sm">
      <NuxtLink to="/institution/subscriptions" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Subscriptions</NuxtLink>
      <NuxtLink to="/institution/quizees" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Quizees</NuxtLink>
      <NuxtLink to="/institution/quiz-masters" class="block px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Quiz Masters</NuxtLink>
    </nav>

    <div class="mt-auto pt-6">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup>
// no props required
</script>

<style scoped>
/* minimal — responsive behavior handled by layout */
</style>
