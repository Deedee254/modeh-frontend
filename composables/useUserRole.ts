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
      if (u && Array.isArray(u.roles)) {
        return u.roles.map((r: any) => (r && (r.name ?? r.title ?? r) ? String(r.name ?? r.title ?? r) : null)).filter(Boolean)
      }
      if (u && (u.role || u.roles)) {
        // single role as string
        return [String(u.role || u.roles)]
      }
    } catch (e) {
      // ignore and fall-through
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
  return { roles, isQuizMaster, isQuizee, isInstitutionManager, preferredRole }
}

// Convenience alias for the composable itself (rarely needed but harmless).
export const useUserRoleAlias = useUserRole
