import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAccountApi } from '~/composables/useAccountApi'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

/**
 * Composable for managing profile form state and operations.
 * Handles form initialization, data preparation, and API calls for profile updates.
 */
export function useProfileForm() {
  const auth = useAuthStore()
  const alert = useAppAlert()
  const { patchMe } = useAccountApi()
  const api = useApi()
  const { grades: taxGrades, levels: taxLevels, subjects: taxSubjects, addSubject } = useTaxonomy()

  const avatarFile = ref(null)
  const avatarPreview = ref(null)

  /**
   * Creates a minimal form state object - just copying values from user/profile
   * No transformations needed, API already provides everything in correct format
   */
  function createFormState(u) {
    if (!u) {
      return {
        display_name: '',
        phone: '',
        bio: '',
        first_name: '',
        last_name: '',
        headline: '',
        institution: '',
        institution_id: '',
        grade_id: '',
        level_id: '',
        subjects: []
      }
    }

    const profile = u?.profile
    const state = {
      display_name: u.name || '',
      phone: u.phone || '',
      bio: profile?.bio || u.bio || '',
      institution: profile?.institution || '',
      institution_id: profile?.institution_id || '',
      grade_id: profile?.grade_id || '',
      level_id: profile?.level_id || '',
      subjects: profile?.subjects || []
    }

    // Add role-specific fields
    if (u.role === 'quizee') {
      state.first_name = profile?.first_name || ''
      state.last_name = profile?.last_name || ''
    } else if (u.role === 'quiz-master') {
        state.first_name = profile?.first_name || ''
        state.last_name = profile?.last_name || ''
    }
  }

  /**
   * Populate taxonomy store refs from API data
   * API provides grade_id, level_id, subjects (array of IDs)
   * We load the full objects into the store for resolution
   */
  function updateTaxonomyRefs(u) {
    if (!u?.profile) return

    const profile = u.profile
    
    // Ensure level and grade are in the store for resolution
    // (Taxonomy will be loaded globally on app init)
    // No need to add objects - the store already has all levels/grades from global fetch
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
  async function saveProfile(form, isQuizMasterOrRole, originalForm) {
    // If caller didn't supply an originalForm for change-detection,
    // build it from the current auth user so comparisons are safe.
    if (!originalForm) {
      try {
        originalForm = createFormState(auth.user)
      } catch (e) {
        originalForm = {}
      }
    }
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

      // Normalize role parameter
      let role = null
      if (typeof isQuizMasterOrRole === 'boolean') {
        role = isQuizMasterOrRole ? 'quiz-master' : 'quizee'
      } else if (typeof isQuizMasterOrRole === 'string') {
        role = isQuizMasterOrRole
      }

      // Helper to safely compare values (handles null, undefined, empty strings)
      const hasChanged = (newVal, oldVal) => {
        // Handle null/undefined/empty string equivalence
        const newEmpty = newVal === null || newVal === undefined || newVal === ''
        const oldEmpty = oldVal === null || oldVal === undefined || oldVal === ''

        // Both empty = no change
        if (newEmpty && oldEmpty) return false

        // One empty, one not = changed
        if (newEmpty !== oldEmpty) return true

        // Handle numeric IDs - compare as strings
        if (typeof newVal === 'number' || typeof oldVal === 'number') {
          return String(newVal) !== String(oldVal)
        }

        // Default comparison
        return newVal !== oldVal
      }

      // Build user data with only changed fields (FormData)
      const userData = new FormData()

      // Only add fields that changed
      if (hasChanged(form.display_name, originalForm.display_name)) {
        userData.append('name', form.display_name)
      }
      if (hasChanged(form.phone, originalForm.phone)) {
        userData.append('phone', form.phone || '')
      }
      // CRITICAL: Only append avatar if file was actually changed (user selected a new file)
      // Do NOT append avatar if it's just the old preview URL
      if (avatarFile.value && avatarFile.value instanceof File) {
        userData.append('avatar', avatarFile.value)
      }

      // Build profile data with only changed fields (JSON)
      const profileData = {}


      if (hasChanged(form.institution, originalForm.institution)) {
        profileData.institution = form.institution || null
      }
      if (hasChanged(form.institution_id, originalForm.institution_id)) {
        profileData.institution_id = form.institution_id || null
      }
      if (hasChanged(form.grade_id, originalForm.grade_id)) {
        profileData.grade_id = form.grade_id || null
      }
      if (hasChanged(form.level_id, originalForm.level_id)) {
        profileData.level_id = form.level_id || null
      }

      // Check if subjects actually changed
      const originalSubjectsSet = new Set((originalForm.subjects || []).map(s => String(s?.id || s)))
      const newSubjectsSet = new Set((form.subjects || []).map(s => String(s?.id || s)))
      const subjectsChanged = originalSubjectsSet.size !== newSubjectsSet.size ||
        ![...originalSubjectsSet].every(s => newSubjectsSet.has(s))
      if (subjectsChanged) {
        // Extract IDs from subject objects or use as-is if already IDs
        profileData.subjects = (form.subjects || []).map(s => s?.id || s).filter(Boolean)
      }

      // Add role-specific fields only if they changed
      if (role === 'quiz-master') {
        if (hasChanged(form.first_name, originalForm.first_name)) {
          profileData.first_name = form.first_name || ''
        }
        if (hasChanged(form.last_name, originalForm.last_name)) {
          profileData.last_name = form.last_name || ''
        }
        if (hasChanged(form.headline, originalForm.headline)) {
          profileData.headline = form.headline || ''
        }
        if (hasChanged(form.bio, originalForm.bio)) {
          profileData.bio = form.bio || ''
        }
      } else if (role === 'quizee') {
        if (hasChanged(form.first_name, originalForm.first_name)) {
          profileData.first_name = form.first_name || ''
        }
        if (hasChanged(form.last_name, originalForm.last_name)) {
          profileData.last_name = form.last_name || ''
        }
        if (hasChanged(form.bio, originalForm.bio)) {
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
            try {
              // Clone response to avoid stream already read error
              const clonedRes = meRes.clone()
              userJson = await clonedRes.json()
            } catch (parseErr) {
              console.error('Failed to parse /api/me response:', parseErr)
            }
          }
        }
      }

      // Update profile data if there are changes (for quiz-master/quizee)
      // If the user is an institution-manager, the profile-like fields (institution, institution_id, bio)
      // are stored on the user model. Append them to the FormData so patchMe('/api/me') will persist them.
      if (role === 'institution-manager' && Object.keys(profileData).length > 0) {
        Object.entries(profileData).forEach(([k, v]) => {
          // normalize null -> empty string for FormData
          userData.append(k, v === null || typeof v === 'undefined' ? '' : v)
        })
      }

      if (Object.keys(profileData).length > 0 && (role === 'quiz-master' || role === 'quizee')) {
        const profileEndpoint = role === 'quiz-master' ? '/api/profile/quiz-master' : '/api/profile/quizee'
        const profileRes = await api.patchJson(profileEndpoint, profileData)
        if (!profileRes.ok) {
          // Get detailed error from response
          let errorMessage = 'Failed to update profile'
          let fieldErrors = null
          try {
            // Clone response to avoid stream already read error
            const clonedRes = profileRes.clone()
            const errorData = await clonedRes.json()
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
            fieldErrors = errorData.errors || null
          } catch (e) {
            errorMessage = `Failed to update profile (${profileRes.status})`
          }
          console.error('Profile update failed:', { status: profileRes.status, message: errorMessage, fieldErrors, profileData })
          throw new Error(errorMessage)
        }
        
        try {
          // Clone response to avoid stream already read error
          const clonedRes = profileRes.clone()
          profileJson = await clonedRes.json()
          // Profile endpoint now returns user object
          if (profileJson.user) {
            userJson = profileJson.user
          }
        } catch (parseErr) {
          console.error('Failed to parse profile response:', parseErr)
          throw new Error('Failed to parse profile update response')
        }
      }

      // Update auth store with merged data
      let mergedUser = { ...userJson }

      // Ensure profile relationships are loaded. Normalize to `profile` when possible.
      if (profileJson && profileJson.user) {
        // Prefer canonical `profile` key returned by API resources.
        if (profileJson.user.profile) {
          mergedUser.profile = profileJson.user.profile
        } else if (role === 'quiz-master' && profileJson.user.quizMasterProfile) {
          mergedUser.profile = profileJson.user.quizMasterProfile
        } else if (role === 'quizee' && profileJson.user.quizeeProfile) {
          mergedUser.profile = profileJson.user.quizeeProfile
        }
      }

      if (mergedUser && mergedUser.id) {
        auth.setUser(mergedUser)
        // CRITICAL: Refresh session first to ensure nuxt-auth cache is updated
        // Then fetch fresh user data from API
        // Wait for backend cache to clear and session to fully update before fetching
        await new Promise(resolve => setTimeout(resolve, 300))
        try {
          const { getSession } = useAuth()
          await getSession()
        } catch (e) {
          // Session refresh may fail but continue
        }
        
        try {
          await auth.fetchUser()
        } catch (e) {
          console.error('Failed to refresh user after save:', e)
        }
      }

      // CRITICAL: Reset avatar file state after successful save to prevent re-uploading
      if (avatarFile.value) {
        avatarFile.value = null
      }

      alert.push({
        type: 'success',
        message: 'Profile updated',
        icon: 'heroicons:check'
      })

      return true
    } catch (e) {
      console.error('Save error:', e)
      // CRITICAL: Reset avatar file on error too, so user can retry
      if (avatarFile.value) {
        avatarFile.value = null
      }
      // Also reset preview on error to prevent stale UI state
      if (avatarPreview.value && !auth.user?.avatar_url) {
        avatarPreview.value = null
      }
      
      // Build user-friendly error message
      let errorMsg = e?.message || 'Failed to save profile'
      
      // If the error contains field validation info, append it
      if (e?.fieldErrors && typeof e.fieldErrors === 'object') {
        const fieldMsgs = Object.entries(e.fieldErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ')
        if (fieldMsgs) {
          errorMsg = `${errorMsg} - ${fieldMsgs}`
        }
      }
      
      alert.push({
        type: 'error',
        message: errorMsg,
        icon: 'heroicons:x-mark'
      })
      return false
    }
  }

  return {
    avatarFile,
    avatarPreview,
    createFormState,
    updateTaxonomyRefs,
    onFile,
    resetAvatar,
    validateForm,
    saveProfile
  }
}

