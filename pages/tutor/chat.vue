<script setup>
definePageMeta({ layout: 'quiz-master' })
import ChatWidget from '~/components/ChatWidget.vue'
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold">Chat</h1>
    <div class="mt-4">
      <ClientOnly>
        <ChatWidget />
      </ClientOnly>
    </div>
  </div>
</template>
