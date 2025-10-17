import { ref, computed, watch } from 'vue'
import useApi from '~/composables/useApi'

/**
 * Composable for managing the logic of creating a quiz battle.
 *
 * @param {object} options - Configuration for the composable.
 * @param {Ref<string>} options.battleName - A ref containing the name for a group battle.
 * @param {Ref<number>} options.maxPlayers - A ref containing the maximum number of players for a group battle.
 * @param {string} options.battleType - The type of battle ('1v1' or 'group').
 */
export function useBattleCreation(options = { battleType: '1v1' }) {
  const { battleName, battleType, maxPlayers } = options

  const api = useApi()

  // --- Reactive State ---
  const grade = ref('')
  const subject = ref('')
  const topic = ref('')
  const difficulty = ref('')
  const totalQuestions = ref(10)
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
    const baseCriteria = !!grade.value && !!subject.value && !!topic.value && !!totalQuestions.value
    if (battleType === 'group') {
      return baseCriteria && !!battleName?.value && !!maxPlayers?.value
    }
    return baseCriteria
  })

  // --- Data Fetching ---
  async function fetchGrades() {
    try {
      const res = await api.get('/api/grades')
      if (res.ok) {
        const j = await res.json()
        grades.value = j.grades || []
      }
    } catch (e) {
      console.error('Failed to fetch grades:', e)
    }
  }

  watch(grade, async (g) => {
    subject.value = ''
    topic.value = ''
    subjects.value = []
    topics.value = []
    if (!g) return
    try {
      const res = await api.get(`/api/subjects?grade_id=${g}`)
      if (res.ok) {
        const j = await res.json()
        subjects.value = (j.subjects?.data || j.subjects || []).map(s => ({ label: s.name, value: s.id }))
      }
    } catch (e) {
      console.error('Failed to fetch subjects:', e)
    }
  })

  watch(subject, async (s) => {
    topic.value = ''
    topics.value = []
    if (!s || !grade.value) return
    try {
      const res = await api.get(`/api/topics?subject_id=${s}`)
      if (res.ok) {
        const j = await res.json()
        topics.value = (j.topics?.data || j.topics || []).map(t => ({ label: t.name, value: t.id }))
      }
    } catch (e) {
      console.error('Failed to fetch topics:', e)
    }
  })

  // --- Battle Creation ---
  async function createBattle() {
    if (!canStart.value) return { error: 'Please fill all required fields.' }
    starting.value = true
    try {
      const payload = {
        name: battleType === 'group' ? battleName.value : `Battle - ${new Date().toISOString()}`,
        type: battleType,
        attach_questions: 1,
        settings: {
          grade: grade.value,
          subject: subject.value,
          topic: topic.value,
          difficulty: difficulty.value,
          per_page: totalQuestions.value,
          random: 1,
          ...(battleType === 'group' && { max_players: maxPlayers.value })
        }
      }

      const res = await api.postJson('/api/battles', payload)
      if (!res.ok) {
        const txt = await res.text()
        throw new Error('Failed to create battle: ' + txt)
      }
      return { battle: await res.json() }
    } catch (e) {
      return { error: e.message || 'Failed to create battle' }
    } finally {
      starting.value = false
    }
  }

  // --- Initialize ---
  fetchGrades()

  return { grade, subject, topic, difficulty, totalQuestions, grades, subjects, topics, difficulties, questionCountOptions, starting, canStart, createBattle }
}