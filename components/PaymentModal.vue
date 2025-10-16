<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold">Subscribe to {{ pkg.title }}</h3>
      <p class="text-sm text-gray-600 mt-2">Amount: {{ pkg.currency }} {{ pkg.price }}</p>

      <div class="mt-4">
        <label class="block text-sm">Phone</label>
        <select v-if="phones.length" v-model="phone" class="w-full border rounded px-2 py-1">
          <option value="">Enter new number</option>
          <option v-for="p in phones" :key="p" :value="p">{{ p }}</option>
        </select>
        <input v-model="phoneInput" v-if="!phone || phone === ''" type="text" placeholder="2547...." class="w-full border rounded px-2 py-1 mt-2" />
        <input v-model="phoneInput" v-else type="hidden" />
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="pay" class="bg-indigo-600 text-white px-4 py-2 rounded">Pay (Mpesa)</button>
        <button @click="$emit('close')" class="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
const props = defineProps({ pkg: Object, open: Boolean, phones: { type: Array, default: () => [] } })
const emit = defineEmits(['close','paid'])
const phone = ref('')
const phoneInput = ref('')

watch(() => props.open, (v) => { if (v) { phone.value = ''; phoneInput.value = '' } })

const config = useRuntimeConfig()

async function pay() {
  const p = phone.value && phone.value !== '' ? phone.value : phoneInput.value
  if (!p) { useAppAlert().push({ message: 'Enter phone', type: 'warning' }); return }
  // create subscription
  const sub = await $fetch(config.public.apiBase + `/api/packages/${props.pkg.id}/subscribe`, { method: 'POST', credentials: 'include', body: { phone: p } })
  if (!sub || !(sub.ok === true || sub.subscription)) { useAppAlert().push({ message: 'Failed to create subscription', type: 'error' }); return }
  // initiate
  const init = await $fetch(config.public.apiBase + `/api/payments/subscriptions/${sub.subscription?.id}/mpesa/initiate`, { method: 'POST', credentials: 'include' })
  if (init && (init.ok === true || init.success === true)) {
    useAppAlert().push({ message: 'Payment initiated. You will receive STK Push on phone (simulated)', type: 'success' })
    emit('paid')
    emit('close')
  } else {
    useAppAlert().push({ message: 'Failed to initiate payment', type: 'error' })
  }
}
</script>
