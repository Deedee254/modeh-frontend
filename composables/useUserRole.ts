import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable to get user roles and simple booleans for checking roles.
 *
 * @returns {object}
 * - `roles`: `ref<string[]>` - reactive list of user roles
 * - `isQuizMaster`: `ref<boolean>` - true if user has `quiz-master` role
 * - `isQuizee`: `ref<boolean>` - true if user has `quizee` role
 * - `isInstitutionManager`: `ref<boolean>` - true if user has `institution-manager` role
 * - `preferredRole`: `ref<string>` - either `quiz-master`, `quizee`, or `institution-manager` based on roles
 */
export function useUserRole() {
  const auth = useAuthStore()
  // Defensive typing: `auth.user` may be untyped in the store. Coerce to `any`
  // and defensively extract roles to avoid TypeScript errors about `never`.
  const roles = computed(() => {
    try {
      const u = auth.user as any
      if (!u) return []
      
      // First, check for explicit roles array
      if (u.roles && Array.isArray(u.roles) && u.roles.length > 0) {
        const extracted = u.roles.map((r: any) => {
          // Handle both { name: "role" } and simple "role" string formats
          if (typeof r === 'string') return r
          if (r && typeof r === 'object' && (r.name || r.title)) {
            return String(r.name || r.title)
          }
          return null
        }).filter(Boolean)
        if (extracted.length > 0) return extracted
      }
      
      // Then check for single role string
      if (u.role && typeof u.role === 'string') {
        return [String(u.role)]
      }
      
      // Fallback for alternate role field name
      if (u.global_role && typeof u.global_role === 'string') {
        return [String(u.global_role)]
      }
    } catch (e) {
      console.error('Error in useUserRole while extracting roles:', e)
    }
    return []
  })

  const isQuizee = computed(() => roles.value.includes('quizee'))
  const isQuizMaster = computed(() => roles.value.includes('quiz-master'))
  const isInstitutionManager = computed(() => roles.value.includes('institution-manager'))

  // Determine a single preferred role for UI purposes
  const preferredRole = computed(() => {
    // Priority: institution-manager > quiz-master > quizee
    if (isInstitutionManager.value) return 'institution-manager'
    if (isQuizMaster.value) return 'quiz-master'
    if (isQuizee.value) return 'quizee'
    // Fallback for no specific role
    return 'quizee'
  })

  // Provide a backwards-compatible alias `isQuizee` for consumers that
  // historically referenced that spelling (avoid runtime `.value` errors).
  // Backwards-compat: some consumers expect the lowercase `isquizee` name.
  // Export both spellings so older components that destructure `{ isquizee }`
  // continue to work without changes.
  return { roles, isQuizMaster, isQuizee, isInstitutionManager, preferredRole, isquizee: isQuizee }
}

// Convenience alias for the composable itself (rarely needed but harmless).
export const useUserRoleAlias = useUserRole

