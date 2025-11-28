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
   * @returns {object} A form state object.
   */
  function createFormState(u) {
    // Determine the profile object based on role
    const profile = u?.role === 'quiz-master' ? u?.quizMasterProfile : u?.quizeeProfile

    // For Quizees, 'bio' in the API maps to the 'profile' database field
    // But we expose it as 'bio' in the API response for consistency
    let bioValue = profile?.bio || u?.bio || ''

    return {
      display_name: u?.name || '',
      name: u?.name || '', // Alias for compatibility
      email: u?.email || '',
      institution: profile?.institution || u?.institution || '',
      grade_id: profile?.grade?.id || profile?.grade_id || u?.grade?.id || (u?.grade_id ?? ''),
      level_id: profile?.level_id || u?.level_id || '',
      phone: u?.phone || '',
      subjects: Array.isArray(profile?.subjects)
        ? profile.subjects.map((s) => (s && s.id) ? s.id : s).filter(Boolean)
        : Array.isArray(u?.subjects)
          ? u.subjects.map((s) => (s && s.id) ? s.id : s).filter(Boolean)
          : [],
      headline: profile?.headline || u?.headline || '',
      bio: bioValue,
      teaching_subjects: Array.isArray(profile?.teaching_subjects)
        ? profile.teaching_subjects.join(', ')
        : profile?.teaching_subjects || u?.teaching_subjects || '',
      first_name: profile?.first_name || u?.first_name || '',
      last_name: profile?.last_name || u?.last_name || ''
    }
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
   * Saves profile data to the API.
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

      // Normalize role parameter first: the caller may pass a boolean (legacy) or a role string
      let role = null
      if (typeof isQuizMasterOrRole === 'boolean') {
        role = isQuizMasterOrRole ? 'quiz-master' : 'quizee'
      } else if (typeof isQuizMasterOrRole === 'string') {
        role = isQuizMasterOrRole
      }

      // Prepare user data (goes to /api/me)
      const userData = new FormData()
      const displayName = form.display_name || form.name
      userData.append('name', displayName)
      // Always include phone if it's defined (can be empty string to clear it)
      if (form.phone !== undefined) userData.append('phone', form.phone)
      if (avatarFile.value) {
        userData.append('avatar', avatarFile.value)
      }
      // For institution managers, also save bio and institution to user record
      if (role === 'institution-manager') {
        if (form.bio !== undefined) userData.append('bio', form.bio)
        if (form.institution !== undefined) userData.append('institution', form.institution)
      }

      // Prepare profile data (goes to role-specific endpoint)
      // Always include fields to properly update/clear them
      const profileData = {}
      if (form.institution !== undefined) profileData.institution = form.institution || null
      if (form.grade_id !== undefined) profileData.grade_id = form.grade_id || null
      if (form.level_id !== undefined) profileData.level_id = form.level_id || null
      if (Array.isArray(form.subjects)) profileData.subjects = form.subjects

      // Add role-specific fields to profile data when applicable
      if (role === 'quiz-master') {
        if (form.headline !== undefined) profileData.headline = form.headline || ''
        if (form.bio !== undefined) profileData.bio = form.bio || ''
      } else if (role === 'quizee') {
        if (form.first_name !== undefined) profileData.first_name = form.first_name || ''
        if (form.last_name !== undefined) profileData.last_name = form.last_name || ''
        if (form.bio !== undefined) profileData.bio = form.bio || ''
      }

      // Update user data first
      let userJson = await patchMe(userData)
      if (!userJson || !userJson.id) {
        const meRes = await api.get('/api/me')
        if (meRes.ok) {
          userJson = await meRes.json()
        }
      }

      // Then update profile data using role-specific endpoint if applicable.
      // For roles that don't have a separate profile endpoint (e.g. institution-manager),
      // skip this step.
      let profileJson = null
      if (role === 'quiz-master' || role === 'quizee') {
        const profileEndpoint = role === 'quiz-master' ? '/api/profile/quiz-master' : '/api/profile/quizee'
        const profileRes = await api.patchJson(profileEndpoint, profileData)
        if (!profileRes.ok) {
          throw new Error('Failed to update profile')
        }
        profileJson = await profileRes.json()
      }

      // Merge the returned data with user data for auth store
      let mergedUser = { ...userJson }
      if (profileJson && profileJson.profile) {
        if (role === 'quiz-master') {
          mergedUser.quizMasterProfile = profileJson.profile
        } else {
          mergedUser.quizeeProfile = profileJson.profile
        }
      }

      // Update auth store
      if (mergedUser && mergedUser.id) {
        auth.setUser(mergedUser)
        // Refresh server-side computed user payload to ensure
        // fields like `missing_profile_fields` and onboarding flags are up-to-date.
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

