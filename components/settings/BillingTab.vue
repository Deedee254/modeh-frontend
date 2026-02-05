<script setup>
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import useMeApi from '~/composables/useMeApi'

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
    const res = await meApi.patch(billing.value, '/api/me/billing')
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
          <h3 class="font-semibold text-blue-900 dark:text-blue-200">Billing Information</h3>
          <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">Your billing details are used to generate invoices. If you're using a payment provider, some settings may be managed there.</p>
        </div>
      </div>
    </div>

    <!-- Billing Form Card -->
    <form @submit.prevent="save" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Billing Settings</h3>

      <div class="space-y-6">
        <!-- Invoice Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Invoice Email Address</label>
          <input 
            v-model="billing.email" 
            type="email"
            placeholder="billing@example.com"
            class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Where invoices will be sent</p>
        </div>

        <!-- Billing Address -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Billing Address</label>
          <textarea 
            v-model="billing.address"
            placeholder="Street address, city, state, postal code..."
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            required
          ></textarea>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Your full billing address for invoices</p>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3 pt-2">
          <button 
            type="submit" 
            :disabled="submitting" 
            class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!submitting">Save Billing Settings</span>
            <span v-else>Saving…</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Help Note Card -->
    <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div class="flex gap-3">
        <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm2-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
        </svg>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <p class="font-semibold mb-1">Need help?</p>
          <p>If you're having issues with billing or need to change payment methods, please contact our support team.</p>
        </div>
      </div>
    </div>
  </div>
</template>

