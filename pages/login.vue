<template>
  <div class="min-h-screen w-full flex">
    <!-- Left Side: Features Panel (Hidden on mobile) -->
    <div class="hidden lg:block lg:w-1/2 h-full">
       <AuthFeaturesPanel />
    </div>

    <!-- Right Side: Login Form -->
    <div class="w-full lg:w-1/2 min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 overflow-y-auto pt-24 sm:pt-16">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <!-- Mobile Header (Logo only, since panel is hidden) -->
        <div class="lg:hidden text-center mb-8">
          <NuxtLink to="/">
             <img class="mx-auto h-12 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
          </NuxtLink>
        </div>

        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p class="mt-2 text-sm text-gray-600">
              Welcome back! Please enter your details.
            </p>
        </div>

        <LoginForm />

        <div class="mt-6 text-center">
           <p class="text-sm text-gray-600">
             Don't have an account? 
             <NuxtLink to="/register/quizee" class="font-medium text-brand-600 hover:text-brand-500">Sign up</NuxtLink>
           </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO meta for Login page
definePageMeta({
  title: 'Login — Modeh',
  layout: false, // Use custom full-screen layout
  middleware: ['guest'],
  meta: [
    { name: 'description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' },
    { property: 'og:title', content: 'Login — Modeh' },
    { property: 'og:description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' }
  ]
})

import { useRoute, useRouter, onMounted } from '#imports'
import LoginForm from '~/components/Auth/LoginForm.vue'
import AuthFeaturesPanel from '~/components/Auth/AuthFeaturesPanel.vue'

const route = useRoute()
const router = useRouter()

// If NextAuth redirects to /login with an error (e.g. OAuthSignin),
// immediately forward to the dedicated error page so users see details.
onMounted(() => {
  if (route.query && route.query.error) {
    router.replace({ path: '/auth/error', query: route.query })
  }
})
</script>

<style scoped>
/* Ensure full height for split layout */
</style>
