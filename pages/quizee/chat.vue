<script setup>
definePageMeta({ layout: 'quizee' })
import ChatWidget from '~/components/chat/ChatWidget.vue'
</script>

<template>
  <div id="root" style="height: calc(100vh - 6rem)">
    <div role="region" aria-label="Notifications (F8)" tabindex="-1" style="pointer-events: none;">
      <ol tabindex="-1" class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol>
    </div>
    <section aria-label="Notifications alt+T" tabindex="-1" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>
    <ClientOnly>
      <ChatWidget />
    </ClientOnly>
  </div>
</template>

<style scoped>
:root {
  --top-bar-height: 4rem;
}
</style>