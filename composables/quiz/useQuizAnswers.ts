import { ref } from 'vue'

interface Question {
  id: string
  type: string
}

interface Quiz {
  questions: Question[]
}

export function useQuizAnswers(quiz: { value: Quiz }, quizId: string) {
  const answers = ref<Record<string, any>>({})

  const initializeAnswers = () => {
    if (!quiz.value || !Array.isArray(quiz.value.questions)) return
    quiz.value.questions.forEach((q: Question) => {
      answers.value[q.id] = (q.type === 'multi') ? [] : null
    })
  }

  const selectMcq = (qid: string, opt: any) => {
    answers.value[qid] = opt
  }

  const toggleMulti = (qid: string, opt: any) => {
    const arr = answers.value[qid] || []
    const idx = arr.indexOf(opt)
    if (idx === -1) arr.push(opt)
    else arr.splice(idx, 1)
    answers.value[qid] = arr
  }

  const updateBlank = (qid: string, index: number, value: string) => {
    if (!Array.isArray(answers.value[qid])) answers.value[qid] = []
    const currentAnswers = [...answers.value[qid]]
    currentAnswers[index] = value
    answers.value[qid] = currentAnswers
  }

  const clearSavedAnswers = () => {
    if (!quiz.value || !Array.isArray(quiz.value.questions)) return
    quiz.value.questions.forEach((q: Question) => { answers.value[q.id] = (q.type === 'multi') ? [] : null })
  }

  return { answers, initializeAnswers, selectMcq, toggleMulti, updateBlank, clearSavedAnswers }
}
