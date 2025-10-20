import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '~/composables/useApi'

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
      const endpoint = type === 'battle'
        ? `${cfg.public.apiBase}/api/battles/${id}/mark`
        : `${cfg.public.apiBase}/api/quiz-attempts/${attemptId}/mark`

      const resultPath = type === 'battle' ? `/quizee/battles/${id}/result` : `/quizee/quizzes/result/${attemptId}`

      const api = useApi()
      
      // Add retry logic
      let retries = 3
      let res = null
      
      while (retries > 0) {
        res = await api.postJson(endpoint.replace(cfg.public.apiBase, ''), {}).catch(() => null)
        // If backend returned a structured limit error object, stop and handle below
        if (res && (res.code === 'limit_reached' || res.ok || res.status === 'success')) break
        retries--
        if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (res && res.code === 'limit_reached') {
        // Route the user to the subscription/checkout page with the limit context so they can upgrade
        const qs = new URLSearchParams({ reason: 'limit', type: res.limit?.type || 'unknown', value: String(res.limit?.value || '') })
        router.push('/quizee/subscription?' + qs.toString())
        return
      }

      if (res && (res.ok || res.status === 'success')) {
        pendingMessage.value = 'Completed. Redirecting to results...'
        status.value = 'success'
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