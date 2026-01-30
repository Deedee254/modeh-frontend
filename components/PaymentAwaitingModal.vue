<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 class="text-lg font-semibold">{{ getModalTitle }}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{{ getModalMessage }}</p>

      <div class="mt-4">
        <div class="text-sm">Transaction ID: <span class="font-mono">{{ tx }}</span></div>
        <div class="mt-3 flex items-start gap-2">
          <div v-if="status === 'pending'" class="text-brand-600">⏳ Waiting for payment confirmation...</div>
          <div v-else-if="status === 'active'" class="text-green-600 flex items-center gap-1">
            <span>✓</span> Payment confirmed — subscription active.
          </div>
          <div v-else-if="status === 'cancelled' || status === 'failed'" class="text-red-600 flex items-center gap-1">
            <span>❌</span> Payment cancelled or failed.
          </div>
          <div v-else-if="status === 'timeout'" class="text-orange-600 flex items-center gap-1">
            <span>⏱️</span> Payment timeout — no response after {{ timeoutSeconds }} seconds.
          </div>
        </div>
        
        <!-- Timer display for pending -->
        <div v-if="status === 'pending' && secondsRemaining > 0" class="mt-3 text-xs text-slate-500">
          Auto-timeout in: {{ formatSeconds(secondsRemaining) }}
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button 
          @click="onClose" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          :class="{'opacity-50 cursor-not-allowed': isLoading}"
          :disabled="isLoading"
        >
          {{ getButtonLabel }}
        </button>
        
        <button 
          v-if="showRetryButton"
          @click="onRetry"
          class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          :class="{'opacity-50 cursor-not-allowed': isLoading}"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Retrying...' : 'Retry' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({ tx: String, open: Boolean })
const emits = defineEmits(['close','update:open'])

// State
const status = ref('pending') // pending, active, cancelled, failed, timeout
const isLoading = ref(false)
const secondsRemaining = ref(120) // 2 minute timeout
let intervalId = null
let timeoutId = null
let pollIntervalId = null

const auth = useAuthStore()
const { push: pushAlert } = useAppAlert()

// Echo channel refs so we can detach listeners later
let _echoChannels = []

// Computed properties
const getModalTitle = computed(() => {
  switch (status.value) {
    case 'active': return '✓ Payment Successful'
    case 'timeout': return '⏱️ Payment Timeout'
    case 'cancelled':
    case 'failed': return '❌ Payment Failed'
    default: return 'Processing Payment'
  }
})

const getModalMessage = computed(() => {
  switch (status.value) {
    case 'active': return 'Your subscription has been activated successfully.'
    case 'timeout': return 'Payment confirmation was not received. Please try again or contact support.'
    case 'cancelled': return 'Payment was cancelled. Please try again.'
    case 'failed': return 'Payment failed. Please try again with a different method.'
    default: return 'We\'ve initiated the payment request. Please complete the payment on your phone.'
  }
})

const getButtonLabel = computed(() => {
  if (status.value === 'active') return 'Done'
  if (status.value === 'timeout' || status.value === 'failed' || status.value === 'cancelled') return 'Close'
  return 'Close'
})

const showRetryButton = computed(() => {
  return ['timeout', 'failed', 'cancelled'].includes(status.value)
})

function formatSeconds(secs) {
  const mins = Math.floor(secs / 60)
  const s = secs % 60
  return `${mins}:${s.toString().padStart(2, '0')}`
}

async function check() {
  if (!props.tx) return
  try {
    isLoading.value = true
    const res = await $fetch(`/api/subscriptions/status?tx=${encodeURIComponent(props.tx)}`, { 
      headers: { Accept: 'application/json' } 
    })
    if (res?.subscription) {
      const newStatus = res.subscription.status
      
      status.value = newStatus
      
      if (newStatus === 'active') {
        setTimeout(() => { emits('update:open', false); emits('close') }, 600)
      }
    }
  } catch (e) {
    // ignore transient errors
  } finally {
    isLoading.value = false
  }
}

