<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-lg w-full bg-white p-6 rounded shadow text-center">
      <h1 class="text-lg font-semibold mb-2">Signing you in…</h1>
      <p class="text-sm text-gray-600">Finishing authentication and redirecting you to the right place.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const api = useApi()
const auth = useAuthStore()

onMounted(async () => {
  if (!process.client) return

  try {
    window.history.replaceState({}, document.title, window.location.pathname)

    const response = await api.get('/api/me')

    if (!response.ok) {
      console.warn(`OAuth callback: fetch /api/me failed with status ${response.status}`)
      return router.replace('/login')
    }

    const user = await response.json()
    auth.setUser(user)

    if (!user?.role) {
      return router.replace('/onboarding/new-user')
    }

    const missingFields = user.missing_profile_fields || []
    if (missingFields.length > 0) {
      const stepMap = { institution: 'institution', grade: 'grade', subjects: 'subjects', role: 'new-user' }
      const nextStep = stepMap[missingFields[0]] || 'new-user'
      return router.replace(`/onboarding/${nextStep}`)
    }

    const dashboard = user.role === 'quiz-master' ? '/quiz-master/dashboard' : '/quizee/dashboard'
    return router.replace(dashboard)

  } catch (err) {
    console.error('OAuth callback error:', err)
    return router.replace('/login')
  }
})
</script>
<style scoped></style>
