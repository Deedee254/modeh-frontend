import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import useApi from '~/composables/useApi'

export interface LeaderboardEntry {
  id: number | string
  name: string
  avatar?: string | null
  points: number
  country?: string | null
}

/**
 * Fetch leaderboard for a specific context (subject, topic, or quiz)
 * Returns top performers to be used with the Podium component
 */
export function useContextLeaderboard() {
  const api = useApi()
  const leaderboard: Ref<LeaderboardEntry[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  /**
   * Fetch leaderboard for a subject
   */
  async function fetchSubjectLeaderboard(subjectId: string | number, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`/api/leaderboard?subject_id=${subjectId}&per_page=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await res.json()
      const raw = data?.data || data?.users || []
      
      leaderboard.value = (Array.isArray(raw) ? raw : [])
        .map((u: any) => ({
          id: u?.id ?? u?.user_id,
          name: u?.name || u?.display_name || u?.username || 'Unknown',
          avatar: u?.avatar || u?.avatar_url || u?.image || null,
          points: u?.points ?? u?.score ?? 0,
          country: u?.country || null,
        }))
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => (b.points || 0) - (a.points || 0))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leaderboard'
      leaderboard.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch leaderboard for a topic
   */
  async function fetchTopicLeaderboard(topicId: string | number, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`/api/leaderboard?topic_id=${topicId}&per_page=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await res.json()
      const raw = data?.data || data?.users || []
      
      leaderboard.value = (Array.isArray(raw) ? raw : [])
        .map((u: any) => ({
          id: u?.id ?? u?.user_id,
          name: u?.name || u?.display_name || u?.username || 'Unknown',
          avatar: u?.avatar || u?.avatar_url || u?.image || null,
          points: u?.points ?? u?.score ?? 0,
          country: u?.country || null,
        }))
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => (b.points || 0) - (a.points || 0))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leaderboard'
      leaderboard.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch leaderboard for a quiz
   */
  async function fetchQuizLeaderboard(quizId: string | number, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`/api/leaderboard?quiz_id=${quizId}&per_page=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await res.json()
      const raw = data?.data || data?.users || []
      
      leaderboard.value = (Array.isArray(raw) ? raw : [])
        .map((u: any) => ({
          id: u?.id ?? u?.user_id,
          name: u?.name || u?.display_name || u?.username || 'Unknown',
          avatar: u?.avatar || u?.avatar_url || u?.image || null,
          points: u?.points ?? u?.score ?? 0,
          country: u?.country || null,
        }))
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => (b.points || 0) - (a.points || 0))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leaderboard'
      leaderboard.value = []
    } finally {
      loading.value = false
    }
  }

  // Computed for top 3 entries (for Podium component)
  const topThree = computed(() => (leaderboard.value || []).slice(0, 3))

  return {
    leaderboard,
    loading,
    error,
    topThree,
    fetchSubjectLeaderboard,
    fetchTopicLeaderboard,
    fetchQuizLeaderboard,
  }
}
