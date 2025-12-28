import { ref, computed } from 'vue'

type Achievement = { title: string; description: string; icon?: string }

export function useQuizEnhancements(quiz: any, progressPercent: any, currentQuestion: any, answers: any) {
  const currentStreak = ref<number>(0)
  const answeredCorrectly = ref<Record<string, boolean>>({})
  const achievements = ref<Achievement[]>([])

  const encouragementMessage = computed(() => {
    const totalQuestions = Array.isArray(quiz.value?.questions) ? quiz.value.questions.length : 0
    const questionsLeft = totalQuestions - (Number(currentQuestion.value) || 0)
    if (currentStreak.value >= 3) return "You're on fire!"
    if (progressPercent.value >= 90) return "Almost there!"
    if (progressPercent.value >= 75) return "You're doing great!"
    if (progressPercent.value >= 50) return "Halfway there!"
    if (progressPercent.value >= 25) return "Keep going!"
    if (questionsLeft === 1) return "Last question!"
    return "You've got this!"
  })

  const encouragementStyle = computed(() => {
    if (currentStreak.value >= 3) return 'from-orange-500 to-red-500 text-white'
    const progress = progressPercent.value
    if (progress >= 90) return 'from-green-500 to-emerald-500 text-white'
    if (progress >= 75) return 'from-brand-500 to-brand-500 text-white'
    if (progress >= 50) return 'from-brand-500 to-brand-500 text-white'
    return 'from-violet-500 to-fuchsia-500 text-white'
  })

  const updateStreak = (isCorrect: boolean) => {
    if (isCorrect) {
      currentStreak.value++
    } else {
      currentStreak.value = 0
    }
  }

  const calculateAchievements = () => {
    const total = Array.isArray(quiz.value?.questions) ? quiz.value.questions.length : 0
    let totalAnswered = 0
    if (Array.isArray(quiz.value?.questions)) {
      for (const q of quiz.value.questions) {
        const val = answers.value[q.id]
        if (val === null || val === undefined) continue
        if (typeof val === 'string' && val === '') continue
        if (Array.isArray(val) && val.length === 0) continue
        totalAnswered++
      }
    }
    const correctCount = Object.values(answeredCorrectly.value).filter(Boolean).length

    // clear previous achievements in-place to avoid replacing the array reference
    achievements.value.length = 0

    if (currentStreak.value >= 5) {
      achievements.value.push({
        title: "Hot Streak",
        description: "Answered 5 questions correctly in a row!",
        icon: "🔥"
      })
    }
    if (totalAnswered === total && total > 0) {
      achievements.value.push({
        title: "Completionist",
        description: "Answered all questions!",
        icon: "🎯"
      })
    }
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0
    if (accuracy >= 90) {
      achievements.value.push({
        title: "Excellence",
        description: "Achieved 90% or higher accuracy!",
        icon: "🌟"
      })
    }
  }

  const resetAchievements = () => {
    currentStreak.value = 0
    answeredCorrectly.value = {}
    achievements.value = []
  }

  return { currentStreak, achievements, encouragementMessage, encouragementStyle, updateStreak, calculateAchievements, resetAchievements }
}

