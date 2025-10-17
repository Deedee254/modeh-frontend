<script setup>
// Simple redirect to the main quizee leaderboard page (keep backward compatibility)
import { onMounted } from 'vue'
const router = useRouter()
onMounted(() => {
  // prefer the centralized leaderboard route if present
  router.replace('/quizee/leaderboard')
})
</script>

<template>
  <div class="min-h-screen grid place-items-center">
    <div class="text-sm text-gray-500">Redirecting to leaderboard...</div>
  </div>
</template>
