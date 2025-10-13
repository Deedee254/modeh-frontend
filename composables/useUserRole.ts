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
  const roles = computed(() => auth.user?.roles?.map(r => r.name) || (auth.user?.role ? [auth.user.role] : []))

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

  return { roles, isQuizMaster, isquizee, preferredRole }
}
