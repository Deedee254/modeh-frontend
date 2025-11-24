import { useAuthStore } from '~/stores/auth'
import { useInstitutionsStore } from '~/stores/institutions'
import { useRoute, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  // Only consider top-level settings/profile paths
  const path = to.path
  if (path !== '/settings' && path !== '/profile') return

  const auth = useAuthStore()
  const instStore = useInstitutionsStore()

  // If user is not signed in or no institution selected, do nothing
  if (!auth || !auth.user) return

  // Determine whether the currently active institution (if any) has the current user as manager.
  const activeId = instStore ? instStore.activeInstitutionSlug : null
  // Use loose typing to avoid TS complaints in middleware (store shapes are dynamic)
  const instPivotRole = (instStore as any)?.institution?.pivot?.role ?? null
  const isInstManager = (auth.user as any)?.role === 'institution-manager' || instPivotRole === 'institution-manager'

  if (isInstManager && activeId) {
    // Redirect /settings -> /institution-manager/settings and /profile -> /institution-manager/profile
    const target = path === '/settings' ? '/institution-manager/settings' : '/institution-manager/profile'
    return navigateTo({ path: target, query: { institutionSlug: String(activeId) } })
  }
})
