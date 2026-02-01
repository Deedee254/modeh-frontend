<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <!-- Loading/Pending State -->
      <div v-if="status === 'pending'" class="text-center">
        <div class="mb-4">
          <svg class="animate-spin h-10 w-10 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold">{{ isMpesaCheckingStatus ? 'Confirming Payment...' : 'Awaiting Payment' }}</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ isMpesaCheckingStatus 
            ? 'Checking M-PESA status. This may take a moment...'
            : 'Complete the M-PESA prompt on your phone' }}
        </p>
        
        <div class="mt-3 text-sm text-gray-500">
          Transaction ID: <span class="font-mono text-xs">{{ tx }}</span>
        </div>

        <div v-if="secondsRemaining > 0" class="mt-3 text-xs text-slate-500">
          Timeout in: {{ formatSeconds(secondsRemaining) }}
        </div>

        <button 
          v-if="!isMpesaCheckingStatus"
          @click="onCheckNow" 
          class="w-full mt-4 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        >
          Check Status Now
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'active'" class="text-center">
        <div class="mb-4">
          <svg class="h-12 w-12 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-green-600">Payment Confirmed!</h3>
        <p class="mt-2 text-sm text-gray-600">Your subscription has been activated.</p>
        
        <div v-if="mpesaData" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-left">
          <p v-if="mpesaData.mpesa_receipt" class="text-xs text-gray-600">
            <span class="font-medium">Receipt:</span> {{ mpesaData.mpesa_receipt }}
          </p>
          <p v-if="mpesaData.transaction_date" class="text-xs text-gray-600 mt-1">
            <span class="font-medium">Date:</span> {{ formatDate(mpesaData.transaction_date) }}
          </p>
        </div>

        <div v-if="invoiceUrl" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm font-medium text-blue-900 mb-2">Invoice Ready</p>
          <button @click="downloadInvoice" class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded">
            Download PDF
          </button>
        </div>
      </div>

      <!-- Failed State -->
      <div v-else-if="status === 'failed'" class="text-center">
        <div class="mb-4">
          <svg class="h-12 w-12 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-600">Payment Failed</h3>
        <p class="mt-2 text-sm text-gray-600">{{ mpesaData?.result_desc || 'The payment was declined.' }}</p>
        <div class="mt-3 text-sm text-gray-500">Transaction ID: <span class="font-mono text-xs">{{ tx }}</span></div>
      </div>

      <!-- Manual Reconciliation Needed -->
      <div v-else-if="status === 'timeout'" class="text-center">
        <div class="mb-4">
          <svg class="h-12 w-12 mx-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-yellow-600">Verification Delayed</h3>
        <p class="mt-2 text-sm text-gray-600">We couldn't verify your payment immediately. We will continue checking.</p>
        <div class="mt-3 text-sm text-gray-500">Transaction ID: <span class="font-mono text-xs">{{ tx }}</span></div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button 
          @click="onClose" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          :disabled="status === 'pending'"
        >
          {{ getButtonLabel }}
        </button>
        
        <button 
          v-if="showRetryButton" 
          @click="onRetry" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import { useMpesaPayment } from '~/composables/useMpesaPayment'

interface Echo {
  private: (channel: string) => EchoChannel
}

interface EchoChannel {
  listen: (event: string, callback: (payload: any) => void) => void
  stopListening: (event: string) => void
  leave: () => void
}

const props = defineProps<{
  tx?: string
  checkoutRequestId?: string
  open?: boolean
}>()
const emits = defineEmits<{ close: [], 'update:open': [boolean] }>()

const status = ref<'pending' | 'active' | 'cancelled' | 'failed' | 'timeout'>('pending')
const secondsRemaining = ref(180)
const invoiceUrl = ref<string | null>(null)
const mpesaData = ref<any>(null)
const isMpesaCheckingStatus = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null
let autoCheckInterval: ReturnType<typeof setInterval> | null = null
const auth = useAuthStore()
const { push: pushAlert } = useAppAlert()
const api = useApi()
const mpesa = useMpesaPayment()
let _echoChannels: EchoChannel[] = []

const getButtonLabel = computed(() => {
  if (status.value === 'active') return 'Done'
  if (['timeout', 'failed', 'cancelled'].includes(status.value)) return 'Close'
  return 'Close'
})

const showRetryButton = computed(() => {
  return ['timeout', 'failed', 'cancelled'].includes(status.value)
})

