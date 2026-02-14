<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-lg">
      <!-- Loading/Pending State -->
      <div v-if="status === 'pending'" class="text-center">
        <div class="mb-4">
          <svg class="animate-spin h-10 w-10 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ isMpesaCheckingStatus ? 'Confirming Payment...' : 'Awaiting Payment' }}</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {{ isMpesaCheckingStatus 
            ? 'Checking M-PESA status. This may take a moment...'
            : 'Complete the M-PESA prompt on your phone' }}
        </p>
        
        <div v-if="secondsRemaining > 0" class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Timeout in: {{ formatSeconds(secondsRemaining) }}
        </div>

        
        <button 
          v-if="!isMpesaCheckingStatus && checkoutRequestId"
          @click="onCheckNow" 
          class="w-full mt-4 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-sm font-medium transition"
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
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Your subscription has been activated.</p>
        
        <div v-if="mpesaData" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-left">
          <p v-if="mpesaData.mpesa_receipt" class="text-xs text-slate-700 dark:text-slate-300">
            <span class="font-medium">M-PESA Receipt:</span> <span class="font-mono text-green-600 dark:text-green-400">{{ mpesaData.mpesa_receipt }}</span>
          </p>
          <p v-if="mpesaData.transaction_date" class="text-xs text-slate-700 dark:text-slate-300 mt-1">
            <span class="font-medium">Date:</span> {{ formatDate(mpesaData.transaction_date) }}
          </p>
          <p v-if="checkoutRequestId" class="text-xs text-slate-700 dark:text-slate-300 mt-1">
            <span class="font-medium">Checkout ID:</span> <span class="font-mono text-blue-600 dark:text-blue-400">{{ checkoutRequestId }}</span>
          </p>
        </div>

        <div v-if="invoiceUrl" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Invoice Ready</p>
          <button @click="downloadInvoice" class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition">
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
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ mpesaData?.result_desc || 'The payment was declined.' }}</p>
        <div class="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <div v-if="mpesaData?.mpesa_receipt" class="mb-2">
            <span class="font-medium">M-PESA Receipt:</span><br>
            <span class="font-mono text-xs text-red-600 dark:text-red-400">{{ mpesaData.mpesa_receipt }}</span>
          </div>
          <div v-if="checkoutRequestId">
            <span class="font-medium">Checkout ID:</span><br>
            <span class="font-mono text-xs text-blue-600 dark:text-blue-400">{{ checkoutRequestId }}</span>
          </div>
        </div>
      </div>

      <!-- Manual Reconciliation Needed -->
      <div v-else-if="status === 'timeout'" class="text-center">
        <div class="mb-4">
          <svg class="h-12 w-12 mx-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-yellow-600">Verification Delayed</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">We couldn't verify your payment immediately. We will continue checking.</p>
        <div class="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <div v-if="checkoutRequestId" class="mb-2">
            <span class="font-medium">Checkout ID:</span><br>
            <span class="font-mono text-xs text-blue-600 dark:text-blue-400">{{ checkoutRequestId }}</span>
          </div>
          <div v-if="mpesaData?.mpesa_receipt" class="mb-2">
            <span class="font-medium">M-PESA Receipt:</span><br>
            <span class="font-mono text-xs text-yellow-600 dark:text-yellow-400">{{ mpesaData.mpesa_receipt }}</span>
          </div>
          <p class="text-xs">Check your M-PESA app for the transaction status</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button 
          @click="onClose" 
          class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition"
        >
          {{ getButtonLabel }}
        </button>
        
        <button 
          v-if="showRetryButton" 
          @click="onRetry" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
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
import useApi from '~/composables/useApi'

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
  phone?: string
  open?: boolean
}>()
const emits = defineEmits<{ close: [], 'update:open': [boolean] }>()

const status = ref<'pending' | 'active' | 'cancelled' | 'failed' | 'timeout' | 'manual_reconciliation'>('pending')
const secondsRemaining = ref(180)
const invoiceUrl = ref<string | null>(null)
const mpesaData = ref<any>(null)
const isMpesaCheckingStatus = ref(false)
let intervalId: NodeJS.Timeout | null = null
let statusCheckInterval: NodeJS.Timeout | null = null
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

function maskPhoneNumber(phone: string): string {
  if (!phone) return 'Not provided'
  // Show first 3 and last 3 digits: 254712****78
  const str = String(phone)
  if (str.length <= 5) return str
  return str.substring(0, 3) + '****' + str.substring(str.length - 2)
}

function startTimeoutCountdown(): void {
  secondsRemaining.value = 180
  intervalId = setInterval(() => {
    secondsRemaining.value--
    if (secondsRemaining.value <= 0) {
      if (intervalId) clearInterval(intervalId)
      if (status.value === 'pending') {
        status.value = 'timeout'
        pushAlert({ type: 'warning', message: 'Payment verification timed out. Please try again or contact support.' })
      }
    }
  }, 1000)
}

/**
 * Streamlined polling: check after 15s, then continue checking every 15s
 * Stops when transaction is resolved or timeout occurs
 */
