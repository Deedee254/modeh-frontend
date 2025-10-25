<script setup>
// Use quiz-master layout for edit route (redirects to create with id query param)
definePageMeta({ layout: 'quiz-master', title: 'Edit Quiz', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Edit quiz content, questions and settings.' } ] })
import { useRouter, useRoute } from '#imports'
const router = useRouter()
const route = useRoute()
// Redirect to the create page but include ?id= so it loads in edit mode
const id = route.params.id
if (id) {
  router.replace({ path: '/quiz-master/quizzes/create', query: { id } })
} else {
  router.replace({ path: '/quiz-master/quizzes/create' })
}
</script>

<template>
  <div />
</template>
