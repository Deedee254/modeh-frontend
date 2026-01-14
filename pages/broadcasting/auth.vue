<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Broadcasting Authentication</h1>
      <p>This endpoint is for WebSocket authentication and should not be accessed directly.</p>
      <NuxtLink to="/" class="text-blue-500 underline">Go back home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
// This page handles the case where Vue Router tries to navigate to /broadcasting/auth
// It should not happen under normal circumstances, but this prevents the warning
</script>