function formatSeconds(secs: number): string {
  const mins = Math.floor(secs / 60)
  const s = secs % 60
  return `${mins}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function startTimeoutCountdown(): void {
  secondsRemaining.value = 180
  intervalId = setInterval(() => {
    secondsRemaining.value--
    if (secondsRemaining.value <= 0) {
      if (intervalId) clearInterval(intervalId)
      if (status.value === 'pending') {
        status.value = 'timeout'
        pushAlert({ type: 'warning', message: 'Payment confirmation timeout. Please retry or contact support.' })
      }
    }
  }, 1000)
}

/**
 * Auto-poll M-PESA reconciliation every 5 seconds while pending
 */
function startAutoCheck(): void {
  if (autoCheckInterval) clearInterval(autoCheckInterval)
  autoCheckInterval = setInterval(async () => {
    if (status.value === 'pending' && props.checkoutRequestId) {
      await reconcilePayment()
    }
  }, 5000)
}

function stopAutoCheck(): void {
  if (autoCheckInterval) {
    clearInterval(autoCheckInterval)
    autoCheckInterval = null
  }
}

/**
 * Manually trigger reconciliation
 */
async function onCheckNow(): Promise<void> {
  if (!props.checkoutRequestId) return
  await reconcilePayment()
}

/**
 * Reconcile payment with M-PESA backend
 */
async function reconcilePayment(): Promise<void> {
  if (!props.checkoutRequestId) return
  isMpesaCheckingStatus.value = true

  const result = await mpesa.reconcile(props.checkoutRequestId, 'user')

  if (result && result.status === 'success') {
    mpesaData.value = result.transaction
    status.value = 'active'
    stopAutoCheck()
    if (intervalId) clearInterval(intervalId)
    fetchAndSetInvoiceUrl()
  } else if (result && result.status === 'failed') {
    mpesaData.value = result.transaction
    status.value = 'failed'
    stopAutoCheck()
    if (intervalId) clearInterval(intervalId)
  }
  // If still pending, auto-check will retry

  isMpesaCheckingStatus.value = false
}

function _attachEchoListeners(): void {
  if (!process.client || !props.tx) return
  try {
    const Echo = (window as any).Echo as Echo | undefined
    const userId = auth.user?.id
    if (!Echo || !userId) return

    const ch = Echo.private(`users.${userId}`)
    _echoChannels.push(ch)

    const handler = (payload: any): void => {
      const tx = payload?.tx ?? payload?.subscription?.tx
      if (!tx || tx !== props.tx) return
      
      status.value = (payload?.subscription?.status as 'pending' | 'active' | 'cancelled' | 'failed' | 'timeout') ?? 'active'
      
      if (status.value === 'active') {
        fetchAndSetInvoiceUrl()
      }
      
      setTimeout(() => { emits('update:open', false); emits('close') }, 600)
    }

    try { ch.listen('SubscriptionUpdated', handler) } catch (e) {}
    try { ch.listen('.SubscriptionUpdated', handler) } catch (e) {}
  } catch (e) {}
}

function _detachEchoListeners(): void {
  if (!process.client) return
  _echoChannels.forEach((ch) => {
    try {
      ch.stopListening?.('SubscriptionUpdated')
      ch.leave?.()
    } catch (e) {}
  })
  _echoChannels = []
}

async function fetchAndSetInvoiceUrl(): Promise<void> {
  try {
    const response = await api.get('/transactions?page=1&per_page=1&sort_by=created_at&sort_order=desc&status=paid')
    const data = await response.json()
    if (data?.data?.[0]) {
      invoiceUrl.value = `/api/transactions/${data.data[0].id}/download`
    }
  } catch (error) {
    console.error('Failed to fetch invoice URL:', error)
  }
}

async function downloadInvoice(): Promise<void> {
  if (!invoiceUrl.value) {
    pushAlert({ type: 'error', message: 'Invoice URL not available' })
    return
  }

  try {
    const token = (auth as any).token || (auth as any).$state?.token || (auth as any).getToken?.()
    const response = await fetch(invoiceUrl.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Download failed')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invoice.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    pushAlert({ type: 'success', message: 'Invoice downloaded successfully' })
  } catch (error) {
    console.error('Failed to download invoice:', error)
    pushAlert({ type: 'error', message: 'Failed to download invoice' })
  }
}

function onRetry(): void {
  status.value = 'pending'
  secondsRemaining.value = 180
  invoiceUrl.value = null
  if (intervalId) clearInterval(intervalId)
  startTimeoutCountdown()
  pushAlert({ type: 'info', message: 'Retrying payment confirmation...' })
}

function onClose(): void {
  emits('update:open', false)
  emits('close')
}

onMounted(() => {
  if (!props.tx) return
  startTimeoutCountdown()
  _attachEchoListeners()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  _detachEchoListeners()
})
</script>

<style scoped>
.text-muted-foreground { color: #6b7280; }
</style>
