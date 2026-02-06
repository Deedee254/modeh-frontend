// composables/useMpesaPayment.ts
import { ref, computed } from 'vue'

interface MpesaPaymentOptions {
  checkoutRequestId: string
  amount: number
  phone: string
  subscription?: any
}

interface PaymentState {
  status: 'idle' | 'pending' | 'checking' | 'success' | 'failed' | 'manual_reconciliation'
  resultCode: number | null
  resultDesc: string | null
  mpesaReceipt: string | null
  transactionDate: string | null
  errorMessage: string | null
  retryCount: number
  nextRetryAt: string | null
  lastCheckedAt: string | null
}

export const useMpesaPayment = () => {
  const api = useApi()
  const state = ref<PaymentState>({
    status: 'idle',
    resultCode: null,
    resultDesc: null,
    mpesaReceipt: null,
    transactionDate: null,
    errorMessage: null,
    retryCount: 0,
    nextRetryAt: null,
    lastCheckedAt: null,
  })

  const isSuccess = computed(() => state.value.status === 'success')
  const isFailed = computed(() => state.value.status === 'failed')
  const isPending = computed(() => state.value.status === 'pending')
  const isChecking = computed(() => state.value.status === 'checking')
  const needsManualReconciliation = computed(() => state.value.status === 'manual_reconciliation')

  /**
   * Poll the reconciliation endpoint until transaction is resolved
   * Calls POST /api/mpesa/reconcile with backoff strategy
   */
  const reconcile = async (checkoutRequestId: string, source: 'user' | 'admin' | 'worker' = 'user') => {
    state.value.status = 'checking'
    state.value.lastCheckedAt = new Date().toISOString()

    try {
      console.log('[useMpesaPayment] Making reconcile request for:', checkoutRequestId)
      
      const resp = await api.postJson('/api/mpesa/reconcile', {
        checkout_request_id: checkoutRequestId,
        source,
      })

      console.log('[useMpesaPayment] Response status:', resp.status, 'OK:', resp.ok)

      // Check HTTP status first
      if (!resp.ok) {
        console.error('[useMpesaPayment] HTTP error:', resp.status, resp.statusText)
        state.value.status = 'manual_reconciliation'
        state.value.errorMessage = `HTTP ${resp.status}: ${resp.statusText}`
        return { ok: false, status: 'manual_reconciliation', httpStatus: resp.status }
      }

      const response = await resp.json()
      console.log('[useMpesaPayment] Reconcile response:', response)

      if (response?.ok) {
        const { status, transaction } = response

        state.value.status = status as PaymentState['status']
        state.value.resultCode = transaction?.result_code ?? null
        state.value.resultDesc = transaction?.result_desc ?? null
        state.value.mpesaReceipt = transaction?.mpesa_receipt ?? null
        state.value.transactionDate = transaction?.transaction_date ?? null
        state.value.retryCount = transaction?.retry_count ?? 0
        state.value.nextRetryAt = transaction?.next_retry_at ?? null

        if (status === 'success') {
          state.value.errorMessage = null
          console.log('[useMpesaPayment] ✅ Success')
          return { ok: true, status: 'success', transaction }
        } else if (status === 'failed') {
          state.value.errorMessage = transaction?.result_desc || 'Payment failed'
          console.log('[useMpesaPayment] ❌ Failed')
          return { ok: false, status: 'failed', transaction }
        } else if (status === 'pending') {
          // Daraja may still be processing; schedule auto-retry based on nextRetryAt
          state.value.errorMessage = null
          console.log('[useMpesaPayment] ⏳ Pending')
          return { ok: false, status: 'pending', transaction, nextRetryAt: transaction?.next_retry_at }
        } else {
          // Unknown status returned from backend
          console.warn('[useMpesaPayment] ⚠️ Unknown status:', status)
          state.value.errorMessage = `Unknown status: ${status}`
          return { ok: true, status: status || 'pending', transaction }
        }
      } else {
        // Response ok but data indicates error
        console.warn('[useMpesaPayment] API returned not ok:', response)
        state.value.status = 'manual_reconciliation'
        state.value.errorMessage = response?.message || 'Failed to reconcile payment'
        return { ok: false, status: 'manual_reconciliation', message: response?.message }
      }
    } catch (error: any) {
      console.error('[useMpesaPayment] Error during reconcile:', error)
      state.value.status = 'manual_reconciliation'
      state.value.errorMessage = error?.message || 'Network error during reconciliation'
      return { ok: false, status: 'manual_reconciliation', error: error?.message }
    }
  }

  /**
   * Auto-poll with exponential backoff
   * Calls reconcile() repeatedly until resolved or max retries hit
   */
  const autoPoll = async (
    checkoutRequestId: string,
    options: {
      maxRetries?: number
      initialDelayMs?: number
      maxDelayMs?: number
    } = {}
  ) => {
    const { maxRetries = 5, initialDelayMs = 2000, maxDelayMs = 30000 } = options

    let attempt = 0
    let delayMs = initialDelayMs

    while (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))

      const result = await reconcile(checkoutRequestId, 'worker')

      if (result && (result.status === 'success' || result.status === 'failed')) {
        // Transaction resolved
        return result
      }

      // Still pending; increase delay exponentially
      attempt++
      delayMs = Math.min(delayMs * 1.5, maxDelayMs)
    }

    // Max retries exhausted; requires manual reconciliation
    state.value.status = 'manual_reconciliation'
    state.value.errorMessage = 'Payment status could not be confirmed. Please contact support.'
    return { ok: false, status: 'manual_reconciliation', message: 'Max retries exceeded' }
  }

  /**
   * Reset state for a new payment
   */
  const reset = () => {
    state.value = {
      status: 'idle',
      resultCode: null,
      resultDesc: null,
      mpesaReceipt: null,
      transactionDate: null,
      errorMessage: null,
      retryCount: 0,
      nextRetryAt: null,
      lastCheckedAt: null,
    }
  }

  return {
    state: computed(() => state.value),
    isSuccess,
    isFailed,
    isPending,
    isChecking,
    needsManualReconciliation,
    reconcile,
    autoPoll,
    reset,
  }
}
