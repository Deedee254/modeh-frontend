<script setup>
definePageMeta({ layout: 'quiz-master' })
import ChatWidget from '~/components/ChatWidget.vue'
</script>

<template>
  <!-- Use a flex container to make the chat widget fill available vertical space -->
  <div class="flex flex-col h-full p-4 sm:p-6">
    <div class="flex-1 border rounded-lg overflow-hidden">
      <ClientOnly>
        <ChatWidget />
      </ClientOnly>
    </div>
  </div>
</template>
