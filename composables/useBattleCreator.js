import { ref, computed, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import useApi from '~/composables/useApi'

/**
 * Composable for managing battle creation logic.
 * @param {object} options - Configuration options.
 * @param {Ref<Array>} options.gradesOptions - Pre-loaded grade options.
 * @param {Ref<string|number>} options.initialGrade - The initial grade value.
 * @returns {object} The state and methods for creating a battle.
 */
export function useBattleCreator(options = {}) {
  const { gradesOptions, initialGrade } = options

  const cfg = useRuntimeConfig()
  const api = useApi()

  // --- Reactive State ---
  const grade = ref(initialGrade || '')
  const subject = ref('')
  const topic = ref('')
  const difficulty = ref('')
  const totalQuestions = ref(5)
  const starting = ref(false)

  // --- Select Options ---
  const grades = ref([])
  const subjects = ref([])
  const topics = ref([])

  const difficulties = [
    { label: 'Any', value: '' },
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' }
  ]

  const questionCountOptions = [
    { label: '5 questions', value: 5 },
    { label: '10 questions', value: 10 },
    { label: '15 questions', value: 15 },
    { label: '20 questions', value: 20 }
  ]

  // --- Computed Properties ---
  const canStart = computed(() => {
    return !!grade.value && !!subject.value && !!topic.value && !!totalQuestions.value
  })

  // --- Data Fetching ---
  async function fetchGrades() {
    if (Array.isArray(gradesOptions?.value) && gradesOptions.value.length) {
      grades.value = gradesOptions.value
      return
    }
    try {
      const res = await api.get('/api/grades')
      if (res.ok) {
        const j = await res.json()
        grades.value = j.grades || []
      }
    } catch (e) {
      console.error('Failed to fetch grades', e)
    }
  }

  watch(grade, async (newGrade) => {
    subject.value = ''
    topic.value = ''
    subjects.value = [] // clear immediately
    topics.value = [] // clear immediately
    if (!newGrade) return

    try {
      const res = await api.get(`/api/subjects?grade_id=${newGrade}`)
      if (res.ok) {
        const j = await res.json()
        subjects.value = (j.subjects?.data || j.subjects || []).map(s => ({ label: s.name, value: s.id }))
      }
    } catch (e) {
      console.error('Failed to fetch subjects', e)
    }
  })

  watch(subject, async (newSubject) => {
    topic.value = ''
    topics.value = []
    if (!newSubject || !grade.value) return

    try {
      const res = await api.get(`/api/topics?subject_id=${newSubject}`)
      if (res.ok) {
        const j = await res.json()
        topics.value = (j.topics?.data || j.topics || []).map(t => ({ label: t.name, value: t.id }))
      }
    } catch (e) {
      console.error('Failed to fetch topics', e)
    }
  })

  // --- Battle Creation ---
  async function createBattle() {
    starting.value = true
    try {
      const payload = {
        name: `Battle - ${grade.value}/${subject.value}/${topic.value}`,
        attach_questions: 1,
        settings: {
          grade: grade.value,
          subject: subject.value,
          topic: topic.value,
          difficulty: difficulty.value,
          per_page: totalQuestions.value,
          random: 1
        }
      }
      const api = (await import('~/composables/useApi')).default()
      const res = await api.postJson('/api/battles', payload)
      if (api.handleAuthStatus(res)) return { error: 'auth' }
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error('Failed to create battle: ' + txt)
      }
      return { battle: await res.json() }
    } catch (e) {
      return { error: e.message || 'Failed to fetch questions' }
    } finally {
      starting.value = false
    }
  }

  // --- Initialize ---
  fetchGrades()

  return { grade, subject, topic, difficulty, totalQuestions, grades, subjects, topics, difficulties, questionCountOptions, starting, canStart, createBattle }
}
