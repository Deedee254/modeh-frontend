<template>
  <form @submit.prevent="save" class="p-4 space-y-4 max-w-lg">
    <div>
      <label for="current-password" class="block text-sm font-medium">Current password</label>
      <input id="current-password" v-model="form.current" type="password" autocomplete="current-password" class="mt-1 block w-full border rounded px-3 py-2 text-sm" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="new-password" class="block text-sm font-medium">New password</label>
          <input id="new-password" v-model="form.password" type="password" autocomplete="new-password" class="mt-1 block w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label for="confirm-password" class="block text-sm font-medium">Confirm new password</label>
          <input id="confirm-password" v-model="form.password_confirm" type="password" autocomplete="new-password" class="mt-1 block w-full border rounded px-3 py-2 text-sm" />
        </div>
    </div>

    <div class="flex justify-end gap-2">
      <button :disabled="submitting" type="submit" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded text-sm">
        <span v-if="!submitting">Change password</span>
        <span v-else>Updating…</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const alert = useAppAlert()
const api = useApi()
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
    alert.push({ type: 'success', message: 'Password changed' })
    form.value.current = form.value.password = form.value.password_confirm = ''
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to change password' })
  } finally {
    submitting.value = false
  }
}
</script>
