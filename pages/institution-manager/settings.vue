<template>
  <div class="py-12">
    <Container>
      <div class="max-w-3xl mx-auto">
        <header class="mb-6">
          <h1 class="text-3xl font-extrabold">Institution settings</h1>
          <p class="mt-1 text-sm text-slate-600">Manage institution profile, billing, members and preferences</p>
        </header>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <SettingsTabs initial="profile" />
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import SettingsTabs from '~/components/SettingsTabs.vue'
import Container from '~/components/ui/Container.vue'

// Use the institution layout for institution settings
definePageMeta({ layout: 'institution', title: 'Institution settings' })
</script>
