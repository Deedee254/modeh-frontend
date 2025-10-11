<template>
  <div class="max-w-2xl mx-auto py-12">
    <h1 class="text-2xl font-bold mb-4">Complete your profile</h1>
    <p class="mb-6">It looks like your profile is incomplete. Please complete the onboarding to continue.</p>

    <div class="space-y-4">
      <button @click="finalize" class="px-4 py-2 bg-indigo-600 text-white rounded">Mark profile as complete</button>
      <button @click="markRole" class="px-4 py-2 border rounded">Mark role selected</button>
      <button @click="markInstitution" class="px-4 py-2 border rounded">Mark institution added</button>
      <button @click="skipToDashboard" class="px-4 py-2 border rounded">Skip to dashboard</button>
    </div>

    <div v-if="message" class="mt-4 text-sm text-green-700">{{ message }}</div>
    <div v-if="error" class="mt-4 text-sm text-red-700">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
const message = ref(null)
const error = ref(null)
const router = useRouter()
const auth = useAuthStore()
const config = useRuntimeConfig()

async function callStep(step) {
  message.value = null; error.value = null
  try {
    const res = await $fetch(config.public.apiBase + '/api/onboarding/step', {
      method: 'POST',
      credentials: 'include',
      body: { step }
    })
    message.value = 'Step recorded.'
    // If profile is complete now, navigate to appropriate dashboard
    const me = await $fetch(config.public.apiBase + '/api/me', { credentials: 'include' })
    if (me?.is_profile_completed) {
      if (me.role === 'quiz-master') router.push('/quiz-master/dashboard')
      else router.push('/quizee/dashboard')
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Request failed'
  }
}

function markRole() { callStep('role_quizee') }
function markInstitution() { callStep('institution') }
async function finalize() {
  message.value = null; error.value = null
  try {
    const res = await $fetch(config.public.apiBase + '/api/onboarding/finalize', { method: 'POST', credentials: 'include' })
    // refetch user
    const me = await $fetch(config.public.apiBase + '/api/me', { credentials: 'include' })
    // clear any skip flag
    try { localStorage.removeItem('modeh:onboarding:skipped') } catch (e) {}
    message.value = 'Profile finalized.'
  if (me && me.role === 'quiz-master') router.push('/quiz-master/dashboard')
  else router.push('/quizee/dashboard')
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Finalize failed'
  }
}

function skipToDashboard() {
  try { localStorage.setItem('modeh:onboarding:skipped', '1') } catch (e) {}
  const me = auth.user || null
  if (me && me.role === 'quiz-master') router.push('/quiz-master/dashboard')
  else router.push('/quizee/dashboard')
}
</script>

<style scoped>
/* small spacing */
</style>
