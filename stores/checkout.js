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

  return { processing, pendingMessage, status, markResults, reset }
})