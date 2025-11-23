<template>
  <PageHero
    title="Institution Settings"
    description="Manage institution profile, billing, members and preferences"
    :breadcrumbs="[
      { text: 'Institution Manager', href: '/institution-manager/dashboard' },
      { text: 'Settings', current: true }
    ]"
  >
    <template #eyebrow>
      Configuration
    </template>
  </PageHero>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <SettingsTabs initial="profile" />
    </div>

  </div>
</template>

<script setup>
import SettingsTabs from '~/components/SettingsTabs.vue'
import Container from '~/components/ui/Container.vue'
import PageHero from '~/components/institution/PageHero.vue'

// Use the institution layout for institution settings
definePageMeta({ layout: 'institution', title: 'Institution settings' })
</script>