function startStatusChecking(): void {
  if (statusCheckInterval !== null) clearInterval(statusCheckInterval)
  
  // Initial check after 15 seconds
  statusCheckInterval = setInterval(async () => {
    if (status.value !== 'pending' || !props.checkoutRequestId) {
      stopStatusChecking()
      return
    }
    
    await reconcilePayment()
  }, 15000)
}

function stopStatusChecking(): void {
  if (statusCheckInterval !== null) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
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
 * Reconcile payment with M-PESA backend and surface errors via toast
 */
async function reconcilePayment(): Promise<void> {
  // Concurrency guard: skip if already checking
  if (isMpesaCheckingStatus.value) {
    return
  }

  if (!props.checkoutRequestId) {
    return
  }
  
  isMpesaCheckingStatus.value = true

  try {
    const result = await mpesa.reconcile(props.checkoutRequestId, 'user')

    // Handle success
    if (result?.ok && result.status === 'success') {
      mpesaData.value = result.transaction
      // Try to set invoiceUrl from response first; fallback to manual fetch
      if (result.transaction?.invoice_url) {
        invoiceUrl.value = result.transaction.invoice_url
      } else {
        await fetchAndSetInvoiceUrl()
      }
      status.value = 'active'
      stopStatusChecking()
      if (intervalId !== null) clearInterval(intervalId)
      pushAlert({ 
        type: 'success', 
        message: `Payment confirmed! Receipt: ${result.transaction?.mpesa_receipt || 'N/A'}` 
      })
      return
    }

    // Handle failure (e.g., insufficient funds, declined, etc.)
    if (result?.status === 'failed') {
      mpesaData.value = result.transaction
      status.value = 'failed'
      stopStatusChecking()
      if (intervalId !== null) clearInterval(intervalId)
      
      const errorMessage = result.transaction?.result_desc || 'Payment was declined'
      pushAlert({ 
        type: 'error', 
        message: `Payment failed: ${errorMessage}` 
      })
      return
    }

    // Handle cancellation (user cancelled the STK prompt)
    if (result?.status === 'cancelled') {
      status.value = 'cancelled'
      stopStatusChecking()
      if (intervalId !== null) clearInterval(intervalId)
      pushAlert({ 
        type: 'warning', 
        message: 'Payment cancelled. You can retry or contact support.' 
      })
      return
    }

    // Handle pending - still waiting for response or auto-retry
    if (result?.status === 'pending') {
      // Still waiting; continue polling
      return
    }

    // Handle manual reconciliation needed (network error, timeout, etc.)
    if (result?.status === 'manual_reconciliation' || !result?.ok) {
      // Narrow the union type before accessing httpStatus to satisfy TypeScript
      if (result && 'httpStatus' in result && result.httpStatus) {
        pushAlert({
          type: 'warning',
          message: `Network issue (${result.httpStatus}). Retrying...`,
        })
      }
      return
    }

    // Unknown status - log but continue
  } catch (error: any) {
    // Generic error - show warning but don't fail the transaction
    pushAlert({ 
      type: 'warning', 
      message: 'Network error while checking payment status. Retrying...' 
    })
  } finally {
    isMpesaCheckingStatus.value = false
  }
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
    const response = await api.get('/api/transactions?page=1&per_page=1&sort_by=created_at&sort_order=desc&status=paid')
    const data = await response.json()
    if (data?.data?.[0]) {
      invoiceUrl.value = `/api/transactions/${data.data[0].id}/download`
    }
  } catch (error) {
    // Silent fail - invoice URL is optional
  }
}

async function downloadInvoice(): Promise<void> {
  if (!invoiceUrl.value) {
    pushAlert({ type: 'error', message: 'Invoice URL not available' })
    return
  }

  try {
    const response = await api.get(invoiceUrl.value)
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
    pushAlert({ type: 'error', message: 'Failed to download invoice' })
  }
}

function onRetry(): void {
  status.value = 'pending'
  secondsRemaining.value = 180
  invoiceUrl.value = null
  mpesaData.value = null
  if (intervalId !== null) clearInterval(intervalId)
  startTimeoutCountdown()
  startStatusChecking()
  pushAlert({ type: 'info', message: 'Retrying payment confirmation...' })
}

function onClose(): void {
  emits('update:open', false)
  emits('close')
}

function startFlow(): void {
  if (!props.tx && !props.checkoutRequestId) {
    pushAlert({ type: 'error', message: 'Payment error: missing transaction data' })
    return
  }

  status.value = 'pending'
  secondsRemaining.value = 180
  invoiceUrl.value = null
  mpesaData.value = null
  isMpesaCheckingStatus.value = false

  if (intervalId !== null) clearInterval(intervalId)
  stopStatusChecking()
  startTimeoutCountdown()
  _detachEchoListeners()
  _attachEchoListeners()

  if (props.checkoutRequestId) {
    startStatusChecking()
    reconcilePayment()
  }
}

function stopFlow(): void {
  if (intervalId !== null) clearInterval(intervalId)
  stopStatusChecking()
  _detachEchoListeners()
}

onMounted(() => {
  if (props.open) startFlow()
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    startFlow()
    return
  }
  stopFlow()
})

onBeforeUnmount(() => {
  stopFlow()
})
</script>

<style scoped>
.text-muted-foreground { color: #6b7280; }
</style>
