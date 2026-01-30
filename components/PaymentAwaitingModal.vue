<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 class="text-lg font-semibold">{{ getModalTitle }}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{{ getModalMessage }}</p>

      <div class="mt-4">
        <div class="text-sm">Transaction ID: <span class="font-mono">{{ tx }}</span></div>
        <div class="mt-3 text-green-600" v-if="status === 'active'"> Payment confirmed</div>
        <div class="mt-3 text-brand-600" v-else-if="status === 'pending'"> Waiting...</div>
        <div class="mt-3 text-orange-600" v-else-if="status === 'timeout'"> Timeout</div>
        <div class="mt-3 text-red-600" v-else> Failed</div>
        
        <div v-if="status === 'pending' && secondsRemaining > 0" class="mt-3 text-xs text-slate-500">
          Timeout in: {{ formatSeconds(secondsRemaining) }}
        </div>

        <div v-if="status === 'active' && invoiceUrl" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm font-medium text-green-900 mb-2"> Invoice Ready</p>
          <button @click="downloadInvoice" class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded">
             Download PDF
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="onClose" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg" :disabled="status === 'pending'">
          {{ getButtonLabel }}
        </button>
        
        <button v-if="showRetryButton" @click="onRetry" class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg">
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

interface Echo {
  private: (channel: string) => EchoChannel
}

interface EchoChannel {
  listen: (event: string, callback: (payload: any) => void) => void
  stopListening: (event: string) => void
  leave: () => void
}

interface EchoPayload {
  tx?: string
  subscription?: {
    tx?: string
    status?: string
  }
}

const props = defineProps<{
  tx?: string
  open?: boolean
}>()
const emits = defineEmits<{ close: [], 'update:open': [boolean] }>()

const status = ref<'pending' | 'active' | 'cancelled' | 'failed' | 'timeout'>('pending')
const secondsRemaining = ref(180)
const invoiceUrl = ref<string | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null
const auth = useAuthStore()
const { push: pushAlert } = useAppAlert()
const api = useApi()
let _echoChannels: EchoChannel[] = []

const titles: Record<string, string> = {
  'active': '✓ Payment Successful',
  'timeout': '⏱️ Payment Timeout',
  'cancelled': '❌ Payment Failed',
  'failed': '❌ Payment Failed'
}

const messages: Record<string, string> = {
  'active': 'Your subscription has been activated successfully.',
  'timeout': 'Payment confirmation was not received. Please try again or contact support.',
  'cancelled': 'Payment was cancelled. Please try again.',
  'failed': 'Payment failed. Please try again with a different method.'
}

const getModalTitle = computed(() => {
  return titles[status.value] || 'Processing Payment'
})

const getModalMessage = computed(() => {
  return messages[status.value] || 'We\'ve initiated the payment request. Please complete the payment on your phone.'
})

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

function _attachEchoListeners(): void {
  if (!process.client || !props.tx) return
  try {
    const Echo = (window as any).Echo as Echo | undefined
    const userId = auth.user?.id
    if (!Echo || !userId) return

    const ch = Echo.private(`users.${userId}`)
    _echoChannels.push(ch)

    const handler = (payload: EchoPayload): void => {
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
