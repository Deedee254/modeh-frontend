<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
      <div class="text-center mb-8">
        <img class="mx-auto h-16 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Sign in to Modeh</h2>
      </div>

      <LoginForm />

      <UModal v-model="showSignedInModal">
        <template #default>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900">You're already signed in</h3>
            <p class="mt-2 text-sm text-slate-600">You are signed in as <strong>{{ auth.user?.name || auth.user?.email || 'User' }}</strong> ({{ auth.user?.role || 'user' }}).</p>
            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <button @click="goToDashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Go to dashboard</button>
              <button @click="handleLogout" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Log out</button>
            </div>
          </div>
        </template>
      </UModal>
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
/* Keep local styles minimal; Tailwind handles the visuals */
.logo { height: 64px }
</style>
