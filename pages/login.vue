<template>
  <div class="h-screen w-full flex">
    <!-- Left Side: Features Panel (Hidden on mobile) -->
    <div class="hidden lg:block lg:w-1/2 h-full">
       <AuthFeaturesPanel />
    </div>

    <!-- Right Side: Login Form -->
    <div class="w-full lg:w-1/2 h-full flex items-center justify-center bg-gray-50 p-4 sm:p-8 overflow-y-auto">
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
             <NuxtLink to="/register" class="font-medium text-brand-600 hover:text-brand-500">Sign up</NuxtLink>
           </p>
        </div>

        <UModal v-model="showSignedInModal">
          <template #default>
            <div class="p-6 text-center">
               <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
              <h3 class="text-lg font-semibold text-gray-900">You're already signed in</h3>
              <p class="mt-2 text-sm text-slate-600">You are signed in as <strong>{{ auth.user?.name || auth.user?.email || 'User' }}</strong> ({{ auth.user?.role || 'user' }}).</p>
              <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button @click="goToDashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-all">Go to dashboard</button>
                <button @click="handleLogout" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Log out</button>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO meta for Login page
definePageMeta({
  title: 'Login — Modeh',
  layout: false, // Use custom full-screen layout
  meta: [
    { name: 'description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' },
    { property: 'og:title', content: 'Login — Modeh' },
    { property: 'og:description', content: 'Sign in to Modeh to access quizzes, track progress, and join competitions. Secure login for quizees and quiz-masters.' }
  ]
})

import LoginForm from '~/components/Auth/LoginForm.vue'
import AuthFeaturesPanel from '~/components/Auth/AuthFeaturesPanel.vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// show modal when already authenticated
const auth = useAuthStore()
const router = useRouter()
const showSignedInModal = ref(Boolean(auth.user))

watch(() => auth.user, (val) => {
  showSignedInModal.value = Boolean(val)
})

function goToDashboard() {
  const role = auth.user?.role
  if (role === 'quiz-master') router.push('/quiz-master/dashboard')
  else if (role === 'quizee') router.push('/quizee/dashboard')
  else if (role === 'institution-manager') router.push('/institution-manager/dashboard')
  else if (role === 'admin') window.location.href = `${useRuntimeConfig().public.apiBase}/admin`
  else router.push('/')
}

async function handleLogout() {
  try {
    await auth.logout()
  } catch (e) {}
  showSignedInModal.value = false
  router.push('/')
}
</script>

<style scoped>
/* Ensure full height for split layout */
</style>
