<script setup>
definePageMeta({ layout: 'quizee' })
import ChatWidget from '~/components/ChatWidget.vue'
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">Messages</h1>
    <div class="h-[calc(100vh-10rem)]">
      <ClientOnly>
        <ChatWidget />
      </ClientOnly>
    </div>
  </div>
</template>