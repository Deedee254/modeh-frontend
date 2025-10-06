<script setup>
// Use tutor layout for edit route (redirects to create with id query param)
definePageMeta({ layout: 'tutor', title: 'Edit Quiz' })
import { useRouter, useRoute } from '#imports'
const router = useRouter()
const route = useRoute()
// Redirect to the create page but include ?id= so it loads in edit mode
const id = route.params.id
router.replace({ path: '/tutor/quizzes/create', query: { id } })
</script>

<template>
  <div />
</template>
