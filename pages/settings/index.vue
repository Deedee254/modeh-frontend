<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Settings</h1>
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
