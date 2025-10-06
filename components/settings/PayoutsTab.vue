<template>
  <form @submit.prevent="save" class="p-4 space-y-4 max-w-lg">
    <div>
      <label class="block text-sm font-medium">Withdrawal amount</label>
      <input v-model.number="amount" type="number" min="0" step="0.01" class="mt-1 block w-full border rounded px-2 py-1" />
      <p v-if="errors.amount" class="text-sm text-red-600 mt-1">{{ errors.amount }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium">Method</label>
      <select v-model="method" class="mt-1 block w-full border rounded px-2 py-1">
        <option value="bank_transfer">Bank transfer</option>
        <option value="paypal">PayPal</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium">Bank account number</label>
      <input v-model="account.number" class="mt-1 block w-full border rounded px-2 py-1" />
      <p v-if="errors.number" class="text-sm text-red-600 mt-1">{{ errors.number }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium">Routing number</label>
      <input v-model="account.routing" class="mt-1 block w-full border rounded px-2 py-1" />
      <p v-if="errors.routing" class="text-sm text-red-600 mt-1">{{ errors.routing }}</p>
    </div>

    <div class="flex justify-end">
      <button :disabled="submitting" class="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">
        <span v-if="!submitting">Request withdrawal</span>
        <span v-else>Requesting...</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

const alert = useAppAlert()
const account = reactive({ number: '', routing: '' })
const amount = ref(null)
const method = ref('bank_transfer')
const submitting = ref(false)
const errors = reactive({ amount: '', number: '', routing: '' })

function validate() {
  let ok = true
  errors.amount = ''
  errors.number = ''
  errors.routing = ''

  if (!amount.value || isNaN(amount.value) || Number(amount.value) <= 0) {
    errors.amount = 'Please enter an amount greater than 0.'
    ok = false
  }

  if (!account.number || String(account.number).length < 4) {
    errors.number = 'Please enter a valid account number.'
    ok = false
  }

  if (method.value === 'bank_transfer' && (!account.routing || String(account.routing).length < 4)) {
    errors.routing = 'Please enter a valid routing number.'
    ok = false
  }

  return ok
}

async function save() {
  if (!validate()) return
  submitting.value = true
  try {
    const cfg = useRuntimeConfig()
    const payload = {
      amount: Number(amount.value),
      method: method.value,
      meta: {
        account_number: account.number,
        routing: account.routing,
      },
    }

    const res = await fetch(cfg.public.apiBase + '/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (!res.ok) {
      let msg = 'Failed to request withdrawal.'
      try {
        const json = await res.json()
        if (json?.message) msg = json.message
      } catch (e) {}
      throw new Error(msg)
    }

    alert.push({ type: 'success', message: 'Withdrawal requested — we will review it shortly.' })
    // reset form a little
    amount.value = null
    account.number = ''
    account.routing = ''
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to request withdrawal' })
  } finally {
    submitting.value = false
  }
}
</script>
