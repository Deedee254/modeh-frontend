import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAccountApi } from '~/composables/useAccountApi'
import useApi from '~/composables/useApi'

/**
 * Composable for managing profile form state and operations.
 * Handles form initialization, data preparation, and API calls for profile updates.
 */
export function useProfileForm() {
  const auth = useAuthStore()
  const alert = useAppAlert()
  const { patchMe } = useAccountApi()
  const api = useApi()

  const avatarFile = ref(null)
  const avatarPreview = ref(null)

  /**
   * Creates a clean form state object from user data.
   * Extracts profile data from nested profile objects (quizeeProfile or quizMasterProfile).
   * @param {object | null} u - The user object from the auth store.
   * @returns {object} A form state object with only backend-supported fields.
   */
  function createFormState(u) {
    // Determine the profile object based on role
    const profile = u?.role === 'quiz-master' ? u?.quizMasterProfile : u?.quizeeProfile

    const state = {
      display_name: u?.name || '',
      phone: u?.phone || '',
      institution: profile?.institution || '',
      grade_id: profile?.grade_id || profile?.grade?.id || '',
      level_id: profile?.level_id || profile?.level?.id || '',
      subjects: Array.isArray(profile?.subjects)
        ? profile.subjects.filter(Boolean)
        : [],
      bio: profile?.bio || ''
    }

    // Quizee-specific fields
    if (u?.role === 'quizee') {
      state.first_name = profile?.first_name || ''
      state.last_name = profile?.last_name || ''
    }

    // Quiz Master-specific fields
    if (u?.role === 'quiz-master') {
      state.headline = profile?.headline || ''
    }

    return state
  }

  /**
   * Handles file input and creates preview.
   */
  function onFile(e) {
    const input = e.target
    const f = input.files?.[0]
    if (!f) return

    avatarFile.value = f
    const url = URL.createObjectURL(f)
    avatarPreview.value = url
  }

  /**
   * Resets avatar preview and file.
   */
  function resetAvatar(userAvatarUrl) {
    avatarFile.value = null
    avatarPreview.value = userAvatarUrl || null
  }

  /**
   * Validates form data before submission.
   */
  function validateForm(form) {
    const errors = {}

    if (!form.display_name && !form.name) {
      errors.name = 'Display name is required'
    } else {
      const displayName = form.display_name || form.name
      if (displayName.trim().length === 0) {
        errors.name = 'Display name cannot be empty'
      }
    }

    return errors
  }

  /**
   * Saves profile data to the API (partial updates - only changed fields).
   * Handles both user data and role-specific profile data.
   */
  async function saveProfile(form, isQuizMasterOrRole) {
    try {
      // Validate form
      const errors = validateForm(form)
      if (Object.keys(errors).length > 0) {
        alert.push({
          type: 'error',
          message: Object.values(errors)[0],
          icon: 'heroicons:exclamation-circle'
        })
        return false
      }

      // Get original values to detect changes
      const originalForm = createFormState(auth.user)

      // Normalize role parameter
      let role = null
      if (typeof isQuizMasterOrRole === 'boolean') {
        role = isQuizMasterOrRole ? 'quiz-master' : 'quizee'
      } else if (typeof isQuizMasterOrRole === 'string') {
        role = isQuizMasterOrRole
      }

      // Build user data with only changed fields (FormData)
      const userData = new FormData()
      
      // Only add fields that changed
      if (form.display_name !== originalForm.display_name) {
        userData.append('name', form.display_name)
      }
      if (form.phone !== originalForm.phone) {
        userData.append('phone', form.phone || '')
      }
      if (avatarFile.value) {
        userData.append('avatar', avatarFile.value)
      }

      // Build profile data with only changed fields (JSON)
      const profileData = {}
      
      if (form.institution !== originalForm.institution) {
        profileData.institution = form.institution || null
      }
      if (form.grade_id !== originalForm.grade_id) {
        profileData.grade_id = form.grade_id || null
      }
      if (form.level_id !== originalForm.level_id) {
        profileData.level_id = form.level_id || null
      }
      
      // Check if subjects actually changed
      const originalSubjectsSet = new Set((originalForm.subjects || []).map(s => String(s)))
      const newSubjectsSet = new Set((form.subjects || []).map(s => String(s)))
      const subjectsChanged = originalSubjectsSet.size !== newSubjectsSet.size ||
                             ![...originalSubjectsSet].every(s => newSubjectsSet.has(s))
      if (subjectsChanged) {
        profileData.subjects = form.subjects || []
      }

      // Add role-specific fields only if they changed
      if (role === 'quiz-master') {
        if (form.headline !== originalForm.headline) {
          profileData.headline = form.headline || ''
        }
        if (form.bio !== originalForm.bio) {
          profileData.bio = form.bio || ''
        }
      } else if (role === 'quizee') {
        if (form.first_name !== originalForm.first_name) {
          profileData.first_name = form.first_name || ''
        }
        if (form.last_name !== originalForm.last_name) {
          profileData.last_name = form.last_name || ''
        }
        if (form.bio !== originalForm.bio) {
          profileData.bio = form.bio || ''
        }
      }

      // Only send requests if there are changes
      let userJson = auth.user
      let profileJson = null

      // Update user data if there are changes
      if (userData.entries().next().done === false || avatarFile.value) {
        // FormData has entries or avatar was uploaded
        userJson = await patchMe(userData)
        if (!userJson || !userJson.id) {
          const meRes = await api.get('/api/me')
          if (meRes.ok) {
            userJson = await meRes.json()
          }
        }
      }

      // Update profile data if there are changes (for quiz-master/quizee)
      if (Object.keys(profileData).length > 0 && (role === 'quiz-master' || role === 'quizee')) {
        const profileEndpoint = role === 'quiz-master' ? '/api/profile/quiz-master' : '/api/profile/quizee'
        const profileRes = await api.patchJson(profileEndpoint, profileData)
        if (!profileRes.ok) {
          throw new Error('Failed to update profile')
        }
        profileJson = await profileRes.json()
        // Profile endpoint now returns user object
        if (profileJson.user) {
          userJson = profileJson.user
        }
      }

      // Update auth store with merged data
      let mergedUser = { ...userJson }
      
      // Ensure profile relationships are loaded
      if (profileJson && profileJson.user) {
        if (role === 'quiz-master' && profileJson.user.quizMasterProfile) {
          mergedUser.quizMasterProfile = profileJson.user.quizMasterProfile
        } else if (role === 'quizee' && profileJson.user.quizeeProfile) {
          mergedUser.quizeeProfile = profileJson.user.quizeeProfile
        }
      }

      if (mergedUser && mergedUser.id) {
        auth.setUser(mergedUser)
        // Refresh to get computed fields like missing_profile_fields
        try {
          await auth.fetchUser()
        } catch (e) {
          console.error('Failed to refresh user after save:', e)
        }
      }

      alert.push({
        type: 'success',
        message: 'Profile updated',
        icon: 'heroicons:check'
      })

      return true
    } catch (e) {
      console.error('Save error:', e)
      alert.push({
        type: 'error',
        message: e?.message || 'Failed to save profile',
        icon: 'heroicons:x-mark'
      })
      return false
    }
  }

  return {
    avatarFile,
    avatarPreview,
    createFormState,
    onFile,
    resetAvatar,
    validateForm,
    saveProfile
  }
}

