<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800 dark:text-slate-100">Settings</h1>
      <UCard>
        <SettingsTabs initial="profile" />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import SettingsTabs from '~/components/SettingsTabs.vue'
definePageMeta({ middleware: [] })
</script>
