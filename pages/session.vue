<template>
  <div><!-- This page should never be viewed directly --></div>
</template>

<script setup lang="ts">
// This is a placeholder page for the NuxtAuth /session endpoint
// The actual session endpoint is handled by server/api/auth/[...].ts
// This page prevents 404 errors when NuxtAuth tries to navigate to /session
definePageMeta({
  layout: false,
  ssr: false
})

// Redirect to home if accessed directly
const router = useRouter()
onMounted(() => {
  router.replace('/')
})
</script>
