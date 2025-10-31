import { defineStore } from 'pinia'
import { normalizeAnswer } from '~/composables/useAnswerNormalization'
import type { QuestionId, Answer, AttemptData, AttemptCacheEntry } from '~/types/quiz'

export const useAnswerStore = defineStore('answers', () => {
  const answers = ref(new Map<QuestionId, Answer>())
  const quizId = ref<number | null | undefined>(undefined)

  // For storing completed quiz/battle attempts for review
  const reviewAttempts = ref(new Map<number, AttemptCacheEntry>())

  function setAnswer(questionId: QuestionId, answer: Answer) {
    // Normalize the answer before storing it to match backend format
    const normalizedAnswer = normalizeAnswer(answer)
    answers.value.set(questionId, normalizedAnswer)
  }

  function getAnswer(questionId: QuestionId): Answer | undefined {
    return answers.value.get(questionId)
  }

  function reset(newQuizId: number | null | undefined = undefined) {
    answers.value.clear()
    quizId.value = newQuizId
  }

  function loadAnswers(newAnswers: [QuestionId, Answer][], newQuizId: number | null | undefined) {
    answers.value = new Map(newAnswers)
    quizId.value = newQuizId
  }

  const allAnswers = computed(() => {
    return Array.from(answers.value.entries()).map(([question_id, answer]) => ({
      question_id,
      answer
    }))
  })

  // Review functionality
  function storeAttemptForReview(attemptId: number | string, attemptData: AttemptData) {
    const normalizedAttempt: AttemptCacheEntry = {
      attempt: attemptData.attempt ?? attemptData,
      badges: attemptData.badges ?? [],
      points: attemptData.points ?? attemptData.points_earned ?? undefined,
      rank: attemptData.rank ?? undefined,
      total_participants: attemptData.total_participants ?? undefined,
      quiz_id: attemptData.quiz_id ?? attemptData.attempt?.quiz_id ?? undefined,
      battle_id: attemptData.battle_id ?? attemptData.attempt?.battle_id ?? undefined
    }
    reviewAttempts.value.set(Number(attemptId), normalizedAttempt)
  }

  function getAttemptForReview(attemptId: number | string): AttemptCacheEntry | undefined {
    return reviewAttempts.value.get(Number(attemptId))
  }

  function hasAttemptForReview(attemptId: number | string): boolean {
    return reviewAttempts.value.has(Number(attemptId))
  }

  function clearReviewAttempts() {
    reviewAttempts.value.clear()
  }

  function removeReviewAttempt(attemptId: number | string) {
    reviewAttempts.value.delete(Number(attemptId))
  }

  return {
    answers,
    quizId,
    setAnswer,
    getAnswer,
    reset,
    loadAnswers,
    allAnswers,
    // Review
    reviewAttempts,
    storeAttemptForReview,
    getAttemptForReview,
    hasAttemptForReview,
    clearReviewAttempts,
    removeReviewAttempt
  }
})
