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
    if (!Array.isArray(answers.value[qid])) answers.value[qid] = []
    const arr = answers.value[qid]
    const idx = arr.indexOf(opt)
    if (idx === -1) arr.push(opt)
    else arr.splice(idx, 1)
  }

  const updateBlank = (qid: string, index: number, value: string) => {
    if (!Array.isArray(answers.value[qid])) answers.value[qid] = []
    const arr = answers.value[qid]
    // ensure array is large enough
    if (index >= arr.length) {
      for (let i = arr.length; i <= index; i++) arr[i] = ''
    }
    // mutate in-place to preserve reference identity
    arr[index] = value
  }

  const clearSavedAnswers = () => {
    if (!quiz.value || !Array.isArray(quiz.value.questions)) return
    quiz.value.questions.forEach((q: Question) => { answers.value[q.id] = (q.type === 'multi') ? [] : null })
  }

  return { answers, initializeAnswers, selectMcq, toggleMulti, updateBlank, clearSavedAnswers }
}
