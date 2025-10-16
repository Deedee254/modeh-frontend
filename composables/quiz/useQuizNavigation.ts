import { ref } from 'vue'

export function useQuizNavigation(questions: any) {
  const currentQuestion = ref<number>(0)

  const nextQuestion = () => {
    if (!questions || !questions.value) return
    if (currentQuestion.value < questions.value.length - 1) {
      currentQuestion.value++
    }
  }

  const previousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
    }
  }

  return { currentQuestion, nextQuestion, previousQuestion }
}
