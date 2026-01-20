import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import useApi from './useApi'

interface QuizeeProfile {
  id: number
  name: string
  email: string
  avatar_url?: string
  avatar?: string
  bio?: string
  institution?: string
  grade?: {
    id: number
    name: string
  }
  subjects?: Array<{
    id: number
    name: string
  }>
  points?: number
  current_streak?: number
  longest_streak?: number
  quizzes_taken?: number
}

export function useQuizeeProfile(quizeeName: string | Ref<string>) {
  const api = useApi()
  const profile = ref<QuizeeProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize the name input
  const normalizedName = computed(() => {
    const name = typeof quizeeName === 'string' ? quizeeName : quizeeName.value
    return decodeURIComponent(name).toLowerCase()
  })

  /**
   * Fetch quizee profile from followers list
   * The backend returns minimal user data from the followers endpoint
   */
  async function fetchQuizeeProfile() {
    try {
      loading.value = true
      error.value = null

      // Fetch the followers list from the authenticated endpoint
      const res = await api.get('/api/quiz-master/followers')

      if (api.handleAuthStatus(res)) {
        error.value = 'Authentication required'
        return false
      }

      if (!res.ok) {
        throw new Error('Failed to fetch follower data')
      }

      const json = await res.json()

      // Merge followers and likers into a single list
      const allFollowers = [
        ...(Array.isArray(json.followers) ? json.followers : []),
        ...(Array.isArray(json.likers) ? json.likers : [])
      ]

      // Find the quizee by name (case-insensitive)
      const foundQuizee = allFollowers.find(
        u => u && u.name && u.name.toLowerCase() === normalizedName.value
      )

      if (!foundQuizee) {
        throw new Error('Quizee not found in your followers or likers list')
      }

      profile.value = foundQuizee

      // Attempt to fetch additional profile details
      if (foundQuizee.id) {
        try {
          const profileRes = await api.get(`/api/users/${foundQuizee.id}`)
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            if (profileData) {
              // Merge detailed profile data from unified 'profile' field
              const enrichedProfile: QuizeeProfile = {
                id: foundQuizee.id,
                name: foundQuizee.name,
                email: foundQuizee.email,
                avatar_url: foundQuizee.avatar_url || foundQuizee.avatar,
                avatar: foundQuizee.avatar,
                bio: profileData.profile?.bio || profileData.bio,
                grade: profileData.profile?.grade,
                subjects: profileData.profile?.subject_models || [],
                institution: profileData.profile?.institution,
                points: profileData.profile?.points,
                current_streak: profileData.profile?.current_streak,
                longest_streak: profileData.profile?.longest_streak,
                quizzes_taken: profileData.profile?.quizzes_taken
              }
              profile.value = enrichedProfile
            }
          }
        } catch (enrichError) {
          console.warn('Could not fetch detailed profile, using basic info', enrichError)
          // Continue with the basic profile we have
        }
      }

      return true
    } catch (err: any) {
      console.error('Failed to load quizee profile', err)
      error.value = err?.message || 'Failed to load profile. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get computed stats from the profile
   */
  const stats = computed(() => ({
    points: profile.value?.points || 0,
    streak: profile.value?.current_streak || 0,
    longestStreak: profile.value?.longest_streak || 0,
    quizzesAttempted: profile.value?.quizzes_taken || 0
  }))

  /**
   * Get computed profile display name
   */
  const displayName = computed(() => profile.value?.name || 'Quizee')

  /**
   * Check if profile has been loaded
   */
  const isLoaded = computed(() => profile.value !== null)

  return {
    profile,
    loading,
    error,
    stats,
    displayName,
    isLoaded,
    fetchQuizeeProfile
  }
}
