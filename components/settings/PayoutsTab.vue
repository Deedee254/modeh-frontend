<template>
  <div class="space-y-6 max-w-2xl">
    <!-- Info Card -->
    <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-blue-900 dark:text-blue-200">Withdrawal Information</h3>
          <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">Withdrawals typically process within 1-3 business days. Make sure your account details are correct before submitting.</p>
        </div>
      </div>
    </div>

    <!-- Withdrawal Form Card -->
    <form @submit.prevent="save" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Request Withdrawal</h3>

      <div class="space-y-6">
        <!-- Amount Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Withdrawal Amount (KSH)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 font-semibold">KSH</span>
            <input 
              v-model.number="amount" 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="0.00"
              class="w-full pl-14 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
            />
          </div>
          <p v-if="errors.amount" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ errors.amount }}</p>
          <p v-else class="text-xs text-gray-600 dark:text-gray-400 mt-2">Enter the amount you wish to withdraw</p>
        </div>

        <!-- Method Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Withdrawal Method</label>
          <select 
            v-model="method" 
            class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Choose how you want to receive your funds</p>
        </div>

        <!-- Account Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Bank Account Number</label>
            <input 
              v-model="account.number" 
              type="text"
              placeholder="Enter account number"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
            />
            <p v-if="errors.number" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ errors.number }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Routing Number</label>
            <input 
              v-model="account.routing" 
              type="text"
              placeholder="Enter routing number"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
            />
            <p v-if="errors.routing" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ errors.routing }}</p>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3 pt-2">
          <button 
            type="submit" 
            :disabled="submitting" 
            class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!submitting">Request Withdrawal</span>
            <span v-else>Processing…</span>
          </button>
          <button 
            type="button"
            @click="resetForm"
            class="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useApi } from '~/composables/useApi'

const alert = useAppAlert()
const api = useApi()
const account = reactive({ number: '', routing: '' })
const amount = ref(null)
const method = ref('bank_transfer')
const submitting = ref(false)
const errors = reactive({ amount: '', number: '', routing: '' })

function resetForm() {
  amount.value = null
  method.value = 'bank_transfer'
  account.number = ''
  account.routing = ''
  errors.amount = ''
  errors.number = ''
  errors.routing = ''
}

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
    const payload = {
      amount: Number(amount.value),
      method: method.value,
      meta: {
        account_number: account.number,
        routing: account.routing,
      },
    }

    const res = await api.postJson('/api/wallet/withdraw', payload)

    if (!res.ok) {
      let msg = 'Failed to request withdrawal.'
      try {
        const json = await res.json()
        if (json?.message) msg = json.message
      } catch (e) {}
      throw new Error(msg)
    }

    alert.push({ type: 'success', message: 'Withdrawal requested — we will review it shortly.' })
    resetForm()
  } catch (e) {
    alert.push({ type: 'error', message: e.message || 'Failed to request withdrawal' })
  } finally {
    submitting.value = false
  }
}
</script>

