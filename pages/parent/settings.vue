<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences</p>
    </div>

    <div class="max-w-2xl">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              disabled
              class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400 rounded-lg shadow-sm py-2.5 px-3 opacity-50 cursor-not-allowed"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email address cannot be changed</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Occupation</label>
            <input
              v-model="form.occupation"
              type="text"
              class="block w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <p v-if="successMessage" class="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin w-4 h-4" />
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Actions</h2>
        <div class="space-y-3">
          <button
            @click="logout"
            class="w-full px-4 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import useMeApi from '~/composables/useMeApi'

definePageMeta({ layout: 'parent' })

const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const meApi = useMeApi()

const isLoading = ref(false)
const successMessage = ref(null)
const errorMessage = ref(null)

const user = computed(() => auth.user || {})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  occupation: '',
})

async function submit() {
  isLoading.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const res = await meApi.post({
      name: form.name,
      phone: form.phone,
    }, '/api/me')

    if (!res.ok) {
      throw new Error('Failed to update profile')
    }
    successMessage.value = 'Profile updated successfully'

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

async function logout() {
  try {
    await auth.logout?.()
    router.push('/login')
  } catch (e) {
    errorMessage.value = 'Failed to logout'
  }
}

onMounted(() => {
  form.name = user.value.name || ''
  form.email = user.value.email || ''
  form.phone = user.value.phone || ''
})
</script>
