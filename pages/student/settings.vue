<template>
  <div class="py-12">
    <Container>
      <div class="max-w-3xl mx-auto">
        <header class="mb-6">
          <h1 class="text-3xl font-extrabold">Account settings</h1>
          <p class="mt-1 text-sm text-slate-600">Manage profile details, security, payouts and notifications</p>
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

// Use the student layout for student settings
definePageMeta({ layout: 'student', title: 'Account settings' })
</script>
