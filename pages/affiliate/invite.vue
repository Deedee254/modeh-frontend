<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Invite via your affiliate code</h1>

    <form @submit.prevent="onSend" class="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label class="block text-sm font-medium text-gray-700">Recipient Email</label>
        <input v-model="email" type="email" required class="mt-1 block w-full border rounded p-2" />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="sending">{{ sending ? 'Sending...' : 'Send affiliate invite' }}</button>
      </div>

      <div v-if="message" class="mt-3 text-sm text-green-600">{{ message }}</div>
      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

const cfg = useRuntimeConfig()
const base = cfg.public?.apiBase || cfg.public?.baseUrl || ''

const email = ref('')
const sending = ref(false)
const message = ref('')
const error = ref('')

async function onSend() {
  error.value = ''
  message.value = ''
  sending.value = true
  try {
    const res = await fetch(`${base}/api/affiliates/send-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data?.message || data?.error || 'Failed to send affiliate invite'
      return
    }
    message.value = data.message || 'Affiliate invite sent'
  } catch (e) {
    console.error(e)
    error.value = 'Unexpected error'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.btn { padding: .5rem 1rem; border-radius: .375rem; font-weight: 600 }
.btn-primary { background-color: var(--primary); color: var(--primary-foreground) }
</style>
