<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <p class="text-gray-600 mb-4">Redirecting to quiz creation...</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from '#imports'

definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' } ] })

const router = useRouter()

// Redirect to quiz creation page - questions are created as part of quiz creation flow
router.push('/quiz-master/quizzes/create')
</script>