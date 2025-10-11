import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

export function useUserRole() {
  // auth store shape is dynamic (Pinia JS store) — cast to any to avoid TS errors in this thin composable
  const auth: any = useAuthStore()

  const roles = computed(() => {
    // backend may provide role as string or array; normalize to array
    const r = auth.user?.roles ?? auth.user?.role ?? auth.role
    if (!r) return []
    return Array.isArray(r) ? r : [r]
  })

  const isquiz-master = computed(() => roles.value.includes('quiz-master'))
  const isquizee = computed(() => roles.value.includes('quizee'))

  const preferredRole = computed(() => {
    if (isquizee.value && !isquiz-master.value) return 'quizee'
    if (isquiz-master.value && !isquizee.value) return 'quiz-master'
    // if both or none, prefer explicit selection on user object, then first role
    const sel = auth.user?.selectedRole || auth.user?.preferred_role || null
    if (sel) return sel
    return roles.value[0] ?? null
  })

  return { roles, isquiz-master, isquizee, preferredRole }
}
