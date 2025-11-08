<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
      <div class="text-center mb-8">
        <img class="mx-auto h-16 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Sign in to Modeh</h2>
      </div>

      <LoginForm />

      
    </div>
  </div>
</template>

<script setup>
// SEO meta for Login page
definePageMeta({
  title: 'Login — Modeh',
  meta: [
    { name: 'description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' },
    { property: 'og:title', content: 'Login — Modeh' },
    { property: 'og:description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' }
  ]
})

import LoginForm from '~/components/Auth/LoginForm.vue'
</script>

<style scoped>
/* Keep local styles minimal; Tailwind handles the visuals */
.logo { height: 64px }
</style>
