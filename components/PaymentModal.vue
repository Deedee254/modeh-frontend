<template>
  <div>
    <UModal v-model="isOpen" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-slate-100 dark:divide-slate-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-slate-900 dark:text-white">
              Confirm Payment
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
          </div>
        </template>

        <div class="p-4">
          <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
            {{ error }}
          </div>

          <!-- Payment Details -->
          <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-semibold text-slate-800 dark:text-slate-200">{{ paymentDetails.title }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ paymentDetails.description }}</div>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-slate-50">{{ paymentDetails.priceDisplay }}</div>
            </div>
          </div>

          <!-- Phone Input -->
          <div class="mb-2">
            <label for="phone-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone number for M-Pesa</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <select v-if="phones.length" v-model="selectedPhonePreset" class="border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full sm:w-auto focus:ring-brand-600 focus:border-brand-500">
                <option value="">Enter a new number</option>
                <option v-for="p in phones" :key="p" :value="p">{{ p }}</option>
              </select>
              <input id="phone-input" v-model="phoneInputLocal" type="tel" placeholder="2547..." class="flex-1 border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full focus:ring-brand-600 focus:border-brand-500" />
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">An STK push will be sent to this number. Please use international format (e.g., 254...)</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="closeModal" :disabled="loading">Cancel</UButton>
            <UButton 
              @click="initiatePayment" 
              :loading="loading" 
              :disabled="!phoneForPayment" 
              icon="i-heroicons-lock-closed" 
              :label="`Pay ${paymentDetails.priceDisplay}`"
              class="bg-brand-600 hover:bg-brand-700"
            >
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <PaymentAwaitingModal :tx="currentTx" :open="showAwaitingModal" @update:open="v => showAwaitingModal = v" @close="onPaymentAttemptClosed" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const props = defineProps({
  open: Boolean,
  pkg: { type: Object, default: null },
  item: { type: Object, default: null },
  phones: { type: Array, default: () => [] }
})

const emits = defineEmits(['close', 'paid'])

const cfg = useRuntimeConfig()
const alert = useAppAlert()
const api = useApi()

const isOpen = ref(props.open)
const loading = ref(false)
const error = ref('')
const currentTx = ref(null)
const showAwaitingModal = ref(false)

const selectedPhonePreset = ref('')
const phoneInputLocal = ref('')

const phoneForPayment = computed(() => selectedPhonePreset.value || phoneInputLocal.value)

const paymentDetails = computed(() => {
  if (props.pkg) {
    return {
      type: 'subscription',
      title: props.pkg.name || 'Subscription',
      description: props.pkg.short_description || `Access for ${props.pkg.duration_days || 30} days`,
      price: props.pkg.price,
      priceDisplay: `${props.pkg.currency || 'KES'} ${props.pkg.price}`
    }
  }
  if (props.item) {
    return {
      type: 'one-off',
      title: props.item.name || props.item.title || 'One-off Purchase',
      description: `Unlock results for this item`,
      price: props.item.price,
      priceDisplay: `${props.item.currency || 'KES'} ${props.item.price}`
    }
  }
  return { title: 'Invalid Item', description: '', price: 0, priceDisplay: 'KES 0' }
})

async function initiatePayment() {
  if (!phoneForPayment.value) {
    error.value = 'Please provide a phone number.'
    return
  }
  loading.value = true
  error.value = ''

  try {
    let res
    if (paymentDetails.value.type === 'subscription') {
      res = await api.postJson(`/api/packages/${props.pkg.id}/subscribe`, { phone: phoneForPayment.value })
    } else {
      const payload = { item_type: props.item.type || 'quiz', item_id: props.item.id, amount: paymentDetails.value.price, phone: phoneForPayment.value }
      res = await api.postJson('/api/one-off-purchases', payload)
    }
    if (api.handleAuthStatus(res)) return
    if (res?.ok && (res.tx || res.purchase?.gateway_meta?.tx)) {
      currentTx.value = res.tx || res.purchase.gateway_meta.tx
      showAwaitingModal.value = true
      isOpen.value = false // Hide this modal, show the awaiting one
    } else {
      const t = await res.text().catch(() => null)
      throw new Error(res?.message || t || 'Failed to initiate payment.')
    }
  } catch (e) {
    error.value = e.data?.message || e.message || 'An unexpected error occurred.'
    alert.push({ type: 'error', message: error.value })
  } finally {
    loading.value = false
  }
}

function onPaymentAttemptClosed() {
  showAwaitingModal.value = false
  emits('paid') // Signal to parent to re-check status
  closeModal()
}

function closeModal() {
  isOpen.value = false
  emits('close')
}

watch(() => props.open, (newVal) => {
  isOpen.value = newVal
  if (newVal) {
    error.value = ''
    loading.value = false
    if (props.phones.length > 0) {
      selectedPhonePreset.value = props.phones[0]
      phoneInputLocal.value = ''
    }
  }
})
</script>
