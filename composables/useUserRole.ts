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

  const isTutor = computed(() => roles.value.includes('tutor'))
  const isStudent = computed(() => roles.value.includes('student'))

  const preferredRole = computed(() => {
    if (isStudent.value && !isTutor.value) return 'student'
    if (isTutor.value && !isStudent.value) return 'tutor'
    // if both or none, prefer explicit selection on user object, then first role
    const sel = auth.user?.selectedRole || auth.user?.preferred_role || null
    if (sel) return sel
    return roles.value[0] ?? null
  })

  return { roles, isTutor, isStudent, preferredRole }
}
