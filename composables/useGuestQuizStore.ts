import { ref, computed } from 'vue'

interface GuestQuizResult {
  quiz_id: number
  quiz_title: string
  quiz_slug: string
  guest_identifier: string
  score: number
  percentage: number
  correct_count: number
  incorrect_count: number
  total_questions: number
  total_marks: number
  earned_marks: number
  time_taken: number
  attempted_at: string
  results: Array<{
    question_id: number
    question_body: string
    is_correct: boolean
    marks_earned: number
    explanation?: string
    correct_answer?: string
  }>
}

const STORAGE_KEY = 'guest_quiz_results'

export const useGuestQuizStore = () => {
  const guestId = ref<string | null>(null)
  const quizResults = ref<Map<number, GuestQuizResult>>(new Map())

  /**
   * Initialize store from localStorage
   */
  const initializeStore = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          guestId.value = data.guestId
          
          // Convert array back to Map
          quizResults.value = new Map(
            (data.results || []).map((item: { quiz_id: number; result: GuestQuizResult }) => [
              item.quiz_id,
              item.result
            ])
          )
        } catch (e) {
          console.error('Failed to parse guest quiz store:', e)
        }
      }
    }
  }

  /**
   * Get or create guest identifier
   */
  const getGuestIdentifier = (): string => {
    if (!guestId.value) {
      if (process.client) {
        guestId.value = localStorage.getItem('guest_id')
      }
      
      if (!guestId.value) {
        // Generate new guest ID based on timestamp and random string
        guestId.value = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        if (process.client) {
          localStorage.setItem('guest_id', guestId.value)
        }
      }
    }
    
    return guestId.value
  }

  /**
   * Save quiz result to store
   */
  const saveQuizResult = (result: GuestQuizResult) => {
    quizResults.value.set(result.quiz_id, result)
    persistToStorage()
  }

  /**
   * Get quiz result if exists
   */
  const getQuizResult = (quizId: number): GuestQuizResult | null => {
    return quizResults.value.get(quizId) || null
  }

  /**
   * Check if quiz has been taken
   */
  const hasQuizBeenTaken = (quizId: number): boolean => {
    return quizResults.value.has(quizId)
  }

  /**
   * Get all quiz results
   */
  const getAllResults = (): GuestQuizResult[] => {
    return Array.from(quizResults.value.values())
  }

  /**
   * Get stats for all attempted quizzes
   */
  const getStats = computed(() => {
    const results = Array.from(quizResults.value.values())
    
    if (results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTimeSpent: 0,
        passedCount: 0
      }
    }

    const totalCorrect = results.reduce((sum, r) => sum + r.correct_count, 0)
    const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0)
    const totalTime = results.reduce((sum, r) => sum + r.time_taken, 0)
    const passedCount = results.filter(r => r.score >= 50).length

    return {
      totalAttempts: results.length,
      averageScore: Math.round(
        results.reduce((sum, r) => sum + r.score, 0) / results.length
      ),
      totalCorrect,
      totalQuestions,
      totalTimeSpent: totalTime,
      passedCount
    }
  })

  /**
   * Persist store to localStorage
   */
  const persistToStorage = () => {
    if (process.client) {
      const data = {
        guestId: guestId.value,
        results: Array.from(quizResults.value.entries()).map(([quizId, result]) => ({
          quiz_id: quizId,
          result
        }))
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }

  /**
   * Clear all guest quiz data
   */
  const clearAllData = () => {
    guestId.value = null
    quizResults.value.clear()
    
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('guest_id')
    }
  }

  /**
   * Clear specific quiz result
   */
  const clearQuizResult = (quizId: number) => {
    quizResults.value.delete(quizId)
    persistToStorage()
  }

  /**
   * Convert guest store data for saving to user account
   * Called when user registers or logs in
   */
  const getDataForAccountSync = (): Array<{
    quiz_id: number
    answers: Array<{ question_id: number; selected: any }>
    score: number
    total_time_seconds: number
  }> => {
    return Array.from(quizResults.value.values()).map(result => ({
      quiz_id: result.quiz_id,
      answers: result.results.map(r => ({
        question_id: r.question_id,
        selected: r.is_correct ? 'correct' : 'incorrect' // Simplified - actual answers not stored in guest mode
      })),
      score: result.score,
      total_time_seconds: result.time_taken
    }))
  }

  return {
    guestId: computed(() => guestId.value),
    quizResults: computed(() => Array.from(quizResults.value.values())),
    initializeStore,
    getGuestIdentifier,
    saveQuizResult,
    getQuizResult,
    hasQuizBeenTaken,
    getAllResults,
    getStats,
    clearAllData,
    clearQuizResult,
    persistToStorage,
    getDataForAccountSync
  }
}
