import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable to get user roles and simple booleans for checking roles.
 *
 * @returns {object}
 * - `roles`: `ref<string[]>` - reactive list of user roles
 * - `isQuizMaster`: `ref<boolean>` - true if user has `quiz-master` role
 * - `isquizee`: `ref<boolean>` - true if user has `quizee` role
 * - `preferredRole`: `ref<string>` - either `quiz-master` or `quizee` based on roles
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

  const isquizee = computed(() => roles.value.includes('quizee'))
  const isQuizMaster = computed(() => roles.value.includes('quiz-master'))

  // Determine a single preferred role for UI purposes
  const preferredRole = computed(() => {
    // If user is both, let them choose, but for now, default to quizee
    if (isquizee.value && isQuizMaster.value) return 'quizee'
    if (isquizee.value && !isQuizMaster.value) return 'quizee'
    if (isQuizMaster.value && !isquizee.value) return 'quiz-master'
    // Fallback for no specific role
    return 'quizee'
  })

  // Provide a backwards-compatible alias `isQuizee` for consumers that
  // historically referenced that spelling (avoid runtime `.value` errors).
  return { roles, isQuizMaster, isquizee, isQuizee: isquizee, preferredRole }
}

// Convenience alias for the composable itself (rarely needed but harmless).
export const useUserRoleAlias = useUserRole
