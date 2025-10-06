<template>
  <!-- Base layout keeps global chrome minimal; role layouts add their own navigation -->
  <div class="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <NuxtRouteAnnouncer />
    <Header />

    <main class="flex-1 py-8 w-full px-4 md:px-6 lg:px-8">
      <slot />
    </main>

    <Footer />

    <!-- Chat is intentionally omitted from the global default layout.
         Chat widgets should be added to authenticated role layouts (student/tutor) only.
         This prevents server-side composable invocation errors and keeps public pages minimal. -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
// ChatDirectMessages intentionally not imported here; role layouts include chat when authenticated.

const chatOpen = ref(false)
</script>

<style scoped>
</style>
