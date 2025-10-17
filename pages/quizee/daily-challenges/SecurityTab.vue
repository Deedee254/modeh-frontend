<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium">Security Settings</h3>
      <p class="text-sm text-muted-foreground">Update your password and manage two-factor authentication.</p>
    </div>

    <div class="p-6 bg-white rounded-lg border shadow-sm">
      <form @submit.prevent="updatePassword" class="space-y-4 max-w-lg">
        <h4 class="font-semibold">Change Password</h4>
        <div>
          <label for="current-password" class="block text-sm font-medium text-gray-700">Current Password</label>
          <input type="password" id="current-password" v-model="passwordForm.current_password" class="mt-1 block w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700">New Password</label>
          <input type="password" id="new-password" v-model="passwordForm.password" class="mt-1 block w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input type="password" id="confirm-password" v-model="passwordForm.password_confirmation" class="mt-1 block w-full border rounded-md px-3 py-2" required />
        </div>
        <div class="flex justify-end">
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Update Password</button>
        </div>
      </form>
    </div>

    <div class="p-6 bg-white rounded-lg border shadow-sm">
        <h4 class="font-semibold">Two-Factor Authentication</h4>
        <p class="text-sm text-gray-500 mt-2">Two-factor authentication is not yet available.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

const alert = useAppAlert()
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

function updatePassword() {
  alert.push({ type: 'info', message: 'Password update functionality is not implemented yet.' })
}
</script>