<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Chat with quiz masters, quizees, and administrators</p>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
      <Icon name="heroicons:chat-bubble-left-right" class="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Chat Features</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Use the chat widget in the corner to communicate directly with quiz masters, quizees, and support team members.</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">The chat widget will appear at the bottom right of your screen.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'parent' })
</script>
