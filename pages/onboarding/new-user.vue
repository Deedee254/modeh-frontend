<template>
  <div class="max-w-md mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-4">Welcome — choose your role</h1>
    <p class="mb-6">Select whether you're a student (Quizee) or a teacher (Quiz Master). This is required to continue.</p>

    <form @submit.prevent="submit" class="bg-white p-6 rounded-lg shadow-sm">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">I am a</label>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="role" value="quizee" />
            <span>Quizee (student)</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="role" value="quiz-master" />
            <span>Quiz Master (teacher)</span>
          </label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Set a password</label>
        <input v-model="password" type="password" minlength="8" class="w-full px-3 py-2 border rounded" placeholder="Choose a password (min 8 chars)" />
      </div>

      <div class="mt-6">
        <button :disabled="!role || submitting" class="w-full px-4 py-2 bg-brand-600 text-white rounded flex items-center justify-center gap-2">
          <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span>{{ submitting ? 'Continuing…' : 'Continue' }}</span>
        </button>
      </div>

      <p v-if="message" class="mt-4 text-sm text-green-700">{{ message }}</p>
      <p v-if="error" class="mt-4 text-sm text-red-700">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'
const router = useRouter()

// Set default role to 'quizee'
const role = ref('quizee')
const password = ref('')
const submitting = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  message.value = ''
  error.value = ''
  if (!role.value) {
    error.value = 'Please select a role to continue.'
    return
  }
   if (!password.value) {
    error.value = 'Please set a password to continue.'

    return
  }
  submitting.value = true
  try {
    const api = useApi()
    const stepName = role.value === 'quiz-master' ? 'role_quiz-master' : 'role_quizee'
    const resp = await api.postJson('/api/onboarding/step', {
      step: stepName,
      data: { role: role.value, password: password.value }
    })
    if (!resp.ok) throw new Error('Failed to save role')

    message.value = 'Role saved. Continuing to onboarding.'
    // After role is set, go to the main onboarding page which will continue the steps
    setTimeout(() => router.replace('/onboarding'), 600)
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to save role'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
</style>
