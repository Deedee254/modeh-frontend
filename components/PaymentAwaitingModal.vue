<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 class="text-lg font-semibold">Awaiting payment</h3>
      <p class="mt-2 text-sm text-muted-foreground">We've initiated the payment request. Please complete the payment on your phone.</p>

      <div class="mt-4">
        <div class="text-sm">Transaction ID: <span class="font-mono">{{ tx }}</span></div>
        <div class="mt-3">
          <div v-if="status === 'pending'" class="text-blue-600">Waiting for payment confirmation...</div>
          <div v-else-if="status === 'active'" class="text-green-600">Payment confirmed — subscription active.</div>
          <div v-else-if="status === 'cancelled' || status === 'failed'" class="text-red-600">Payment failed or cancelled.</div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button class="btn" @click="onClose" :disabled="status === 'pending'">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({ tx: String, open: Boolean })
const emits = defineEmits(['close','update:open'])

const status = ref('pending')
let intervalId = null

const auth = useAuthStore()

// Echo channel refs so we can detach listeners later
let _echoChannels = []

async function check() {
  try {
    const res = await $fetch(`/api/subscriptions/status?tx=${encodeURIComponent(props.tx)}`, { headers: { Accept: 'application/json' } })
    if (res?.subscription) status.value = res.subscription.status
  } catch (e) {
    // ignore transient errors
  }
}

function _attachEchoListeners() {
  if (!process.client) return
  if (!props.tx) return
  try {
    const Echo = (window && window.Echo) ? window.Echo : null
    const userId = auth.user?.id
    if (!Echo || !userId) return

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
            status.value = subscription?.status ?? payload?.status ?? 'active'
            // show a small success alert if available
            try { const alert = useAppAlert(); alert.push({ message: 'Payment confirmed', type: 'success' }) } catch (e) {}
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
        // ignore per-channel errors
      }
    })
  } catch (e) {
    // ignore overall echo attach errors
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

onMounted(() => {
  if (!props.tx) return
  check()
  intervalId = setInterval(() => {
    if (status.value !== 'pending') { clearInterval(intervalId); return }
    check()
  }, 3000)

  // attach realtime listeners (if Echo is configured)
  _attachEchoListeners()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  _detachEchoListeners()
})

function onClose() {
  emits('update:open', false)
  emits('close')
}
</script>

<style scoped>
.text-muted-foreground { color: var(--muted-foreground); }
.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; }
</style>
