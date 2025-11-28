import { ref, computed } from 'vue'

/**
 * useQuestionTimer - composable to manage a per-question countdown timer
 * returns reactive state and helpers for starting/stopping/resetting the timer
 * and scheduling a per-question expiry callback.
 */
export default function useQuestionTimer(defaultSeconds = 20) {
  const timePerQuestion = ref(defaultSeconds)
  const questionRemaining = ref(0)
  const questionStartTs = ref(0)
  let _interval = null as any
  let _limitTimer = null as any
  let _onTimeout = null as any

  const displayTime = computed(() => {
    const sec = Math.max(0, Math.ceil(questionRemaining.value))
    return sec.toString().padStart(2, '0')
  })

  const timerColorClass = computed(() => {
    if (questionRemaining.value <= 5) return 'text-red-500 dark:text-red-400 animate-pulse'
    if (questionRemaining.value <= 10) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-gray-800 dark:text-gray-200'
  })

  /**
   * Start the question interval timer.
   * @param seconds optional full-per-question limit (will replace stored timePerQuestion)
   * @param initialRemaining optional remaining seconds to start from (useful when restoring)
   */
  function startTimer(seconds?: number, initialRemaining?: number) {
    stopTimer()
    if (typeof seconds === 'number') timePerQuestion.value = seconds
    if (typeof initialRemaining === 'number') {
      // start from a restored remaining time; compute a start timestamp such that
      // elapsed = timePerQuestion - initialRemaining
      questionRemaining.value = Math.max(0, initialRemaining)
      questionStartTs.value = Date.now() - Math.max(0, (timePerQuestion.value - questionRemaining.value) * 1000)
    } else {
      questionRemaining.value = timePerQuestion.value
      questionStartTs.value = Date.now()
    }
    _interval = setInterval(() => {
      const elapsed = (Date.now() - questionStartTs.value) / 1000
      questionRemaining.value = Math.max(0, timePerQuestion.value - elapsed)
      if (questionRemaining.value <= 0) {
        // on timeout call handler if set
        if (typeof _onTimeout === 'function') _onTimeout()
      }
    }, 500)
  }

  function stopTimer() {
    if (_interval) { clearInterval(_interval); _interval = null }
  }

  function resetTimer(seconds?: number) {
    if (typeof seconds === 'number') timePerQuestion.value = seconds
    questionRemaining.value = timePerQuestion.value
    questionStartTs.value = Date.now()
  }

  function getElapsed() {
    if (!questionStartTs.value) return 0
    return Math.floor((Date.now() - questionStartTs.value) / 1000)
  }

  function recordAndReset(seconds?: number) {
    const elapsed = getElapsed()
    resetTimer(seconds)
    return Math.min(elapsed, timePerQuestion.value)
  }

  function onTimeout(cb: Function) {
    _onTimeout = cb
  }

  /**
   * Schedule a single authoritative per-question expiry.
   * @param limitSeconds full per-question limit in seconds (used as fallback)
   * @param cb callback to invoke on expiry
   * @param remainingSeconds optional remaining seconds to schedule for (useful when restoring)
   */
  function schedulePerQuestionLimit(limitSeconds: number | null, cb: Function, remainingSeconds?: number | null) {
    clearPerQuestionLimit()
    if (!limitSeconds) return
    const ms = Math.max(0, (typeof remainingSeconds === 'number' && remainingSeconds !== null ? remainingSeconds : limitSeconds) * 1000)
    _limitTimer = setTimeout(() => {
      try { cb() } catch (e) { /* swallow */ }
    }, ms)
  }

  function clearPerQuestionLimit() {
    if (_limitTimer) { clearTimeout(_limitTimer); _limitTimer = null }
  }

  return {
    timePerQuestion,
    questionRemaining,
    questionStartTs,
    displayTime,
    timerColorClass,
    startTimer,
    stopTimer,
    resetTimer,
    getElapsed,
    recordAndReset,
    onTimeout,
    schedulePerQuestionLimit,
    clearPerQuestionLimit
  }
}

