<template>
  <div class="min-h-[calc(100vh-240px)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <SettingsTabs initial="profile" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SettingsTabs from '~/components/SettingsTabs.vue'
import PageHero from '~/components/ui/PageHero.vue'

// Use the quiz-master layout for settings page
definePageMeta({ layout: 'quiz-master', title: 'Account settings' })

useHead({
  title: 'Account settings'
})
</script>
