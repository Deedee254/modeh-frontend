/**
 * Quiz Management Composable
 * Handles quiz operations with integrated Google Analytics tracking
 * 
 * Usage:
 * const { loadQuiz, submitAnswers, trackAttempt } = useQuizManager()
 */

import { ref } from 'vue'
import { useAnalytics } from './useAnalytics'
import useApi from './useApi'

export const useQuizManager = () => {
  const { trackQuizAttempt, trackQuizCompletion, trackError, trackEngagement } = useAnalytics()
  const api = useApi()

  const quiz = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const quizStartTime = ref(null)

  /**
   * Load a quiz and track the attempt
   */
  const loadQuiz = async (quizId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/quiz/${quizId}`)
      if (api.handleAuthStatus(response)) return

      const data = await api.parseResponse(response)
      if (data) {
        quiz.value = data
        quizStartTime.value = Date.now()

        // Track quiz attempt
        trackQuizAttempt(
          quiz.value.id,
          quiz.value.title,
          quiz.value.difficulty_level || 'unknown'
        )
      }
    } catch (err) {
      error.value = err.message || 'Failed to load quiz'
      trackError(
        `Failed to load quiz ${quizId}: ${error.value}`,
        'QUIZ_LOAD_ERROR'
      )
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit quiz answers and track completion
   */
  const submitAnswers = async (answers) => {
    if (!quiz.value) {
      error.value = 'No quiz loaded'
      return null
    }

    try {
      const response = await api.post(`/api/quiz/${quiz.value.id}/submit`, {
        answers
      })

      if (api.handleAuthStatus(response)) return null

      const result = await api.parseResponse(response)

      if (result) {
        // Track quiz completion with score
        trackQuizCompletion(
          quiz.value.id,
          quiz.value.title,
          result.score || 0,
          result.max_score || 100
        )

        // Track time spent on quiz
        if (quizStartTime.value) {
          const timeSpent = Date.now() - quizStartTime.value
          trackEngagement('quiz', quiz.value.id, timeSpent)
        }

        return result
      }
    } catch (err) {
      error.value = err.message || 'Failed to submit quiz'
      trackError(
        `Failed to submit quiz ${quiz.value.id}: ${error.value}`,
        'QUIZ_SUBMIT_ERROR'
      )
      throw err
    }
  }

  /**
   * Manual quiz attempt tracking (in case needed separately)
   */
  const trackAttempt = (quizId, quizTitle, difficulty = 'unknown') => {
    trackQuizAttempt(quizId, quizTitle, difficulty)
  }

  return {
    // State
    quiz,
    loading,
    error,

    // Methods
    loadQuiz,
    submitAnswers,
    trackAttempt
  }
}