function startTimeoutCountdown() {
  // Count down from 120 seconds
  secondsRemaining.value = 120
  intervalId = setInterval(() => {
    secondsRemaining.value--
    if (secondsRemaining.value <= 0) {
      clearInterval(intervalId)
      if (status.value === 'pending') {
        status.value = 'timeout'
        pushAlert({ 
          type: 'warning', 
          message: 'Payment confirmation timeout. Please retry or contact support.' 
        })
      }
    }
  }, 1000)
}

function _attachEchoListeners() {
  if (!process.client) return
  if (!props.tx) return
  try {
    const Echo = (window && window.Echo) ? window.Echo : null
    const userId = auth.user?.id
    if (!Echo || !userId) {
      return
    }

    // subscribe to backend channel naming: users.{id}
    const channelNames = [`users.${userId}`]
    channelNames.forEach((chName) => {
      try {
        const ch = Echo.private(chName)
        _echoChannels.push(ch)

        const handler = (payload) => {
          const tx = payload?.tx ?? payload?.data?.tx ?? payload?.subscription?.gateway_meta?.tx ?? payload?.subscription?.tx ?? null
          const subscription = payload?.subscription ?? payload?.data?.subscription ?? null
          if (!tx) return
          if (tx === props.tx) {
            // update status if provided
            const newStatus = subscription?.status ?? payload?.status ?? 'active'
            status.value = newStatus
            // close modal shortly after
            setTimeout(() => { emits('update:open', false); emits('close') }, 600)
          }
        }

        // listen to a few possible event name formats (class, short-name, dotted)
        try { ch.listen('SubscriptionUpdated', handler) } catch (e) {}
        try { ch.listen('.SubscriptionUpdated', handler) } catch (e) {}
        try { ch.listen('.App\\\\Events\\\\SubscriptionUpdated', handler) } catch (e) {}
        try { ch.listen('.App\\Events\\SubscriptionUpdated', handler) } catch (e) {}
      } catch (err) {
        // channel attachment error
      }
    })
  } catch (e) {
    // echo attachment error
  }
}

function _detachEchoListeners() {
  if (!process.client) return
  try {
    _echoChannels.forEach((ch) => {
      try {
        if (typeof ch.stopListening === 'function') {
          ch.stopListening('SubscriptionUpdated')
          ch.stopListening('.SubscriptionUpdated')
        }
        if (typeof ch.leave === 'function') ch.leave()
      } catch (e) {}
    })
  } catch (e) {}
  _echoChannels = []
}

async function onRetry() {
  isLoading.value = true
  try {
    // Reset state
    status.value = 'pending'
    secondsRemaining.value = 120
    clearInterval(intervalId)
    startTimeoutCountdown()
    
    // Restart polling
    if (pollIntervalId) clearInterval(pollIntervalId)
    check() // immediate check
    pollIntervalId = setInterval(() => {
      if (status.value === 'pending') check()
    }, 3000)
    
    pushAlert({ type: 'info', message: 'Retrying payment confirmation...' })
  } catch (e) {
    pushAlert({ type: 'error', message: 'Failed to retry. Please close and try again.' })
  } finally {
    isLoading.value = false
  }
}

function onClose() {
  emits('update:open', false)
  emits('close')
}

onMounted(() => {
  if (!props.tx) {
    return
  }
  
  // Initial check
  check()
  
  // Start polling every 3 seconds
  pollIntervalId = setInterval(() => {
    if (status.value === 'pending') check()
  }, 3000)
  
  // Start timeout countdown
  startTimeoutCountdown()
  
  // attach realtime listeners (if Echo is configured)
  _attachEchoListeners()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  if (pollIntervalId) clearInterval(pollIntervalId)
  if (timeoutId) clearTimeout(timeoutId)
  _detachEchoListeners()
})
</script>

<style scoped>
.text-muted-foreground { 
  color: #6b7280; 
}
</style>

