import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from '~/composables/useApi'
import { useRouter } from '#imports'

export const useCheckoutStore = defineStore('checkout', () => {
  // const router = useRouter() // Should be called inside actions when needed.
  const cfg = useRuntimeConfig()

  // State
  const processing = ref<boolean>(false)
  const pendingMessage = ref<string>('')
  const status = ref<'idle' | 'processing' | 'success' | 'error'>('idle') // idle, processing, success, error
  let pollHandle: ReturnType<typeof setInterval> | null = null

  function reset() {
    processing.value = false
    pendingMessage.value = ''
    status.value = 'idle'
    if (pollHandle) { clearInterval(pollHandle); pollHandle = null }
  }

  async function markResults(params: { type: string; id?: string | number; attemptId?: string | number }) {
    const { type, id, attemptId } = params
    processing.value = true
    status.value = 'processing'
    pendingMessage.value = 'Preparing to mark answers...'

    // Add a small delay to allow backend processing to complete
    await new Promise(resolve => setTimeout(resolve, 2000))

    const steps: string[] = ['Marking answers...', 'Calculating results...', 'Adding points & badges...', 'Finalizing results...']
    let stepIndex = 0
    const interval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      pendingMessage.value = steps[stepIndex] ?? ''
    }, 800)

    try {
      const api = useApi()
      const resultPath = type === 'battle' ? `/quizee/battles/${id}/result` : `/quizee/quizzes/result/${attemptId}`

      // Determine endpoints based on type
      let endpoints: string[] = []
      if (type === 'battle') {
        // For regular battles, only use the generic battle mark endpoint
        endpoints = [`${cfg.public.apiBase}/api/battles/${id}/mark`]
      } else {
        // For quizzes, use quiz attempt endpoint
        endpoints = [`${cfg.public.apiBase}/api/quiz-attempts/${attemptId}/mark`]
      }

      let res: any = null
      for (let e of endpoints) {
        // Retry logic for marking answers
        let retries = 3
        while (retries > 0) {
          // postJson returns a Response or similar; treat as any for now
          // remove base prefix because api.postJson expects a path
          const response = await api.postJson(e.replace(cfg.public.apiBase, ''), {}).catch(() => null)
          if (!response) {
            retries--
            if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
          
          // Parse response to check for errors or success
          const data = response.ok ? (await response.json().catch(() => ({}))) : {}
          
          if (data.code === 'limit_reached' || data.ok || response.status === 'success') {
            res = data
            res._httpStatus = response.status
            break
          }
          
          // If not ok, capture the error response
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            res = errorData
            res._httpStatus = response.status
            break
          }
          
          retries--
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000))
        }
        if (res) break
      }

      if (res && res.code === 'limit_reached') {
        // Route the user to the subscription/checkout page with the limit context so they can upgrade
        const router = useRouter()
        const qs = new URLSearchParams({ reason: 'limit', type: res.limit?.type || 'unknown', value: String(res.limit?.value || '') })
        router.push('/quizee/subscription?' + qs.toString())
        return
      }

      if (res && res.ok) {
        pendingMessage.value = 'Completed. Redirecting to results...'
        status.value = 'success'
        const router = useRouter()
        router.push(resultPath)
      } else if (res && res._httpStatus >= 400) {
        // Display actual backend error message instead of generic message
        const errorMsg = res.message || res.error || `Server error (${res._httpStatus})`
        throw new Error(errorMsg)
      } else {
        throw new Error('Failed to mark results. Please try again in a few seconds.')
      }
    } catch (err: any) {
      pendingMessage.value = err?.message || 'An error occurred while marking results. Please try again.'
      status.value = 'error'
    } finally {
      clearInterval(interval)
      processing.value = false
    }
  }

  return { processing, pendingMessage, status, markResults, reset }
})