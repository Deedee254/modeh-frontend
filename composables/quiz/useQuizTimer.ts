import { ref, computed, onBeforeUnmount, getCurrentInstance } from 'vue'

export function useQuizTimer(quiz: any, onTimerEnd: () => void) {
  const timer = ref<ReturnType<typeof setInterval> | null>(null)
  const timeLeft = ref(0)
  const lastAnnouncement = ref('')

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const displayTime = computed(() => {
    if (quiz.value.timer_seconds) {
      return `Time left: ${formatTime(timeLeft.value)}`
    }
    return `Time spent: ${formatTime(timeLeft.value)}`
  })

  const timerPercent = computed(() => {
    if (!quiz.value.timer_seconds) return 0
    const total = Number(quiz.value.timer_seconds) || 1
    const elapsed = Math.max(0, total - Number(timeLeft.value))
    return Math.round((elapsed / total) * 100)
  })

  const timerColorClass = computed(() => {
    if (!quiz.value.timer_seconds) return 'bg-gray-400'
    const pct = timerPercent.value
    if (pct >= 90) return 'bg-red-500' // Changed from 75 to 90 for more urgency
    if (pct >= 60) return 'bg-amber-500' // Changed from 50 to 60
    return 'bg-green-500'
  })

  const startTimer = () => {
    if (quiz.value.timer_seconds) {
      timeLeft.value = quiz.value.timer_seconds
      timer.value = setInterval(() => {
        timeLeft.value = Math.max(0, timeLeft.value - 1)
        if (timeLeft.value === 60) lastAnnouncement.value = 'One minute remaining'
        if (timeLeft.value === 10) lastAnnouncement.value = 'Ten seconds remaining'
        if (timeLeft.value === 0) onTimerEnd()
      }, 1000)
    } else {
      timeLeft.value = 0
      timer.value = setInterval(() => {
        timeLeft.value++
      }, 1000)
    }
  }

  const stopTimer = () => {
    if (timer.value) clearInterval(timer.value)
  }

  // Only register the lifecycle hook when called from inside a component's setup()
  // function. Calling composables outside setup (or during SSR) will result in
  // a Vue warning because there is no active component instance. Guarding here
  // avoids that warning and makes the composable safe to call from non-setup
  // contexts (stores, tests, SSR code) where automatic cleanup isn't available.
  try {
    if (getCurrentInstance()) onBeforeUnmount(stopTimer)
  } catch (e) {}

  return { timeLeft, displayTime, timerPercent, timerColorClass, lastAnnouncement, startTimer, stopTimer }
}
