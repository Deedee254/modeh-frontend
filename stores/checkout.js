import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from '~/composables/useApi'

export const useCheckoutStore = defineStore('checkout', () => {
  // const router = useRouter() // Should be called inside actions when needed.
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

  async function markResults({ type, id, attemptId }) {
    processing.value = true
    status.value = 'processing'
    pendingMessage.value = 'Preparing to mark answers...'

    // Add a small delay to allow backend processing to complete
    await new Promise(resolve => setTimeout(resolve, 2000))

    const steps = ['Marking answers...', 'Calculating results...', 'Adding points & badges...', 'Finalizing results...']
    let stepIndex = 0
    const interval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      pendingMessage.value = steps[stepIndex]
    }, 800)

    try {
      const api = useApi()
      const resultPath = type === 'battle' ? `/quizee/battles/${id}/result` : `/quizee/quizzes/result/${attemptId}`

      // For tournament battles we prefer the tournament-specific mark endpoint.
      // Try tournament mark first, then fallback to the generic battle mark endpoint.
      let endpoints = []
      if (type === 'battle') {
        endpoints = [
          `${cfg.public.apiBase}/api/tournaments/battles/${id}/mark`,
          `${cfg.public.apiBase}/api/battles/${id}/mark`
        ]
        // Note: the above includes a tournament-scoped attempt; frontend may provide the tournament id via attemptId in some flows.
        // We'll try each endpoint until one succeeds or all fail.
      } else {
        endpoints = [`${cfg.public.apiBase}/api/quiz-attempts/${attemptId}/mark`]
      }

      let res = null
      for (let e of endpoints) {
        // Retry logic for marking answers
        let retries = 3
        while (retries > 0) {
          res = await api.postJson(e.replace(cfg.public.apiBase, ''), {}).catch(() => null)
          if (res && (res.code === 'limit_reached' || res.ok || res.status === 'success')) break
          retries--
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000))
        }
        if (res && (res.ok || res.status === 'success' || res.code === 'limit_reached')) break
      }

      if (res && res.code === 'limit_reached') {
        // Route the user to the subscription/checkout page with the limit context so they can upgrade
        const router = useRouter()
        const qs = new URLSearchParams({ reason: 'limit', type: res.limit?.type || 'unknown', value: String(res.limit?.value || '') })
        router.push('/quizee/subscription?' + qs.toString())
        return
      }

      if (res && (res.ok || res.status === 'success')) {
        pendingMessage.value = 'Completed. Redirecting to results...'
        status.value = 'success'
        const router = useRouter()
        router.push(resultPath)
      } else {
        throw new Error('Failed to mark results. Please try again in a few seconds.')
      }
    } catch (e) {
      pendingMessage.value = e.message || 'An error occurred while marking results. Please try again.'
      status.value = 'error'
    } finally {
      clearInterval(interval)
      processing.value = false
    }
  }

  return { processing, pendingMessage, status, markResults, reset }
})