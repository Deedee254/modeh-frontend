<script setup>
import UiTextarea from '~/components/ui/UiTextarea.vue'
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const alert = useAppAlert()
const billing = ref({ email: '', address: '' })
const submitting = ref(false)
const api = useApi()

async function save() {
  if (!billing.value.email || !billing.value.address) {
    alert.push({ type: 'error', message: 'Please provide invoice email and address' })
    return
  }
  submitting.value = true
  try {
    const res = await api.patchJson('/api/me/billing', billing.value)
    if (!res.ok) throw new Error('Failed')
    alert.push({ type: 'success', message: 'Billing settings saved' })
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to save billing settings' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <form @submit.prevent="save" class="space-y-4 max-w-lg">
      <div>
        <label class="block text-sm font-medium">Invoice email</label>
        <input v-model="billing.email" class="mt-1 block w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label class="block text-sm font-medium">Billing address</label>
      <UTextarea v-model="billing.address" class="mt-1 block w-full" :rows="3" />
      </div>
      <div class="flex justify-end">
        <button :disabled="submitting" class="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">
          <span v-if="!submitting">Save</span>
          <span v-else>Saving…</span>
        </button>
      </div>
    </form>
    <div class="mt-4 text-sm text-gray-500">Note: billing endpoints may be handled by the server or a payments provider. If saving fails, please contact support.</div>
  </div>
</template>
