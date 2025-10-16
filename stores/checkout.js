import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useCheckoutStore = defineStore('checkout', () => {
  const router = useRouter()
  const cfg = useRuntimeConfig()

  // State
  const processing = ref(false)
  const pendingMessage = ref('')
  const status = ref('idle') // idle, processing, success, error
  let pollHandle = null

  function reset() {
    processing.value = false
    pendingMessage.value = ''
    status.value = 'idle'
    if (pollHandle) { clearInterval(pollHandle); pollHandle = null }
  }

  async function payForThisItem({ phone, packageId, type, itemId, amount }) {
    if (!phone) {
      pendingMessage.value = 'Please enter a phone number to proceed.'
      status.value = 'error'
      return
    }

    processing.value = true
    pendingMessage.value = ''
    status.value = 'processing'

    try {
      if (!packageId) {
        // initiate one-off purchase
        const payload = { item_type: type || 'quiz', item_id: itemId, amount, phone }
        const res = await $fetch(`${cfg.public.apiBase}/api/one-off-purchases`, { method: 'POST', credentials: 'include', body: payload }).catch(() => null)
        if (res && res.ok && res.purchase) {
          pendingMessage.value = 'Payment initiated. Check your phone for Mpesa prompt.'
          status.value = 'processing'

          // start polling for purchase status by id
          const purchaseId = res.purchase.id
          let attempts = 0
          const maxAttempts = 60 // 2 minutes at 2s interval
          pollHandle = setInterval(async () => {
            attempts++
            try {
              const p = await $fetch(`${cfg.public.apiBase}/api/one-off-purchases/${purchaseId}`, { credentials: 'include' }).catch(() => null)
              if (p && p.ok && p.purchase) {
                const st = p.purchase.status
                if (st === 'confirmed') {
                  pendingMessage.value = 'Payment confirmed. You can now see results.'
                  status.value = 'success'
                  clearInterval(pollHandle); pollHandle = null
                } else if (st === 'cancelled' || st === 'failed') {
                  pendingMessage.value = 'Payment was cancelled or failed.'
                  status.value = 'error'
                  clearInterval(pollHandle); pollHandle = null
                } else {
                  // still pending - update message optionally
                  pendingMessage.value = 'Waiting for payment confirmation...'
                }
              }
            } catch (e) {
              // ignore transient errors
            }
            if (attempts >= maxAttempts) {
              if (pollHandle) { clearInterval(pollHandle); pollHandle = null }
              pendingMessage.value = 'Payment is taking longer than expected. If you completed payment, try "See Results" after a few seconds.'
              status.value = 'error'
            }
          }, 2000)
        } else {
          throw new Error('Failed to initiate one-off payment')
        }
      } else {
        // package subscribe path
        const sub = await $fetch(`${cfg.public.apiBase}/api/packages/${packageId}/subscribe`, { method: 'POST', credentials: 'include', body: { phone } })
        if (!sub?.subscription?.id) throw new Error('Failed to create subscription')
        const init = await $fetch(`${cfg.public.apiBase}/api/payments/subscriptions/${sub.subscription.id}/mpesa/initiate`, { method: 'POST', credentials: 'include' })
        if (init && (init.ok === true || init.success === true)) {
          pendingMessage.value = 'Payment initiated. Check your phone for Mpesa prompt.'
          status.value = 'success'
        } else throw new Error('Failed to initiate subscription payment')
      }
    } catch (e) {
      pendingMessage.value = e.message || 'Payment failed. Please try again.'
      status.value = 'error'
    } finally {
      processing.value = false
    }
  }

  async function markResults({ type, id, attemptId }) {
    processing.value = true
    status.value = 'processing'
    pendingMessage.value = 'Marking answers...'

    const steps = ['Marking answers...', 'Calculating results...', 'Adding points & badges...', 'Finalizing results...']
    let stepIndex = 0
    const interval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      pendingMessage.value = steps[stepIndex]
    }, 800)

    try {
      const endpoint = type === 'battle'
        ? `${cfg.public.apiBase}/api/battles/${id}/mark`
        : `${cfg.public.apiBase}/api/quiz-attempts/${attemptId}/mark`

      const resultPath = type === 'battle' ? `/quizee/battles/${id}/result` : `/quizee/quizzes/result/${attemptId}`

      const res = await $fetch(endpoint, { method: 'POST', credentials: 'include' }).catch(() => null)

      if (res && (res.ok || res.status === 'success')) {
        pendingMessage.value = 'Completed. Redirecting to results...'
        status.value = 'success'
        router.push(resultPath)
      } else {
        throw new Error('Failed to mark results. If you just paid, try again in a few seconds.')
      }
    } catch (e) {
      pendingMessage.value = e.message || 'An error occurred while marking results. Please try again.'
      status.value = 'error'
    } finally {
      clearInterval(interval)
      processing.value = false
    }
  }

  return { processing, pendingMessage, status, payForThisItem, markResults, reset }
})