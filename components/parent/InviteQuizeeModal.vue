<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <Icon name="heroicons:x-mark" class="w-6 h-6" />
      </button>

      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Invite a Quizee</h2>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Quizee Email <span class="text-red-500">*</span></label>
          <input
            v-model="form.quizeeEmail"
            type="email"
            required
            class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500"
            placeholder="quizee@example.com"
          />
          <p v-if="fieldErrors.quizeeEmail" class="mt-1 text-sm text-red-600">{{ fieldErrors.quizeeEmail }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Quizee Name (Optional)</label>
          <input
            v-model="form.quizeeName"
            type="text"
            class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Quizee's full name"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{{ success }}</p>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="close"
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin w-4 h-4" />
            {{ isLoading ? 'Sending...' : 'Send Invite' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import useApi from '~/composables/useApi'

const emit = defineEmits(['close', 'invited'])

const api = useApi()
const isLoading = ref(false)
const error = ref(null)
const success = ref(null)

const form = reactive({
  quizeeEmail: '',
  quizeeName: '',
})

const fieldErrors = reactive({})

function validateForm() {
  fieldErrors.quizeeEmail = !form.quizeeEmail || !/^\S+@\S+\.\S+$/.test(form.quizeeEmail) ? 'Valid email is required' : ''
  return !fieldErrors.quizeeEmail
}

async function submit() {
  if (!validateForm()) return

  isLoading.value = true
  error.value = null
  success.value = null

  try {
    const res = await api.postJson('/api/parent/invite-quizee', {
      quizee_email: form.quizeeEmail,
      quizee_name: form.quizeeName,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Failed to send invitation')
    }

    success.value = 'Invitation sent successfully!'
    form.quizeeEmail = ''
    form.quizeeName = ''

    setTimeout(() => {
      emit('invited')
    }, 1500)
  } catch (e) {
    error.value = e.message || 'Failed to send invitation'
  } finally {
    isLoading.value = false
  }
}

function close() {
  emit('close')
}
</script>
