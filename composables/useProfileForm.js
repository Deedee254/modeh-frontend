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
   * Extract institution name from either a string or object
   */
  function extractInstitutionName(inst) {
    if (!inst) return ''
    if (typeof inst === 'string') return inst
    if (typeof inst === 'object' && inst.name) return String(inst.name)
    return ''
  }

  /**
   * Extract institution ID from either a number, string, or object
   */
  function extractInstitutionId(inst) {
    if (!inst) return ''
    if (typeof inst === 'number') return inst
    if (typeof inst === 'string' && !isNaN(inst)) return inst
    if (typeof inst === 'object' && inst.id) return inst.id
    return ''
  }

  /**
   * Creates a clean form state object from user data.
   * Extracts profile data from nested profile objects (quizeeProfile or quizMasterProfile).
   * Also populates taxonomy refs with profile data so pickers can preselect values.
   * @param {object | null} u - The user object from the auth store.
   * @returns {object} A form state object with only backend-supported fields.
   */
  function createFormState(u) {
    // Determine the profile object based on role (quiz-master / quizee)
    // Handle both 'quiz-master' (with hyphen) and other variations
    const isQuizMaster = u?.role === 'quiz-master' || u?.role === 'quizMaster'
    const profile = isQuizMaster ? u?.quizMasterProfile : u?.quizeeProfile

    // Default institution values (handle institution-manager who stores institutions on user)
    let instName = ''
    let instId = ''
    if (u?.role === 'institution-manager') {
      if (u?.institutions && Array.isArray(u.institutions) && u.institutions.length > 0) {
        const first = u.institutions[0]
        instName = first?.name || ''
        instId = first?.id || first?.slug || ''
      } else {
        instName = u?.institution || ''
        instId = ''
      }
    }

    const state = {
      display_name: u?.name || '',
      phone: u?.phone || '',
      institution: (u?.role === 'institution-manager') ? instName : (extractInstitutionName(profile?.institution) || ''),
      institution_id: (u?.role === 'institution-manager') ? instId : (extractInstitutionId(profile?.institution) || ''),
      grade_id: profile?.grade_id || profile?.grade?.id || '',
      level_id: profile?.level_id || profile?.level?.id || '',
      subjects: Array.isArray(profile?.subjects)
        ? profile.subjects.filter(Boolean)
        : [],
      // prefer profile.bio if available, otherwise fall back to top-level user bio
      bio: (u?.role === 'institution-manager') ? (u?.bio || '') : (profile?.bio || u?.bio || '')
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

    // CRITICAL FIX: Add profile taxonomy objects to composable refs
    // so pickers can preselect them. This ensures level, grade, and subjects
    // from the loaded profile are available in the dropdowns.
    try {
      if (profile?.level && profile.level.id) {
        if (!taxLevels.value.find(l => String(l.id) === String(profile.level.id))) {
          taxLevels.value = [...taxLevels.value, profile.level]
        }
      }
      if (profile?.grade && profile.grade.id) {
        if (!taxGrades.value.find(g => String(g.id) === String(profile.grade.id))) {
          taxGrades.value = [...taxGrades.value, profile.grade]
        }
      }
      if (profile?.subjects && Array.isArray(profile.subjects)) {
        for (const subject of profile.subjects) {
          if (subject && subject.id) {
            addSubject(subject)
          }
        }
      }
    } catch (e) {
      // ignore errors adding to taxonomy refs
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
      if (avatarFile.value) {
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
      const originalSubjectsSet = new Set((originalForm.subjects || []).map(s => String(s)))
      const newSubjectsSet = new Set((form.subjects || []).map(s => String(s)))
      const subjectsChanged = originalSubjectsSet.size !== newSubjectsSet.size ||
        ![...originalSubjectsSet].every(s => newSubjectsSet.has(s))
      if (subjectsChanged) {
        profileData.subjects = form.subjects || []
      }

      // Add role-specific fields only if they changed
      if (role === 'quiz-master') {
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
            userJson = await meRes.json()
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

