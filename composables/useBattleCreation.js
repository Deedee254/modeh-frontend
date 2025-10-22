import { ref, computed, watch } from 'vue'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

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
  const level = ref('')
  const subject = ref('')
  const topic = ref('')
  const difficulty = ref('')
  const totalQuestions = ref(10)
  const starting = ref(false)

  // --- Persistence ---
  // load/save key prefix so multiple pages won't collide
  const STORAGE_KEY = `modeh:battle:${battleType}:draft`

  // attempt to load existing draft from localStorage
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed) {
        if (parsed.level) level.value = parsed.level
        if (parsed.grade) grade.value = parsed.grade
        if (parsed.subject) subject.value = parsed.subject
        if (parsed.topic) topic.value = parsed.topic
        if (parsed.difficulty) difficulty.value = parsed.difficulty
        if (parsed.totalQuestions) totalQuestions.value = parsed.totalQuestions
        // restore optional fields when provided
        if (battleName && parsed.battleName) battleName.value = parsed.battleName
        if (maxPlayers && parsed.maxPlayers) maxPlayers.value = parsed.maxPlayers
      }
    }
  } catch (e) {
    // ignore storage errors
  }

  // helper to persist draft
  function persistDraft() {
    try {
      const payload = {
        level: level.value,
        grade: grade.value,
        subject: subject.value,
        topic: topic.value,
        difficulty: difficulty.value,
        totalQuestions: totalQuestions.value,
        ...(battleName && { battleName: battleName.value }),
        ...(maxPlayers && { maxPlayers: maxPlayers.value })
      }
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      // ignore
    }
  }

  // watch fields and persist
  watch([level, grade, subject, topic, difficulty, totalQuestions], () => { persistDraft() })
  if (battleName) watch(battleName, () => { persistDraft() })
  if (maxPlayers) watch(maxPlayers, () => { persistDraft() })

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
  // Use centralized taxonomy composable for grades/subjects/topics
  const {
    grades: taxGrades,
    subjects: taxSubjects,
    topics: taxTopics,
    levels: taxLevels,
    loadingGrades,
    loadingSubjects,
    loadingTopics,
    loadingLevels,
    fetchGrades: fetchTaxGrades,
    fetchLevels,
    fetchSubjectsByGrade,
    fetchTopicsBySubject
  } = useTaxonomy()

  // Helper to map raw taxonomy items to { label, value } option shape
  function mapToOptions(list) {
    if (!Array.isArray(list)) return []
    return list.map(item => {
      if (item && typeof item === 'object') {
        // If already in option shape
        if ('label' in item && 'value' in item) return item
        // Common API shape
        const label = item.name ?? item.title ?? item.label ?? ''
        const value = item.id ?? item.value ?? ''
        return { label, value }
      }
      return { label: String(item), value: item }
    })
  }

  // Watch taxonomy sources and update local option refs
  // If a level is selected, show only its grades; otherwise show global grades
  watch([taxGrades, taxLevels, level], () => {
    try {
      if (level.value) {
        // find the level in taxLevels
        const lv = (taxLevels.value || []).find(it => String(it.id) === String(level.value))
        if (lv && Array.isArray(lv.grades)) {
          grades.value = mapToOptions(lv.grades)
          return
        }
      }
      // fallback to global grades
      grades.value = mapToOptions(taxGrades.value)
    } catch (e) {
      grades.value = mapToOptions(taxGrades.value)
    }
  }, { immediate: true })
  watch(taxSubjects, (s) => { subjects.value = mapToOptions(s) }, { immediate: true })
  watch(taxTopics, (t) => { topics.value = mapToOptions(t) }, { immediate: true })

  // When grade changes, reset dependent fields and fetch subjects
  watch(grade, async (g) => {
    subject.value = ''
    topic.value = ''
    subjects.value = [] // Clear options immediately
    topics.value = [] // Clear options immediately
    if (!g) return
    await fetchSubjectsByGrade(g)
    // After fetching, if no subjects are found, ensure the list is empty.
    if (!taxSubjects.value || taxSubjects.value.length === 0) subjects.value = []
  })

  // When level changes, reset dependent fields and refresh grade list
  watch(level, async (lv) => {
    // reset downstream selections
    grade.value = ''
    subject.value = ''
    topic.value = ''
    subjects.value = []
    topics.value = []
    // ensure we have levels loaded so the watch above can populate grades
    if (!taxLevels.value || taxLevels.value.length === 0) await fetchLevels()
  })

  // When subject changes, reset topic and fetch topics
  watch(subject, async (s) => {
    topic.value = ''
    topics.value = []
    if (!s) return
    await fetchTopicsBySubject(s)
  })

  // --- Battle Creation ---
  /**
   * Create a battle. Optionally provide totalTimeSeconds to indicate a total battle time that
   * should be split across questions; when provided it will be sent as settings.time_total_seconds
   * so the backend computes and persists time_per_question.
   */
  async function createBattle({ totalTimeSeconds = null } = {}) {
    if (!canStart.value) return { error: 'Please fill all required fields.' }
    starting.value = true
    try {
      const settings = {
        // send canonical keys expected by API: grade_id, subject_id, topic_id, difficulty, question_count
        level_id: level.value || undefined,
        grade_id: grade.value,
        subject_id: subject.value,
        topic_id: topic.value,
        difficulty: difficulty.value,
        question_count: totalQuestions.value,
        random: 1,
        ...(battleType === 'group' && { max_players: maxPlayers.value })
      }
      if (totalTimeSeconds) settings.time_total_seconds = totalTimeSeconds

      const payload = {
        name: battleType === 'group' ? battleName.value : `Battle - ${new Date().toISOString()}`,
        type: battleType,
        attach_questions: true,
        settings
      }

      const res = await api.postJson('/api/battles', payload)
      if (!res.ok) {
        const txt = await res.text()
        throw new Error('Failed to create battle: ' + txt)
      }
      const data = await res.json().catch(() => null)
      // only clear the draft after the server returns a battle object
      try {
        if (data && data.battle && typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (e) {}
      return { battle: data?.battle ?? data }
    } catch (e) {
      return { error: e.message || 'Failed to create battle' }
    } finally {
      starting.value = false
    }
  }

  // --- Initialize ---
  // initialize grades from taxonomy composable
  fetchTaxGrades()

  return { level, grade, subject, topic, difficulty, totalQuestions, grades, subjects, topics, levels: taxLevels, loadingLevels, difficulties, questionCountOptions, starting, canStart, createBattle }
}