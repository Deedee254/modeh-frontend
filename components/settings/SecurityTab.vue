<template>
  <div class="space-y-6 max-w-2xl">
    <!-- Social Provider Info -->
    <div v-if="auth.user?.social_provider" class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h4 class="font-semibold text-blue-900 dark:text-blue-100">Connected Account</h4>
          <p class="text-sm text-blue-800 dark:text-blue-200 mt-1">Your account is linked to <span class="font-medium capitalize">{{ auth.user.social_provider }}</span>. You can sign in using this provider.</p>
        </div>
      </div>
    </div>

    <!-- Password Change Form -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h3>
      
      <form @submit.prevent="save" class="space-y-5">
        <!-- Current Password -->
        <div>
          <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
          <input 
            id="current-password" 
            v-model="form.current" 
            type="password" 
            autocomplete="current-password" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            placeholder="Enter your current password"
          />
        </div>

        <!-- New Password & Confirm -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input 
              id="new-password" 
              v-model="form.password" 
              type="password" 
              autocomplete="new-password" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <input 
              id="confirm-password" 
              v-model="form.password_confirm" 
              type="password" 
              autocomplete="new-password" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <!-- Password Requirements -->
        <div class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Requirements:</p>
          <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li class="flex items-center gap-2">
              <span v-if="form.password.length >= 6" class="text-green-600">✓</span>
              <span v-else class="text-gray-400">○</span>
              At least 6 characters
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button 
            type="submit" 
            :disabled="submitting"
            class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!submitting">Change Password</span>
            <span v-else>Updating…</span>
          </button>
          <button 
            type="button"
            @click="form = { current: '', password: '', password_confirm: '' }"
            class="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

const alert = useAppAlert()
const api = useApi()
const auth = useAuthStore()
const form = ref({ current: '', password: '', password_confirm: '' })
const submitting = ref(false)

async function save() {
  if (!form.value.password || form.value.password !== form.value.password_confirm) {
    alert.push({ type: 'error', message: 'Passwords do not match' })
    return
  }
  if (form.value.password.length < 6) {
    alert.push({ type: 'error', message: 'Password must be at least 6 characters' })
    return
  }
  submitting.value = true
  try {
    const payload = {
      current_password: form.value.current,
      password: form.value.password,
      password_confirmation: form.value.password_confirm,
    }
    const res = await api.postJson('/api/me/password', payload)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) {
      let msg = 'Failed to change password'
      try {
        const json = await res.json()
        if (json?.message) msg = json.message
      } catch (e) {}
      throw new Error(msg)
    }
    alert.push({ type: 'success', message: 'Password changed successfully' })
    form.value.current = form.value.password = form.value.password_confirm = ''
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to change password' })
  } finally {
    submitting.value = false
  }
}
</script>
  }
}
</script>

