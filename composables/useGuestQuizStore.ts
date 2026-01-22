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
  // In-progress partial attempts (map of quizId -> partial data)
  const inProgress = ref<Map<number, any>>(new Map())

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

          // Load any in-progress partials
          if (data.inProgress) {
            inProgress.value = new Map(Object.entries(data.inProgress).map(([k, v]) => [Number(k), v]))
          }
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
        })),
        inProgress: Object.fromEntries(Array.from(inProgress.value.entries()).map(([k, v]) => [String(k), v]))
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }

  /**
   * Save a per-question verdict into an in-progress attempt for a quiz.
   * verdict: { questionId, selectedOptionId, isCorrect, explanation }
   */
  const saveQuestionVerdict = (quizId: number, verdict: { questionId: number; selectedOptionId: any; isCorrect: boolean; explanation?: string }) => {
    const existing = inProgress.value.get(quizId) || { answers: {} }
    existing.answers = existing.answers || {}
    existing.answers[verdict.questionId] = {
      selectedOptionId: verdict.selectedOptionId,
      isCorrect: verdict.isCorrect,
      explanation: verdict.explanation ?? null,
      updated_at: new Date().toISOString()
    }
    inProgress.value.set(quizId, existing)
    persistToStorage()
  }

  const getPartialResult = (quizId: number) => {
    return inProgress.value.get(quizId) || null
  }

  const clearPartialResult = (quizId: number) => {
    inProgress.value.delete(quizId)
    persistToStorage()
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
   * Check if guest has reached the quiz attempt limit
   * Guests can attempt up to 1 quiz before needing to register
   */
  const hasReachedQuizLimit = (): boolean => {
    return quizResults.value.size >= 1
  }

  /**
   * Convert guest store data for saving to user account
   * Called when user registers or logs in
   */
  const getDataForAccountSync = (): Array<{
    quiz_id: number,
    answers: Array<{ question_id: number; selected: any }>,
    score: number,
    total_time_seconds: number,
    partial?: boolean
  }> => {
    const out: Array<any> = []

    // Completed attempts
    Array.from(quizResults.value.values()).forEach(result => {
      const answers = (result.results || []).map(r => ({
        question_id: r.question_id,
        // prefer explicit selected option id/text if available on saved result
        selected: (r as any).selected_option_id ?? (r as any).selected_option_text ?? (r.is_correct ? 'correct' : 'incorrect')
      }))

      out.push({
        quiz_id: result.quiz_id,
        answers,
        score: result.score,
        total_time_seconds: result.time_taken,
        partial: false
      })
    })

    // In-progress partial attempts (merge if a full result isn't present)
    Array.from(inProgress.value.entries()).forEach(([quizId, partial]) => {
      // skip if already have a completed result for this quiz
      const hasCompleted = Array.from(quizResults.value.values()).some(r => r.quiz_id === quizId)
      if (hasCompleted) return

      const answersArr: Array<{ question_id: number; selected: any }> = []
      if (partial && partial.answers) {
        Object.entries(partial.answers).forEach(([qIdStr, v]) => {
          const qid = Number(qIdStr)
          answersArr.push({ question_id: qid, selected: (v as any).selectedOptionId ?? (v as any).selected ?? null })
        })
      }

      out.push({
        quiz_id: quizId,
        answers: answersArr,
        score: 0,
        total_time_seconds: 0,
        partial: true
      })
    })

    return out
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
    hasReachedQuizLimit,
    // in-progress APIs
    saveQuestionVerdict,
    getPartialResult,
    clearPartialResult,
    persistToStorage,
    getDataForAccountSync
  }
}
