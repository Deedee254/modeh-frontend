<script setup>
// Use quiz-master layout for edit route (redirects to create with id query param)
definePageMeta({ layout: 'quiz-master', title: 'Edit Quiz', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Edit quiz content, questions and settings.' } ] })
import { useRouter, useRoute } from '#imports'
const router = useRouter()
const route = useRoute()
// Redirect to the create page but include ?slug= so it loads in edit mode
const slug = route.params.slug
if (slug) {
  router.replace({ path: '/quiz-master/quizzes/create', query: { slug } })
} else {
  router.replace({ path: '/quiz-master/quizzes/create' })
}
</script>

<template>
  <div />
</template>
